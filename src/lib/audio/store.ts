export type ChantStatus = "idle" | "chanting" | "paused";

export type ChantSnapshot = {
  status: ChantStatus;
  mode: "synth" | "file";
  section: number;
  line: number;
  /** คำที่กำลังสวด: -1 = ยังไม่เริ่มบรรทัด, >= จำนวนคำ = จบบรรทัดแล้ว */
  word: number;
};

let snapshot: ChantSnapshot = {
  status: "idle",
  mode: "synth",
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
