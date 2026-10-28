// เสียงสวดจริงที่ใช้เป็นค่าเริ่มต้น (ใส่ไฟล์ของตัวเองแทนที่ public/audio/chant.mp3 ได้ แล้วแก้ข้อมูลด้านล่าง)
// สัญญาอนุญาต CC BY 3.0 ต้องแสดงเครดิตผู้บันทึกและลิงก์สัญญาอนุญาต

export const RECORDING = {
  src: "/audio/chant.mp3",
  title: "พระปาติโมกข์",
  meaning:
    "พระสงฆ์ประชุมกันในพระอุโบสถในวันอุโบสถ แล้วสวดทบทวนศีล 227 ข้อของภิกษุเป็นภาษาบาลี",
  place: "วัดคุ้งตะเภา จ.อุตรดิตถ์",
  credit: "บันทึกเสียงโดย พระวินัยธร",
  license: "CC BY 3.0",
  licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Bhikkhu_P%C4%81%E1%B9%ADimokkha_Pali.ogg",
  /** ดัดแปลงจากต้นฉบับ: ตัด 8 นาทีแรก ลดเสียงรบกวน ปรับความดัง */
  changes: "ตัดช่วง 8 นาทีแรก ลดเสียงรบกวน และปรับระดับเสียง",
};
