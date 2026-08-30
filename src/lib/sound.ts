// Presenter-only sound design. Fully synthesized with the Web Audio API so the
// experience needs no external assets and never blocks on network.
//
// The chain is built for a live hall: every voice runs dry into a master bus and
// (optionally) into a synthesized reverb send for space, then through a
// compressor that glues the layers and makes hits punch without clipping.
//
// Cues come in selectable "packs" (see SoundPackId): the operator picks the
// character of every big-screen cue from the admin console.

import { isSoundPackId, type SoundPackId } from "@/lib/quiz";

type Cue =
  | "gameStart"
  | "questionStart"
  | "tick"
  | "timeUp"
  | "reveal"
  | "fact"
  | "leaderboard"
  | "finale";

type CueOpts = { remaining?: number; pack?: SoundPackId };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverbBus: GainNode | null = null; // wet send → convolver → return → comp
let enabled = false;
let currentPack: SoundPackId = "cinematic";

export function isSoundEnabled() {
  return enabled;
}

export function setSoundPack(pack: string) {
  if (isSoundPackId(pack)) currentPack = pack;
}

/** A short synthesized impulse response (decaying noise) for a plate-ish reverb. */
function makeImpulse(context: AudioContext, seconds: number, decay: number) {
  const rate = context.sampleRate;
  const len = Math.max(1, Math.floor(rate * seconds));
  const buf = context.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

/** Must be called from a user gesture (browser autoplay policy). */
export async function enableSound() {
  if (typeof window === "undefined") return false;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return false;
  if (!ctx) {
    ctx = new Ctor();

    // Master glue compressor → destination.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 26;
    comp.ratio.value = 4;
    comp.attack.value = 0.002;
    comp.release.value = 0.25;
    comp.connect(ctx.destination);

    master = ctx.createGain();
    master.gain.value = 0.32;
    master.connect(comp);

    // Reverb send: wet bus → convolver → return → compressor. Best-effort; if the
    // browser lacks ConvolverNode the wet sends simply go nowhere.
    try {
      const convolver = ctx.createConvolver();
      convolver.buffer = makeImpulse(ctx, 1.8, 3.0);
      const ret = ctx.createGain();
      ret.gain.value = 0.9;
      reverbBus = ctx.createGain();
      reverbBus.gain.value = 1;
      reverbBus.connect(convolver);
      convolver.connect(ret);
      ret.connect(comp);
    } catch {
      reverbBus = null;
    }
  }
  await ctx.resume();
  enabled = true;
  return true;
}

export function disableSound() {
  enabled = false;
}

// ---------------------------------------------------------------- synth voices

/** Route a source's envelope out to the dry master and (optionally) the reverb. */
function send(out: AudioNode, wet: number) {
  if (!master) return;
  out.connect(master);
  if (wet > 0 && reverbBus && ctx) {
    const s = ctx.createGain();
    s.gain.value = wet;
    out.connect(s);
    s.connect(reverbBus);
  }
}

type ToneOpts = {
  type?: OscillatorType;
  peak?: number;
  attack?: number;
  wet?: number;
  detune?: number;
  filterHz?: number; // low-pass to soften bright waves
};

/** A single pitched note with an exponential pluck/pad envelope. */
function tone(startOffset: number, freq: number, duration: number, opts: ToneOpts = {}) {
  if (!ctx || !master) return;
  const { type = "sine", peak = 0.8, attack = 0.02, wet = 0, detune = 0, filterHz } = opts;
  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (detune) osc.detune.setValueAtTime(detune, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  let node: AudioNode = gain;
  osc.connect(gain);
  if (filterHz) {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = filterHz;
    gain.connect(lp);
    node = lp;
  }
  send(node, wet);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** A fuller stab: the same note stacked with a slightly detuned twin for width. */
function fat(startOffset: number, freq: number, duration: number, opts: ToneOpts = {}) {
  tone(startOffset, freq, duration, opts);
  tone(startOffset, freq, duration, {
    ...opts,
    detune: (opts.detune ?? 0) + 8,
    peak: (opts.peak ?? 0.8) * 0.7,
  });
}

/** A chord played as one block (drama) or as an upward roll (celebration). */
function chord(
  startOffset: number,
  freqs: number[],
  duration: number,
  opts: ToneOpts & { roll?: number } = {},
) {
  const { roll = 0, ...rest } = opts;
  freqs.forEach((f, i) => fat(startOffset + i * roll, f, duration - i * roll, rest));
}

/** A pitched sub "boom" that drops in frequency — chest-thump for hits/finales. */
function boom(startOffset: number, from: number, to: number, duration: number, peak = 0.9, wet = 0.2) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(to, t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain);
  send(gain, wet);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** A pitch glide on one oscillator — risers (up) and warble/buzzer falls (down). */
function slide(startOffset: number, from: number, to: number, duration: number, opts: ToneOpts = {}) {
  if (!ctx || !master) return;
  const { type = "sawtooth", peak = 0.5, attack = 0.03, wet = 0, filterHz } = opts;
  const t0 = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + duration);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  let node: AudioNode = gain;
  osc.connect(gain);
  if (filterHz) {
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = filterHz;
    gain.connect(lp);
    node = lp;
  }
  send(node, wet);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** Filtered white-noise burst — impact, whoosh, or a rising tension swell. */
function noise(
  startOffset: number,
  duration: number,
  opts: { peak?: number; type?: BiquadFilterType; from?: number; to?: number; wet?: number } = {},
) {
  if (!ctx || !master) return;
  const { peak = 0.5, type = "bandpass", from = 400, to = from, wet = 0.2 } = opts;
  const t0 = ctx.currentTime + startOffset;
  const rate = ctx.sampleRate;
  const len = Math.max(1, Math.floor(rate * duration));
  const buf = ctx.createBuffer(1, len, rate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(from, t0);
  if (to !== from) filter.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + duration);
  filter.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + Math.min(0.05, duration * 0.4));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter);
  filter.connect(gain);
  send(gain, wet);
  src.start(t0);
  src.stop(t0 + duration + 0.05);
}

// ------------------------------------------------------------------- the packs

// Note frequencies (Hz).
const C3 = 130.81, G3 = 196.0;
const C4 = 261.63, E4 = 329.63, G4 = 392.0, A4 = 440.0;
const C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880.0, B5 = 987.77;
const C6 = 1046.5, D6 = 1174.66, E6 = 1318.51, G6 = 1567.98;

/** remaining seconds → urgency 0.2…1.0 (used to escalate the countdown). */
function urgency(remaining: number | undefined) {
  const r = Math.min(5, Math.max(1, remaining ?? 5));
  return { r, u: (6 - r) / 5 };
}

type CueMap = Record<Cue, (o: CueOpts) => void>;

const PACKS: Record<SoundPackId, CueMap> = {
  // ---------------------------------------------------------------- CINEMATIC
  // Trailer-style: deep sub booms, long tension risers, big reverb, epic stacks.
  cinematic: {
    gameStart: () => {
      slide(0, 180, 1000, 0.7, { type: "sawtooth", peak: 0.35, wet: 0.4, filterHz: 2500 });
      noise(0, 0.7, { peak: 0.35, type: "bandpass", from: 300, to: 4000, wet: 0.4 });
      boom(0.6, 160, 60, 0.6, 0.9, 0.3);
      fat(0.62, C6, 0.5, { type: "triangle", peak: 0.7, wet: 0.45, filterHz: 6000 });
    },
    questionStart: () => {
      boom(0, 120, 80, 0.35, 0.6, 0.15);
      [A4, C5, E5, A5].forEach((f, i) =>
        tone(i * 0.08, f, 0.25, { type: "triangle", peak: 0.7, wet: 0.3, filterHz: 6000 }),
      );
      noise(0, 0.06, { peak: 0.3, type: "highpass", from: 6000, wet: 0 });
    },
    // Countdown: a deep heartbeat thump + tense blip, both escalating; big accent at 1.
    tick: (o) => {
      const { r, u } = urgency(o.remaining);
      boom(0, 90 + u * 45, 50, 0.22, 0.5 + u * 0.4, 0.15);
      tone(0.02, 480 + u * 640, 0.1, { type: "triangle", peak: 0.28 + u * 0.34, wet: 0.15, filterHz: 4000 });
      if (r === 1) {
        slide(0.14, 400, 1200, 0.32, { type: "sawtooth", peak: 0.6, wet: 0.3, filterHz: 5000 });
        boom(0.14, 150, 55, 0.4, 0.85, 0.25);
      }
    },
    // Soft buzzer: rounded (low-passed) two-tone fall + deep impact, never screechy.
    timeUp: () => {
      fat(0, 300, 0.24, { type: "triangle", peak: 0.6, wet: 0.2, filterHz: 1600 });
      fat(0.22, 196, 0.45, { type: "triangle", peak: 0.6, wet: 0.25, filterHz: 1300 });
      boom(0, 130, 45, 0.55, 0.9, 0.3);
      noise(0, 0.3, { peak: 0.32, type: "lowpass", from: 700, wet: 0.2 });
    },
    // Reveal: suspense swell + riser → big major stack + sub hit + shimmer cascade.
    // (Voice count/levels kept in check so the dense stack doesn't clip the bus.)
    reveal: () => {
      slide(0, 200, 1500, 0.5, { type: "sawtooth", peak: 0.35, wet: 0.4, filterHz: 3000 });
      noise(0, 0.5, { peak: 0.35, type: "bandpass", from: 400, to: 5000, wet: 0.4 });
      boom(0.48, 180, 60, 0.7, 0.75, 0.3);
      chord(0.5, [C4, E4, G4, C5, E5], 1.1, { type: "triangle", peak: 0.5, wet: 0.45, filterHz: 6000 });
      [C6, E6, G6].forEach((f, i) => tone(0.55 + i * 0.08, f, 0.5, { type: "sine", peak: 0.4, wet: 0.55 }));
    },
    // Interesting fact: an ethereal, mysterious pad with a slow rising shimmer.
    fact: () => {
      tone(0, C5, 1.0, { type: "sine", peak: 0.4, wet: 0.6, attack: 0.15 });
      tone(0, G5, 1.0, { type: "sine", peak: 0.3, wet: 0.6, attack: 0.2 });
      slide(0.1, 800, 2000, 1.2, { type: "triangle", peak: 0.2, wet: 0.6, filterHz: 5000 });
      [E6, G6, D6].forEach((f, i) => tone(0.3 + i * 0.18, f, 0.6, { type: "sine", peak: 0.28, wet: 0.6 }));
      noise(0.2, 0.9, { peak: 0.1, type: "highpass", from: 8000, wet: 0.5 });
    },
    leaderboard: () => {
      chord(0, [G4, C5, E5], 0.4, { type: "triangle", peak: 0.7, wet: 0.3, roll: 0.04, filterHz: 6000 });
      chord(0.35, [C5, E5, G5, C6], 0.7, { type: "triangle", peak: 0.8, wet: 0.4, roll: 0.04, filterHz: 7000 });
      boom(0.35, 150, 80, 0.5, 0.7, 0.2);
      [E6, G6].forEach((f, i) => tone(0.4 + i * 0.1, f, 0.5, { type: "sine", peak: 0.5, wet: 0.55 }));
    },
    // Winners: an epic win — long riser → timpani hits → huge sustained stack →
    // ascending arpeggio → a shower of high sparkles.
    finale: () => {
      slide(0, 150, 2000, 1.0, { type: "sawtooth", peak: 0.45, wet: 0.4, filterHz: 4000 });
      noise(0, 0.9, { peak: 0.4, type: "bandpass", from: 300, to: 6000, wet: 0.4 });
      boom(0.9, 220, 55, 1.1, 1.0, 0.35);
      boom(1.15, 200, 50, 0.9, 0.8, 0.3);
      chord(0.92, [C3, C4, E4, G4, C5], 1.6, { type: "triangle", peak: 0.8, wet: 0.45, roll: 0.05, filterHz: 6000 });
      [C5, E5, G5, C6, E6, G6].forEach((f, i) =>
        tone(1.05 + i * 0.12, f, 0.6, { type: "triangle", peak: 0.6, wet: 0.5, filterHz: 8000 }),
      );
      [G6, E6, C6, D6, G6, C6, E6].forEach((f, i) =>
        tone(1.9 + i * 0.09, f, 0.4, { type: "sine", peak: 0.4, wet: 0.6 }),
      );
    },
  },

  // ------------------------------------------------------------------ CLASSIC
  // Clean and balanced — bright synth beeps with a light space.
  classic: {
    gameStart: () => {
      noise(0, 0.55, { peak: 0.4, type: "bandpass", from: 300, to: 4000, wet: 0.35 });
      boom(0.4, 180, 70, 0.5, 0.9, 0.25);
      fat(0.42, C6, 0.5, { type: "triangle", peak: 0.7, wet: 0.4, filterHz: 6000 });
    },
    questionStart: () => {
      [C5, E5, G5, C6].forEach((f, i) =>
        tone(i * 0.09, f, 0.2, { type: "triangle", peak: 0.75, wet: 0.2, filterHz: 7000 }),
      );
      noise(0, 0.06, { peak: 0.25, type: "highpass", from: 6000, wet: 0 });
      boom(0, 130, 90, 0.28, 0.5, 0.1);
    },
    tick: (o) => {
      const { r, u } = urgency(o.remaining);
      const freq = 760 + u * 900;
      const peak = 0.3 + u * 0.4;
      noise(0, 0.03, { peak: 0.2 + u * 0.2, type: "highpass", from: 5000, wet: 0 });
      tone(0.01, freq, 0.09, { type: "square", peak, filterHz: 5000 });
      if (r === 1) tone(0.12, freq * 1.5, 0.12, { type: "square", peak, filterHz: 6000 });
    },
    timeUp: () => {
      fat(0, 300, 0.22, { type: "sawtooth", peak: 0.55, wet: 0.15, filterHz: 2000 });
      fat(0.2, 220, 0.4, { type: "sawtooth", peak: 0.55, wet: 0.2, filterHz: 1700 });
      boom(0, 120, 55, 0.5, 0.8, 0.25);
      noise(0, 0.25, { peak: 0.35, type: "lowpass", from: 900, wet: 0.2 });
    },
    reveal: () => {
      noise(0, 0.32, { peak: 0.4, type: "bandpass", from: 500, to: 3500, wet: 0.4 });
      boom(0.3, 160, 80, 0.45, 0.85, 0.2);
      chord(0.32, [C5, E5, G5], 0.6, { type: "triangle", peak: 0.7, wet: 0.35, filterHz: 6000 });
      tone(0.34, C6, 0.5, { type: "sine", peak: 0.6, wet: 0.5 });
      tone(0.42, E6, 0.4, { type: "sine", peak: 0.45, wet: 0.5 });
    },
    fact: () => {
      tone(0, G5, 0.5, { type: "sine", peak: 0.5, wet: 0.5, attack: 0.05 });
      tone(0.12, B5, 0.5, { type: "sine", peak: 0.45, wet: 0.5, attack: 0.05 });
      tone(0.24, D6, 0.6, { type: "sine", peak: 0.4, wet: 0.6, attack: 0.05 });
      noise(0.1, 0.6, { peak: 0.12, type: "highpass", from: 7000, wet: 0.5 });
    },
    leaderboard: () => {
      chord(0, [G4, C5, E5], 0.35, { type: "triangle", peak: 0.65, wet: 0.3, roll: 0.05, filterHz: 6000 });
      chord(0.3, [C5, E5, G5], 0.6, { type: "triangle", peak: 0.75, wet: 0.35, roll: 0.05, filterHz: 7000 });
      boom(0.3, 140, 90, 0.5, 0.6, 0.15);
      tone(0.32, C6, 0.5, { type: "sine", peak: 0.5, wet: 0.5 });
    },
    finale: () => {
      noise(0, 0.7, { peak: 0.45, type: "bandpass", from: 300, to: 5000, wet: 0.4 });
      boom(0.6, 200, 60, 0.9, 1.0, 0.3);
      chord(0.62, [C4, E4, G4, C5], 1.2, { type: "triangle", peak: 0.8, wet: 0.4, roll: 0.06, filterHz: 6000 });
      [C5, E5, G5, C6, E6, G6].forEach((f, i) =>
        tone(0.75 + i * 0.12, f, 0.5, { type: "triangle", peak: 0.6, wet: 0.45, filterHz: 8000 }),
      );
      [D6, G6, C6, E6, B5, D6].forEach((f, i) =>
        tone(1.5 + i * 0.09, f, 0.35, { type: "sine", peak: 0.4, wet: 0.6 }),
      );
    },
  },

  // ------------------------------------------------------------------- ARCADE
  // Retro 8-bit: dry square/pulse waves, fast arpeggios, coins and power-ups.
  arcade: {
    gameStart: () => {
      [C5, E5, G5, C6].forEach((f, i) =>
        tone(i * 0.05, f, 0.1, { type: "square", peak: 0.5, filterHz: 5000 }),
      );
      tone(0.24, G6, 0.13, { type: "square", peak: 0.5, filterHz: 6000 });
      boom(0, 120, 80, 0.2, 0.45, 0);
    },
    questionStart: () => {
      [C5, E5, G5, C6, E6].forEach((f, i) =>
        tone(i * 0.05, f, 0.09, { type: "square", peak: 0.5, filterHz: 6000 }),
      );
      boom(0, 110, 80, 0.18, 0.4, 0);
    },
    tick: (o) => {
      const { r, u } = urgency(o.remaining);
      tone(0, 680 + u * 620, 0.08, { type: "square", peak: 0.45 + u * 0.2, filterHz: 5000 });
      if (r === 1) tone(0.11, 1600, 0.14, { type: "square", peak: 0.6, filterHz: 7000 });
    },
    // Soft retro buzzer: a mellow descending warble, low-passed so it isn't harsh.
    timeUp: () => {
      slide(0, 520, 130, 0.45, { type: "triangle", peak: 0.6, filterHz: 2600 });
      tone(0.12, 180, 0.22, { type: "square", peak: 0.45, filterHz: 2200 });
      boom(0, 140, 60, 0.3, 0.5, 0);
    },
    reveal: () => {
      slide(0, 300, 1200, 0.24, { type: "square", peak: 0.5, filterHz: 5000 });
      [C5, E5, G5, C6].forEach((f, i) =>
        tone(0.22 + i * 0.05, f, 0.2, { type: "square", peak: 0.5, filterHz: 6000 }),
      );
      boom(0.22, 150, 80, 0.3, 0.55, 0);
    },
    fact: () => {
      tone(0, G5, 0.12, { type: "square", peak: 0.48, filterHz: 6000 });
      tone(0.1, C6, 0.12, { type: "square", peak: 0.48, filterHz: 6000 });
      tone(0.2, E6, 0.2, { type: "square", peak: 0.48, filterHz: 7000 });
    },
    leaderboard: () => {
      [C5, E5, G5, C6, G5, C6].forEach((f, i) =>
        tone(i * 0.07, f, 0.14, { type: "square", peak: 0.52, filterHz: 6000 }),
      );
      boom(0, 130, 80, 0.25, 0.45, 0);
    },
    finale: () => {
      [C5, E5, G5, C6, E6, G6, C6, G6].forEach((f, i) =>
        tone(i * 0.11, f, 0.17, { type: "square", peak: 0.52, filterHz: 7000 }),
      );
      [C4, G4, C5].forEach((f, i) => tone(0.9 + i * 0.12, f, 0.34, { type: "square", peak: 0.46, filterHz: 5000 }));
      boom(0, 150, 70, 0.35, 0.55, 0);
    },
  },
};

export function playCue(cue: Cue, opts: CueOpts = {}) {
  if (!enabled || !ctx) return;
  const pack = opts.pack && isSoundPackId(opts.pack) ? opts.pack : currentPack;
  PACKS[pack][cue](opts);
}
