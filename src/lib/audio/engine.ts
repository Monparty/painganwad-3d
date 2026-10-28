import * as THREE from "three";
import { CHANTS } from "./chants";
import { RECORDING } from "./recording";
import { audioLevel, chantStore, type ChantMode } from "./store";

// ระบบเสียงในโบสถ์ มีเสียงสวด 2 แบบ:
// - "recording": เสียงพระสวดจริงจากไฟล์ (stream ผ่าน <audio> ไม่ decode ทั้งไฟล์)
// - "synth": เสียงสังเคราะห์แบบ formant พร้อมคำบรรยายไฮไลต์ทีละคำ
// ทั้งสองแบบเข้า chantBus เดียวกัน → เสียงรอบทิศ (PositionalAudio), เสียงก้อง และขยับปากพระ

const F0 = 112;
const SHORT = 0.24;
const LONG = 0.43;
const LINE_GAP = 0.55;
const SECTION_GAP = 4.2;
const CHANT_LEVEL = 0.9;
const INTRO_DELAY = 5000;
const RECORDING_LOOP_GAP = 5000;

type Formant = [number, number, number];

const VOWELS: Record<string, Formant> = {
  a: [700, 1150, 2500],
  i: [290, 2150, 2850],
  u: [320, 820, 2300],
  e: [430, 1850, 2550],
  o: [460, 820, 2450],
};
const NASAL: Formant = [260, 1050, 2300];
const FORMANT_Q = [7, 11, 14];
const FORMANT_AMP = [3.2, 2.2, 1.4];

const GLIDES: Record<string, Formant> = {
  l: [380, 1000, 2500],
  r: [420, 1250, 1700],
  v: [320, 800, 2200],
  y: [280, 2200, 2900],
};
// ความถี่เสียงระเบิดของพยัญชนะกักตามฐานกรณ์
const STOP_HZ: Record<string, number> = {
  b: 1100,
  p: 1100,
  t: 3800,
  d: 3600,
  ṭ: 3000,
  ḍ: 3000,
  k: 1900,
  g: 1800,
  c: 4200,
  j: 4000,
};
const NASALS = "mnñṅṇṃ";
const VOWEL_CHARS = "aāiīuūeo";
const BASE_VOWEL: Record<string, string> = {
  a: "a",
  ā: "a",
  i: "i",
  ī: "i",
  u: "u",
  ū: "u",
  e: "e",
  o: "o",
};

type Onset = "none" | "stop" | "nasal" | "s" | "h" | "glide";

type Syllable = {
  onset: Onset;
  burstHz: number;
  aspirated: boolean;
  glide: Formant | null;
  vowel: Formant;
  long: boolean;
  coda: "none" | "nasal" | "stop";
};

function parseSyllable(raw: string): Syllable {
  let i = 0;
  while (i < raw.length && !VOWEL_CHARS.includes(raw[i])) i++;
  let j = i;
  while (j < raw.length && VOWEL_CHARS.includes(raw[j])) j++;
  const onsetStr = raw.slice(0, i);
  const vowelStr = raw.slice(i, j) || "a";
  const codaStr = raw.slice(j);
  const c = onsetStr[0] ?? "";

  let onset: Onset = "none";
  if (!c) onset = "none";
  else if (c in STOP_HZ) onset = "stop";
  else if (NASALS.includes(c)) onset = "nasal";
  else if (c === "s") onset = "s";
  else if (c === "h") onset = "h";
  else if (c in GLIDES) onset = "glide";

  const longVowel = vowelStr.length > 1 || "āīūeo".includes(vowelStr[0]);
  return {
    onset,
    burstHz: STOP_HZ[c] ?? 2500,
    aspirated: onsetStr.length > 1 && onsetStr[1] === "h",
    glide: GLIDES[c] ?? null,
    vowel: VOWELS[BASE_VOWEL[vowelStr[0]] ?? "a"],
    long: longVowel || codaStr.length > 0,
    coda:
      codaStr === "" ? "none" : NASALS.includes(codaStr[0]) ? "nasal" : "stop",
  };
}

const PARSED = CHANTS.map((sec) =>
  sec.lines.map((line) =>
    line.roman.split(" ").map((w) => w.split("-").map(parseSyllable)),
  ),
);

function makeImpulse(ctx: BaseAudioContext, seconds: number, decay: number) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const preDelay = Math.floor(ctx.sampleRate * 0.012);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    let lp = 0;
    for (let i = preDelay; i < len; i++) {
      const x = i / len;
      lp += (Math.random() * 2 - 1 - lp) * (0.9 - 0.75 * x);
      data[i] = lp * Math.pow(1 - x, decay);
    }
    for (const ms of [11, 23, 37, 52, 71, 96]) {
      const k = Math.floor((ctx.sampleRate * ms) / 1000) + ch * 7;
      data[k] += (Math.random() > 0.5 ? 1 : -1) * 0.5 * (1 - ms / 120);
    }
  }
  return buf;
}

function makeNoise(ctx: BaseAudioContext, seconds: number, brown = false) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else data[i] = white;
  }
  return buf;
}

/** คลื่นเส้นเสียง: ฮาร์มอนิกลดหลั่นนุ่มกว่า sawtooth */
function glottalWave(ctx: BaseAudioContext) {
  const n = 48;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let k = 1; k < n; k++) imag[k] = Math.pow(k, -1.2) * (k % 2 === 0 ? 0.85 : 1);
  return ctx.createPeriodicWave(real, imag);
}

type Voice = {
  osc: OscillatorNode;
  gain: GainNode;
  env: GainNode;
  ratio: number;
  level: number;
  /** หน่วงเวลาเข้า/ออกพยางค์ของพระรูปนี้ (วินาที) สุ่มใหม่ทุกบรรทัด */
  lag: number;
};
type WordEntry = {
  t0: number;
  t1: number;
  section: number;
  line: number;
  word: number;
  words: number;
};
type LineEntry = { t0: number; t1: number; section: number; line: number };

export class ChantEngine {
  readonly ctx: AudioContext;
  /** เสียงสวดแบบแห้ง ส่งเข้า PositionalAudio ที่ตำแหน่งพระ */
  readonly chantOut: GainNode;
  /** เสียงก้อง ระฆัง และบรรยากาศ ไม่ระบุทิศทาง */
  readonly ambientOut: GainNode;

  private readonly chantBus: GainNode;
  private readonly reverbSend: GainNode;
  private readonly bellBus: GainNode;
  private readonly analyser: AnalyserNode;
  private readonly levelData = new Float32Array(512);
  private readonly noiseGain: GainNode;
  private readonly noiseFilter: BiquadFilterNode;
  private readonly noiseBuffer: AudioBuffer;
  private readonly voices: Voice[] = [];
  private readonly formants: { filter: BiquadFilterNode; gain: GainNode }[] = [];
  private readonly audio: HTMLAudioElement;
  private readonly recordingGain: GainNode;

  private mode: ChantMode = "recording";
  private words: WordEntry[] = [];
  private lines: LineEntry[] = [];
  private cursor = { section: 0, line: 0 };
  private nextTime = 0;
  private running = false;
  private started = false;
  private pumpTimer: ReturnType<typeof setInterval> | null = null;
  private recordingTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingSources: { t: number; node: AudioScheduledSourceNode }[] = [];

  constructor(ctx: AudioContext) {
    this.ctx = ctx;

    this.chantOut = ctx.createGain();
    this.chantOut.gain.value = CHANT_LEVEL;
    this.ambientOut = ctx.createGain();

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    comp.attack.value = 0.01;
    comp.release.value = 0.25;
    comp.connect(this.chantOut);

    this.chantBus = ctx.createGain();
    this.chantBus.connect(comp);
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.chantBus.connect(this.analyser);

    const convolver = ctx.createConvolver();
    convolver.buffer = makeImpulse(ctx, 3.8, 2.6);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.55;
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    this.chantBus.connect(this.reverbSend);
    this.reverbSend.connect(convolver);
    convolver.connect(wet);
    wet.connect(this.ambientOut);

    this.bellBus = ctx.createGain();
    this.bellBus.gain.value = 0.8;
    this.bellBus.connect(this.ambientOut);
    this.bellBus.connect(this.reverbSend);

    // ---------- เสียงสวดจริง ----------
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.src = RECORDING.src;
    this.audio.addEventListener("error", () => this.recordingFailed());
    this.audio.addEventListener("ended", this.onRecordingEnded);
    this.recordingGain = ctx.createGain();
    this.recordingGain.gain.value = 0;
    ctx.createMediaElementSource(this.audio).connect(this.recordingGain);
    this.recordingGain.connect(this.chantBus);

    // ---------- เสียงสังเคราะห์ ----------
    // พระแต่ละรูป: เส้นเสียง → ระดับเสียง → envelope ของตัวเอง → รวม → กรองโทน → formant
    const voiceMix = ctx.createGain();
    voiceMix.gain.value = 0.22;
    const tilt = ctx.createBiquadFilter();
    tilt.type = "lowpass";
    tilt.frequency.value = 2800;
    tilt.Q.value = 0.3;
    voiceMix.connect(tilt);

    const synthBus = ctx.createGain();
    synthBus.connect(this.chantBus);
    for (let k = 0; k < 3; k++) {
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = VOWELS.a[k];
      filter.Q.value = FORMANT_Q[k];
      const gain = ctx.createGain();
      gain.gain.value = FORMANT_AMP[k];
      tilt.connect(filter);
      filter.connect(gain);
      gain.connect(synthBus);
      this.formants.push({ filter, gain });
    }
    // ย่านเสียงกังวาน ~3.2kHz ทำให้เสียงสวดมีมิติขึ้น
    const ring = ctx.createBiquadFilter();
    ring.type = "bandpass";
    ring.frequency.value = 3200;
    ring.Q.value = 8;
    const ringGain = ctx.createGain();
    ringGain.gain.value = 0.55;
    tilt.connect(ring);
    ring.connect(ringGain);
    ringGain.connect(synthBus);
    // เสียงก้องอก
    const body = ctx.createBiquadFilter();
    body.type = "lowpass";
    body.frequency.value = 380;
    const bodyGain = ctx.createGain();
    bodyGain.gain.value = 0.35;
    tilt.connect(body);
    body.connect(bodyGain);
    bodyGain.connect(synthBus);

    // เสียงที่ 0 คือพระผู้นำสวด ที่เหลือคือพระที่สวดตาม (เพี้ยนกันเล็กน้อยให้เป็นหมู่)
    const wave = glottalWave(ctx);
    const voiceDefs: [cents: number, level: number][] = [
      [0, 1],
      [-9, 0.75],
      [7, 0.75],
      [-15, 0.7],
      [13, 0.7],
      [-1200, 0.35],
    ];
    for (const [cents, level] of voiceDefs) {
      const ratio = Math.pow(2, cents / 1200);
      const osc = ctx.createOscillator();
      osc.setPeriodicWave(wave);
      osc.frequency.value = F0 * ratio;
      const gain = ctx.createGain();
      gain.gain.value = level;
      const env = ctx.createGain();
      env.gain.value = 0;
      osc.connect(gain);
      gain.connect(env);
      env.connect(voiceMix);

      for (const [rate, depth] of [
        [4.4 + Math.random() * 1.2, 0.006],
        [0.1 + Math.random() * 0.2, 0.004],
      ]) {
        const lfo = ctx.createOscillator();
        lfo.frequency.value = rate;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = F0 * ratio * depth;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
      }
      osc.start();
      this.voices.push({ osc, gain, env, ratio, level, lag: 0 });
    }

    this.noiseBuffer = makeNoise(ctx, 2);

    // ลมหายใจผ่านช่องเสียง (เข้า envelope ของพระผู้นำ จึงดังตามพยางค์)
    const breath = ctx.createBufferSource();
    breath.buffer = this.noiseBuffer;
    breath.loop = true;
    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = "bandpass";
    breathFilter.frequency.value = 1800;
    breathFilter.Q.value = 0.6;
    const breathGain = ctx.createGain();
    breathGain.gain.value = 0.05;
    breath.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(this.voices[0].env);
    breath.start();

    // สัญญาณรบกวนสำหรับเสียงพยัญชนะ (ส, ห, เสียงระเบิด)
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    this.noiseFilter = ctx.createBiquadFilter();
    this.noiseFilter.type = "bandpass";
    this.noiseFilter.Q.value = 1.2;
    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0;
    noise.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(synthBus);
    noise.start();

    // เสียงห้องโถงเบาๆ
    const room = ctx.createBufferSource();
    room.buffer = makeNoise(ctx, 4, true);
    room.loop = true;
    const roomLp = ctx.createBiquadFilter();
    roomLp.type = "lowpass";
    roomLp.frequency.value = 300;
    const roomGain = ctx.createGain();
    roomGain.gain.value = 0.025;
    room.connect(roomLp);
    roomLp.connect(roomGain);
    roomGain.connect(this.ambientOut);
    room.start();
  }

  get isRunning() {
    return this.running;
  }

  /** เรียกจาก click ของผู้ใช้โดยตรง (ต้องอยู่ใน user gesture เพื่อปลดล็อกเสียง) */
  start() {
    if (this.started) return;
    this.started = true;
    void this.ctx.resume();
    // ปลดล็อก <audio> บน iOS: play ภายใน gesture แล้วหยุดทันที
    const a = this.audio;
    a.muted = true;
    a.play()
      .then(() => {
        a.pause();
        a.currentTime = 0;
      })
      .catch(() => {})
      .finally(() => {
        a.muted = false;
      });

    const now = this.ctx.currentTime;
    this.ringBell(now + 0.4, 1);
    this.ringBell(now + 3.2, 0.7);
    this.scheduleBirds();
    this.loop();
    setTimeout(() => {
      if (chantStore.get().status === "idle") this.resume();
    }, INTRO_DELAY);
  }

  resume() {
    if (this.running || !this.started) return;
    void this.ctx.resume();
    this.running = true;
    // ไฟล์จริงมีเสียงก้องของโบสถ์อยู่แล้ว จึงเติมเสียงก้องน้อยกว่าเสียงสังเคราะห์
    this.reverbSend.gain.setTargetAtTime(this.mode === "recording" ? 0.22 : 0.55, this.ctx.currentTime, 0.2);
    if (this.mode === "recording") {
      this.clearRecordingTimer();
      this.fadeRecording(1, 0.4);
      this.audio.play().catch((e: DOMException) => {
        if (e.name === "NotSupportedError") this.recordingFailed();
      });
    } else {
      this.nextTime = Math.max(this.nextTime, this.ctx.currentTime + 0.35);
      this.pump();
      this.pumpTimer = setInterval(this.pump, 100);
    }
    chantStore.set({ status: "chanting" });
  }

  pause() {
    if (!this.running) return;
    this.running = false;
    if (this.mode === "recording") {
      this.clearRecordingTimer();
      this.fadeRecording(0, 0.12);
      this.recordingTimer = setTimeout(() => this.audio.pause(), 450);
    } else {
      this.pauseSynth();
    }
    chantStore.set({ status: "paused" });
  }

  toggle() {
    if (this.running) this.pause();
    else this.resume();
  }

  setMode(mode: ChantMode) {
    if (mode === this.mode) return;
    if (mode === "recording" && !chantStore.get().recordingAvailable) return;
    const wasRunning = this.running;
    if (wasRunning) this.pause();
    this.mode = mode;
    chantStore.set({ mode });
    if (wasRunning) this.resume();
  }

  setVolume(v: number) {
    const now = this.ctx.currentTime;
    this.chantOut.gain.setTargetAtTime(CHANT_LEVEL * v, now, 0.1);
    this.ambientOut.gain.setTargetAtTime(v, now, 0.1);
  }

  // ---------- เสียงสวดจริง ----------

  private fadeRecording(target: number, tau: number) {
    const g = this.recordingGain.gain;
    const now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setTargetAtTime(target, now, tau);
  }

  private clearRecordingTimer() {
    if (this.recordingTimer) clearTimeout(this.recordingTimer);
    this.recordingTimer = null;
  }

  /** จบไฟล์ → ตีระฆัง เว้นช่วง แล้วสวดใหม่ตั้งแต่ต้น */
  private onRecordingEnded = () => {
    if (!this.running || this.mode !== "recording") return;
    this.ringBell(this.ctx.currentTime + 0.5, 0.9);
    this.recordingTimer = setTimeout(() => {
      this.audio.currentTime = 0;
      if (this.running && this.mode === "recording") void this.audio.play().catch(() => {});
    }, RECORDING_LOOP_GAP);
  };

  private recordingFailed() {
    if (!chantStore.get().recordingAvailable) return;
    const wasRunning = this.running && this.mode === "recording";
    if (wasRunning) this.pause();
    this.mode = "synth";
    chantStore.set({ recordingAvailable: false, mode: "synth" });
    if (wasRunning) this.resume();
  }

  // ---------- เสียงสังเคราะห์ ----------

  private pauseSynth() {
    if (this.pumpTimer) clearInterval(this.pumpTimer);
    this.pumpTimer = null;
    const now = this.ctx.currentTime;

    // สวดต่อจากบรรทัดที่ยังสวดไม่จบ
    const unfinished = this.lines.find((l) => l.t1 > now);
    if (unfinished) {
      this.cursor = { section: unfinished.section, line: unfinished.line };
    }
    this.lines = this.lines.filter((l) => l.t0 <= now);
    this.words = this.words.filter((w) => w.t0 <= now);
    this.silence(now);
    this.pendingSources = this.pendingSources.filter((p) => {
      if (p.t <= now) return true;
      p.node.stop();
      return false;
    });
    this.nextTime = now + 0.35;
  }

  private silence(now: number) {
    const hold = (p: AudioParam, target?: number) => {
      p.cancelScheduledValues(now);
      if (target !== undefined) p.setTargetAtTime(target, now, 0.06);
    };
    hold(this.noiseGain.gain, 0);
    hold(this.noiseFilter.frequency);
    for (const f of this.formants) {
      hold(f.filter.frequency);
      hold(f.gain.gain);
    }
    for (const v of this.voices) {
      hold(v.env.gain, 0);
      hold(v.osc.frequency);
      hold(v.gain.gain, v.level);
    }
  }

  private pump = () => {
    if (!this.running) return;
    const now = this.ctx.currentTime;
    let guard = 0;
    while (this.nextTime < now + 1.5 && guard++ < 4) {
      const { section, line } = this.cursor;
      const end = this.scheduleLine(section, line, this.nextTime);
      if (line + 1 < CHANTS[section].lines.length) {
        this.cursor = { section, line: line + 1 };
        this.nextTime = end + LINE_GAP + Math.random() * 0.15;
      } else {
        this.cursor = { section: (section + 1) % CHANTS.length, line: 0 };
        this.ringBell(end + 1, 0.8);
        this.nextTime = end + SECTION_GAP + (this.cursor.section === 0 ? 3 : 0);
      }
    }
    const old = now - 20;
    this.words = this.words.filter((w) => w.t1 > old);
    this.lines = this.lines.filter((l) => l.t1 > old);
  };

  private scheduleLine(section: number, line: number, t0: number) {
    const words = PARSED[section][line];
    const total = words.reduce((n, w) => n + w.length, 0);
    // พระแต่ละรูปตามผู้นำช้าเร็วไม่เท่ากัน ทำให้เสียงหมู่ฟังเป็นธรรมชาติ
    this.voices.forEach((v, k) => {
      v.lag = k === 0 || k === this.voices.length - 1 ? 0 : 0.006 + Math.random() * 0.03;
    });
    // บรรทัดแรกของแต่ละบท พระผู้นำสวดขึ้นต้นคำแรกคนเดียวก่อน
    const solo = line === 0;
    if (solo) this.setSolo(true, t0 - 0.05);

    let t = t0;
    let idx = 0;
    words.forEach((sylls, w) => {
      const wordStart = t;
      if (solo && w === 1) this.setSolo(false, t - 0.03);
      for (const s of sylls) {
        idx++;
        const isFirst = idx === 1;
        const isLast = idx === total;
        let d = (s.long ? LONG : SHORT) * (0.95 + Math.random() * 0.1);
        if (isLast) d *= 1.9;
        let semi = (s.long ? -0.15 : 0.1) + (Math.random() - 0.5) * 0.25;
        if (isFirst) semi -= 0.6;
        this.scheduleSyllable(s, t, d, semi, isFirst, isLast);
        if (isLast) this.setPitch(semi - 1.6, t + d * 0.35, 0.18);
        t += d;
      }
      this.words.push({
        t0: wordStart,
        t1: t,
        section,
        line,
        word: w,
        words: words.length,
      });
    });
    this.lines.push({ t0, t1: t, section, line });
    return t;
  }

  /** ตั้ง envelope ของพระทุกรูป โดยแต่ละรูปเลื่อนเวลาตาม lag ของตัวเอง */
  private envTo(value: number, t: number, tau: number) {
    for (const v of this.voices) v.env.gain.setTargetAtTime(value, t + v.lag, tau);
  }

  private scheduleSyllable(
    s: Syllable,
    t: number,
    d: number,
    semi: number,
    isFirst: boolean,
    isLast: boolean,
  ) {
    const ng = this.noiseGain.gain;
    const nf = this.noiseFilter.frequency;
    let vowelStart: number;

    this.setPitch(semi, t, 0.035);
    switch (s.onset) {
      case "stop": {
        this.envTo(0, t, 0.008);
        const burst = t + 0.045;
        nf.setValueAtTime(s.burstHz, burst);
        ng.setValueAtTime(0, burst);
        ng.linearRampToValueAtTime(s.aspirated ? 0.35 : 0.25, burst + 0.006);
        ng.setTargetAtTime(0, burst + 0.01, s.aspirated ? 0.03 : 0.012);
        vowelStart = burst + (s.aspirated ? 0.05 : 0.015);
        break;
      }
      case "nasal":
        this.setFormants(NASAL, t, 0.01, true);
        this.envTo(0.55, t, 0.015);
        vowelStart = t + 0.06;
        break;
      case "s":
        this.envTo(0, t, 0.012);
        nf.setValueAtTime(6000, t);
        ng.setTargetAtTime(0.16, t + 0.01, 0.015);
        ng.setTargetAtTime(0, t + 0.09, 0.012);
        vowelStart = t + 0.1;
        break;
      case "h":
        this.envTo(0.15, t, 0.015);
        nf.setValueAtTime(1600, t);
        ng.setTargetAtTime(0.08, t, 0.015);
        ng.setTargetAtTime(0, t + 0.05, 0.015);
        vowelStart = t + 0.06;
        break;
      case "glide":
        this.setFormants(s.glide!, t, 0.012);
        this.envTo(0.6, t, 0.02);
        vowelStart = t + 0.055;
        break;
      default:
        this.envTo(isFirst ? 0 : 0.45, t, 0.01);
        vowelStart = t + 0.025;
    }

    this.setFormants(s.vowel, vowelStart - 0.01, 0.02);
    this.envTo(1, vowelStart, 0.018);

    if (s.coda === "nasal") {
      const c = t + d * 0.62;
      this.setFormants(NASAL, c, 0.02, true);
      this.envTo(0.7, c, 0.02);
    } else if (s.coda === "stop") {
      this.envTo(0, t + d * 0.72, 0.01);
    }
    if (isLast) this.envTo(0, t + d - 0.04, 0.06);
  }

  private setFormants(f: Formant, t: number, tau: number, nasal = false) {
    this.formants.forEach((fm, k) => {
      fm.filter.frequency.setTargetAtTime(f[k], t, tau);
      fm.gain.gain.setTargetAtTime(
        FORMANT_AMP[k] * (nasal && k > 0 ? 0.15 : 1),
        t,
        tau,
      );
    });
  }

  private setPitch(semi: number, t: number, tau: number) {
    const f = F0 * Math.pow(2, semi / 12);
    for (const v of this.voices) {
      const drift = 1 + (Math.random() - 0.5) * 0.008;
      v.osc.frequency.setTargetAtTime(f * v.ratio * drift, t + v.lag, tau);
    }
  }

  private setSolo(solo: boolean, t: number) {
    this.voices.forEach((v, k) => {
      if (k > 0) v.gain.gain.setTargetAtTime(solo ? 0 : v.level, t, 0.05);
    });
  }

  // ---------- ระฆังและบรรยากาศ ----------

  private ringBell(t: number, strength: number) {
    const ctx = this.ctx;
    const f = 174;
    // อัตราส่วนฮาร์มอนิกของระฆังสำริด: [ratio, amp, decay(s)]
    const partials: [number, number, number][] = [
      [0.5, 0.5, 9],
      [1, 0.9, 7],
      [1.19, 0.45, 5],
      [1.5, 0.3, 4.5],
      [2, 0.5, 4],
      [2.51, 0.22, 3],
      [2.66, 0.2, 2.6],
      [3.01, 0.14, 2],
      [4.07, 0.1, 1.4],
      [5.21, 0.06, 0.9],
    ];
    this.pendingSources = this.pendingSources.filter((p) => p.t > ctx.currentTime - 12);
    for (const [ratio, amp, decay] of partials) {
      for (const beat of [-1, 1]) {
        const osc = ctx.createOscillator();
        osc.frequency.value = f * ratio * (1 + beat * 0.0012);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(amp * strength * 0.06, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
        osc.connect(g);
        g.connect(this.bellBus);
        osc.start(t);
        osc.stop(t + decay + 0.05);
        this.pendingSources.push({ t, node: osc });
      }
    }
    const strike = ctx.createBufferSource();
    strike.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2400;
    bp.Q.value = 0.8;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.12 * strength, t);
    sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    strike.connect(bp);
    bp.connect(sg);
    sg.connect(this.bellBus);
    strike.start(t);
    strike.stop(t + 0.12);
    this.pendingSources.push({ t, node: strike });
  }

  private scheduleBirds() {
    setTimeout(() => {
      this.chirp();
      this.scheduleBirds();
    }, 5000 + Math.random() * 11000);
  }

  private chirp() {
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.05;
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    const out = ctx.createGain();
    out.gain.value = 0.018;
    pan.connect(out);
    out.connect(this.ambientOut);
    const base = 2800 + Math.random() * 1600;
    const notes = 2 + Math.floor(Math.random() * 4);
    let st = t;
    for (let i = 0; i < notes; i++) {
      const osc = ctx.createOscillator();
      const f = base * (1 + Math.random() * 0.2);
      osc.frequency.setValueAtTime(f, st);
      osc.frequency.exponentialRampToValueAtTime(f * 1.35, st + 0.035);
      osc.frequency.exponentialRampToValueAtTime(f * 0.9, st + 0.07);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, st);
      g.gain.linearRampToValueAtTime(1, st + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.075);
      osc.connect(g);
      g.connect(pan);
      osc.start(st);
      osc.stop(st + 0.09);
      st += 0.09 + Math.random() * 0.06;
    }
  }

  private loop = () => {
    requestAnimationFrame(this.loop);
    this.analyser.getFloatTimeDomainData(this.levelData);
    let sum = 0;
    for (const v of this.levelData) sum += v * v;
    const target = Math.min(1, Math.sqrt(sum / this.levelData.length) * 5);
    audioLevel.chant += (target - audioLevel.chant) * 0.35;
    if (this.mode === "synth") this.updateSnapshot(this.ctx.currentTime);
  };

  private updateSnapshot(now: number) {
    let cur: WordEntry | undefined;
    let next: WordEntry | undefined;
    for (const w of this.words) {
      if (w.t0 <= now) cur = w;
      else {
        next = w;
        break;
      }
    }
    if (cur && (now < cur.t1 + 1.6 || !this.running)) {
      const done = now >= cur.t1 && cur.word === cur.words - 1;
      chantStore.set({
        section: cur.section,
        line: cur.line,
        word: done ? cur.words : cur.word,
      });
      return;
    }
    const up = next ?? this.cursor;
    chantStore.set({ section: up.section, line: up.line, word: -1 });
  }
}

let instance: ChantEngine | null = null;

export function getChantEngine() {
  // three.js ใช้ AudioContext ตัวเดียวกันกับ AudioListener (type ของ three ไม่ตรงกับ DOM)
  instance ??= new ChantEngine(THREE.AudioContext.getContext() as unknown as AudioContext);
  return instance;
}
