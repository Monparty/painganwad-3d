// เสียงสวดจริงที่ใช้เป็นค่าเริ่มต้น (ใส่ไฟล์ของตัวเองแทนที่ public/audio/chant.mp3 ได้ แล้วแก้ข้อมูลด้านล่าง)
// สัญญาอนุญาต CC BY 3.0 ต้องแสดงเครดิตผู้บันทึกและลิงก์สัญญาอนุญาต

export const RECORDING = {
  src: "/audio/chant.mp3",
  title: { th: "พระปาติโมกข์", en: "Pāṭimokkha" },
  meaning: {
    th: "พระสงฆ์ประชุมกันในพระอุโบสถในวันอุโบสถ แล้วสวดทบทวนศีล 227 ข้อของภิกษุเป็นภาษาบาลี",
    en: "On observance days the monks gather in the ordination hall and recite the 227 rules of monastic discipline in Pali.",
  },
  place: { th: "วัดคุ้งตะเภา จ.อุตรดิตถ์", en: "Wat Khung Taphao, Uttaradit" },
  credit: { th: "บันทึกเสียงโดย พระวินัยธร", en: "recorded by Phra Winaithon" },
  license: "CC BY 3.0",
  licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Bhikkhu_P%C4%81%E1%B9%ADimokkha_Pali.ogg",
  /** ดัดแปลงจากต้นฉบับ: ตัด 8 นาทีแรก ลดเสียงรบกวน ปรับความดัง */
  changes: {
    th: "ตัดช่วง 8 นาทีแรก ลดเสียงรบกวน และปรับระดับเสียง",
    en: "first 8 minutes removed, noise reduced, levels adjusted",
  },
};
