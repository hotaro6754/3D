// Web Audio Cat Meow Synthesizer for Birthday Song
let audioCtxInstance: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtxInstance) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxInstance = new AudioContextClass();
  }
  if (audioCtxInstance.state === 'suspended') {
    audioCtxInstance.resume();
  }
  return audioCtxInstance;
}

// Frequency table for notes
const NOTES: Record<string, number> = {
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
};

// Happy Birthday Melody in Meows: [Note, durationSeconds]
const BIRTHDAY_MELODY: Array<[string, number]> = [
  ['G4', 0.28], ['G4', 0.28], ['A4', 0.55], ['G4', 0.55], ['C5', 0.55], ['B4', 1.0],
  ['G4', 0.28], ['G4', 0.28], ['A4', 0.55], ['G4', 0.55], ['D5', 0.55], ['C5', 1.0],
  ['G4', 0.28], ['G4', 0.28], ['G5', 0.55], ['E5', 0.55], ['C5', 0.55], ['B4', 0.55], ['A4', 0.8],
  ['F5', 0.28], ['F5', 0.28], ['E5', 0.55], ['C5', 0.55], ['D5', 0.55], ['C5', 1.2]
];

/**
 * Synthesizes a single feline "meow" note with realistic pitch glide & formant filter
 */
function playMeowNote(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Cat voice is a harmonic rich wave (sawtooth / triangle hybrid)
  osc.type = 'sawtooth';

  // "Mye-o-w" pitch contour: slight scoop up, sustain, then gentle fall
  osc.frequency.setValueAtTime(freq * 0.85, startTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.08, startTime + duration * 0.2);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.96, startTime + duration * 0.8);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.9, startTime + duration);

  // Formant bandpass filter ("mye-owww" vocal tract vowel sweep)
  filter.type = 'bandpass';
  filter.Q.value = 3.5;
  filter.frequency.setValueAtTime(freq * 1.5, startTime);
  filter.frequency.exponentialRampToValueAtTime(freq * 2.8, startTime + duration * 0.3);
  filter.frequency.exponentialRampToValueAtTime(freq * 1.8, startTime + duration);

  // Volume envelope
  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.22, startTime + duration * 0.15);
  gain.gain.exponentialRampToValueAtTime(0.16, startTime + duration * 0.65);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

export function playMeowHappyBirthday(): void {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime + 0.05;
    let timeOffset = 0;

    BIRTHDAY_MELODY.forEach(([noteName, dur]) => {
      const freq = NOTES[noteName] || 440;
      playMeowNote(ctx, freq, now + timeOffset, dur * 0.9);
      timeOffset += dur * 0.95;
    });
  } catch (e) {
    console.warn('AudioContext meow error:', e);
  }
}

export function playSingleCatPurrMeow(pitchOffset = 1.0): void {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const baseFreq = 440 * pitchOffset;
    playMeowNote(ctx, baseFreq, now, 0.45);
  } catch (e) {
    console.warn(e);
  }
}

export function playCatNomSound(): void {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {
    console.warn(e);
  }
}

export function playCandleBlowSound(): void {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const bufSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(800, now);
    filt.frequency.exponentialRampToValueAtTime(200, now + 0.35);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    noise.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  } catch (e) {
    console.warn(e);
  }
}

export function playCakeSliceSound(): void {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } catch (e) {
    console.warn(e);
  }
}
