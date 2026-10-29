import { MissionState, Role } from '../types/game';

type MessageCallback = (state: MissionState, sourceRole: Role) => void;

class MultiplayerSyncService {
  private channel: BroadcastChannel | null = null;
  private callbacks: Set<MessageCallback> = new Set();
  private channelName = 'partyverse_kayip_sinyal_sync';

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type === 'STATE_UPDATE') {
            this.notifyCallbacks(event.data.state, event.data.sourceRole);
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

    // Also write to localStorage for cross-tab fallback
    try {
      localStorage.setItem('partyverse_sync_payload', JSON.stringify(payload));
    } catch {
      // ignore quota errors
    }
  }

  public subscribe(callback: MessageCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
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
}

export const syncService = new MultiplayerSyncService();
