// บทสวด: คำไทยแต่ละคำ (คั่นด้วยช่องว่าง) ต้องจับคู่กับคำโรมัน (พยางค์คั่นด้วย "-")
// คำโรมันใช้ขับเสียงสังเคราะห์ และใช้เป็นคำบรรยายภาษาบาลีในโหมดภาษาอังกฤษ ส่วนคำไทยใช้แสดงคำบรรยาย

import type { Text } from "../i18n";

export type ChantLine = { thai: string; roman: string };

export type ChantSection = {
  id: "namo" | "buddha" | "dhamma" | "sangha" | "metta" | "kruatnam";
  title: Text;
  meaning: Text;
  lines: ChantLine[];
};

const NAMO: ChantLine = {
  thai: "นะโม ตัสสะ ภะคะวะโต อะระหะโต สัมมาสัมพุทธัสสะ",
  roman: "na-mo tas-sa bha-ga-va-to a-ra-ha-to sam-mā-sam-bud-dhas-sa",
};

const SAVAKA: ChantLine = {
  thai: "ภะคะวะโต สาวะกะสังโฆ",
  roman: "bha-ga-va-to sā-va-ka-saṅ-gho",
};

const withSavaka = (thai: string, roman: string): ChantLine => ({
  thai: `${thai} ${SAVAKA.thai}`,
  roman: `${roman} ${SAVAKA.roman}`,
});

const IDAM_ME: ChantLine[] = [
  { thai: "อิทัง เม ญาตีนัง โหตุ", roman: "i-daṃ me ñā-tī-naṃ ho-tu" },
  { thai: "สุขิตา โหนตุ ญาตะโย", roman: "su-khi-tā hon-tu ñā-ta-yo" },
];

export const CHANTS: ChantSection[] = [
  {
    id: "namo",
    title: { th: "บทนอบน้อมพระพุทธเจ้า", en: "Homage to the Buddha" },
    meaning: {
      th: "ขอนอบน้อมแด่พระผู้มีพระภาคเจ้า ผู้ไกลจากกิเลส ตรัสรู้ชอบได้โดยพระองค์เอง",
      en: "Homage to the Blessed One, the Worthy One, the Perfectly Self-Awakened One.",
    },
    lines: [NAMO, NAMO, NAMO],
  },
  {
    id: "buddha",
    title: { th: "บทสรรเสริญพระพุทธคุณ", en: "Virtues of the Buddha" },
    meaning: {
      th: "พระผู้มีพระภาคเจ้านั้น เป็นผู้ไกลจากกิเลส ตรัสรู้ชอบเอง ถึงพร้อมด้วยวิชชาและจรณะ เป็นครูของเทวดาและมนุษย์",
      en: "Such is the Blessed One: worthy, perfectly awakened, accomplished in knowledge and conduct, knower of the worlds, teacher of gods and humans.",
    },
    lines: [
      { thai: "อิติปิ โส ภะคะวา", roman: "i-ti-pi so bha-ga-vā" },
      { thai: "อะระหัง สัมมาสัมพุทโธ", roman: "a-ra-haṃ sam-mā-sam-bud-dho" },
      { thai: "วิชชาจะระณะสัมปันโน", roman: "vij-jā-ca-ra-ṇa-sam-pan-no" },
      { thai: "สุคะโต โลกะวิทู", roman: "su-ga-to lo-ka-vi-dū" },
      {
        thai: "อะนุตตะโร ปุริสะทัมมะสาระถิ",
        roman: "a-nut-ta-ro pu-ri-sa-dam-ma-sā-ra-thi",
      },
      { thai: "สัตถา เทวะมะนุสสานัง", roman: "sat-thā de-va-ma-nus-sā-naṃ" },
      { thai: "พุทโธ ภะคะวาติ", roman: "bud-dho bha-ga-vā-ti" },
    ],
  },
  {
    id: "dhamma",
    title: { th: "บทสรรเสริญพระธรรมคุณ", en: "Virtues of the Dhamma" },
    meaning: {
      th: "พระธรรมเป็นสิ่งที่พระผู้มีพระภาคเจ้าตรัสไว้ดีแล้ว ผู้ปฏิบัติพึงเห็นได้ด้วยตนเอง ไม่จำกัดกาล ควรเรียกให้มาดู",
      en: "The Dhamma is well taught by the Blessed One, visible here and now, timeless, inviting all to come and see, to be known by the wise for themselves.",
    },
    lines: [
      {
        thai: "สวากขาโต ภะคะวะตา ธัมโม",
        roman: "sa-vāk-khā-to bha-ga-va-tā dham-mo",
      },
      {
        thai: "สันทิฏฐิโก อะกาลิโก เอหิปัสสิโก",
        roman: "san-diṭ-ṭhi-ko a-kā-li-ko e-hi-pas-si-ko",
      },
      {
        thai: "โอปะนะยิโก ปัจจัตตัง เวทิตัพโพ วิญญูหีติ",
        roman: "o-pa-na-yi-ko pac-cat-taṃ ve-di-tab-bo viñ-ñū-hī-ti",
      },
    ],
  },
  {
    id: "sangha",
    title: { th: "บทสรรเสริญพระสังฆคุณ", en: "Virtues of the Sangha" },
    meaning: {
      th: "สงฆ์สาวกของพระผู้มีพระภาคเจ้า เป็นผู้ปฏิบัติดีแล้ว ปฏิบัติตรง ปฏิบัติเพื่อรู้ธรรม เป็นนาบุญของโลกไม่มีนาบุญอื่นยิ่งกว่า",
      en: "The Blessed One's community of disciples practises well, straightly, wisely and rightly; worthy of offerings, the unsurpassed field of merit for the world.",
    },
    lines: [
      withSavaka("สุปะฏิปันโน", "su-pa-ṭi-pan-no"),
      withSavaka("อุชุปะฏิปันโน", "u-ju-pa-ṭi-pan-no"),
      withSavaka("ญายะปะฏิปันโน", "ñā-ya-pa-ṭi-pan-no"),
      withSavaka("สามีจิปะฏิปันโน", "sā-mī-ci-pa-ṭi-pan-no"),
      {
        thai: "ยะทิทัง จัตตาริ ปุริสะยุคานิ อัฏฐะ ปุริสะปุคคะลา",
        roman: "ya-di-daṃ cat-tā-ri pu-ri-sa-yu-gā-ni aṭ-ṭha pu-ri-sa-pug-ga-lā",
      },
      withSavaka("เอสะ", "e-sa"),
      {
        thai: "อาหุเนยโย ปาหุเนยโย ทักขิเณยโย อัญชะลีกะระณีโย",
        roman: "ā-hu-nei-yo pā-hu-nei-yo dak-khi-ṇei-yo añ-ja-lī-ka-ra-ṇī-yo",
      },
      {
        thai: "อะนุตตะรัง ปุญญักเขตตัง โลกัสสาติ",
        roman: "a-nut-ta-raṃ puñ-ñak-khet-taṃ lo-kas-sā-ti",
      },
    ],
  },
  {
    id: "metta",
    title: { th: "บทแผ่เมตตา", en: "Spreading loving-kindness" },
    meaning: {
      th: "ขอให้ข้าพเจ้ามีความสุข ปราศจากทุกข์ ไม่มีเวร ไม่เบียดเบียนใคร ไม่มีทุกข์กายทุกข์ใจ และขอสัตว์ทั้งหลายจงอย่ามีเวรแก่กัน อย่าเบียดเบียนกัน จงรักษาตนให้มีความสุขเถิด",
      en: "May I be happy and free from suffering, free from enmity, ill will and distress. May all beings be free from enmity, ill will and distress, and look after themselves with ease.",
    },
    lines: [
      { thai: "อะหัง สุขิโต โหมิ", roman: "a-haṃ su-khi-to ho-mi" },
      { thai: "นิททุกโข โหมิ", roman: "nid-duk-kho ho-mi" },
      { thai: "อะเวโร โหมิ", roman: "a-ve-ro ho-mi" },
      { thai: "อัพยาปัชโฌ โหมิ", roman: "ab-yā-paj-jho ho-mi" },
      { thai: "อะนีโฆ โหมิ", roman: "a-nī-gho ho-mi" },
      { thai: "สุขี อัตตานัง ปะริหะรามิ", roman: "su-khī at-tā-naṃ pa-ri-ha-rā-mi" },
      { thai: "สัพเพ สัตตา อะเวรา โหนตุ", roman: "sab-be sat-tā a-ve-rā hon-tu" },
      { thai: "อัพยาปัชฌา โหนตุ", roman: "ab-yā-paj-jhā hon-tu" },
      { thai: "อะนีฆา โหนตุ", roman: "a-nī-ghā hon-tu" },
      { thai: "สุขี อัตตานัง ปะริหะรันตุ", roman: "su-khī at-tā-naṃ pa-ri-ha-ran-tu" },
    ],
  },
  {
    id: "kruatnam",
    title: { th: "บทกรวดน้ำ", en: "Sharing merit (water pouring)" },
    meaning: {
      th: "ขอส่วนบุญนี้จงสำเร็จแก่ญาติทั้งหลายของข้าพเจ้า ขอให้ญาติทั้งหลายจงมีความสุขเถิด · รินน้ำให้ไหลเป็นสายจนจบบท แล้วนำน้ำไปเทที่โคนต้นไม้",
      en: "May this merit reach my relatives; may my relatives be happy. Pour the water in one unbroken stream until the chant ends, then pour it at the foot of a tree.",
    },
    lines: [...IDAM_ME, ...IDAM_ME, ...IDAM_ME],
  },
];

export const KRUATNAM = CHANTS.findIndex((c) => c.id === "kruatnam");

/** คำโรมันแบบอ่านง่าย (ไม่มีขีดแบ่งพยางค์) ใช้เป็นคำบรรยายภาษาบาลี */
export const paliWords = (line: ChantLine) => line.roman.split(" ").map((w) => w.replace(/-/g, ""));
