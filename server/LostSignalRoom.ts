import { Room, Client, ServerError } from 'colyseus';
import { 
  MissionState, 
  Role, 
  MiniGameType, 
  EnvironmentType, 
  DiagnosticData,
  SignalData,
  CableData,
  AirlockData,
  RadarData,
  EnergyData,
  RescueData,
  RescueRoute,
  GameMode,
} from '../src/types/game';
import { 
  createInitialMissionState, 
  generateRoundId, 
  getRandomMiniGames, 
  calculateFinalScore, 
  RESCUE_ROUTES 
} from '../src/services/gameFactory';
import { 
  validateAndAdvancePhase, 
  validateRescueDecision, 
  isMiniGameCompleted 
} from '../src/services/phaseTransition';
import { applyAdvancedAction } from '../src/services/advancedScenarioLogic';

interface PlayerSession {
  sessionId: string;
  role: Role;
  name: string;
  ready: boolean;
  roleConfirmed: boolean;
  connected: boolean;
}

export class LostSignalRoom extends Room {
  public static activeRooms: Map<string, string> = new Map(); // roomCode -> roomId
  public maxClients = 2;
  public roomCode!: string;
  public hostSessionId!: string;
  public missionState!: MissionState;
  public playerSessions: Map<string, PlayerSession> = new Map();
  public processedActionIds: Set<string> = new Set();
  public disconnectSecondsLeft: number = 0;
  private tickInterval: any = null;

  onCreate(options: any) {
    const rawCode = (options.roomCode || 'KYP-' + Math.random().toString(36).substring(2, 6).toUpperCase()).toUpperCase().trim();
    this.roomCode = rawCode.startsWith('KYP-') ? rawCode : `KYP-${rawCode}`;

    // Prevent duplicate room creation with same code
    if (LostSignalRoom.activeRooms.has(this.roomCode)) {
      throw new ServerError(409, `Bu oda kodu (${this.roomCode}) zaten başka bir ekip tarafından kullanılıyor.`);
    }
    LostSignalRoom.activeRooms.set(this.roomCode, this.roomId);

    this.setMetadata({ roomCode: this.roomCode });

    const env: EnvironmentType = options.environment || 'kayip_sinyal';
    const hostName: string = options.playerName || 'Kaptan Ece';
    this.missionState = createInitialMissionState(this.roomCode, env, hostName);
    if (options.selectedMiniGames && Array.isArray(options.selectedMiniGames)) {
      this.missionState.selectedMiniGames = options.selectedMiniGames;
    }
    this.missionState.status = 'lobby';

    // Set up 1-second authoritative server clock
    this.tickInterval = this.clock.setInterval(() => {
      this.handleServerTick();
    }, 1000);

    // Register message handlers
    this.registerMessageHandlers();
  }

  private registerMessageHandlers() {
    // 1. Ready Toggle: Player can ONLY toggle their own ready status
    this.onMessage('toggle_ready', (client) => {
      const player = this.playerSessions.get(client.sessionId);
      if (!player) return;
      if (this.missionState.status !== 'lobby') return;

      player.ready = !player.ready;
      this.missionState.players[player.role].ready = player.ready;
      this.broadcastFilteredState();
    });

    // 1B. Game Mode Select in Lobby (Host or either player)
    this.onMessage('set_game_mode', (client, payload: { mode: GameMode }) => {
      if (this.missionState.status !== 'lobby') return;
      this.missionState.gameMode = payload.mode;
      this.broadcastFilteredState();
    });

    // 2. Role Swap / Select in Lobby
    this.onMessage('select_role', (client, payload: { targetRole: Role }) => {
      const player = this.playerSessions.get(client.sessionId);
      if (!player || this.missionState.status !== 'lobby') return;

      const targetRole = payload.targetRole;
      if (player.role === targetRole) return;

      // Find the other player
      let otherPlayer: PlayerSession | null = null;
      for (const [sId, p] of this.playerSessions.entries()) {
        if (sId !== client.sessionId) {
          otherPlayer = p;
          break;
        }
      }

      if (otherPlayer) {
        // Swap roles
        otherPlayer.role = player.role;
        otherPlayer.ready = false;
        this.missionState.players[otherPlayer.role] = {
          id: otherPlayer.sessionId,
          name: otherPlayer.name,
          role: otherPlayer.role,
          ready: false,
        };
      }

      player.role = targetRole;
      player.ready = false;
      this.missionState.players[targetRole] = {
        id: player.sessionId,
        name: player.name,
        role: targetRole,
        ready: false,
      };

      this.broadcastFilteredState();
    });

    // 3. Start Game: Only Host can start, and only when both players are ready
    this.onMessage('start_game', (client) => {
      if (client.sessionId !== this.hostSessionId) {
        client.send('error_message', 'Yalnızca oda lideri oyunu başlatabilir.');
        return;
      }

      const bothReady = 
        this.playerSessions.size === 2 &&
        Array.from(this.playerSessions.values()).every(p => p.ready);

      if (!bothReady) {
        client.send('error_message', 'Her iki oyuncu da hazır olmadan oyun başlatılamaz.');
        return;
      }

      this.missionState.status = 'role_intro';
      for (const p of this.playerSessions.values()) {
        p.roleConfirmed = false;
        if (this.missionState.players[p.role]) {
          this.missionState.players[p.role].roleConfirmed = false;
        }
      }
      this.broadcastFilteredState();
    });

    // 4. Confirm Role Intro: moves to Phase 1 ONLY when both connected players have confirmed
    this.onMessage('confirm_role', (client) => {
      if (this.missionState.status !== 'role_intro') return;
      const player = this.playerSessions.get(client.sessionId);
      if (!player) return;
      player.roleConfirmed = true;
      if (this.missionState.players[player.role]) {
        this.missionState.players[player.role].roleConfirmed = true;
      }

      const bothConnectedAndConfirmed = 
        this.playerSessions.size === 2 &&
        Array.from(this.playerSessions.values()).every(p => p.connected && p.roleConfirmed);

      if (bothConnectedAndConfirmed) {
        this.missionState.status = 'phase_game';
        this.missionState.currentPhaseIndex = 0;
      }
      this.broadcastFilteredState();
    });

    // 5. Authoritative Game Actions (Deduplicated, RoundId and PhaseIndex verified)
    const handleActionPayload = (client: Client, payload: {
      actionId?: string;
      roundId: string;
      phaseIndex: number;
      actionType: string;
      data: any;
    }) => {
      this.handleGameAction(client, {
        actionId: payload.actionId || ('ACT-' + Math.random().toString(36).substring(2, 8)),
        roundId: payload.roundId,
        phaseIndex: payload.phaseIndex,
        actionType: payload.actionType,
        data: payload.data,
      });
    };

    this.onMessage('game_action', handleActionPayload);
    this.onMessage('action', handleActionPayload);

    // 6. Phase Advance Request
    this.onMessage('advance_phase', (client, payload: {
      roundId: string;
      expectedPhaseIndex: number;
    }) => {
      const result = validateAndAdvancePhase(this.missionState, {
        roundId: payload.roundId,
        expectedPhaseIndex: payload.expectedPhaseIndex,
      });

      if (!result.success) {
        client.send('error_message', result.error || 'Aşama ilerletilemedi.');
        return;
      }

      if (result.nextState) {
        this.missionState = result.nextState;
      }
      this.broadcastFilteredState();
    });

    // 7. Restart Round / Rematch: Only Host, preserves room and players
    this.onMessage('restart_round', (client) => {
      if (client.sessionId !== this.hostSessionId) {
        client.send('error_message', 'Yalnızca oda lideri yeni tur başlatabilir.');
        return;
      }

      const prevPair = this.missionState.selectedMiniGames;
      const newPair = getRandomMiniGames(prevPair);
      const newRoundId = generateRoundId();

      const freshState = createInitialMissionState(
        this.roomCode,
        this.missionState.activeEnvironment,
        this.missionState.players.kaptan.name,
        prevPair
      );

      freshState.roundId = newRoundId;
      freshState.selectedMiniGames = newPair;
      freshState.status = 'lobby';

      // Preserve player names and roles
      freshState.players.kaptan.name = this.missionState.players.kaptan.name;
      freshState.players.kaptan.ready = false;
      freshState.players.muhendis.name = this.missionState.players.muhendis.name;
      freshState.players.muhendis.ready = false;

      for (const p of this.playerSessions.values()) {
        p.ready = false;
        p.roleConfirmed = false;
      }

      this.missionState = freshState;
      this.processedActionIds.clear();
      this.disconnectSecondsLeft = 0;

      this.broadcastFilteredState();
    });
  }

  private handleGameAction(client: Client, payload: {
    actionId: string;
    roundId: string;
    phaseIndex: number;
    actionType: string;
    data: any;
  }) {
    const player = this.playerSessions.get(client.sessionId);
    if (!player) return;

    // 1. Guard against duplicate or stale actions
    if (!payload.actionId || this.processedActionIds.has(payload.actionId)) {
      return; // already processed
    }
    this.processedActionIds.add(payload.actionId);

    // 2. Round ID check
    if (payload.roundId !== this.missionState.roundId) {
      client.send('error_message', `Geçersiz tur kimliği (${payload.roundId} vs ${this.missionState.roundId})`);
      return;
    }

    // 3. Phase index check
    if (payload.phaseIndex !== this.missionState.currentPhaseIndex) {
      client.send('error_message', `Aşama uyumsuzluğu (${payload.phaseIndex} vs ${this.missionState.currentPhaseIndex})`);
      return;
    }

    // 4. Strict Role & Task Authorization
    const { actionType, data } = payload;
    const currentStatus = this.missionState.status;

    // Handle Advanced Interdependent Scenario Actions
    if (actionType.startsWith('advanced_')) {
      const result = applyAdvancedAction(this.missionState, actionType, data, player.role);
      if (result.error) {
        client.send('error_message', result.error);
        return;
      }
      this.missionState = result.nextState;
      this.broadcastFilteredState();
      return;
    }

    // Handle Phase 0 & 1 Mini-games
    if (currentStatus === 'phase_game') {
      const activeMiniGame = this.missionState.selectedMiniGames[this.missionState.currentPhaseIndex];

      // Arıza Teşhisi
      if (activeMiniGame === 'ariza_teshisi') {
        if (actionType === 'diagnostic_captain_breaker') {
          if (player.role !== 'kaptan') {
            client.send('error_message', 'Yalnızca Kaptan reaktör kesicisini devreye alabilir.');
            return;
          }
          if (this.missionState.diagnostic.isSolved) return;
          if (!data.breaker) return;

          const isCorrect = data.breaker === this.missionState.diagnostic.correctBreaker;
          this.missionState.diagnostic.captainSelectedBreaker = data.breaker;

          if (isCorrect) {
            this.missionState.diagnostic.unlockedBreaker = data.breaker;
            const willSolve = this.missionState.diagnostic.engineerActionTaken &&
              this.missionState.diagnostic.engineerSuggestedLine === this.missionState.diagnostic.faultyLine;

            if (willSolve) {
              this.missionState.diagnostic.isSolved = true;
              this.missionState.diagnostic.lines[this.missionState.diagnostic.faultyLine] = {
                ...this.missionState.diagnostic.lines[this.missionState.diagnostic.faultyLine],
                temp: 54,
                press: 50,
                noise: 36,
                status: 'stabil',
              };
              this.missionState.feedbackState = 'success';
              this.missionState.feedbackMessage = `GÜVENLİK KİLİDİ AÇILDI! ${data.breaker} kesicisi arızalı devreyi izole etti. Reaktör kararlı.`;
            } else {
              this.missionState.feedbackState = 'idle';
              this.missionState.feedbackMessage = `GÜVENLİK KİLİDİ AÇILDI (${data.breaker})! Devre akımı kesildi. Mühendisin soğutma valfi ve basınç tahliyesi müdahalesi bekleniyor.`;
            }
          } else {
            this.applyPenalty(`Hatalı kesici seçimi (${data.breaker})! İzole edilen hatta anomali bulunmuyor; sağlam sistemin enerjisi kesildi.`);
          }
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'diagnostic_engineer_select_line') {
          if (player.role !== 'muhendis') return;
          if (this.missionState.diagnostic.isSolved) return;

          this.missionState.diagnostic.engineerSuggestedLine = data.line;
          this.missionState.feedbackState = 'idle';
          this.missionState.feedbackMessage = `Mühendis ${data.line ? data.line.toUpperCase() : ''} devresini inceleme için işaretledi.`;
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'diagnostic_engineer_purge') {
          if (player.role !== 'muhendis') {
            client.send('error_message', 'Yalnızca Mühendis hat tahliyesi yapabilir.');
            return;
          }
          if (this.missionState.diagnostic.isSolved) return;

          if (!data.line) {
            this.missionState.feedbackState = 'error';
            this.missionState.feedbackMessage = 'Müdahale için önce canlı sensörlerde arızalı devreyi tespit edip işaretleyin.';
            this.broadcastFilteredState();
            return;
          }

          const isBreakerUnlocked = this.missionState.diagnostic.captainSelectedBreaker === this.missionState.diagnostic.correctBreaker;
          if (!isBreakerUnlocked) {
            this.missionState.diagnostic.engineerSuggestedLine = data.line;
            this.missionState.feedbackState = 'error';
            this.missionState.feedbackMessage = 'Güvenlik kilidi devrede! Kaptan ana şebekeden bu hattın güvenlik kesicisini açmadan tahliye vanası çalıştırılamaz.';
            this.broadcastFilteredState();
            return;
          }

          if (data.line !== this.missionState.diagnostic.faultyLine) {
            this.missionState.diagnostic.engineerSuggestedLine = data.line;
            this.applyPenalty('Hatalı hat tahliyesi! Seçilen devrede çoklu arıza koşulları oluşmamış. Sağlam hatta müdahale edildi.');
            this.broadcastFilteredState();
            return;
          }

          // Check valve angle & throttle if provided
          const valveAngle = data.valveAngle !== undefined ? data.valveAngle : this.missionState.diagnostic.targetValveAngle;
          if (data.valveAngle !== undefined && data.valveAngle !== this.missionState.diagnostic.targetValveAngle) {
            this.missionState.diagnostic.engineerSuggestedLine = data.line;
            this.missionState.diagnostic.engineerValveAngle = data.valveAngle;
            this.missionState.feedbackState = 'error';
            this.missionState.feedbackMessage = 'Müdahale başarısız: Soğutma valfi doğru açıda değil. Termal şok riski nedeniyle tahliye emniyet valfi tarafından durduruldu.';
            this.broadcastFilteredState();
            return;
          }

          const throttleActive = data.throttleActive !== undefined ? data.throttleActive : true;
          if (data.throttleActive !== undefined && !throttleActive) {
            this.missionState.diagnostic.engineerSuggestedLine = data.line;
            this.missionState.diagnostic.engineerThrottleActive = false;
            this.missionState.feedbackState = 'error';
            this.missionState.feedbackMessage = 'Müdahale başarısız: Basınç tahliyesi devre dışı. Hat basıncı boşaltılmadan devre açılamaz.';
            this.broadcastFilteredState();
            return;
          }

          // All passed
          this.missionState.diagnostic.lines[this.missionState.diagnostic.faultyLine] = {
            ...this.missionState.diagnostic.lines[this.missionState.diagnostic.faultyLine],
            temp: 54,
            press: 50,
            noise: 36,
            status: 'stabil',
          };
          this.missionState.diagnostic.engineerActionTaken = true;
          this.missionState.diagnostic.engineerSuggestedLine = data.line;
          this.missionState.diagnostic.engineerValveAngle = valveAngle;
          this.missionState.diagnostic.engineerThrottleActive = throttleActive;
          this.missionState.diagnostic.isSolved = true;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = `MÜDAHALE TAMAMLANDI! ${data.line.toUpperCase()} devresi başarıyla soğutuldu ve tahliye edildi. Reaktör dengelendi!`;
          this.broadcastFilteredState();
          return;
        }

        // Unknown action for ariza_teshisi
        return;
      }

      // Sinyal Çözümü
      if (activeMiniGame === 'sinyal_cozumu') {
        if (actionType === 'signal_engineer_tune') {
          if (player.role !== 'muhendis') {
            client.send('error_message', 'Yalnızca Mühendis frekans ayarı ve kilitlemesi yapabilir.');
            return;
          }
          if (this.missionState.signal.isSolved) return;

          this.missionState.signal.engineerTunedFreq = data.freq;
          this.missionState.signal.isLocked = true;

          if (data.freq === this.missionState.signal.correctFrequency) {
            this.missionState.signal.isSolved = true;
            this.missionState.feedbackState = 'success';
            this.missionState.feedbackMessage = 'Sinyal frekansı kilitlendi! İletişim sağlandı.';
          } else {
            this.applyPenalty('Hatalı frekans seçimi! Parazit rezonansı gövdeyi sarstı.');
          }
          this.broadcastFilteredState();
          return;
        }
        return;
      }

      // Kablo Bağlantısı
      if (activeMiniGame === 'kablo_baglantisi') {
        if (actionType === 'cable_assign_port') {
          if (player.role !== 'muhendis') return;
          this.missionState.cable.portAssignments[data.portId] = data.cableId;
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'cable_test_connections') {
          if (player.role !== 'muhendis') {
            client.send('error_message', 'Yalnızca Mühendis kablo devresini test edebilir.');
            return;
          }
          if (this.missionState.cable.isSolved) return;

          this.missionState.cable.isTested = true;
          let allCorrect = true;
          for (const port of this.missionState.cable.ports) {
            if (this.missionState.cable.portAssignments[port.id] !== port.requiredCableId) {
              allCorrect = false;
              break;
            }
          }

          if (allCorrect) {
            this.missionState.cable.isSolved = true;
            this.missionState.feedbackState = 'success';
            this.missionState.feedbackMessage = 'Kablo bağlantıları hatasız kuruldu!';
          } else {
            this.applyPenalty('Hatalı kablo bağlantısı! Kısa devre oluştu.');
          }
          this.broadcastFilteredState();
          return;
        }
        return;
      }

      // Hava Kilidi
      if (activeMiniGame === 'hava_kilidi') {
        if (actionType === 'airlock_set_params') {
          if (player.role !== 'muhendis') return;
          if (data.dialIndex !== undefined) this.missionState.airlock.engineerDialIndex = data.dialIndex;
          if (data.sealLocked !== undefined) this.missionState.airlock.engineerSealLocked = data.sealLocked;
          if (data.vacuumPower !== undefined) this.missionState.airlock.engineerVacuumPower = data.vacuumPower;
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'airlock_verify') {
          if (player.role !== 'muhendis') {
            client.send('error_message', 'Yalnızca Mühendis hava kilidi parametrelerini doğrulayabilir.');
            return;
          }
          if (this.missionState.airlock.isSolved) return;

          const al = this.missionState.airlock;
          const dialCorrect = al.engineerDialIndex === al.targetDialIndex;
          const sealCorrect = al.engineerSealLocked === al.targetSealLocked;
          const vacuumCorrect = al.engineerVacuumPower >= al.targetVacuumMin && al.engineerVacuumPower <= al.targetVacuumMax;

          if (dialCorrect && sealCorrect && vacuumCorrect) {
            al.isSolved = true;
            this.missionState.feedbackState = 'success';
            this.missionState.feedbackMessage = 'Hava kilidi basıncı dengelendi ve mühürlendi!';
          } else {
            this.applyPenalty('Hava kilidi parametreleri uyumsuz! Basınç kaçağı meydana geldi.');
          }
          this.broadcastFilteredState();
          return;
        }
        return;
      }

      // Radar Yönlendirme
      if (activeMiniGame === 'radar_yonlendirme') {
        if (actionType === 'radar_set_coordinates') {
          if (player.role !== 'muhendis') return;
          if (data.azimuth !== undefined) this.missionState.radar.engineerAzimuth = data.azimuth;
          if (data.elevation !== undefined) this.missionState.radar.engineerElevation = data.elevation;
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'radar_scan') {
          if (player.role !== 'muhendis') {
            client.send('error_message', 'Yalnızca Mühendis radar taraması yapabilir.');
            return;
          }
          if (this.missionState.radar.isSolved) return;

          this.missionState.radar.isScanned = true;
          const r = this.missionState.radar;
          const azDiff = Math.abs(r.engineerAzimuth - r.targetAzimuth);
          const elDiff = Math.abs(r.engineerElevation - r.targetElevation);

          if (azDiff <= 5 && elDiff <= 5) {
            r.isSolved = true;
            this.missionState.feedbackState = 'success';
            this.missionState.feedbackMessage = 'Kurtarma feneri radarda tespit edildi!';
          } else {
            this.applyPenalty('Radar taraması hedef koordinatlardan saptı! Parazit arttı.');
          }
          this.broadcastFilteredState();
          return;
        }
        return;
      }
    }

    // Handle Phase 2: Enerji Dağıtımı
    if (currentStatus === 'phase_energy') {
      if (actionType === 'energy_set_allocation') {
        if (player.role !== 'muhendis') return;
        if (this.missionState.energy.isLocked) return;

        const alloc = data.allocation;
        const sum = alloc.yasamDestegi + alloc.itki + alloc.kalkan;
        if (sum <= this.missionState.energy.totalBudget) {
          this.missionState.energy.engineerAllocation = alloc;
        }
        this.broadcastFilteredState();
        return;
      }

      if (actionType === 'energy_share_draft') {
        if (player.role !== 'muhendis') return;
        this.missionState.energy.isDraftShared = true;
        this.broadcastFilteredState();
        return;
      }

      if (actionType === 'energy_lock') {
        if (player.role !== 'kaptan') {
          client.send('error_message', 'Yalnızca Kaptan enerji dağılımını onaylayıp kilitleyebilir.');
          return;
        }
        if (!this.missionState.energy.isDraftShared) {
          client.send('error_message', 'Mühendisin enerji taslağını iletmesi bekleniyor.');
          return;
        }
        if (this.missionState.energy.isLocked) return;

        const e = this.missionState.energy;
        const netLife = Math.max(0, e.engineerAllocation.yasamDestegi - e.lineLosses.yasamDestegi);
        const netThrust = Math.max(0, e.engineerAllocation.itki - e.lineLosses.itki);
        const netShield = Math.max(0, e.engineerAllocation.kalkan - e.lineLosses.kalkan);

        const meetsLife = netLife >= e.captainMinRequirements.yasamDestegi;
        const meetsThrust = netThrust >= e.captainMinRequirements.itki;
        const meetsShield = netShield >= e.captainMinRequirements.kalkan;

        if (meetsLife && meetsThrust && meetsShield) {
          e.isLocked = true;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = 'Enerji dağılımı kilitlendi ve ana hatta aktarıldı!';
        } else {
          this.applyPenalty('Enerji dağılımı kritik güvenlik eşiklerinin altında kaldı!');
        }
        this.broadcastFilteredState();
        return;
      }
      return;
    }

    // Handle Phase 3: Kurtarma Kararı
    if (currentStatus === 'phase_rescue') {
      if (actionType === 'rescue_select_route') {
        this.missionState.rescue.selectedRouteId = data.routeId;
        this.missionState.rescue.captainApproved = false;
        this.missionState.rescue.engineerApproved = false;
        this.missionState.rescue.validationError = null;
        this.broadcastFilteredState();
        return;
      }

      if (actionType === 'rescue_toggle_approval') {
        // Player can ONLY toggle their OWN approval!
        if (player.role === 'kaptan') {
          this.missionState.rescue.captainApproved = !this.missionState.rescue.captainApproved;
        } else if (player.role === 'muhendis') {
          this.missionState.rescue.engineerApproved = !this.missionState.rescue.engineerApproved;
        }

        // When both approve, validate rescue decision authoritatively
        if (this.missionState.rescue.captainApproved && this.missionState.rescue.engineerApproved) {
          const selectedRoute = RESCUE_ROUTES.find(r => r.id === this.missionState.rescue.selectedRouteId)!;
          const validation = validateRescueDecision(this.missionState, selectedRoute);

          if (validation.success && validation.nextState) {
            this.missionState = validation.nextState;
          } else {
            this.missionState.rescue.validationError = validation.error || 'Kurtarma planı doğrulanamadı.';
            this.missionState.rescue.captainApproved = false;
            this.missionState.rescue.engineerApproved = false;
          }
        }
        this.broadcastFilteredState();
        return;
      }
      return;
    }
  }

  private applyPenalty(reason: string) {
    this.missionState.timeLeftSeconds = Math.max(0, this.missionState.timeLeftSeconds - 15);
    this.missionState.hullIntegrity = Math.max(0, this.missionState.hullIntegrity - 10);
    this.missionState.feedbackState = 'error';
    this.missionState.feedbackMessage = `${reason} (-15s Süre, -%10 Bütünlük)`;

    if (this.missionState.timeLeftSeconds <= 0 || this.missionState.hullIntegrity <= 0) {
      this.handleMissionFailure(
        this.missionState.hullIntegrity <= 0 
          ? 'İstasyon gövdesi kritik hasar alarak parçalandı!' 
          : 'Süre tükendi! İstasyon patlamadan önce tahliye tamamlanamadı.'
      );
    }
  }

  private handleServerTick() {
    // 1. Disconnect Countdown: If partner disconnected during active mission
    if (this.missionState.isDisconnected && this.disconnectSecondsLeft > 0) {
      this.disconnectSecondsLeft--;
      this.missionState.feedbackMessage = `Mürettebat üyesi bekleniyor: ${this.disconnectSecondsLeft}s`;

      if (this.disconnectSecondsLeft <= 0) {
        this.handleMissionFailure('Mürettebat üyesinin sinyali 45 saniye boyunca alınamadı. Görev sonlandırıldı.');
        return;
      }
      this.broadcastFilteredState();
      return;
    }

    // 2. Active Game Timer Countdown
    const isGameActive = 
      (this.missionState.status === 'phase_game' || 
       this.missionState.status === 'phase_energy' || 
       this.missionState.status === 'phase_rescue') &&
      !this.missionState.isPaused &&
      !this.missionState.isDisconnected;

    if (!isGameActive) return;

    if (this.missionState.timeLeftSeconds > 0) {
      this.missionState.timeLeftSeconds--;
    }

    // Advanced Scenario Plasma Surge Event warning & strike check
    if (this.missionState.gameMode === 'gelismis' && this.missionState.advancedScenario) {
      const adv = this.missionState.advancedScenario;
      if (!adv.event.isResolved) {
        if (this.missionState.timeLeftSeconds <= adv.event.warningTriggerTime && !adv.event.isActive) {
          adv.event.isActive = true;
          adv.evacuationLog.push(`[${this.missionState.timeLeftSeconds}s] ⚠️ DİKKAT: Plazma Fırtınası Dalgası yaklaşıyor! 35 saniye içinde temas.`);
        }
        if (this.missionState.timeLeftSeconds <= adv.event.strikeTime && adv.event.isActive && !adv.event.isResolved) {
          adv.event.isResolved = true;
          adv.event.isActive = false;
          adv.event.chosenReaction = 'ihmal';
          adv.event.narrativeResult = 'Savunmasız gövdeye plazma çarptı! -%15 Gövde hasarı.';
          this.missionState.hullIntegrity = Math.max(1, this.missionState.hullIntegrity - 15);
          adv.evacuationLog.push(`[${this.missionState.timeLeftSeconds}s] 💥 PLAZMA TEMASI: İstasyon kalkanlanmadı. Gövde %15 hasar aldı.`);
        }
      }
    }

    if (this.missionState.timeLeftSeconds <= 0 || this.missionState.hullIntegrity <= 0) {
      this.handleMissionFailure(
        this.missionState.hullIntegrity <= 0 
          ? 'İstasyon gövdesi parçalandı!' 
          : 'Süre tükendi!'
      );
    } else {
      this.broadcastFilteredState();
    }
  }

  private handleMissionFailure(reason: string) {
    const finalHull = Math.max(0, this.missionState.hullIntegrity);
    const scoreData = calculateFinalScore(
      this.missionState.completedTasksCount || 0,
      0,
      finalHull,
      0
    );

    this.missionState.status = 'phase_result';
    this.missionState.outcomeType = 'basarisizlik';
    this.missionState.rescuedCrewCount = 0;
    this.missionState.timeLeftSeconds = 0;
    this.missionState.hullIntegrity = finalHull;
    this.missionState.finalScore = scoreData.total;
    this.missionState.scoreBreakdown = scoreData.breakdown;
    this.missionState.feedbackState = 'error';
    this.missionState.feedbackMessage = reason;

    this.broadcastFilteredState();
  }

  onJoin(client: Client, options: any) {
    const isHost = this.playerSessions.size === 0;
    if (isHost) {
      this.hostSessionId = client.sessionId;
    }

    // Role assignment: host is kaptan, second player is muhendis
    let role: Role = isHost ? 'kaptan' : 'muhendis';
    if (options.role && isHost) {
      role = options.role;
    }

    const playerName = options.playerName || (role === 'kaptan' ? 'Kaptan Ece' : 'Mühendis Mert');

    const session: PlayerSession = {
      sessionId: client.sessionId,
      role,
      name: playerName,
      ready: false,
      roleConfirmed: false,
      connected: true,
    };

    this.playerSessions.set(client.sessionId, session);

    // Update mission state player metadata
    this.missionState.players[role] = {
      id: client.sessionId,
      name: playerName,
      role,
      ready: false,
    };

    // If game was paused waiting for this reconnecting player
    if (this.missionState.isDisconnected) {
      this.missionState.isDisconnected = false;
      this.missionState.isPaused = false;
      this.disconnectSecondsLeft = 0;
      this.missionState.feedbackState = 'idle';
      this.missionState.feedbackMessage = `${playerName} yeniden bağlandı! Görev sürüyor.`;
    }

    this.broadcastFilteredState();
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.playerSessions.get(client.sessionId);
    if (!player) return;

    if (consented) {
      // Voluntary leave
      this.playerSessions.delete(client.sessionId);
      const isGameInProgress = 
        this.missionState.status === 'phase_game' || 
        this.missionState.status === 'phase_energy' || 
        this.missionState.status === 'phase_rescue';

      if (isGameInProgress) {
        this.handleMissionFailure(`Mürettebat üyesi (${player.name}) görevden ayrıldı. Görev sonlandırıldı.`);
      } else if (this.missionState.status === 'lobby') {
        this.missionState.players[player.role].ready = false;
        this.broadcastFilteredState();
      }
      return;
    }

    // Unvoluntary disconnect: pause game and allow 45s grace period for reconnection
    player.connected = false;
    const isGameInProgress = 
      this.missionState.status === 'phase_game' || 
      this.missionState.status === 'phase_energy' || 
      this.missionState.status === 'phase_rescue';

    if (isGameInProgress) {
      this.missionState.isPaused = true;
      this.missionState.isDisconnected = true;
      this.disconnectSecondsLeft = 45;
      this.missionState.feedbackState = 'disconnected';
      this.missionState.feedbackMessage = `${player.name} bağlantısı koptu. Yeniden bağlanması bekleniyor (45s)...`;
      this.broadcastFilteredState();

      try {
        await this.allowReconnection(client, 45);
        // Player reconnected!
        player.connected = true;
        this.missionState.isPaused = false;
        this.missionState.isDisconnected = false;
        this.disconnectSecondsLeft = 0;
        this.missionState.feedbackState = 'idle';
        this.missionState.feedbackMessage = `${player.name} yeniden bağlandı. Görev devam ediyor.`;
        this.broadcastFilteredState();
      } catch (err) {
        // 45s Grace period expired
        this.handleMissionFailure(`Mürettebat üyesi (${player.name}) 45 saniye boyunca yeniden bağlanamadı. Görev sonlandırıldı.`);
      }
    }
  }

  onDispose() {
    LostSignalRoom.activeRooms.delete(this.roomCode);
    if (this.tickInterval) {
      this.tickInterval.clear();
    }
    this.processedActionIds.clear();
  }

  /**
   * Role-based secret data isolation:
   * Only the information pertinent to the player's role is sent to their phone.
   */
  public getFilteredStateForRole(role: Role): MissionState {
    const base: MissionState = {
      ...this.missionState,
      myRole: role,
    };

    if (role === 'kaptan') {
      return {
        ...base,
        diagnostic: {
          ...this.missionState.diagnostic,
          lines: {
            reaktor: { temp: 0, press: 0, noise: 0, code: 'CIR-01', status: this.missionState.diagnostic.lines.reaktor.status },
            sogutucu: { temp: 0, press: 0, noise: 0, code: 'CIR-02', status: this.missionState.diagnostic.lines.sogutucu.status },
            anten: { temp: 0, press: 0, noise: 0, code: 'CIR-03', status: this.missionState.diagnostic.lines.anten.status },
            yonlendirme: { temp: 0, press: 0, noise: 0, code: 'CIR-04', status: this.missionState.diagnostic.lines.yonlendirme.status },
          },
        },
        signal: {
          ...this.missionState.signal,
        },
        cable: {
          ...this.missionState.cable,
        },
        airlock: {
          ...this.missionState.airlock,
        },
        radar: {
          ...this.missionState.radar,
        },
        energy: {
          ...this.missionState.energy,
        },
        advancedScenario: this.missionState.advancedScenario ? {
          ...this.missionState.advancedScenario,
          subsystems: {
            ...this.missionState.advancedScenario.subsystems,
            reaktor: {
              ...this.missionState.advancedScenario.subsystems.reaktor,
              targetBreaker: undefined as any,
              liveTelemetry: {
                coreTemp: 0,
                coolantPressure: 0,
                lineNoise: 0,
                criticalLine: 'anten',
              },
            },
            sinyal: {
              ...this.missionState.advancedScenario.subsystems.sinyal,
              targetFrequency: '??? MHz',
            },
            hava_kilidi: {
              ...this.missionState.advancedScenario.subsystems.hava_kilidi,
              targetDialIndex: -1,
              targetVacuumMin: 0,
              targetVacuumMax: 0,
              externalPressureKpa: 0,
            },
          },
        } : undefined,
      };
    } else {
      // Engineer sees interactive consoles, live telemetry, and dials,
      // but NOT captain's secret cheat-sheets, rules, or expected solutions!
      return {
        ...base,
        diagnostic: {
          ...this.missionState.diagnostic,
          faultyLine: 'reaktor', // generic fallback label
          correctBreaker: null as any,
          targetValveAngle: 0,
          lineBreakerMap: {
            anten: '??' as any,
            reaktor: '??' as any,
            sogutucu: '??' as any,
            yonlendirme: '??' as any,
          },
        },
        signal: {
          ...this.missionState.signal,
          computedCode: '????',
          correctFrequency: '??? MHz',
        },
        cable: {
          ...this.missionState.cable,
          ports: this.missionState.cable.ports.map(p => ({
            ...p,
            requiredCableId: '???',
          })),
        },
        airlock: {
          ...this.missionState.airlock,
          targetDialIndex: -1,
          targetDialText: 'Gizli Protokol',
          targetPressureRange: 'Kaptan Onaylı Aralık',
          targetVacuumMin: 0,
          targetVacuumMax: 0,
        },
        radar: {
          ...this.missionState.radar,
          targetAzimuth: 0,
          targetElevation: 0,
          beaconLabel: 'Hedef Kaptanda',
        },
        energy: {
          ...this.missionState.energy,
        },
        advancedScenario: this.missionState.advancedScenario ? {
          ...this.missionState.advancedScenario,
          subsystems: {
            ...this.missionState.advancedScenario.subsystems,
            reaktor: {
              ...this.missionState.advancedScenario.subsystems.reaktor,
              targetBreaker: undefined as any,
            },
            sinyal: {
              ...this.missionState.advancedScenario.subsystems.sinyal,
              targetFrequency: '??? MHz',
              symbols: ['?', '?', '?', '?'],
              symbolValueSum: 0,
            },
            hava_kilidi: {
              ...this.missionState.advancedScenario.subsystems.hava_kilidi,
              targetDialIndex: -1,
              targetVacuumMin: 0,
              targetVacuumMax: 0,
            },
          },
        } : undefined,
      };
    }
  }

  private broadcastFilteredState() {
    for (const client of this.clients) {
      const player = this.playerSessions.get(client.sessionId);
      if (player) {
        const filtered = this.getFilteredStateForRole(player.role);
        client.send('state_update', filtered);
      }
    }
  }
}
