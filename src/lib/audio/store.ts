export type ChantStatus = "idle" | "chanting" | "paused";
export type ChantMode = "recording" | "synth";

export type ChantSnapshot = {
  status: ChantStatus;
  mode: ChantMode;
  /** โหลดไฟล์เสียงสวดจริงได้หรือไม่ (ถ้าไม่ได้จะใช้เสียงสังเคราะห์อย่างเดียว) */
  recordingAvailable: boolean;
  section: number;
  line: number;
  /** คำที่กำลังสวด: -1 = ยังไม่เริ่มบรรทัด, >= จำนวนคำ = จบบรรทัดแล้ว */
  word: number;
};

let snapshot: ChantSnapshot = {
  status: "idle",
  mode: "recording",
  recordingAvailable: true,
  section: 0,
  line: 0,
  word: -1,
};

const listeners = new Set<() => void>();

export const chantStore = {
  get: () => snapshot,
  set(patch: Partial<ChantSnapshot>) {
    const next = { ...snapshot, ...patch };
    const changed = (Object.keys(next) as (keyof ChantSnapshot)[]).some(
      (k) => next[k] !== snapshot[k],
    );
    if (!changed) return;
    snapshot = next;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** ระดับเสียงสวด (0..1) อัปเดตทุกเฟรม ใช้ขยับปากพระในฉาก */
export const audioLevel = { chant: 0 };
