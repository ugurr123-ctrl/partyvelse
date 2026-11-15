import { MissionState, Role } from '../types/game';
import { colyseusClient } from './colyseusClient';

type MessageCallback = (state: MissionState, sourceRole: Role) => void;

export interface RadioTransmission {
  id: string;
  senderRole: Role;
  senderName: string;
  message: string;
  frequency: string;
  timestamp: number;
  isVoice?: boolean;
  audioDataUrl?: string;
  audioDurationMs?: number;
}

type RadioCallback = (transmission: RadioTransmission) => void;

class MultiplayerSyncService {
  private channel: BroadcastChannel | null = null;
  private callbacks: Set<MessageCallback> = new Set();
  private radioCallbacks: Set<RadioCallback> = new Set();
  private channelName = 'partyverse_kayip_sinyal_sync';

  constructor() {
    // Listen to online server transmissions over WebSocket
    try {
      colyseusClient.onRadio((transmission: RadioTransmission) => {
        this.notifyRadioCallbacks(transmission);
      });
    } catch (e) {
      // ignore
    }

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => {
          if (event.data) {
            if (event.data.type === 'STATE_UPDATE') {
              this.notifyCallbacks(event.data.state, event.data.sourceRole);
            } else if (event.data.type === 'RADIO_TRANSMISSION') {
              this.notifyRadioCallbacks(event.data.transmission);
            }
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported, falling back to window storage events', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'partyverse_sync_payload' && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            this.notifyCallbacks(data.state, data.sourceRole);
          } catch (e) {
            console.error('Storage sync parse error', e);
          }
        } else if (event.key === 'partyverse_radio_payload' && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            this.notifyRadioCallbacks(data.transmission);
          } catch (e) {
            console.error('Storage radio parse error', e);
          }
        }
      });
    }
  }

  public broadcast(state: MissionState, sourceRole: Role) {
    const payload = {
      type: 'STATE_UPDATE',
      state,
      sourceRole,
      timestamp: Date.now(),
    };

    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        console.warn('Broadcast postMessage failed', err);
      }
    }

    try {
      localStorage.setItem('partyverse_sync_payload', JSON.stringify(payload));
    } catch {
      // ignore quota errors
    }
  }

  public broadcastRadio(transmission: RadioTransmission) {
    const payload = {
      type: 'RADIO_TRANSMISSION',
      transmission,
      timestamp: Date.now(),
    };

    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        console.warn('Radio broadcast postMessage failed', err);
      }
    }

    try {
      localStorage.setItem('partyverse_radio_payload', JSON.stringify(payload));
    } catch {
      // ignore quota errors
    }

    // Mark as sent locally so sender does not treat echoed server broadcast as incoming alert/autoplay
    this.sentRadioIds.add(transmission.id);

    // Forward through Colyseus WebSocket if connected to online server
    try {
      if (colyseusClient.isConnected()) {
        colyseusClient.sendRadio(transmission);
      }
    } catch (e) {
      // ignore
    }

    // Trigger local listeners too so sending device immediately shows transmission
    this.notifyRadioCallbacks(transmission);
  }

  public isLocallySentRadio(id: string): boolean {
    return this.sentRadioIds.has(id);
  }

  public tryClaimRadioAudioPlayback(id: string): boolean {
    if (this.playedRadioAudioIds.has(id)) return false;
    this.playedRadioAudioIds.add(id);
    if (this.playedRadioAudioIds.size > 100) {
      const first = this.playedRadioAudioIds.values().next().value;
      if (first) this.playedRadioAudioIds.delete(first);
    }
    return true;
  }

  public subscribe(callback: MessageCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  public subscribeRadio(callback: RadioCallback): () => void {
    this.radioCallbacks.add(callback);
    return () => {
      this.radioCallbacks.delete(callback);
    };
  }

  private notifyCallbacks(state: MissionState, sourceRole: Role) {
    this.callbacks.forEach((cb) => {
      try {
        cb(state, sourceRole);
      } catch (err) {
        console.error('Sync callback error', err);
      }
    });
  }

  private seenRadioIds = new Set<string>();
  private sentRadioIds = new Set<string>();
  private playedRadioAudioIds = new Set<string>();

  private notifyRadioCallbacks(transmission: RadioTransmission) {
    if (this.seenRadioIds.has(transmission.id)) {
      return;
    }
    this.seenRadioIds.add(transmission.id);
    if (this.seenRadioIds.size > 120) {
      const first = this.seenRadioIds.values().next().value;
      if (first) this.seenRadioIds.delete(first);
    }

    this.radioCallbacks.forEach((cb) => {
      try {
        cb(transmission);
      } catch (err) {
        console.error('Radio callback error', err);
      }
    });
  }
}

export const syncService = new MultiplayerSyncService();
