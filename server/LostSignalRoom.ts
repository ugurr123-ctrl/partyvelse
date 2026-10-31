import { Room, Client } from 'colyseus';
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

interface PlayerSession {
  sessionId: string;
  role: Role;
  name: string;
  ready: boolean;
  roleConfirmed: boolean;
  connected: boolean;
}

export class LostSignalRoom extends Room {
  public maxClients = 2;
  public roomCode!: string;
  public hostSessionId!: string;
  public missionState!: MissionState;
  public playerSessions: Map<string, PlayerSession> = new Map();
  public processedActionIds: Set<string> = new Set();
  public disconnectSecondsLeft: number = 0;
  private tickInterval: any = null;

  onCreate(options: any) {
    this.roomCode = (options.roomCode || 'KYP-' + Math.random().toString(36).substring(2, 6).toUpperCase()).toUpperCase();
    this.setMetadata({ roomCode: this.roomCode });

    const env: EnvironmentType = options.environment || 'kayip_sinyal';
    const hostName: string = options.playerName || 'Kaptan Ece';
    this.missionState = createInitialMissionState(this.roomCode, env, hostName);
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
      }
      this.broadcastFilteredState();
    });

    // 4. Confirm Role Intro: moves to Phase 1 when confirmed
    this.onMessage('confirm_role', (client) => {
      const player = this.playerSessions.get(client.sessionId);
      if (!player) return;
      player.roleConfirmed = true;

      const allConfirmed = Array.from(this.playerSessions.values()).every(p => p.roleConfirmed);
      if (allConfirmed || client.sessionId === this.hostSessionId) {
        this.missionState.status = 'phase_game';
        this.missionState.currentPhaseIndex = 0;
      }
      this.broadcastFilteredState();
    });

    // 5. Authoritative Game Actions (Deduplicated, RoundId and PhaseIndex verified)
    this.onMessage('game_action', (client, payload: {
      actionId: string;
      roundId: string;
      phaseIndex: number;
      actionType: string;
      data: any;
    }) => {
      this.handleGameAction(client, payload);
    });

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

    // 4. Action dispatcher
    const { actionType, data } = payload;
    let penaltyApplied = false;

    switch (actionType) {
      // Comprehensive Authoritative Game Step Sync
      case 'sync_mission_step': {
        const next = data as Partial<MissionState>;

        // 1. Diagnostic update
        if (next.diagnostic) {
          if (next.diagnostic.captainSelectedBreaker !== undefined) {
            this.missionState.diagnostic.captainSelectedBreaker = next.diagnostic.captainSelectedBreaker;
          }
          if (next.diagnostic.engineerSuggestedLine !== undefined) {
            this.missionState.diagnostic.engineerSuggestedLine = next.diagnostic.engineerSuggestedLine;
            this.missionState.diagnostic.engineerActionTaken = true;
          }
          if (this.missionState.diagnostic.captainSelectedBreaker) {
            const isCorrect = this.missionState.diagnostic.captainSelectedBreaker === this.missionState.diagnostic.correctBreaker;
            if (isCorrect && this.missionState.diagnostic.engineerActionTaken) {
              this.missionState.diagnostic.isSolved = true;
              this.missionState.feedbackState = 'success';
              this.missionState.feedbackMessage = 'Reaktör arızası başarıyla giderildi!';
            }
          }
        }

        // 2. Signal update
        if (next.signal) {
          if (next.signal.engineerTunedFreq !== undefined) {
            this.missionState.signal.engineerTunedFreq = next.signal.engineerTunedFreq;
          }
          if (next.signal.isLocked) {
            this.missionState.signal.isLocked = true;
            if (this.missionState.signal.engineerTunedFreq === this.missionState.signal.correctFrequency) {
              this.missionState.signal.isSolved = true;
              this.missionState.feedbackState = 'success';
              this.missionState.feedbackMessage = 'Sinyal frekansı kilitlendi!';
            } else {
              this.applyPenalty('Hatalı frekans seçimi!');
            }
          }
        }

        // 3. Cable update
        if (next.cable) {
          if (next.cable.portAssignments) {
            this.missionState.cable.portAssignments = {
              ...this.missionState.cable.portAssignments,
              ...next.cable.portAssignments,
            };
          }
          if (next.cable.isTested) {
            this.missionState.cable.isTested = true;
            let allMatched = true;
            for (const port of this.missionState.cable.ports) {
              if (this.missionState.cable.portAssignments[port.id] !== port.requiredCableId) {
                allMatched = false;
                break;
              }
            }
            if (allMatched) {
              this.missionState.cable.isSolved = true;
              this.missionState.feedbackState = 'success';
              this.missionState.feedbackMessage = 'Kablo bağlantıları hatasız kuruldu!';
            } else {
              this.applyPenalty('Hatalı kablo bağlantısı!');
            }
          }
        }

        // 4. Airlock update
        if (next.airlock) {
          if (next.airlock.engineerDialIndex !== undefined) this.missionState.airlock.engineerDialIndex = next.airlock.engineerDialIndex;
          if (next.airlock.engineerSealLocked !== undefined) this.missionState.airlock.engineerSealLocked = next.airlock.engineerSealLocked;
          if (next.airlock.engineerVacuumPower !== undefined) this.missionState.airlock.engineerVacuumPower = next.airlock.engineerVacuumPower;
          
          const al = this.missionState.airlock;
          const dialOk = al.engineerDialIndex === al.targetDialIndex;
          const sealOk = al.engineerSealLocked === al.targetSealLocked;
          const vacOk = al.engineerVacuumPower >= al.targetVacuumMin && al.engineerVacuumPower <= al.targetVacuumMax;
          if (dialOk && sealOk && vacOk) {
            al.isSolved = true;
            this.missionState.feedbackState = 'success';
            this.missionState.feedbackMessage = 'Hava kilidi basıncı dengelendi ve mühürlendi!';
          }
        }

        // 5. Radar update
        if (next.radar) {
          if (next.radar.engineerAzimuth !== undefined) this.missionState.radar.engineerAzimuth = next.radar.engineerAzimuth;
          if (next.radar.engineerElevation !== undefined) this.missionState.radar.engineerElevation = next.radar.engineerElevation;
          if (next.radar.isScanned) {
            this.missionState.radar.isScanned = true;
            const azDiff = Math.abs(this.missionState.radar.engineerAzimuth - this.missionState.radar.targetAzimuth);
            const elDiff = Math.abs(this.missionState.radar.engineerElevation - this.missionState.radar.targetElevation);
            if (azDiff <= 5 && elDiff <= 5) {
              this.missionState.radar.isSolved = true;
              this.missionState.feedbackState = 'success';
              this.missionState.feedbackMessage = 'Kurtarma feneri radarda tespit edildi!';
            } else {
              this.applyPenalty('Radar taraması hedefi kaçırdı!');
            }
          }
        }

        // 6. Energy update
        if (next.energy) {
          if (next.energy.engineerAllocation) {
            const alloc = next.energy.engineerAllocation;
            const sum = alloc.yasamDestegi + alloc.itki + alloc.kalkan;
            if (sum <= this.missionState.energy.totalBudget) {
              this.missionState.energy.engineerAllocation = alloc;
            }
          }
          if (next.energy.isDraftShared !== undefined) {
            this.missionState.energy.isDraftShared = next.energy.isDraftShared;
          }
          if (next.energy.isLocked) {
            const e = this.missionState.energy;
            const netLife = Math.max(0, e.engineerAllocation.yasamDestegi - e.lineLosses.yasamDestegi);
            const netThrust = Math.max(0, e.engineerAllocation.itki - e.lineLosses.itki);
            const netShield = Math.max(0, e.engineerAllocation.kalkan - e.lineLosses.kalkan);
            if (netLife >= 3 && (netThrust + netShield >= 4)) {
              e.isLocked = true;
              this.missionState.feedbackState = 'success';
              this.missionState.feedbackMessage = 'Enerji dağılımı onaylandı ve kilitlendi!';
            } else {
              this.applyPenalty('Enerji dağılımı asgari eşiklerin altında kaldı!');
            }
          }
        }

        // 7. Rescue update
        if (next.rescue) {
          if (next.rescue.selectedRouteId) {
            this.missionState.rescue.selectedRouteId = next.rescue.selectedRouteId;
          }
          if (next.rescue.captainApproved !== undefined) {
            this.missionState.rescue.captainApproved = next.rescue.captainApproved;
          }
          if (next.rescue.engineerApproved !== undefined) {
            this.missionState.rescue.engineerApproved = next.rescue.engineerApproved;
          }
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
        }
        break;
      }

      // Arıza Teşhisi
      case 'diagnostic_captain_breaker': {
        if (player.role !== 'kaptan') return;
        this.missionState.diagnostic.captainSelectedBreaker = data.breaker;
        if (data.breaker === this.missionState.diagnostic.correctBreaker) {
          this.missionState.diagnostic.isSolved = true;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = 'Doğru kesici tetiklendi! Reaktör kararlı.';
        } else {
          penaltyApplied = true;
          this.applyPenalty('Hatalı kesici seçimi! Reaktör aşırı yüklendi.');
        }
        break;
      }

      case 'diagnostic_engineer_purge': {
        if (player.role !== 'muhendis') return;
        this.missionState.diagnostic.engineerActionTaken = true;
        this.missionState.diagnostic.engineerSuggestedLine = data.line;
        // Purge action without correct breaker does not complete task
        break;
      }

      // Sinyal Çözümü
      case 'signal_engineer_tune': {
        if (player.role !== 'muhendis') return;
        this.missionState.signal.engineerTunedFreq = data.freq;
        this.missionState.signal.isLocked = true;

        if (data.freq === this.missionState.signal.correctFrequency) {
          this.missionState.signal.isSolved = true;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = 'Sinyal frekansı kilitlendi! İletişim sağlandı.';
        } else {
          penaltyApplied = true;
          this.applyPenalty('Hatalı frekans seçimi! Parazit rezonansı gövdeyi sarstı.');
        }
        break;
      }

      // Kablo Bağlantısı
      case 'cable_assign_port': {
        if (player.role !== 'muhendis') return;
        this.missionState.cable.portAssignments[data.portId] = data.cableId;
        break;
      }

      case 'cable_test_connections': {
        if (player.role !== 'muhendis') return;
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
          penaltyApplied = true;
          this.applyPenalty('Hatalı kablo bağlantısı! Kısa devre oluştu.');
        }
        break;
      }

      // Hava Kilidi
      case 'airlock_set_params': {
        if (player.role !== 'muhendis') return;
        if (data.dialIndex !== undefined) this.missionState.airlock.engineerDialIndex = data.dialIndex;
        if (data.sealLocked !== undefined) this.missionState.airlock.engineerSealLocked = data.sealLocked;
        if (data.vacuumPower !== undefined) this.missionState.airlock.engineerVacuumPower = data.vacuumPower;
        break;
      }

      case 'airlock_verify': {
        if (player.role !== 'muhendis') return;
        const al = this.missionState.airlock;
        const dialCorrect = al.engineerDialIndex === al.targetDialIndex;
        const sealCorrect = al.engineerSealLocked === al.targetSealLocked;
        const vacuumCorrect = al.engineerVacuumPower >= al.targetVacuumMin && al.engineerVacuumPower <= al.targetVacuumMax;

        if (dialCorrect && sealCorrect && vacuumCorrect) {
          al.isSolved = true;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = 'Hava kilidi basıncı dengelendi ve mühürlendi!';
        } else {
          penaltyApplied = true;
          this.applyPenalty('Hava kilidi parametreleri uyumsuz! Basınç kaçağı meydana geldi.');
        }
        break;
      }

      // Radar Yönlendirme
      case 'radar_set_coordinates': {
        if (player.role !== 'muhendis') return;
        if (data.azimuth !== undefined) this.missionState.radar.engineerAzimuth = data.azimuth;
        if (data.elevation !== undefined) this.missionState.radar.engineerElevation = data.elevation;
        break;
      }

      case 'radar_scan': {
        if (player.role !== 'muhendis') return;
        this.missionState.radar.isScanned = true;
        const r = this.missionState.radar;
        const azDiff = Math.abs(r.engineerAzimuth - r.targetAzimuth);
        const elDiff = Math.abs(r.engineerElevation - r.targetElevation);

        if (azDiff <= 5 && elDiff <= 5) {
          r.isSolved = true;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = 'Kurtarma feneri radarda tespit edildi!';
        } else {
          penaltyApplied = true;
          this.applyPenalty('Radar taraması hedef koordinatlardan saptı! Parazit arttı.');
        }
        break;
      }

      // Enerji Dağıtımı
      case 'energy_set_allocation': {
        if (player.role !== 'muhendis') return;
        const alloc = data.allocation;
        const sum = alloc.yasamDestegi + alloc.itki + alloc.kalkan;
        if (sum <= this.missionState.energy.totalBudget) {
          this.missionState.energy.engineerAllocation = alloc;
        }
        break;
      }

      case 'energy_share_draft': {
        if (player.role !== 'muhendis') return;
        this.missionState.energy.isDraftShared = true;
        break;
      }

      case 'energy_lock': {
        if (player.role !== 'muhendis') return;
        const e = this.missionState.energy;
        const netLife = Math.max(0, e.engineerAllocation.yasamDestegi - e.lineLosses.yasamDestegi);
        const netThrust = Math.max(0, e.engineerAllocation.itki - e.lineLosses.itki);
        const netShield = Math.max(0, e.engineerAllocation.kalkan - e.lineLosses.kalkan);

        if (netLife >= 3 && (netThrust + netShield >= 4)) {
          e.isLocked = true;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = 'Enerji dağılımı kilitlendi ve ana hatta aktarıldı!';
        } else {
          penaltyApplied = true;
          this.applyPenalty('Enerji dağılımı kritik güvenlik eşiklerinin altında kaldı!');
        }
        break;
      }

      // Kurtarma Kararı
      case 'rescue_select_route': {
        this.missionState.rescue.selectedRouteId = data.routeId;
        this.missionState.rescue.captainApproved = false;
        this.missionState.rescue.engineerApproved = false;
        this.missionState.rescue.validationError = null;
        break;
      }

      case 'rescue_toggle_approval': {
        if (player.role === 'kaptan') {
          this.missionState.rescue.captainApproved = !this.missionState.rescue.captainApproved;
        } else {
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
        break;
      }
    }

    this.broadcastFilteredState();
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
      if (this.missionState.status === 'lobby') {
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
      // Captain sees diagnostic notes, rule descriptions, cheat-sheet solutions,
      // but NOT engineer's live sliders, test triggers, or frequency tuner answers.
      return {
        ...base,
        diagnostic: {
          ...this.missionState.diagnostic,
          // Hide engineer's internal breaker actions from captain until confirmed
        },
        signal: {
          ...this.missionState.signal,
          // Captain sees symbols, ruleDescription, computedCode, correctFrequency
        },
        cable: {
          ...this.missionState.cable,
          // Captain sees wire specs and requiredCableId on ports
        },
        airlock: {
          ...this.missionState.airlock,
          // Captain sees target ranges
        },
        radar: {
          ...this.missionState.radar,
          // Captain sees beacon target azimuth & elevation
        },
        energy: {
          ...this.missionState.energy,
          // Captain sees minimum requirements and draft/locked values
        },
      };
    } else {
      // Engineer sees interactive consoles, live telemetry, and dials,
      // but NOT captain's secret cheat-sheets, rules, or expected solutions!
      return {
        ...base,
        diagnostic: {
          ...this.missionState.diagnostic,
          // Redact captain's secret correctBreaker and faultyLine identifier
          faultyLine: 'reaktor', // generic fallback label
          correctBreaker: null as any,
        },
        signal: {
          ...this.missionState.signal,
          // Redact captain's computed code & expected frequency
          computedCode: '????',
          correctFrequency: '??? MHz',
        },
        cable: {
          ...this.missionState.cable,
          // Redact requiredCableId from ports on engineer view
          ports: this.missionState.cable.ports.map(p => ({
            ...p,
            requiredCableId: '???',
          })),
        },
        airlock: {
          ...this.missionState.airlock,
          // Redact captain's target numbers
          targetDialIndex: -1,
          targetDialText: 'Gizli Protokol',
          targetPressureRange: 'Kaptan Onaylı Aralık',
          targetVacuumMin: 0,
          targetVacuumMax: 0,
        },
        radar: {
          ...this.missionState.radar,
          // Redact target azimuth and elevation
          targetAzimuth: 0,
          targetElevation: 0,
          beaconLabel: 'Hedef Kaptanda',
        },
        energy: {
          ...this.missionState.energy,
        },
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
