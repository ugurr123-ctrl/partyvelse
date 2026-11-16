import { colyseusClient } from './colyseusClient';
import { soundManager } from './soundEffects';
import type { RadioSignal } from './radioSignal';

type Peer = {
  connection: RTCPeerConnection;
  sender?: RTCRtpSender;
  candidates: RTCIceCandidateInit[];
  remoteReady: boolean;
  announcedReady: boolean;
  queue: Promise<void>;
  source?: MediaStreamAudioSourceNode;
  gain?: GainNode;
};

export class LiveRadio {
  private peers = new Map<string, Peer>();
  private sessionId?: string;
  private context?: AudioContext;
  private outgoing?: MediaStreamTrack;
  private deliveredLive = false;
  private readonly subscriptions: Array<() => void>;

  constructor(private channel: string, private onReady: (ready: boolean) => void) {
    this.subscriptions = [
      colyseusClient.onRadioSignal((signal) => this.receive(signal)),
      colyseusClient.onConnection(() => this.updateSession()),
      soundManager.subscribeMute(() => this.refresh()),
    ];
    window.addEventListener('pointerup', this.unlock);
    window.addEventListener('keydown', this.unlock);
    this.updateSession();
  }

  private unlock = () => {
    if (!this.sessionId || typeof AudioContext === 'undefined') return;
    if (!this.context) {
      this.context = new AudioContext();
      this.context.onstatechange = () => this.refresh();
    }
    if (this.context.state !== 'running') {
      void this.context.resume().then(() => this.refresh(), () => {});
    }
  };

  private send(kind: RadioSignal['kind'], to?: string, details: Partial<RadioSignal> = {}) {
    colyseusClient.sendRadioSignal({ ...details, kind, channel: this.channel, to });
  }

  private updateSession() {
    const sessionId = colyseusClient.getRadioSessionId();
    if (sessionId === this.sessionId) return;
    this.clearPeers();
    this.sessionId = sessionId;
    if (sessionId) this.send('hello');
  }

  private removePeer(id: string) {
    const peer = this.peers.get(id);
    if (!peer) return;
    if (this.outgoing) this.deliveredLive = false;
    this.peers.delete(id);
    peer.source?.disconnect();
    peer.gain?.disconnect();
    peer.connection.close();
    this.refresh();
  }

  private clearPeers() {
    for (const id of this.peers.keys()) this.removePeer(id);
  }

  private canSend() {
    return this.peers.size > 0 && [...this.peers.values()].every((peer) =>
      peer.remoteReady && peer.sender && peer.connection.connectionState === 'connected',
    );
  }

  private refresh() {
    const muted = soundManager.isMuted();
    for (const [id, peer] of this.peers) {
      if (peer.gain && this.context) peer.gain.gain.setValueAtTime(muted ? 0 : 1, this.context.currentTime);
      const ready = Boolean(peer.source && this.context?.state === 'running' &&
        peer.connection.connectionState === 'connected');
      if (ready !== peer.announcedReady) {
        peer.announcedReady = ready;
        this.send('ready', id, { ready });
      }
    }
    const ready = this.canSend();
    if (!ready && this.outgoing) this.deliveredLive = false;
    this.onReady(ready);
  }

  private createPeer(id: string): Peer {
    const connection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    const peer: Peer = {
      connection, candidates: [], remoteReady: false, announcedReady: false, queue: Promise.resolve(),
    };
    this.peers.set(id, peer);
    connection.onicecandidate = ({ candidate }) => {
      if (candidate && this.peers.get(id) === peer) this.send('ice', id, { candidate: candidate.toJSON() });
    };
    connection.onconnectionstatechange = () => {
      if (this.peers.get(id) !== peer) return;
      this.refresh();
    };
    connection.ontrack = ({ track }) => {
      if (this.peers.get(id) !== peer || typeof AudioContext === 'undefined') return;
      if (!this.context) {
        this.context = new AudioContext();
        this.context.onstatechange = () => this.refresh();
      }
      peer.source?.disconnect();
      peer.gain?.disconnect();
      peer.source = this.context.createMediaStreamSource(new MediaStream([track]));
      peer.gain = this.context.createGain();
      peer.source.connect(peer.gain).connect(this.context.destination);
      this.refresh();
    };
    return peer;
  }

  private receive(signal: RadioSignal) {
    const id = signal.from;
    if (!this.sessionId || !id || id === this.sessionId || signal.channel !== this.channel ||
        typeof RTCPeerConnection === 'undefined') return;
    if (signal.kind === 'bye') {
      this.removePeer(id);
      return;
    }

    let peer = this.peers.get(id);
    const discovered = signal.kind === 'hello' || signal.kind === 'welcome';
    if (discovered && peer && ['failed', 'closed'].includes(peer.connection.connectionState)) {
      this.removePeer(id);
      peer = undefined;
    }
    if (!peer && !discovered) return;
    if (!peer) {
      try {
        peer = this.createPeer(id);
      } catch {
        return;
      }
    }
    if (signal.kind === 'hello') this.send('welcome', id);
    const current = peer;
    current.queue = current.queue.then(async () => {
      if (this.peers.get(id) !== current) return;
      const pc = current.connection;
      if (discovered && this.sessionId! < id && !current.sender) {
        current.sender = pc.addTransceiver('audio', { direction: 'sendrecv' }).sender;
        await pc.setLocalDescription(await pc.createOffer());
        if (this.peers.get(id) === current && pc.localDescription) {
          this.send('offer', id, { description: pc.localDescription.toJSON() });
        }
      } else if ((signal.kind === 'offer' || signal.kind === 'answer') && signal.description) {
        await pc.setRemoteDescription(signal.description);
        for (const candidate of current.candidates.splice(0)) await pc.addIceCandidate(candidate);
        if (signal.kind === 'offer') {
          const transceiver = pc.getTransceivers().find(({ receiver }) => receiver.track.kind === 'audio');
          if (!transceiver) throw new Error('Radio offer has no audio transceiver');
          transceiver.direction = 'sendrecv';
          current.sender = transceiver.sender;
          await pc.setLocalDescription(await pc.createAnswer());
          if (this.peers.get(id) === current && pc.localDescription) {
            this.send('answer', id, { description: pc.localDescription.toJSON() });
          }
        }
      } else if (signal.kind === 'ice' && signal.candidate) {
        if (pc.remoteDescription) await pc.addIceCandidate(signal.candidate);
        else current.candidates.push(signal.candidate);
      } else if (signal.kind === 'ready') {
        current.remoteReady = signal.ready === true;
      }
      this.refresh();
    }).catch(() => {
      if (this.peers.get(id) === current) {
        current.connection.close();
        this.refresh();
      }
    });
  }

  start(track: MediaStreamTrack) {
    this.deliveredLive = this.canSend();
    if (!this.deliveredLive) return false;
    this.outgoing = track;
    for (const peer of this.peers.values()) {
      void peer.sender?.replaceTrack(track).catch(() => {
        if (this.outgoing === track) this.deliveredLive = false;
      });
    }
    return true;
  }

  stop() {
    const delivered = Boolean(this.outgoing && this.deliveredLive && this.canSend());
    if (this.outgoing) {
      this.outgoing.enabled = false;
      for (const peer of this.peers.values()) void peer.sender?.replaceTrack(null).catch(() => {});
    }
    this.outgoing = undefined;
    this.deliveredLive = false;
    return delivered;
  }

  dispose() {
    this.stop();
    if (this.sessionId) this.send('bye');
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    window.removeEventListener('pointerup', this.unlock);
    window.removeEventListener('keydown', this.unlock);
    this.clearPeers();
    if (this.context) {
      this.context.onstatechange = null;
      void this.context.close().catch(() => {});
    }
  }
}
