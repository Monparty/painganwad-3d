// บทสวด: คำไทยแต่ละคำ (คั่นด้วยช่องว่าง) ต้องจับคู่กับคำโรมัน (พยางค์คั่นด้วย "-")
// คำโรมันใช้ขับเสียงสังเคราะห์ ส่วนคำไทยใช้แสดงคำบรรยาย

export type ChantLine = { thai: string; roman: string };

export type ChantSection = {
  title: string;
  meaning: string;
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

export const CHANTS: ChantSection[] = [
  {
    title: "บทนอบน้อมพระพุทธเจ้า",
    meaning:
      "ขอนอบน้อมแด่พระผู้มีพระภาคเจ้า ผู้ไกลจากกิเลส ตรัสรู้ชอบได้โดยพระองค์เอง",
    lines: [NAMO, NAMO, NAMO],
  },
  {
    title: "บทสรรเสริญพระพุทธคุณ",
    meaning:
      "พระผู้มีพระภาคเจ้านั้น เป็นผู้ไกลจากกิเลส ตรัสรู้ชอบเอง ถึงพร้อมด้วยวิชชาและจรณะ เป็นครูของเทวดาและมนุษย์",
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
    title: "บทสรรเสริญพระธรรมคุณ",
    meaning:
      "พระธรรมเป็นสิ่งที่พระผู้มีพระภาคเจ้าตรัสไว้ดีแล้ว ผู้ปฏิบัติพึงเห็นได้ด้วยตนเอง ไม่จำกัดกาล ควรเรียกให้มาดู",
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
    title: "บทสรรเสริญพระสังฆคุณ",
    meaning:
      "สงฆ์สาวกของพระผู้มีพระภาคเจ้า เป็นผู้ปฏิบัติดีแล้ว ปฏิบัติตรง ปฏิบัติเพื่อรู้ธรรม เป็นนาบุญของโลกไม่มีนาบุญอื่นยิ่งกว่า",
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
];
