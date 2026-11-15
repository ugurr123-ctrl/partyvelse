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
  generateKarantinaData,
  RESCUE_ROUTES 
} from '../src/services/gameFactory';
import { 
  validateAndAdvancePhase, 
  validateRescueDecision, 
  isMiniGameCompleted 
} from '../src/services/phaseTransition';
import { applyAdvancedAction } from '../src/services/advancedScenarioLogic';
import { applyLocalGameAction } from '../src/services/localGameEngine';
import {
  applyOmegaAction,
  filterOmegaStateForRole,
  generateOmegaData,
  getOmegaRoleMeta,
  getOmegaRolesForCount,
  getTeamOperationMeta,
  getTeamThemeFromCode,
  isTeamOperationTheme,
} from '../src/services/omegaGameEngine';

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
  private disconnectedPlayers: Map<string, { name: string; secondsLeft: number }> = new Map();
  private tickInterval: any = null;

  private getWaitingSlotName(theme: MissionState['operationTheme'], role: Role, targetCount: 2 | 3 | 4): string {
    if (isTeamOperationTheme(theme)) {
      return getOmegaRoleMeta(role, targetCount === 3 ? 3 : 4).waitingName;
    }
    if (role === 'kaptan') {
      if (theme === 'karantina_2088') return 'Baş Biyolog Bekleniyor...';
      if (theme === 'golge_protokolu') return 'Ajan Bekleniyor...';
      if (theme === 'derin_basinc') return 'Dümenci Bekleniyor...';
      return 'Kaptan Bekleniyor...';
    }
    if (theme === 'karantina_2088') return 'Güvenlik Şefi Bekleniyor...';
    if (theme === 'golge_protokolu') return 'Hacker Bekleniyor...';
    if (theme === 'derin_basinc') return 'Makinist Bekleniyor...';
    return 'Arkadaşın Bekleniyor...';
  }

  private syncDisconnectBanner() {
    if (this.disconnectedPlayers.size === 0) {
      this.missionState.isDisconnected = false;
      this.missionState.isPaused = false;
      return;
    }
    let minSeconds = 45;
    const names: string[] = [];
    for (const info of this.disconnectedPlayers.values()) {
      names.push(info.name);
      if (info.secondsLeft < minSeconds) {
        minSeconds = info.secondsLeft;
      }
    }
    this.missionState.isDisconnected = true;
    this.missionState.isPaused = true;
    this.missionState.feedbackState = 'disconnected';
    this.missionState.feedbackMessage = `${names.join(', ')} bekleniyor: ${Math.max(0, minSeconds)}s`;
  }

  private transferHostIfNeeded(leavingSessionId: string) {
    if (this.hostSessionId !== leavingSessionId) return;
    const nextHost = Array.from(this.playerSessions.values()).find((p) => p.connected) ||
      Array.from(this.playerSessions.values())[0];
    if (nextHost) {
      this.hostSessionId = nextHost.sessionId;
      this.missionState.hostId = nextHost.sessionId;
    } else {
      this.hostSessionId = '';
      this.missionState.hostId = '';
    }
  }

  onCreate(options: any) {
    const rawCode = (options.roomCode || 'KYP-' + Math.random().toString(36).substring(2, 6).toUpperCase()).toUpperCase().trim();
    const isPrefixed =
      rawCode.startsWith('KR') ||
      rawCode.startsWith('SHDW') ||
      rawCode.startsWith('DP') ||
      rawCode.startsWith('KYP') ||
      rawCode.startsWith('OMG') ||
      rawCode.startsWith('TTN') ||
      rawCode.startsWith('SBK') ||
      rawCode.startsWith('BZL');
    this.roomCode = isPrefixed ? rawCode : `KYP-${rawCode}`;

    // Prevent duplicate room creation with same code
    if (LostSignalRoom.activeRooms.has(this.roomCode)) {
      throw new ServerError(409, `Bu oda kodu (${this.roomCode}) zaten başka bir ekip tarafından kullanılıyor.`);
    }
    LostSignalRoom.activeRooms.set(this.roomCode, this.roomId);

    this.setMetadata({ roomCode: this.roomCode });

    const codeTeamTheme = getTeamThemeFromCode(this.roomCode);
    const resolvedTeamTheme = isTeamOperationTheme(options.operationTheme)
      ? options.operationTheme
      : codeTeamTheme;
    const isTeamTheme = Boolean(resolvedTeamTheme);

    const targetCount: 2 | 3 | 4 = isTeamTheme
      ? options.targetPlayerCount === 3 || /^(OMG3|TTN3|SBK3|BZL3)/.test(this.roomCode)
        ? 3
        : 4
      : 2;
    this.maxClients = targetCount;

    const env: EnvironmentType = options.environment || 'kayip_sinyal';
    const allowedRoles = getOmegaRolesForCount(targetCount);
    const requestedHostRole: Role = options?.role;
    const hostRole: Role = allowedRoles.includes(requestedHostRole) ? requestedHostRole : 'kaptan';
    const hostName: string =
      options.playerName ||
      (isTeamTheme
        ? getOmegaRoleMeta(hostRole, targetCount === 3 ? 3 : 4).defaultName
        : hostRole === 'kaptan'
        ? 'Kaptan Ece'
        : 'Mühendis Mert');

    this.missionState = createInitialMissionState(this.roomCode, env, hostName);
    this.missionState.targetPlayerCount = targetCount;
    if (options.selectedMiniGames && Array.isArray(options.selectedMiniGames)) {
      this.missionState.selectedMiniGames = options.selectedMiniGames;
    }
    if (options.gameMode === 'gelismis' || options.gameMode === 'standart') {
      this.missionState.gameMode = options.gameMode;
    }
    if (resolvedTeamTheme) {
      const teamMeta = getTeamOperationMeta(resolvedTeamTheme);
      this.missionState.operationTheme = resolvedTeamTheme;
      this.missionState.timeLeftSeconds = teamMeta.defaultTimeSeconds;
      this.missionState.omegaData = generateOmegaData(targetCount === 3 ? 3 : 4, resolvedTeamTheme);
    } else if (options.operationTheme) {
      this.missionState.operationTheme = options.operationTheme;
      if (options.operationTheme === 'karantina_2088') {
        this.missionState.karantinaData = generateKarantinaData();
      }
    }
    this.missionState.status = 'lobby';

    // Initialize role slots cleanly
    for (const r of allowedRoles) {
      const waitingName = isTeamTheme
        ? getOmegaRoleMeta(r, targetCount === 3 ? 3 : 4).waitingName
        : r === 'kaptan'
        ? (options.operationTheme === 'karantina_2088'
            ? 'Baş Biyolog Bekleniyor...'
            : options.operationTheme === 'golge_protokolu'
            ? 'Ajan Bekleniyor...'
            : options.operationTheme === 'derin_basinc'
            ? 'Dümenci Bekleniyor...'
            : 'Kaptan Bekleniyor...')
        : (options.operationTheme === 'karantina_2088'
            ? 'Güvenlik Şefi Bekleniyor...'
            : options.operationTheme === 'golge_protokolu'
            ? 'Hacker Bekleniyor...'
            : options.operationTheme === 'derin_basinc'
            ? 'Makinist Bekleniyor...'
            : 'Arkadaşın Bekleniyor...');

      this.missionState.players[r] = {
        id: '',
        name: r === hostRole ? hostName : waitingName,
        role: r,
        ready: false,
        roleConfirmed: false,
        connected: false,
      };
    }
    if (targetCount < 4) {
      delete this.missionState.players.guvenlik;
    }
    if (targetCount < 3) {
      delete this.missionState.players.kriptolog;
    }

    // Set up 1-second authoritative server clock
    this.tickInterval = this.clock.setInterval(() => {
      this.handleServerTick();
    }, 1000);

    // Register message handlers
    this.registerMessageHandlers();
  }

  private registerMessageHandlers() {
    // 0. State Request from newly connected / reconnected client
    this.onMessage('request_state', (client) => {
      const player = this.playerSessions.get(client.sessionId);
      if (player) {
        client.send('state_update', this.getFilteredStateForRole(player.role));
      }
    });

    // 0B. Live Tactical Radio Transmission (Text & Push-to-Talk Voice Clips)
    this.onMessage('radio_transmission', (_client, transmission) => {
      if (!transmission || typeof transmission !== 'object') return;
      if (typeof transmission.audioDataUrl === 'string' && transmission.audioDataUrl.length > 450000) {
        return; // Guard against oversized audio payloads (> ~330KB binary)
      }
      this.broadcast('radio_transmission', transmission);
    });

    // 1. Ready Toggle: Player can ONLY toggle their own ready status
    this.onMessage('toggle_ready', (client) => {
      const player = this.playerSessions.get(client.sessionId);
      if (!player) return;
      if (this.missionState.status !== 'lobby') return;

      player.ready = !player.ready;
      const slot = this.missionState.players[player.role];
      if (slot) {
        slot.ready = player.ready;
      }
      this.broadcastFilteredState();
    });

    // 1B. Game Mode Select in Lobby (Host only)
    this.onMessage('set_game_mode', (client, payload: { mode: GameMode }) => {
      if (this.missionState.status !== 'lobby') return;
      if (client.sessionId !== this.hostSessionId) {
        client.send('error_message', 'Yalnızca oda lideri oyun modunu değiştirebilir.');
        return;
      }
      if (payload?.mode !== 'standart' && payload?.mode !== 'gelismis') return;
      this.missionState.gameMode = payload.mode;
      this.broadcastFilteredState();
    });

    // 1C. Reroll Random Mini-Games Sequence in Lobby (Host only)
    this.onMessage('reroll_tasks', (client) => {
      if (this.missionState.status !== 'lobby') return;
      if (client.sessionId !== this.hostSessionId) {
        client.send('error_message', 'Yalnızca oda lideri görev sırasını değiştirebilir.');
        return;
      }
      const newGames = getRandomMiniGames(this.missionState.selectedMiniGames);
      this.missionState.selectedMiniGames = newGames;
      if (this.missionState.advancedScenario) {
        this.missionState.advancedScenario.activeSubsystemTab =
          newGames[0] === 'ariza_teshisi'
            ? 'reaktor'
            : newGames[0] === 'sinyal_cozumu'
            ? 'sinyal'
            : newGames[0] === 'hava_kilidi'
            ? 'hava_kilidi'
            : newGames[0] === 'kablo_baglantisi'
            ? 'kablo'
            : 'radar';
      }
      this.broadcastFilteredState();
    });

    // 2. Role Swap / Select in Lobby (works for 2, 3, or 4 player rooms)
    this.onMessage('select_role', (client, payload: { targetRole: Role }) => {
      const player = this.playerSessions.get(client.sessionId);
      if (!player || this.missionState.status !== 'lobby') return;

      const targetCount = this.missionState.targetPlayerCount || 2;
      const allowedRoles = getOmegaRolesForCount(targetCount);
      const targetRole = payload.targetRole;
      if (!allowedRoles.includes(targetRole) || player.role === targetRole) return;

      const oldRole = player.role;
      let occupant: PlayerSession | null = null;
      for (const [sId, p] of this.playerSessions.entries()) {
        if (sId !== client.sessionId && p.role === targetRole) {
          occupant = p;
          break;
        }
      }

      if (occupant) {
        occupant.role = oldRole;
        occupant.ready = false;
        occupant.roleConfirmed = false;
        this.missionState.players[oldRole] = {
          id: occupant.sessionId,
          name: occupant.name,
          role: oldRole,
          ready: false,
          roleConfirmed: false,
          connected: occupant.connected,
        };
      } else {
        const waitingLabel = this.getWaitingSlotName(this.missionState.operationTheme, oldRole, targetCount);
        this.missionState.players[oldRole] = {
          id: '',
          name: waitingLabel,
          role: oldRole,
          ready: false,
          roleConfirmed: false,
          connected: false,
        };
      }

      player.role = targetRole;
      player.ready = false;
      player.roleConfirmed = false;
      this.missionState.players[targetRole] = {
        id: player.sessionId,
        name: player.name,
        role: targetRole,
        ready: false,
        roleConfirmed: false,
        connected: player.connected,
      };

      this.broadcastFilteredState();
    });

    // 3. Start Game: Only Host can start, and only when all expected players are connected and ready
    this.onMessage('start_game', (client) => {
      if (client.sessionId !== this.hostSessionId) {
        client.send('error_message', 'Yalnızca oda lideri oyunu başlatabilir.');
        return;
      }

      const requiredPlayers = this.missionState.targetPlayerCount || 2;
      if (this.playerSessions.size < requiredPlayers) {
        client.send(
          'error_message',
          `Oyunu başlatmak için tüm ekip üyelerinin odaya katılması gerekiyor (${this.playerSessions.size}/${requiredPlayers}).`
        );
        return;
      }

      const allReady =
        this.playerSessions.size === requiredPlayers &&
        Array.from(this.playerSessions.values()).every((p) => p.ready);

      if (!allReady) {
        client.send('error_message', 'Tüm oyuncular hazır olmadan oyun başlatılamaz.');
        return;
      }

      this.missionState.status = 'role_intro';
      for (const p of this.playerSessions.values()) {
        p.roleConfirmed = false;
        const slot = this.missionState.players[p.role];
        if (slot) {
          slot.roleConfirmed = false;
        }
      }
      this.broadcastFilteredState();
    });

    // 4. Confirm Role Intro: moves to Phase 1 ONLY when all connected players have confirmed
    this.onMessage('confirm_role', (client) => {
      if (this.missionState.status !== 'role_intro') return;
      const player = this.playerSessions.get(client.sessionId);
      if (!player) return;
      player.roleConfirmed = true;
      const slot = this.missionState.players[player.role];
      if (slot) {
        slot.roleConfirmed = true;
      }

      const requiredPlayers = this.missionState.targetPlayerCount || 2;
      const allConnectedAndConfirmed =
        this.playerSessions.size === requiredPlayers &&
        Array.from(this.playerSessions.values()).every((p) => p.connected && p.roleConfirmed);

      if (allConnectedAndConfirmed) {
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
      const prevGameMode = this.missionState.gameMode;
      const prevTheme = this.missionState.operationTheme;
      const prevCount = this.missionState.targetPlayerCount || 2;
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
      freshState.gameMode = prevGameMode;
      freshState.status = 'lobby';
      freshState.operationTheme = prevTheme;
      freshState.targetPlayerCount = prevCount;
      freshState.hostId = this.hostSessionId;
      if (prevTheme === 'karantina_2088') {
        freshState.karantinaData = generateKarantinaData();
      } else if (isTeamOperationTheme(prevTheme)) {
        freshState.timeLeftSeconds = getTeamOperationMeta(prevTheme).defaultTimeSeconds;
        freshState.omegaData = generateOmegaData(prevCount === 3 ? 3 : 4, prevTheme);
      }

      // Reset slots cleanly first, then restore active player sessions with real IDs & connected status
      const allowedRoles = getOmegaRolesForCount(prevCount);
      for (const r of allowedRoles) {
        freshState.players[r] = {
          id: '',
          name: this.getWaitingSlotName(prevTheme, r, prevCount),
          role: r,
          ready: false,
          roleConfirmed: false,
          connected: false,
        };
      }
      if (prevCount < 4) delete freshState.players.guvenlik;
      if (prevCount < 3) delete freshState.players.kriptolog;

      for (const p of this.playerSessions.values()) {
        p.ready = false;
        p.roleConfirmed = false;
        freshState.players[p.role] = {
          id: p.sessionId,
          name: p.name,
          role: p.role,
          ready: false,
          roleConfirmed: false,
          connected: p.connected,
        };
      }

      this.missionState = freshState;
      this.processedActionIds.clear();
      this.disconnectedPlayers.clear();
      this.syncDisconnectBanner();

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

    // 1. Round ID check
    if (payload.roundId !== this.missionState.roundId) {
      client.send('error_message', `Geçersiz tur kimliği (${payload.roundId} vs ${this.missionState.roundId})`);
      return;
    }

    // 2. Phase index check
    if (payload.phaseIndex !== this.missionState.currentPhaseIndex) {
      client.send('error_message', `Aşama uyumsuzluğu (${payload.phaseIndex} vs ${this.missionState.currentPhaseIndex})`);
      return;
    }

    // 3. Guard against duplicate or stale actions (bounded LRU eviction at 2000 entries)
    if (!payload.actionId || this.processedActionIds.has(payload.actionId)) {
      return; // already processed
    }
    if (this.processedActionIds.size >= 2000) {
      const oldest = this.processedActionIds.values().next().value;
      if (oldest) {
        this.processedActionIds.delete(oldest);
      }
    }
    this.processedActionIds.add(payload.actionId);

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

    // Handle Karantina 2088 Actions
    if (actionType.startsWith('karantina_')) {
      const isBioAction =
        actionType === 'karantina_set_spectral_filter' ||
        actionType === 'karantina_phase1_bio_transmit' ||
        actionType === 'karantina_set_bond_freq' ||
        actionType === 'karantina_phase2_bio_inject' ||
        actionType === 'karantina_set_vacuum_flow' ||
        actionType === 'karantina_phase3_bio_start';
      const isSecAction =
        actionType.startsWith('karantina_phase1_sec_') ||
        actionType.startsWith('karantina_phase2_sec_') ||
        actionType.startsWith('karantina_phase3_sec_');

      if (isBioAction && player.role !== 'kaptan') {
        client.send('error_message', 'Yalnızca Baş Biyolog bu işlemi gerçekleştirebilir.');
        return;
      }
      if (isSecAction && player.role !== 'muhendis') {
        client.send('error_message', 'Yalnızca Güvenlik Şefi bu işlemi gerçekleştirebilir.');
        return;
      }
      this.missionState = applyLocalGameAction(this.missionState, actionType, data, player.role);
      this.broadcastFilteredState();
      return;
    }

    // Handle OMEGA-4 (3 & 4 Player Team Operation) Actions
    if (actionType.startsWith('omega_')) {
      const result = applyOmegaAction(this.missionState, actionType, data, player.role);
      if (result.error) {
        client.send('error_message', result.error);
        return;
      }
      this.missionState = result.nextState;
      this.broadcastFilteredState();
      return;
    }

    const isThemeCustom =
      this.missionState.operationTheme === 'derin_basinc' ||
      this.missionState.operationTheme === 'golge_protokolu';

    // Handle Phase 0 & 1 Mini-games
    if (currentStatus === 'phase_game') {
      const activeMiniGame = this.missionState.selectedMiniGames[this.missionState.currentPhaseIndex];

      if (actionType === 'captain_signal_ready') {
        if (player.role !== 'kaptan') return;
        this.missionState.feedbackState = 'idle';
        this.missionState.feedbackMessage = data?.message || 'Kaptan kılavuz verilerini operasyona aktardı.';
        this.broadcastFilteredState();
        return;
      }

      // Theme-specific custom puzzle handlers (Derin Basınç & Gölge Protokolü)
      if (isThemeCustom) {
        if (actionType === 'theme_apply_penalty') {
          this.applyPenalty(
            data?.reason || 'Hatalı müdahale tespit edildi!',
            {
              timeLoss: typeof data?.timeLoss === 'number' ? data.timeLoss : 15,
              hullLoss: typeof data?.hullLoss === 'number' ? data.hullLoss : 10,
              stealthLoss: typeof data?.stealthLoss === 'number' ? data.stealthLoss : 0,
            }
          );
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'theme_diagnostic_captain_sync' && activeMiniGame === 'ariza_teshisi') {
          if (player.role !== 'kaptan') {
            client.send('error_message', 'Yalnızca Kaptan/Dümenci/Ajan bu senkronizasyonu başlatabilir.');
            return;
          }
          if (this.missionState.diagnostic.isSolved) return;

          if (this.missionState.operationTheme === 'golge_protokolu') {
            const isVoltageTarget = typeof data?.voltage === 'number' && Math.abs(data.voltage - 24.5) <= 0.5;
            const isDeltaReady = data?.deltaCable === 'SARI';
            if (!isVoltageTarget || !isDeltaReady) {
              this.applyPenalty(
                'VOLTAJ YA DA SOKET HATALI! Hackerın telsiz talimatlarını kontrol edip kablo ve voltajı yeniden ayarla.',
                { timeLoss: 10, hullLoss: 0, stealthLoss: 5 }
              );
              this.broadcastFilteredState();
              return;
            }
          }

          const breaker = this.missionState.diagnostic.correctBreaker;
          this.missionState.diagnostic.captainSelectedBreaker = breaker;
          this.missionState.diagnostic.unlockedBreaker = breaker;

          const shouldSolveNow = this.missionState.diagnostic.engineerActionTaken;

          if (shouldSolveNow) {
            this.missionState.diagnostic.engineerActionTaken = true;
            this.missionState.diagnostic.isSolved = true;
            this.missionState.diagnostic.lines[this.missionState.diagnostic.faultyLine] = {
              ...this.missionState.diagnostic.lines[this.missionState.diagnostic.faultyLine],
              temp: 54,
              press: 50,
              noise: 36,
              status: 'stabil',
            };
            this.missionState.feedbackState = 'success';
            this.missionState.feedbackMessage =
              this.missionState.operationTheme === 'golge_protokolu'
                ? 'GÜVENLİK DUVARI AŞILDI! Fiziksel panel bypass tamamlandı, faz kilidi açıldı.'
                : 'KOORDİNATLAR AKTARILDI VE DEVRE DENGELENDİ! Sonraki aşamaya geçebilirsiniz.';
          } else {
            this.missionState.feedbackState = 'idle';
            this.missionState.feedbackMessage =
              this.missionState.operationTheme === 'golge_protokolu'
                ? 'FİZİKSEL PANEL KİLİTLENDİ! Hackerın Subnet Köprüsünü senkronize etmesi bekleniyor.'
                : 'Güvenlik kilidi açıldı ve koordinatlar makiniste aktarıldı!';
          }
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'theme_diagnostic_solve' && activeMiniGame === 'ariza_teshisi') {
          if (player.role !== 'muhendis') {
            client.send('error_message', 'Yalnızca Makinist/Hacker bu müdahaleyi tamamlayabilir.');
            return;
          }
          if (this.missionState.diagnostic.isSolved) return;

          if (this.missionState.operationTheme === 'derin_basinc') {
            const tanksOk =
              Boolean(data?.tanks) &&
              !data.tanks[1] &&
              Boolean(data.tanks[2]) &&
              !data.tanks[3] &&
              Boolean(data.tanks[4]);
            const pressureOk = Number(data?.pressure) === 48;
            if (!tanksOk || !pressureOk) {
              this.applyPenalty('Hatalı tank seçimi veya basınç değeri! Dümenciden telsizle doğrula.');
              this.broadcastFilteredState();
              return;
            }
          }

          if (this.missionState.operationTheme === 'golge_protokolu') {
            if (data?.activeNode !== 'BETA' && data?.activeNode !== 'DELTA') {
              this.applyPenalty(
                'HATALI DÜĞÜM SEÇİMİ! Node-Beta veya Node-Delta köprüsünü seçmelisin.',
                { timeLoss: 10, hullLoss: 0, stealthLoss: 5 }
              );
              this.broadcastFilteredState();
              return;
            }
          }

          const breaker = this.missionState.diagnostic.correctBreaker;
          const shouldSolveNow =
            this.missionState.operationTheme === 'golge_protokolu'
              ? this.missionState.diagnostic.captainSelectedBreaker === breaker
              : true;

          if (this.missionState.operationTheme !== 'golge_protokolu') {
            this.missionState.diagnostic.captainSelectedBreaker = breaker;
            this.missionState.diagnostic.unlockedBreaker = breaker;
          }
          this.missionState.diagnostic.engineerActionTaken = true;
          this.missionState.diagnostic.engineerSuggestedLine = this.missionState.diagnostic.faultyLine;
          this.missionState.diagnostic.engineerValveAngle = this.missionState.diagnostic.targetValveAngle;
          this.missionState.diagnostic.engineerThrottleActive = true;
          this.missionState.diagnostic.isSolved = shouldSolveNow;

          if (shouldSolveNow) {
            this.missionState.diagnostic.lines[this.missionState.diagnostic.faultyLine] = {
              ...this.missionState.diagnostic.lines[this.missionState.diagnostic.faultyLine],
              temp: 54,
              press: 50,
              noise: 36,
              status: 'stabil',
            };
            this.missionState.feedbackState = 'success';
            this.missionState.feedbackMessage =
              this.missionState.operationTheme === 'golge_protokolu'
                ? 'KÖPRÜ BAŞARIYLA KURULDU! Fiziksel panel ve güvenlik duvarı senkronize edildi.'
                : 'BALAST DENGELENDİ! Vana ve basınç protokolü başarıyla mühürlendi.';
          } else {
            this.missionState.feedbackState = 'idle';
            this.missionState.feedbackMessage =
              'KÖPRÜ SENKRONİZE EDİLDİ! Ajanın Port-Delta (Sarı) ve 24.5V panelini kilitlemesi bekleniyor.';
          }
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'theme_signal_solve' && activeMiniGame === 'sinyal_cozumu') {
          if (this.missionState.signal.isSolved) return;

          if (this.missionState.operationTheme === 'golge_protokolu') {
            if (player.role === 'kaptan') {
              const angle = Number(data?.prismAngle);
              if (typeof data?.prismAngle !== 'number' || (angle !== 45 && angle !== 225)) {
                this.applyPenalty(
                  'LAZER SENSÖRÜ UYARISI! Prizma mandalını Hackerın bildirdiği doğru açıya getirin.',
                  { timeLoss: 10, hullLoss: 0, stealthLoss: 10 }
                );
                this.broadcastFilteredState();
                return;
              }
            } else {
              if (Number(data?.empFreq) !== 740) {
                this.applyPenalty(
                  'EMP DAMPER HATALI! Hedef rezonansı 740 THz seviyesine sabitleyin.',
                  { timeLoss: 10, hullLoss: 0, stealthLoss: 10 }
                );
                this.broadcastFilteredState();
                return;
              }
            }
          } else if (this.missionState.operationTheme === 'derin_basinc') {
            if (player.role !== 'muhendis') {
              client.send('error_message', 'Yalnızca Makinist manyetik torpido sinyalini kilitleyebilir.');
              return;
            }
            const tubeOk = Number(data?.tube) === 2;
            const freqOk = typeof data?.torpFreq === 'number' && Math.abs(Number(data.torpFreq) - 433.8) < 0.05;
            if (!tubeOk || !freqOk) {
              this.applyPenalty('Hatalı kovan veya frekans! Dümencinin sonarına danış.');
              this.broadcastFilteredState();
              return;
            }
          }

          this.missionState.signal.engineerTunedFreq =
            data?.freq || this.missionState.signal.correctFrequency;
          this.missionState.signal.isLocked = true;
          this.missionState.signal.frequencyMatched = true;
          this.missionState.signal.isSolved = true;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage =
            this.missionState.operationTheme === 'golge_protokolu'
              ? 'OPTİK PRİZMA VE KÖR NOKTA KORİDORU SENKRONİZE EDİLDİ!'
              : 'MANYETİK TORPİDO SİNYALİ KİLİTLENDİ! İletişim başarıyla sağlandı.';
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'theme_cable_solve' && activeMiniGame === 'kablo_baglantisi') {
          if (player.role !== 'muhendis') {
            client.send('error_message', 'Yalnızca Makinist bölme yalıtımını tamamlayabilir.');
            return;
          }
          if (this.missionState.cable.isSolved) return;

          const valveOk = Boolean(data?.valves?.C) && !data?.valves?.A && !data?.valves?.B;
          const switchOk =
            Boolean(data?.switches?.sw2) &&
            !data?.switches?.sw1 &&
            !data?.switches?.sw3 &&
            !data?.switches?.sw4;
          const clampOk = Number(data?.clampProgress) >= 65;
          if (!valveOk || !switchOk || !clampOk) {
            this.applyPenalty('Hatalı valf, şalter veya kelepçe ayarı! Dümenciye telsizle sor.');
            this.broadcastFilteredState();
            return;
          }

          this.missionState.cable.isTested = true;
          this.missionState.cable.isSolved = true;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = 'Bölme yalıtım mührü hatasız kilitlendi!';
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'theme_airlock_solve' && activeMiniGame === 'hava_kilidi') {
          if (player.role !== 'muhendis') {
            client.send('error_message', 'Yalnızca Makinist elektroliz üretimini başlatabilir.');
            return;
          }
          if (this.missionState.airlock.isSolved) return;

          const voltOk = Math.abs(Number(data?.volt) - 180) <= 5;
          const catOk = Number(data?.catalystPct) >= 60 && Number(data?.catalystPct) <= 70;
          const cellsOk =
            Boolean(data?.cellSwitches?.katotA) &&
            Boolean(data?.cellSwitches?.katotB) &&
            Boolean(data?.cellSwitches?.anotC);
          if (!voltOk || !catOk || !cellsOk) {
            this.applyPenalty('Hatalı voltaj, katalizör veya hücre seçimi! Dümenciden telsizle doğrula.');
            this.broadcastFilteredState();
            return;
          }

          this.missionState.airlock.isSolved = true;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = 'Oksijen üretimi ve hücre voltajı stabilize edildi!';
          this.broadcastFilteredState();
          return;
        }
      }

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

          // Reject if valveAngle or throttleActive is missing (do not auto-fill with correct answer!)
          if (data.valveAngle === undefined || data.valveAngle === null) {
            this.missionState.diagnostic.engineerSuggestedLine = data.line;
            this.missionState.feedbackState = 'error';
            this.missionState.feedbackMessage = 'Müdahale başarısız: Soğutma valfi açısı belirtilmedi. Lütfen valf açısını ayarlayın.';
            this.broadcastFilteredState();
            return;
          }

          if (data.throttleActive === undefined || data.throttleActive === null) {
            this.missionState.diagnostic.engineerSuggestedLine = data.line;
            this.missionState.feedbackState = 'error';
            this.missionState.feedbackMessage = 'Müdahale başarısız: Basınç tahliye anahtarı konumu belirtilmedi. Lütfen tahliye anahtarını ayarlayın.';
            this.broadcastFilteredState();
            return;
          }

          if (data.valveAngle !== this.missionState.diagnostic.targetValveAngle) {
            this.missionState.diagnostic.engineerSuggestedLine = data.line;
            this.missionState.diagnostic.engineerValveAngle = data.valveAngle;
            this.missionState.feedbackState = 'error';
            this.missionState.feedbackMessage = 'Müdahale başarısız: Soğutma valfi doğru açıda değil. Termal şok riski nedeniyle tahliye emniyet valfi tarafından durduruldu.';
            this.broadcastFilteredState();
            return;
          }

          if (!data.throttleActive) {
            this.missionState.diagnostic.engineerSuggestedLine = data.line;
            this.missionState.diagnostic.engineerThrottleActive = false;
            this.missionState.feedbackState = 'error';
            this.missionState.feedbackMessage = 'Müdahale başarısız: Basınç tahliyesi devre dışı. Hat basıncı boşaltılmadan devre açılamaz.';
            this.broadcastFilteredState();
            return;
          }

          const valveAngle = data.valveAngle;
          const throttleActive = data.throttleActive;

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
      if (isThemeCustom) {
        if (actionType === 'derin_basinc_transmit_core') {
          if (player.role !== 'kaptan') return;
          this.missionState.energy.isDraftShared = true;
          this.missionState.feedbackState = 'idle';
          this.missionState.feedbackMessage = 'Çekirdek enerji koordinatları makiniste iletildi!';
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'derin_basinc_seal_reactor') {
          if (player.role !== 'muhendis') {
            client.send('error_message', 'Yalnızca Makinist reaktör kapağını mühürleyebilir.');
            return;
          }
          if (this.missionState.energy.isLocked) return;

          const rodOk = typeof data?.k02Position === 'number' && data.k02Position <= 20;
          const valveOk = data?.valve1Open === true;
          const pressureOk = data?.currentPressure === 28;

          if (rodOk && valveOk && pressureOk) {
            this.missionState.energy.engineerAllocation = { yasamDestegi: 5, itki: 5, kalkan: 5 };
            this.missionState.energy.isDraftShared = true;
            this.missionState.energy.isLocked = true;
            this.missionState.feedbackState = 'success';
            this.missionState.feedbackMessage = 'Soğutma pompası çalıştırıldı ve K-02 mühürlendi!';
          } else {
            this.applyPenalty('Hatalı reaktör mühürleme parametreleri (K-02 %20, Boru-1 Açık ve 28 Bar olmalı)!');
          }
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'theme_apply_penalty') {
          this.applyPenalty(
            data?.reason || 'Hatalı müdahale tespit edildi!',
            {
              timeLoss: typeof data?.timeLoss === 'number' ? data.timeLoss : 15,
              hullLoss: typeof data?.hullLoss === 'number' ? data.hullLoss : 10,
              stealthLoss: typeof data?.stealthLoss === 'number' ? data.stealthLoss : 0,
            }
          );
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'golge_energy_solve') {
          if (this.missionState.energy.isLocked) return;
          if (player.role === 'muhendis') {
            this.missionState.energy.isDraftShared = true;
            this.missionState.feedbackState = 'idle';
            this.missionState.feedbackMessage =
              'Kasa şifre matrisi kırıldı! PIN (8429) Ajanın terminaline aktarıldı, Ajan onayı bekleniyor.';
            this.broadcastFilteredState();
            return;
          }
          if (player.role !== 'kaptan') return;
          if (typeof data?.pin !== 'string' || data.pin.trim() !== '8429') {
            this.applyPenalty('Hatalı kasa PIN kodu! Hacker ile telsizden doğrula.', {
              timeLoss: 15,
              hullLoss: 0,
              stealthLoss: 10,
            });
            this.broadcastFilteredState();
            return;
          }
          this.missionState.energy.engineerAllocation = { yasamDestegi: 5, itki: 5, kalkan: 5 };
          this.missionState.energy.isDraftShared = true;
          this.missionState.energy.isLocked = true;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = 'Kasa şifresi kırıldı ve biyometrik veri başarıyla çekildi!';
          this.broadcastFilteredState();
          return;
        }
      }

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
      if (isThemeCustom) {
        if (actionType === 'derin_basinc_transmit_vector') {
          if (player.role !== 'kaptan') return;
          const angleStr = String(data?.angle || '');
          this.missionState.rescue.selectedRouteId = angleStr.includes('45')
            ? 'alfa'
            : angleStr.includes('15')
            ? 'gama'
            : 'beta';
          this.missionState.rescue.captainApproved = true;
          this.missionState.rescue.validationError = null;
          this.missionState.feedbackState = 'idle';
          this.missionState.feedbackMessage = 'Yükseliş vektörü makiniste aktarıldı!';
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'derin_basinc_trigger_ascent') {
          if (player.role !== 'muhendis') {
            client.send('error_message', 'Yalnızca Makinist acil yüzeye çıkışı tetikleyebilir.');
            return;
          }
          if (!this.missionState.rescue.captainApproved) {
            client.send('error_message', 'Dümencinin yükseliş vektörünü aktarması bekleniyor!');
            return;
          }
          const pressureOk = Number(data?.pressure) === 18;
          const angleOk = Number(data?.angle) === 28;
          const tanksOk =
            Boolean(data?.tanks) &&
            Boolean(data.tanks[1]) &&
            !data.tanks[2] &&
            Boolean(data.tanks[3]) &&
            !data.tanks[4];
          if (!pressureOk || !angleOk || !tanksOk) {
            this.applyPenalty('Hatalı tahliye parametreleri! Balast basıncı, çıkış açısı ve tank sırası doğrulanamadı.');
            this.broadcastFilteredState();
            return;
          }
          const scoreData = calculateFinalScore(
            4,
            this.missionState.timeLeftSeconds,
            this.missionState.hullIntegrity,
            10
          );
          this.missionState.rescue.captainApproved = true;
          this.missionState.rescue.engineerApproved = true;
          this.missionState.status = 'phase_result';
          this.missionState.outcomeType = 'tam_basari';
          this.missionState.rescuedCrewCount = 10;
          this.missionState.completedTasksCount = 4;
          this.missionState.finalScore = scoreData.total;
          this.missionState.scoreBreakdown = scoreData.breakdown;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = 'Acil yüzeye çıkış başarıyla tamamlandı!';
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'golge_transmit_escape') {
          if (player.role !== 'kaptan') return;
          this.missionState.rescue.captainApproved = true;
          this.missionState.rescue.selectedRouteId = data?.route === 'metro' ? 'alfa' : 'beta';
          this.missionState.rescue.validationError = null;
          this.missionState.feedbackState = 'idle';
          this.missionState.feedbackMessage = 'Kaçış rotası koordinatları hacker terminaline aktarıldı!';
          this.broadcastFilteredState();
          return;
        }

        if (actionType === 'golge_execute_extraction') {
          if (player.role !== 'muhendis') {
            client.send('error_message', 'Yalnızca Hacker son kaçış tahliyesini onaylayabilir.');
            return;
          }
          if (!this.missionState.rescue.captainApproved) {
            client.send('error_message', 'Ajanın kaçış rotasını onaylayıp aktarması bekleniyor!');
            return;
          }
          const scoreData = calculateFinalScore(
            4,
            this.missionState.timeLeftSeconds,
            this.missionState.hullIntegrity,
            10
          );
          this.missionState.rescue.captainApproved = true;
          this.missionState.rescue.engineerApproved = true;
          this.missionState.status = 'phase_result';
          this.missionState.outcomeType = 'tam_basari';
          this.missionState.rescuedCrewCount = 10;
          this.missionState.completedTasksCount = 4;
          this.missionState.finalScore = scoreData.total;
          this.missionState.scoreBreakdown = scoreData.breakdown;
          this.missionState.feedbackState = 'success';
          this.missionState.feedbackMessage = 'Gölge Protokolü tahliyesi iz bırakmadan tamamlandı!';
          this.broadcastFilteredState();
          return;
        }
      }

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

  private applyPenalty(
    reason: string,
    opts?: { timeLoss?: number; hullLoss?: number; stealthLoss?: number }
  ) {
    const timeLoss = opts?.timeLoss ?? 15;
    const hullLoss = opts?.hullLoss ?? 10;
    const stealthLoss = opts?.stealthLoss ?? 0;

    this.missionState.timeLeftSeconds = Math.max(0, this.missionState.timeLeftSeconds - timeLoss);
    this.missionState.hullIntegrity = Math.max(0, this.missionState.hullIntegrity - hullLoss);
    if (stealthLoss > 0) {
      this.missionState.stealthLevel = Math.max(0, (this.missionState.stealthLevel ?? 100) - stealthLoss);
    }

    const suffixParts: string[] = [];
    if (timeLoss > 0) suffixParts.push(`-${timeLoss}s Süre`);
    if (hullLoss > 0) suffixParts.push(`-%${hullLoss} Bütünlük`);
    if (stealthLoss > 0) suffixParts.push(`-%${stealthLoss} Sessizlik`);

    this.missionState.feedbackState = 'error';
    this.missionState.feedbackMessage =
      suffixParts.length > 0 ? `${reason} (${suffixParts.join(', ')})` : reason;

    const stealthDepleted = stealthLoss > 0 && (this.missionState.stealthLevel ?? 100) <= 0;
    if (this.missionState.timeLeftSeconds <= 0 || this.missionState.hullIntegrity <= 0 || stealthDepleted) {
      this.handleMissionFailure(
        stealthDepleted
          ? 'Gizlilik tamamen deşifre oldu! Alarm sistemleri operasyonu kilitledi.'
          : this.missionState.hullIntegrity <= 0
          ? 'İstasyon gövdesi kritik hasar alarak parçalandı!'
          : 'Süre tükendi! İstasyon patlamadan önce tahliye tamamlanamadı.'
      );
    }
  }

  private handleServerTick() {
    // 1. Disconnect Countdown: Track all disconnected players simultaneously
    if (this.disconnectedPlayers.size > 0) {
      let expiredName: string | null = null;
      for (const info of this.disconnectedPlayers.values()) {
        info.secondsLeft = Math.max(0, info.secondsLeft - 1);
        if (info.secondsLeft <= 0 && !expiredName) {
          expiredName = info.name;
        }
      }
      if (expiredName) {
        this.disconnectedPlayers.clear();
        this.missionState.isDisconnected = false;
        this.missionState.isPaused = false;
        this.handleMissionFailure(`Mürettebat üyesinin (${expiredName}) sinyali 45 saniye boyunca alınamadı. Görev sonlandırıldı.`);
        return;
      }
      this.syncDisconnectBanner();
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
      this.missionState.hostId = client.sessionId;
    }

    const targetCount = this.missionState.targetPlayerCount || 2;
    const allowedRoles = getOmegaRolesForCount(targetCount);
    const occupiedRoles = new Set(Array.from(this.playerSessions.values()).map((p) => p.role));
    const requestedRole = options?.role as Role | undefined;

    let role: Role = allowedRoles[0];
    if (requestedRole && allowedRoles.includes(requestedRole) && !occupiedRoles.has(requestedRole)) {
      role = requestedRole;
    } else {
      const openRole = allowedRoles.find((r) => !occupiedRoles.has(r));
      role = openRole || allowedRoles[0];
    }

    const defaultName =
      isTeamOperationTheme(this.missionState.operationTheme)
        ? getOmegaRoleMeta(role, targetCount === 3 ? 3 : 4).defaultName
        : role === 'kaptan'
        ? 'Kaptan Ece'
        : 'Mühendis Mert';
    const playerName = options?.playerName || defaultName;

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
      connected: true,
    };

    // If game was paused waiting for a disconnected player
    if (this.disconnectedPlayers.size > 0) {
      this.disconnectedPlayers.delete(client.sessionId);
      this.syncDisconnectBanner();
      if (this.disconnectedPlayers.size === 0) {
        this.missionState.feedbackState = 'idle';
        this.missionState.feedbackMessage = `${playerName} yeniden bağlandı! Görev sürüyor.`;
      }
    }

    this.broadcastFilteredState();
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.playerSessions.get(client.sessionId);
    if (!player) return;

    const targetCount = this.missionState.targetPlayerCount || 2;
    const isGraceTrackedStatus =
      this.missionState.status === 'role_intro' ||
      this.missionState.status === 'phase_game' ||
      this.missionState.status === 'phase_energy' ||
      this.missionState.status === 'phase_rescue';

    if (consented) {
      // Voluntary leave
      this.playerSessions.delete(client.sessionId);
      this.disconnectedPlayers.delete(client.sessionId);

      if (isGraceTrackedStatus) {
        this.handleMissionFailure(`Mürettebat üyesi (${player.name}) görevden ayrıldı. Görev sonlandırıldı.`);
      } else if (this.missionState.status === 'lobby') {
        this.missionState.players[player.role] = {
          id: '',
          name: this.getWaitingSlotName(this.missionState.operationTheme, player.role, targetCount),
          role: player.role,
          ready: false,
          roleConfirmed: false,
          connected: false,
        };
        this.transferHostIfNeeded(client.sessionId);
        this.broadcastFilteredState();
      }
      return;
    }

    // Unintentional disconnect
    player.connected = false;
    const slot = this.missionState.players[player.role];
    if (slot) {
      slot.connected = false;
    }

    if (this.missionState.status === 'lobby') {
      this.broadcastFilteredState();
      try {
        await this.allowReconnection(client, 15);
        player.connected = true;
        if (this.missionState.players[player.role]) {
          this.missionState.players[player.role]!.connected = true;
        }
        this.broadcastFilteredState();
      } catch {
        this.playerSessions.delete(client.sessionId);
        if (this.missionState.status === 'lobby') {
          this.missionState.players[player.role] = {
            id: '',
            name: this.getWaitingSlotName(this.missionState.operationTheme, player.role, targetCount),
            role: player.role,
            ready: false,
            roleConfirmed: false,
            connected: false,
          };
          this.transferHostIfNeeded(client.sessionId);
          this.broadcastFilteredState();
        }
      }
      return;
    }

    if (isGraceTrackedStatus) {
      this.disconnectedPlayers.set(client.sessionId, { name: player.name, secondsLeft: 45 });
      this.syncDisconnectBanner();
      this.broadcastFilteredState();

      try {
        await this.allowReconnection(client, 45);
        // Player reconnected!
        player.connected = true;
        if (this.missionState.players[player.role]) {
          this.missionState.players[player.role]!.connected = true;
        }
        this.disconnectedPlayers.delete(client.sessionId);
        this.syncDisconnectBanner();
        if (this.disconnectedPlayers.size === 0) {
          this.missionState.feedbackState = 'idle';
          this.missionState.feedbackMessage = `${player.name} yeniden bağlandı. Görev devam ediyor.`;
        }
        this.broadcastFilteredState();
      } catch {
        // 45s Grace period expired
        this.disconnectedPlayers.delete(client.sessionId);
        this.playerSessions.delete(client.sessionId);
        if (this.missionState.status !== 'phase_result') {
          this.syncDisconnectBanner();
          this.handleMissionFailure(`Mürettebat üyesi (${player.name}) 45 saniye boyunca yeniden bağlanamadı. Görev sonlandırıldı.`);
        }
      }
    }
  }

  onDispose() {
    LostSignalRoom.activeRooms.delete(this.roomCode);
    if (this.tickInterval) {
      this.tickInterval.clear();
    }
    this.processedActionIds.clear();
    this.disconnectedPlayers.clear();
  }

  /**
   * Role-based secret data isolation:
   * Only the information pertinent to the player's role is sent to their phone.
   */
  public getFilteredStateForRole(role: Role): MissionState {
    const filteredOmega = this.missionState.omegaData
      ? filterOmegaStateForRole(this.missionState.omegaData, role)
      : undefined;

    const base: MissionState = {
      ...this.missionState,
      myRole: role,
      omegaData: filteredOmega,
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
              lines: {
                reaktor: { temp: 0, press: 0, noise: 0, code: 'CIR-01', status: this.missionState.advancedScenario.subsystems.reaktor.lines?.reaktor.status || 'stabil' },
                sogutucu: { temp: 0, press: 0, noise: 0, code: 'CIR-02', status: this.missionState.advancedScenario.subsystems.reaktor.lines?.sogutucu.status || 'stabil' },
                anten: { temp: 0, press: 0, noise: 0, code: 'CIR-03', status: this.missionState.advancedScenario.subsystems.reaktor.lines?.anten.status || 'stabil' },
                yonlendirme: { temp: 0, press: 0, noise: 0, code: 'CIR-04', status: this.missionState.advancedScenario.subsystems.reaktor.lines?.yonlendirme.status || 'stabil' },
              },
            },
            sinyal: {
              ...this.missionState.advancedScenario.subsystems.sinyal,
              targetFrequency: '??? MHz',
              computedCode: '????',
              incomingSymbols: ['?', '?', '?', '?'],
              frequencies: undefined as any,
              symbols: ['?', '?', '?', '?'],
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
              targetValveAngle: 0,
              lineBreakerMap: undefined as any,
              faultyLine: undefined as any,
            },
            sinyal: {
              ...this.missionState.advancedScenario.subsystems.sinyal,
              targetFrequency: '??? MHz',
              computedCode: '????',
              symbolMap: undefined as any,
              ruleType: undefined as any,
              ruleDescription: undefined as any,
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
