import { Client, Room } from 'colyseus.js';
import { MissionState, Role, EnvironmentType, GameMode, OperationTheme } from '../types/game';

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
  private actionCounter: number = 0;
  private intentionalLeave: boolean = false;

  constructor() {
    this.initClient();
  }

  private getServerUrl(): string {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const protocol = window.location.protocol;
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      
      // If running inside a standalone mobile APK wrapper (Capacitor/Cordova/file://)
      const isNativeAppWrapper = 
        protocol === 'file:' || 
        protocol === 'capacitor:' || 
        protocol === 'ionic:' ||
        (isLocalhost && window.location.port !== '3000');

      if (isNativeAppWrapper) {
        return 'wss://ais-pre-7auzhp5svziwyjbxp35hez-984295935198.europe-west2.run.app';
      }

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
    operationTheme?: OperationTheme
  ): Promise<void> {
    if (!this.client) this.initClient();
    this.intentionalLeave = false;
    this.notifyConnection('connecting');

    const clean = roomCode.toUpperCase().trim();
    const isPrefixed = clean.startsWith('KR') || clean.startsWith('SHDW') || clean.startsWith('DP') || clean.startsWith('KYP');
    const normalizedCode = isPrefixed ? clean : `KYP-${clean}`;

    let theme = operationTheme;
    if (!theme) {
      if (normalizedCode.startsWith('KR')) theme = 'karantina_2088';
      else if (normalizedCode.startsWith('SHDW')) theme = 'golge_protokolu';
      else if (normalizedCode.startsWith('DP')) theme = 'derin_basinc';
      else theme = 'kayip_sinyal';
    }

    try {
      this.room = await this.client!.create('lost_signal', {
        roomCode: normalizedCode,
        playerName,
        role,
        environment,
        operationTheme: theme,
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
    playerName: string
  ): Promise<void> {
    if (!this.client) this.initClient();
    this.intentionalLeave = false;
    this.notifyConnection('connecting');

    const clean = roomCode.toUpperCase().trim();
    const isPrefixed = clean.startsWith('KR') || clean.startsWith('SHDW') || clean.startsWith('DP') || clean.startsWith('KYP');
    const normalizedCode = isPrefixed ? clean : `KYP-${clean}`;

    try {
      this.room = await this.client!.join('lost_signal', {
        roomCode: normalizedCode,
        playerName,
      });

      this.setupRoomHandlers();
      this.saveSessionToken();
      this.notifyConnection('connected');
    } catch (err: any) {
      this.notifyConnection('disconnected');
      let msg = `Odaya (${normalizedCode}) katılınamadı.`;
      if (err.message?.includes('no rooms found') || err.message?.includes('not found')) {
        msg = `Girdiğiniz kodla (${normalizedCode}) aktif bir oda bulunamadı veya oda dolu (2/2).`;
      } else if (err.message) {
        msg += ` (${err.message})`;
      }
      this.notifyError(msg);
      throw new Error(msg);
    }
  }

  /**
   * Reconnect within the 45-second grace period using stored token
   */
  public async attemptReconnect(): Promise<boolean> {
    const token = this.getReconnectionToken();
    if (!token) return false;

    if (!this.client) this.initClient();
    this.notifyConnection('connecting');

    try {
      this.room = await this.client!.reconnect(token);
      this.setupRoomHandlers();
      this.saveSessionToken();
      this.notifyConnection('connected');
      return true;
    } catch (err) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('partyverse_reconnect_token');
        sessionStorage.removeItem('partyverse_room_id');
      }
      this.notifyConnection('disconnected');
      return false;
    }
  }

  private setupRoomHandlers() {
    if (!this.room) return;

    this.room.onMessage('state_update', (filteredState: MissionState) => {
      this.notifyState(filteredState);
    });

    this.room.onMessage('error_message', (msg: string) => {
      this.notifyError(msg);
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
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('partyverse_reconnect_token');
          sessionStorage.removeItem('partyverse_room_id');
        }
        this.notifyConnection('disconnected');
      } else {
        // Unintentional drop (network loss, refresh)
        this.notifyConnection('reconnecting');
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
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('partyverse_reconnect_token');
      sessionStorage.removeItem('partyverse_room_id');
    }
    if (this.room) {
      await this.room.leave();
      this.room = null;
      this.notifyConnection('disconnected');
    }
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
