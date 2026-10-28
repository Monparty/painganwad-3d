import type { Text } from "./i18n";

// มารยาทในวัด: เขียนให้ชาวต่างชาติเข้าใจง่าย และใช้เป็นเกร็ดความรู้สำหรับคนไทยด้วย

export type Manner = {
  title: Text;
  body: Text;
  /** คำไทยที่เกี่ยวข้อง พร้อมคำอ่าน */
  term?: { thai: string; roman: string };
  /** ลองทำในฉาก */
  action?: "bow" | "offering";
};

export const MANNERS: Manner[] = [
  {
    title: { th: "แต่งกายสุภาพ", en: "Dress modestly" },
    body: {
      th: "ใส่เสื้อมีแขนปิดไหล่ กางเกงหรือกระโปรงคลุมเข่า ไม่บางหรือรัดรูปเกินไป ถ้ามาร่วมงานบุญนิยมใส่สีขาวหรือสีสุภาพ",
      en: "Cover your shoulders and knees, and avoid see-through or very tight clothing. White or muted colors are customary for ceremonies, and many temples lend sarongs at the gate.",
    },
  },
  {
    title: { th: "ถอดรองเท้าก่อนเข้าโบสถ์", en: "Take off your shoes" },
    body: {
      th: "ถอดรองเท้า หมวก และแว่นกันแดดไว้ด้านนอก เวลาเข้าประตูให้ก้าวข้ามธรณีประตู อย่าเหยียบ",
      en: "Leave shoes, hats and sunglasses outside the ordination hall. Step over the raised wooden threshold rather than on it.",
    },
    term: { thai: "โบสถ์", roman: "bot / ubosot" },
  },
  {
    title: { th: "นั่งพับเพียบ", en: "Sit with your feet tucked away" },
    body: {
      th: "นั่งพับขาไปด้านข้าง ปลายเท้าชี้ไปด้านหลัง อย่าชี้เท้าไปทางพระพุทธรูป พระสงฆ์ หรือผู้อื่น และอย่านั่งหันหลังให้พระประธาน",
      en: "Fold your legs to one side with your feet pointing behind you. Feet are the lowest part of the body, so never point them at a Buddha image, a monk or another person, and don't sit with your back to the main Buddha image.",
    },
    term: { thai: "พับเพียบ", roman: "pap phiap" },
  },
  {
    title: { th: "กราบพระสามครั้ง", en: "Bow three times" },
    body: {
      th: "กราบแบบเบญจางคประดิษฐ์ ให้หน้าผาก ฝ่ามือทั้งสอง และเข่าทั้งสองจรดพื้น กราบสามครั้งระลึกถึงพระพุทธ พระธรรม และพระสงฆ์",
      en: "Kneel, then lower your forehead, palms and knees to the floor. Bow three times: once each for the Buddha, the Dhamma (his teaching) and the Sangha (the community of monks).",
    },
    term: { thai: "กราบ", roman: "krap" },
    action: "bow",
  },
  {
    title: { th: "ไหว้พระสงฆ์", en: "Greet monks with a wai" },
    body: {
      th: "พนมมือแล้วยกขึ้นให้นิ้วโป้งจรดระหว่างคิ้ว พระสงฆ์จะไม่ไหว้ตอบ ซึ่งเป็นเรื่องปกติ",
      en: "Press your palms together and raise them until your thumbs touch between your eyebrows. Monks do not return a wai; this is normal, not rude.",
    },
    term: { thai: "ไหว้", roman: "wai" },
  },
  {
    title: { th: "สุภาพสตรีไม่สัมผัสพระสงฆ์", en: "Women should not touch monks" },
    body: {
      th: "สุภาพสตรีไม่ควรถูกเนื้อต้องตัวหรือยื่นของให้พระโดยตรง ให้วางบนผ้ารับประเคนที่พระปูไว้ หรือฝากผู้ชายถวายแทน",
      en: "Monks keep strict rules about contact with women. Women should not hand anything directly to a monk; place it on the cloth he lays down, or ask a man to pass it on.",
    },
    term: { thai: "ผ้ารับประเคน", roman: "pha rap prakhen" },
  },
  {
    title: { th: "เคารพพระพุทธรูป", en: "Respect Buddha images" },
    body: {
      th: "อย่าปีนป่าย จับ หรือถ่ายรูปท่าทางไม่เหมาะสมกับพระพุทธรูป พระพุทธรูปไม่ใช่ของตกแต่ง เวลาบอกทางให้ผายมือแทนการชี้นิ้ว",
      en: "Don't climb on, touch or pose playfully with Buddha images; they are objects of reverence, not decoration. Indicate things with an open hand rather than a pointed finger.",
    },
  },
  {
    title: { th: "สำรวมกิริยา", en: "Keep calm and quiet" },
    body: {
      th: "พูดเบาๆ ปิดเสียงโทรศัพท์ ไม่ใช้แฟลชระหว่างพิธี ขออนุญาตก่อนถ่ายภาพพระสงฆ์ และไม่จับศีรษะผู้อื่น",
      en: "Speak softly, silence your phone, avoid flash during ceremonies and ask before photographing monks. The head is the most respected part of the body, so don't touch anyone's head.",
    },
  },
  {
    title: { th: "ถวายของให้ถูกเวลา", en: "Offerings and mealtimes" },
    body: {
      th: "พระสงฆ์ฉันอาหารได้ตั้งแต่เช้าถึงเที่ยงวัน หลังเที่ยงควรถวายน้ำปานะ เช่น น้ำผลไม้ หรือของใช้แทน และถวายของด้วยสองมือ",
      en: "Monks eat only between dawn and noon. In the afternoon, offer drinks such as juice, or useful items instead, and always offer with both hands.",
    },
    term: { thai: "ถวาย", roman: "thawai" },
    action: "offering",
  },
  {
    title: { th: "ทำบุญด้วยใจ", en: "Making merit" },
    body: {
      th: "ร่วมทำบุญได้ที่ตู้รับบริจาคของวัด จะมากหรือน้อยก็ได้บุญเท่ากันเมื่อทำด้วยใจศรัทธา และไม่ควรยื่นเงินให้พระสงฆ์โดยตรง",
      en: "Donations go in the temple's donation boxes; any amount given sincerely is merit. Avoid handing cash directly to a monk.",
    },
    term: { thai: "ทำบุญ", roman: "tham bun" },
  },
];
