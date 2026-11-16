export type RadioSignal = {
  kind: 'hello' | 'welcome' | 'bye' | 'offer' | 'answer' | 'ice' | 'ready';
  channel: string;
  to?: string;
  from?: string;
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  ready?: boolean;
};
