import type { RadioSignal } from './radioSignal';
import { Client, Room } from 'colyseus.js';
import { MissionState, Role, EnvironmentType, GameMode, OperationTheme } from '../types/game';
import { getTeamThemeFromCode, isTeamOperationTheme } from './omegaGameEngine';

type StateCallback = (state: MissionState) => void;
type ErrorCallback = (error: string) => void;
type ConnectionCallback = (status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting') => void;
type RadioCallback = (transmission: any) => void;

class ColyseusClientService {
  private client: Client | null = null;
  private room: Room | null = null;
  private stateCallbacks: Set<StateCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private radioCallbacks: Set<RadioCallback> = new Set();
  private radioSignalCallbacks = new Set<(signal: RadioSignal) => void>();
  private actionCounter: number = 0;
  private intentionalLeave: boolean = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 18;
  private isAttemptingReconnect: boolean = false;

  constructor() {
    this.initClient();
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearStoredSession() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('partyverse_reconnect_token');
      sessionStorage.removeItem('partyverse_room_id');
    }
  }

  private getServerUrl(): string {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol;
      const configuredUrl = import.meta.env.VITE_COLYSEUS_URL?.trim();
      if (configuredUrl) return configuredUrl;

      const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${window.location.host}`;
    }
    return 'ws://localhost:3000';
  }

  private initClient() {
    const url = this.getServerUrl();
    this.client = new Client(url);
  }

  public isConnected(): boolean {
    return !!this.room;
  }

  public getSessionId(): string | null {
    return this.room ? this.room.sessionId : null;
  }

  public getRoomId(): string | null {
    return this.room ? this.room.roomId : null;
  }

  public getReconnectionToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('partyverse_reconnect_token');
    }
    return this.room?.reconnectionToken || null;
  }

  /**
   * Create a new room with roomCode (Host flow - strictly uses client.create)
   */
  public async createRoom(
    roomCode: string,
    playerName: string,
    role: Role = 'kaptan',
    environment: EnvironmentType = 'kayip_sinyal',
    operationTheme?: OperationTheme,
    gameMode?: GameMode,
    targetPlayerCount?: 2 | 3 | 4
  ): Promise<void> {
    if (this.room) {
      await this.leaveRoom().catch(() => {});
    }
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;
    if (!this.client) this.initClient();
    this.intentionalLeave = false;
    this.notifyConnection('connecting');

    const clean = roomCode.toUpperCase().trim();
    const detectedTeamTheme = getTeamThemeFromCode(clean);
    const isPrefixed =
      clean.startsWith('KR') ||
      clean.startsWith('SHDW') ||
      clean.startsWith('DP') ||
      clean.startsWith('KYP') ||
      Boolean(detectedTeamTheme);
    const normalizedCode = isPrefixed ? clean : `KYP-${clean}`;

    let theme = operationTheme;
    if (!theme) {
      if (normalizedCode.startsWith('KR')) theme = 'karantina_2088';
      else if (normalizedCode.startsWith('SHDW')) theme = 'golge_protokolu';
      else if (normalizedCode.startsWith('DP')) theme = 'derin_basinc';
      else if (detectedTeamTheme) theme = detectedTeamTheme;
      else theme = 'kayip_sinyal';
    }

    const isTeamTheme = isTeamOperationTheme(theme);
    const playerCount: 2 | 3 | 4 = isTeamTheme
      ? targetPlayerCount === 3 || /^(OMG3|TTN3|SBK3|BZL3)/.test(normalizedCode)
        ? 3
        : 4
      : 2;

    try {
      this.room = await this.client!.create('lost_signal', {
        roomCode: normalizedCode,
        playerName,
        role,
        environment,
        operationTheme: theme,
        gameMode,
        targetPlayerCount: playerCount,
      });

      this.setupRoomHandlers();
      this.saveSessionToken();
      this.notifyConnection('connected');
    } catch (err: any) {
      this.notifyConnection('disconnected');
      const msg = err.message?.includes('zaten') 
        ? err.message 
        : `Oda oluşturulamadı: ${err.message || 'Sunucu hatası'}`;
      this.notifyError(msg);
      throw new Error(msg);
    }
  }

  /**
   * Join an existing room with roomCode (Joiner flow - strictly uses client.join)
   */
  public async joinRoom(
    roomCode: string,
    playerName: string,
    preferredRole?: Role
  ): Promise<void> {
    if (this.room) {
      await this.leaveRoom().catch(() => {});
    }
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;
    if (!this.client) this.initClient();
    this.intentionalLeave = false;
    this.notifyConnection('connecting');

    const clean = roomCode.toUpperCase().trim();
    const isPrefixed =
      clean.startsWith('KR') ||
      clean.startsWith('SHDW') ||
      clean.startsWith('DP') ||
      clean.startsWith('KYP') ||
      Boolean(getTeamThemeFromCode(clean));
    const normalizedCode = isPrefixed ? clean : `KYP-${clean}`;

    try {
      this.room = await this.client!.join('lost_signal', {
        roomCode: normalizedCode,
        playerName,
        ...(preferredRole ? { role: preferredRole } : {}),
      });

      this.setupRoomHandlers();
      this.saveSessionToken();
      this.notifyConnection('connected');
    } catch (err: any) {
      this.notifyConnection('disconnected');
      let msg = `Odaya (${normalizedCode}) katılınamadı.`;
      if (err.message?.includes('no rooms found') || err.message?.includes('not found')) {
        msg = `Girdiğiniz kodla (${normalizedCode}) aktif bir oda bulunamadı veya oda dolu.`;
      } else if (err.message) {
        msg += ` (${err.message})`;
      }
      this.notifyError(msg);
      throw new Error(msg);
    }
  }

  /**
   * Reconnect within the 45-second grace period using stored token.
   * When keepTokenOnTransientError is true, transient network errors keep the token for automatic retries.
   */
  public async attemptReconnect(opts?: { keepTokenOnTransientError?: boolean }): Promise<boolean> {
    if (this.room) return true;
    const token = this.getReconnectionToken();
    if (!token) return false;
    if (this.isAttemptingReconnect) return false;

    this.isAttemptingReconnect = true;
    if (!this.client) this.initClient();
    if (!opts?.keepTokenOnTransientError) {
      this.notifyConnection('connecting');
    }

    try {
      this.room = await this.client!.reconnect(token);
      this.clearReconnectTimer();
      this.reconnectAttempts = 0;
      this.isAttemptingReconnect = false;
      this.setupRoomHandlers();
      this.saveSessionToken();
      this.notifyConnection('connected');
      return true;
    } catch (err: any) {
      this.isAttemptingReconnect = false;
      const msg = String(err?.message || '');
      const isFatalRoomGone = /not found|expired|404|consumed|invalid/i.test(msg);

      if (isFatalRoomGone || !opts?.keepTokenOnTransientError) {
        this.clearReconnectTimer();
        this.clearStoredSession();
        this.notifyConnection('disconnected');
      } else {
        this.notifyConnection('reconnecting');
      }
      return false;
    }
  }

  private startAutoReconnect() {
    if (!this.getReconnectionToken() || this.room) return;
    this.reconnectAttempts = 0;
    this.notifyConnection('reconnecting');
    this.scheduleNextReconnect(1200);
  }

  private scheduleNextReconnect(delayMs: number) {
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(async () => {
      if (this.intentionalLeave || this.room) return;
      const token = this.getReconnectionToken();
      if (!token) {
        this.notifyConnection('disconnected');
        return;
      }

      const ok = await this.attemptReconnect({ keepTokenOnTransientError: true });
      if (ok || this.room) return;

      if (!this.getReconnectionToken()) {
        this.notifyError('Oda oturumunun süresi doldu. Lütfen yeniden katılın.');
        this.notifyConnection('disconnected');
        return;
      }

      this.reconnectAttempts++;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleNextReconnect(2500);
      } else {
        this.clearReconnectTimer();
        this.clearStoredSession();
        this.notifyConnection('disconnected');
        this.notifyError('45 saniyelik yeniden bağlanma süresi doldu. Lütfen yeniden odaya katılın.');
      }
    }, delayMs);
  }

  public async retryReconnectNow(): Promise<boolean> {
    if (this.room) return true;
    const token = this.getReconnectionToken();
    if (!token) return false;
    this.clearReconnectTimer();
    const ok = await this.attemptReconnect({ keepTokenOnTransientError: true });
    if (!ok && !this.room && this.getReconnectionToken() && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.scheduleNextReconnect(2500);
    }
    return ok;
  }

  private setupRoomHandlers() {
    if (!this.room) return;

    this.room.onMessage('state_update', (filteredState: MissionState) => {
      this.notifyState(filteredState);
    });

    this.room.onMessage('error_message', (msg: string) => {
      this.notifyError(msg);
    });

    this.room.onMessage('radio_signal', (signal: RadioSignal) => {
      this.radioSignalCallbacks.forEach((callback) => callback(signal));
    });

    this.room.onMessage('radio_transmission', (transmission: any) => {
      this.notifyRadio(transmission);
    });

    this.room.onError((code, message) => {
      this.notifyError(`Sunucu hatası [${code}]: ${message}`);
    });

    // Request authoritative state from server immediately
    try {
      this.room.send('request_state');
    } catch (e) {
      // ignore if room closed
    }

    this.room.onLeave((code) => {
      console.warn(`[Colyseus] Left room with code: ${code}`);
      const wasIntentional = this.intentionalLeave;
      this.room = null;

      if (wasIntentional) {
        this.clearReconnectTimer();
        this.clearStoredSession();
        this.notifyConnection('disconnected');
      } else {
        // Unintentional drop (network loss, refresh) — keep token and start auto-reconnect loop
        this.startAutoReconnect();
      }
    });
  }

  private saveSessionToken() {
    if (typeof window !== 'undefined' && this.room && this.room.reconnectionToken) {
      sessionStorage.setItem('partyverse_reconnect_token', this.room.reconnectionToken);
      sessionStorage.setItem('partyverse_room_id', this.room.roomId);
    }
  }

  public toggleReady() {
    if (this.room) {
      this.room.send('toggle_ready');
    }
  }

  public selectRole(targetRole: Role) {
    if (this.room) {
      this.room.send('select_role', { targetRole });
    }
  }

  public setGameMode(mode: GameMode) {
    if (this.room) {
      this.room.send('set_game_mode', { mode });
    }
  }

  public rerollTasks() {
    if (this.room) {
      this.room.send('reroll_tasks');
    }
  }

  public startGame() {
    if (this.room) {
      this.room.send('start_game');
    }
  }

  public confirmRole() {
    if (this.room) {
      this.room.send('confirm_role');
    }
  }

  public sendAction(
    actionType: string,
    data: any,
    roundId: string,
    phaseIndex: number
  ) {
    if (!this.room) return;
    this.actionCounter++;
    const actionId = `ACT-${Date.now()}-${this.actionCounter}-${Math.random().toString(36).substring(2, 6)}`;

    this.room.send('game_action', {
      actionId,
      roundId,
      phaseIndex,
      actionType,
      data,
    });
  }

  public advancePhase(roundId: string, expectedPhaseIndex: number) {
    if (this.room) {
      this.room.send('advance_phase', {
        roundId,
        expectedPhaseIndex,
      });
    }
  }

  public restartRound() {
    if (this.room) {
      this.room.send('restart_round');
    }
  }

  public async leaveRoom() {
    this.intentionalLeave = true;
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;
    this.isAttemptingReconnect = false;
    this.clearStoredSession();
    if (this.room) {
      try {
        await this.room.leave();
      } catch {
        // ignore leave error
      }
      this.room = null;
    }
    this.notifyConnection('disconnected');
  }

  // Subscriptions
  public onState(cb: StateCallback): () => void {
    this.stateCallbacks.add(cb);
    return () => this.stateCallbacks.delete(cb);
  }

  public onError(cb: ErrorCallback): () => void {
    this.errorCallbacks.add(cb);
    return () => this.errorCallbacks.delete(cb);
  }

  public getRadioSessionId() {
    return this.isConnected() ? this.room?.sessionId : undefined;
  }

  public sendRadioSignal(signal: RadioSignal) {
    if (this.isConnected()) this.room?.send('radio_signal', signal);
  }

  public onRadioSignal(callback: (signal: RadioSignal) => void) {
    this.radioSignalCallbacks.add(callback);
    return () => { this.radioSignalCallbacks.delete(callback); };
  }

  public sendRadio(transmission: any) {
    if (this.room) {
      this.room.send('radio_transmission', transmission);
    }
  }

  public onRadio(cb: RadioCallback): () => void {
    this.radioCallbacks.add(cb);
    return () => this.radioCallbacks.delete(cb);
  }

  public onConnection(cb: ConnectionCallback): () => void {
    this.connectionCallbacks.add(cb);
    return () => this.connectionCallbacks.delete(cb);
  }

  private notifyRadio(transmission: any) {
    this.radioCallbacks.forEach((cb) => {
      try {
        cb(transmission);
      } catch (e) {
        console.error('Radio callback error:', e);
      }
    });
  }

  private notifyState(state: MissionState) {
    this.stateCallbacks.forEach((cb) => {
      try {
        cb(state);
      } catch (e) {
        console.error('State callback error:', e);
      }
    });
  }

  private notifyError(err: string) {
    this.errorCallbacks.forEach((cb) => {
      try {
        cb(err);
      } catch (e) {
        console.error('Error callback error:', e);
      }
    });
  }

  private notifyConnection(status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting') {
    this.connectionCallbacks.forEach((cb) => {
      try {
        cb(status);
      } catch (e) {
        console.error('Connection callback error:', e);
      }
    });
  }
}

export const colyseusClient = new ColyseusClientService();
