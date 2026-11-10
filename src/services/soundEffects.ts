/**
 * Web Audio API based zero-dependency sound effects generator for Partyverse.
 * Works 100% offline, requires no external audio assets, zero latency.
 */

let isAudioMuted = false;
try {
  const stored = localStorage.getItem('partyverse_sound_muted');
  if (stored !== null) {
    isAudioMuted = stored === 'true';
  }
} catch {}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const soundManager = {
  isMuted(): boolean {
    return isAudioMuted;
  },

  setMuted(muted: boolean) {
    isAudioMuted = muted;
    try {
      localStorage.setItem('partyverse_sound_muted', String(muted));
    } catch {}
    if (!muted) {
      this.playClick();
    }
  },

  toggleMute(): boolean {
    this.setMuted(!isAudioMuted);
    return isAudioMuted;
  },

  /**
   * Crisp UI click / toggle sound
   */
  playClick() {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  },

  /**
   * Tactical radio / comms chirp
   */
  playRadioChirp() {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1760, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  },

  /**
   * Mission or puzzle success chime
   */
  playSuccess() {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.07;
        const dur = 0.22;
        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {}
  },

  /**
   * Error buzzer on invalid action or penalty
   */
  playError() {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.setValueAtTime(130, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  },

  /**
   * Mechanical breaker / valve snap
   */
  playBreaker() {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  },

  /**
   * Warning siren pulse
   */
  playWarning() {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  },

  /**
   * Tactical military radio squelch / static burst when pressing PTT or receiving radio transmission
   */
  playRadioSquelch() {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const bufferSize = Math.floor(ctx.sampleRate * 0.09); // 90ms noise
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Bandpass filter to sound like an authentic walkie-talkie
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2200;
      filter.Q.value = 1.4;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
    } catch {}
  },

  /**
   * Classic two-tone tactical walkie-talkie roger beep on transmission end
   */
  playRogerBeep() {
    if (isAudioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      // Tone 1: 960 Hz
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(960, ctx.currentTime);
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.055);

      // Tone 2: 1360 Hz (delayed by 60ms)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1360, ctx.currentTime + 0.06);
      gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.135);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.06);
      osc2.stop(ctx.currentTime + 0.135);
    } catch {}
  },
};
