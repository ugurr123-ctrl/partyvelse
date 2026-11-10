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

  private notifyRadioCallbacks(transmission: RadioTransmission) {
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
