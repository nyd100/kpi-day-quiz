// Presenter-only sound design. Synthesized with the Web Audio API so the
// experience needs no external assets and never blocks on network.

type Cue =
  | "gameStart"
  | "questionStart"
  | "tick"
  | "timeUp"
  | "reveal"
  | "leaderboard"
  | "finale";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = false;

export function isSoundEnabled() {
  return enabled;
}

/** Must be called from a user gesture (browser autoplay policy). */
export async function enableSound() {
  if (typeof window === "undefined") return false;
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return false;
  if (!ctx) {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.28;
    master.connect(ctx.destination);
  }
  await ctx.resume();
  enabled = true;
  return true;
}

export function disableSound() {
  enabled = false;
}

function tone(
  startOffset: number,
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  peak = 1,
) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function sweep(startOffset: number, from: number, to: number, duration: number) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(to, t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.8, t0 + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export function playCue(cue: Cue) {
  if (!enabled || !ctx) return;
  switch (cue) {
    case "gameStart":
      sweep(0, 220, 660, 0.5);
      tone(0.45, 880, 0.35, "triangle", 0.8);
      break;
    case "questionStart":
      tone(0, 523.25, 0.14, "triangle", 0.7);
      tone(0.13, 783.99, 0.2, "triangle", 0.7);
      break;
    case "tick":
      tone(0, 1200, 0.07, "square", 0.35);
      break;
    case "timeUp":
      tone(0, 320, 0.18, "sawtooth", 0.6);
      tone(0.18, 240, 0.32, "sawtooth", 0.6);
      break;
    case "reveal":
      tone(0, 659.25, 0.14, "sine", 0.8);
      tone(0.14, 830.61, 0.14, "sine", 0.8);
      tone(0.28, 987.77, 0.3, "sine", 0.8);
      break;
    case "leaderboard":
      tone(0, 587.33, 0.12, "triangle", 0.7);
      tone(0.12, 739.99, 0.12, "triangle", 0.7);
      tone(0.24, 880, 0.25, "triangle", 0.7);
      break;
    case "finale":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(i * 0.16, f, 0.4, "triangle", 0.9));
      sweep(0.7, 440, 1320, 0.8);
      break;
  }
}
