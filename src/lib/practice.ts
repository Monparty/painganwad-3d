import type { Stats } from "./i18n";

// โหมดปฏิบัติ: สวดมนต์ก่อนนอน และนั่งสมาธิ (เก็บสถิติไว้ในเครื่องผู้ใช้)

export type Practice =
  | { kind: "sleep"; minutes: number; startedAt: number }
  | {
      kind: "meditate";
      minutes: number;
      startedAt: number;
      withChant: boolean;
      /** เสียงสวดเล่นอยู่ก่อนเริ่ม (นั่งแบบเงียบ) จึงสวดต่อเมื่อจบ */
      resumeAfter: boolean;
    };

export const SLEEP_MINUTES = [15, 30, 45, 60];
export const MEDITATE_MINUTES = [5, 10, 15, 20, 30];
/** ช่วงท้ายของโหมดก่อนนอนที่เสียงค่อยๆ เบาลง (วินาที) */
export const sleepFadeSeconds = (minutes: number) => Math.min(600, (minutes * 60) / 3);

const KEY = "paiwat:meditation";
type Stored = Stats & { lastDay: string };

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function loadStats(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Stored;
  } catch {}
  return { sessions: 0, minutes: 0, streak: 0, lastDay: "" };
}

export function recordMeditation(minutes: number): Stored {
  const prev = loadStats();
  const now = new Date();
  const today = dayKey(now);
  const yesterday = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const streak = prev.lastDay === today ? prev.streak : prev.lastDay === yesterday ? prev.streak + 1 : 1;
  const next = { sessions: prev.sessions + 1, minutes: prev.minutes + minutes, streak, lastDay: today };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export const clock = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
