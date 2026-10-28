import { useSyncExternalStore } from "react";

// สองภาษา: สลับในหน้าเดียว (ไม่เปลี่ยน route) เพื่อไม่ให้ฉาก 3 มิติและเสียงสวดเริ่มใหม่
// ลำดับการเลือก: ?lang= ใน URL → ค่าที่เคยเลือก → ภาษาของเบราว์เซอร์

export type Lang = "th" | "en";
export type Text = Record<Lang, string>;

const KEY = "paiwat:lang";
const listeners = new Set<() => void>();
let current: Lang | null = null;

const isLang = (v: unknown): v is Lang => v === "th" || v === "en";

function detect(): Lang {
  try {
    const query = new URLSearchParams(window.location.search).get("lang");
    if (isLang(query)) return query;
    const saved = localStorage.getItem(KEY);
    if (isLang(saved)) return saved;
  } catch {}
  return navigator.language.toLowerCase().startsWith("th") ? "th" : "en";
}

export const langStore = {
  get: (): Lang => (current ??= detect()),
  getServer: (): Lang => "th",
  set(lang: Lang) {
    if (lang === current) return;
    current = lang;
    try {
      localStorage.setItem(KEY, lang);
    } catch {}
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useLang() {
  return useSyncExternalStore(langStore.subscribe, langStore.get, langStore.getServer);
}

const THAI_DIGITS = "๐๑๒๓๔๕๖๗๘๙";
export const thaiNumber = (n: number) => String(n).replace(/\d/g, (d) => THAI_DIGITS[+d]);

export type Stats = { sessions: number; minutes: number; streak: number };

const th = {
  loading: "กำลังเปิดประตูโบสถ์…",
  title: "ไปวัด",
  subtitle: "",
  tagline: "ถอดรองเท้าไว้หน้าโบสถ์ แล้วนั่งพับเพียบฟังพระสวดมนต์",
  enter: "เข้าพระอุโบสถ",
  note: "ใส่หูฟังจะได้ยินเสียงสวดรอบทิศ · ลากเพื่อหันมองซ้ายขวา",
  brand: "พระอุโบสถ",
  chantSource: "แหล่งเสียงสวด",
  modeRecording: "เสียงจริง",
  modeSynth: "บทสวด+คำอ่าน",
  bow: "กราบพระ",
  bowing: "กำลังกราบ…",
  pause: "หยุดสวด",
  resume: "สวดต่อ",
  mute: "ปิดเสียง",
  unmute: "เปิดเสียง",
  fullscreen: "เต็มจอ",
  hint: "ลากเพื่อหันมอง · ปุ่มลูกศร ← → · ล้อเมาส์เพื่อซูม",
  recordingLabel: "เสียงสวดจริง",
  audio: "เสียง",

  menu: "เมนู",
  close: "ปิด",
  listen: "ฟังสวด",
  practice: "ปฏิบัติ",
  sleep: "สวดมนต์ก่อนนอน",
  sleepDesc: "เสียงสวดค่อยๆ เบาลง จอค่อยๆ มืด แล้วหยุดเอง",
  meditate: "นั่งสมาธิ",
  meditateDesc: "ตีระฆังเริ่มและจบ พร้อมจังหวะหายใจ พุท–โธ",
  withChant: "มีเสียงสวด",
  silent: "เงียบ",
  minutes: (n: number) => `${n} นาที`,
  start: "เริ่ม",
  stats: (s: Stats) => `นั่งแล้ว ${s.sessions} ครั้ง · รวม ${s.minutes} นาที · ต่อเนื่อง ${s.streak} วัน`,
  noStats: "ยังไม่เคยนั่ง เริ่มวันนี้เลย",
  temple: "ในวัด",
  fortune: "เสี่ยงเซียมซี",
  fortuneDesc: "ตั้งจิตอธิษฐาน แล้วเขย่ากระบอกเซียมซี",
  etiquette: "มารยาทในวัด",
  etiquetteDesc: "สิ่งที่ควรทำและไม่ควรทำเมื่อไปวัด",
  language: "ภาษา",

  sleepPill: "ก่อนนอน",
  stop: "หยุด",
  goodnight: "ราตรีสวัสดิ์",
  goodnightSub: "หลับให้สบาย ขอให้ฝันดี",
  backToHall: "กลับเข้าโบสถ์",

  breatheIn: "พุท",
  breatheOut: "โธ",
  breatheInHint: "หายใจเข้า",
  breatheOutHint: "หายใจออก",
  end: "จบ",
  meditationDone: (n: number) => `ครบ ${n} นาที`,
  sadhu: "อนุโมทนาสาธุ",
  back: "กลับ",

  fortuneTitle: "เซียมซี",
  fortuneIntro: "นั่งให้สงบ ตั้งจิตนึกถึงเรื่องที่อยากถาม แล้วเขย่ากระบอกจนไม้หล่นออกมาหนึ่งอัน",
  shake: "เขย่า",
  shakeHint: "หรือเขย่ามือถือ",
  shaking: "กำลังเขย่า…",
  slipNumber: (n: number) => `ใบที่ ${thaiNumber(n)}`,
  levels: { great: "ดีมาก", good: "ดี", fair: "ปานกลาง", caution: "ระวัง" },
  topics: { work: "การงาน", money: "การเงิน", love: "ความรัก", health: "สุขภาพ" },
  reflection: "คติธรรม",
  again: "เขย่าอีกครั้ง",
  fortuneNote: "เซียมซีเป็นเพียงกำลังใจ ผลจริงอยู่ที่การกระทำของเราเอง",

  etiquetteIntro: "วัดเป็นสถานที่ศักดิ์สิทธิ์ ปฏิบัติตัวให้เหมาะสมเพื่อแสดงความเคารพต่อพระรัตนตรัย",
  tryBow: "ลองกราบเลย",
  tryLook: "มองพานดอกไม้ตรงหน้า",
};

type Dict = typeof th;

const en: Dict = {
  loading: "Opening the temple doors…",
  title: "ไปวัด",
  subtitle: "Pai Wat · a visit to a Thai temple",
  tagline:
    "Leave your shoes at the door, sit with your feet tucked behind you, and listen to the monks chant.",
  enter: "Enter the ordination hall",
  note: "Wear headphones to hear the chant all around you · drag to look around",
  brand: "Ubosot",
  chantSource: "Chant source",
  modeRecording: "Recording",
  modeSynth: "Chant + text",
  bow: "Bow",
  bowing: "Bowing…",
  pause: "Pause chanting",
  resume: "Resume chanting",
  mute: "Mute",
  unmute: "Unmute",
  fullscreen: "Full screen",
  hint: "Drag to look around · ← → keys · scroll to zoom",
  recordingLabel: "Field recording",
  audio: "Audio",

  menu: "Menu",
  close: "Close",
  listen: "Chants",
  practice: "Practice",
  sleep: "Bedtime chanting",
  sleepDesc: "The chant slowly fades and the screen dims until it stops.",
  meditate: "Meditation timer",
  meditateDesc: "A bell to begin and end, with a Bud–dho breathing guide.",
  withChant: "With chanting",
  silent: "Silent",
  minutes: (n: number) => `${n} min`,
  start: "Start",
  stats: (s: Stats) => `${s.sessions} sessions · ${s.minutes} min total · ${s.streak}-day streak`,
  noStats: "No sessions yet. Start today.",
  temple: "At the temple",
  fortune: "Fortune sticks",
  fortuneDesc: "Make a wish and shake the siam si cylinder.",
  etiquette: "Temple etiquette",
  etiquetteDesc: "Dos and don'ts when visiting a Thai temple.",
  language: "Language",

  sleepPill: "Bedtime",
  stop: "Stop",
  goodnight: "Sleep well",
  goodnightSub: "May you rest peacefully.",
  backToHall: "Back to the hall",

  breatheIn: "Bud",
  breatheOut: "dho",
  breatheInHint: "breathe in",
  breatheOutHint: "breathe out",
  end: "End",
  meditationDone: (n: number) => `${n} minutes complete`,
  sadhu: "Sādhu — well done",
  back: "Back",

  fortuneTitle: "Siam Si",
  fortuneIntro:
    "Sit quietly, hold your question in mind, then shake the cylinder until a single stick falls out.",
  shake: "Shake",
  shakeHint: "or shake your phone",
  shaking: "Shaking…",
  slipNumber: (n: number) => `No. ${n}`,
  levels: { great: "Excellent", good: "Good", fair: "Moderate", caution: "Take care" },
  topics: { work: "Work", money: "Money", love: "Love", health: "Health" },
  reflection: "Reflection",
  again: "Shake again",
  fortuneNote: "A siam si offers encouragement, not destiny — what matters is what you do.",

  etiquetteIntro:
    "A wat is a sacred place. These simple customs show respect, and Thai people will notice and appreciate them.",
  tryBow: "Try bowing now",
  tryLook: "Look at your offering tray",
};

export const UI: Record<Lang, Dict> = { th, en };

export function useT() {
  return UI[useLang()];
}
