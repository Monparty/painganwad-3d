import type { Text } from "./i18n";

// ใบเซียมซี 28 ใบ (แต่งขึ้นใหม่ ไม่ได้คัดลอกจากวัดใด) คติธรรมส่วนใหญ่มาจากพุทธภาษิต

export type FortuneLevel = "great" | "good" | "fair" | "caution";

export type Fortune = {
  level: FortuneLevel;
  /** สองวรรค คั่นด้วย \n */
  verse: Text;
  work: Text;
  money: Text;
  love: Text;
  health: Text;
  advice: Text;
};

export const FORTUNES: Fortune[] = [
  {
    level: "great",
    verse: {
      th: "บัวพ้นน้ำรับแสงอรุณ\nความเพียรที่บ่มไว้ ถึงคราวผลิบาน",
      en: "A lotus clears the water to meet the dawn;\nthe effort you have tended now comes into bloom.",
    },
    work: { th: "งานที่ทำมานานเห็นผล ผู้ใหญ่เมตตา", en: "Long work pays off; seniors look on you kindly." },
    money: { th: "มีลาภเข้ามาต่อเนื่อง เก็บออมไว้บ้าง", en: "Steady gains arrive; set some aside." },
    love: { th: "คนรักจริงใจ คนโสดอาจพบคนถูกใจในงานบุญ", en: "A sincere partner; if single, you may meet someone at a temple fair." },
    health: { th: "แข็งแรงดี จิตใจแจ่มใส", en: "Strong body, clear mind." },
    advice: { th: "ทำดีต่อไปอย่าหยุด ความดีงอกงามได้เหมือนบัว", en: "Keep doing good without pause; goodness grows like the lotus." },
  },
  {
    level: "good",
    verse: {
      th: "ลมเย็นพัดผ่านใบโพธิ์\nเรื่องหนักใจค่อยคลาย มีผู้ช่วยเหลือ",
      en: "A cool breeze moves through the bodhi leaves;\nheavy matters ease, and help arrives.",
    },
    work: { th: "มีผู้ใหญ่หรือเพื่อนร่วมงานช่วยหนุน", en: "A mentor or colleague lends support." },
    money: { th: "การเงินพอดี ไม่ขาดมือ", en: "Enough to meet your needs." },
    love: { th: "เข้าใจกันมากขึ้นหลังได้พูดคุย", en: "An honest talk brings you closer." },
    health: { th: "พักผ่อนให้พอ อาการเหนื่อยจะหายไป", en: "Rest well and the tiredness will pass." },
    advice: { th: "เปิดใจรับความช่วยเหลือ แล้วส่งต่อน้ำใจให้ผู้อื่น", en: "Accept help with grace, and pass the kindness on." },
  },
  {
    level: "fair",
    verse: {
      th: "เมฆบังจันทร์ไว้ชั่วครู่\nรอสักพัก แสงนวลจะกลับมา",
      en: "Clouds veil the moon for a while;\nwait a little, and its light returns.",
    },
    work: { th: "งานยังติดขัด อย่าเพิ่งเปลี่ยนแผน", en: "Work is slow; don't change course just yet." },
    money: { th: "รายจ่ายมาก ควรประหยัด", en: "Expenses run high; spend carefully." },
    love: { th: "อย่าใจร้อน ให้เวลากันและกัน", en: "Be patient; give each other time." },
    health: { th: "ระวังการนอนดึก", en: "Watch the late nights." },
    advice: { th: "ทุกสิ่งไม่เที่ยง ความทุกข์ก็ผ่านไปได้เช่นกัน", en: "All things change, and hardship too will pass." },
  },
  {
    level: "good",
    verse: {
      th: "เทียนเล่มน้อยส่องทางในความมืด\nเริ่มจากก้าวเล็ก ทางจะเปิดเอง",
      en: "A small candle lights the dark;\nbegin with a small step, and the way opens.",
    },
    work: { th: "เริ่มงานใหม่ได้ ค่อยเป็นค่อยไป", en: "A good time to begin something new, step by step." },
    money: { th: "รายได้เล็กๆ หลายทางรวมกันเป็นก้อน", en: "Small incomes from several places add up." },
    love: { th: "ความสัมพันธ์เติบโตอย่างมั่นคง", en: "The relationship grows steadily." },
    health: { th: "ออกกำลังกายเบาๆ ทุกวัน", en: "Gentle exercise every day." },
    advice: { th: "อย่าดูแคลนความดีเล็กน้อย น้ำทีละหยดยังเต็มตุ่มได้", en: "Don't belittle small good deeds; drop by drop, the water jar is filled." },
  },
  {
    level: "caution",
    verse: {
      th: "เรือลำน้อยต้านกระแสน้ำเชี่ยว\nหยุดพายพักก่อน รอน้ำนิ่ง",
      en: "A small boat fights a strong current;\nrest the oars and wait for calmer water.",
    },
    work: { th: "อย่าเพิ่งตัดสินใจเรื่องใหญ่ ตรวจเอกสารให้ดี", en: "Hold off on big decisions; double-check documents." },
    money: { th: "ระวังการลงทุนหรือให้ยืมเงิน", en: "Be wary of investing or lending money." },
    love: { th: "ระวังคำพูดตอนโกรธ", en: "Guard your words when angry." },
    health: { th: "ระวังอุบัติเหตุเล็กน้อย เดินทางช้าลง", en: "Mind small accidents; travel slowly." },
    advice: { th: "สติมา ปัญญาเกิด เมื่อใจนิ่ง ทางออกจะปรากฏ", en: "Mindfulness brings wisdom; still the mind and the way appears." },
  },
  {
    level: "great",
    verse: {
      th: "ระฆังดังกังวานทั่วลานวัด\nข่าวดีกำลังเดินทางมาถึงท่าน",
      en: "The temple bell rings across the courtyard;\ngood news is on its way to you.",
    },
    work: { th: "ได้รับการยอมรับ มีโอกาสเลื่อนตำแหน่ง", en: "Recognition, perhaps a promotion." },
    money: { th: "มีโชคจากความขยันของตนเอง", en: "Fortune comes from your own hard work." },
    love: { th: "สมหวัง ผู้ใหญ่ทั้งสองฝ่ายยินดี", en: "Hopes fulfilled; both families approve." },
    health: { th: "หายจากอาการเจ็บป่วยที่มี", en: "Recovery from what ails you." },
    advice: { th: "เมื่อได้ดีอย่าลืมแบ่งปัน ความสุขที่แบ่งแล้วยิ่งเพิ่ม", en: "In good times, share; shared happiness only grows." },
  },
  {
    level: "good",
    verse: {
      th: "ต้นไม้ใหญ่หยั่งรากลึก\nลมแรงเพียงใดก็ไม่หวั่น",
      en: "A great tree with deep roots\nstands firm in any wind.",
    },
    work: { th: "งานมั่นคง เหมาะกับการวางรากฐาน", en: "Stable work; a good time to lay foundations." },
    money: { th: "การออมระยะยาวให้ผลดี", en: "Long-term saving pays off." },
    love: { th: "ความรักมั่นคง ไว้ใจกันได้", en: "A steady love you can trust." },
    health: { th: "ดูแลกระดูกและข้อ", en: "Look after your back and joints." },
    advice: { th: "ศีลคือราก ความดีคือลำต้น ทำให้มั่นแล้วชีวิตจะร่มเย็น", en: "Virtue is the root and goodness the trunk; make them firm and life gives shade." },
  },
  {
    level: "fair",
    verse: {
      th: "ข้าวในนารอฝนฤดูใหม่\nยังไม่ถึงเวลาเก็บเกี่ยว",
      en: "Rice in the field waits for the rains;\nit is not yet time to harvest.",
    },
    work: { th: "ผลงานยังไม่ปรากฏ ทำต่อไป", en: "Results aren't showing yet; keep going." },
    money: { th: "รับเท่าไหร่จ่ายเท่านั้น", en: "Income just covers spending." },
    love: { th: "ยังไม่ชัดเจน อย่าเร่งรัด", en: "Still unclear; don't rush it." },
    health: { th: "ดื่มน้ำให้มาก", en: "Drink plenty of water." },
    advice: { th: "ทุกอย่างมีเหตุปัจจัย ทำเหตุให้ดี ผลจะตามมาเอง", en: "All things arise from causes; tend the causes well and results will follow." },
  },
  {
    level: "good",
    verse: {
      th: "นกบินกลับรังยามเย็น\nบ้านคือที่พักใจ ครอบครัวคือพร",
      en: "Birds fly home at dusk;\nhome is rest for the heart, family a blessing.",
    },
    work: { th: "งานใกล้บ้านหรืองานกับครอบครัวไปได้ดี", en: "Work close to home or with family goes well." },
    money: { th: "ได้รับความช่วยเหลือจากญาติ", en: "Help may come from relatives." },
    love: { th: "ครอบครัวสนับสนุนความรัก", en: "Your family supports the relationship." },
    health: { th: "พาพ่อแม่ไปตรวจสุขภาพ", en: "Take your parents for a check-up." },
    advice: { th: "พ่อแม่คือพระในบ้าน ดูแลท่านคือบุญใหญ่", en: "Parents are the Buddhas of the home; caring for them is great merit." },
  },
  {
    level: "great",
    verse: {
      th: "ฟ้าหลังฝนสดใส รุ้งพาดกลางฟ้า\nเรื่องยากที่ผ่านมา กลายเป็นบทเรียนล้ำค่า",
      en: "After the rain the sky clears and a rainbow appears;\npast hardship becomes a precious lesson.",
    },
    work: { th: "อุปสรรคหมดไป งานเดินหน้าเต็มที่", en: "Obstacles clear; work moves ahead at full speed." },
    money: { th: "เงินที่ติดค้างได้คืน", en: "Money owed to you comes back." },
    love: { th: "คืนดีกับคนที่เคยห่างเหิน", en: "Reconciliation with someone who drifted away." },
    health: { th: "ร่างกายฟื้นตัวเร็ว", en: "Your body recovers quickly." },
    advice: { th: "ขอบคุณความยากลำบาก ที่ทำให้ใจเราเข้มแข็ง", en: "Be grateful for hardship; it made your heart strong." },
  },
  {
    level: "caution",
    verse: {
      th: "เดินบนสะพานไม้ไผ่ยามค่ำ\nก้าวช้าๆ มองให้ชัดก่อนเหยียบ",
      en: "Crossing a bamboo bridge at night,\nstep slowly and look before each step.",
    },
    work: { th: "ระวังคนพูดสองแง่ อย่าเชื่อข่าวลือ", en: "Beware of two-faced talk; ignore rumors." },
    money: { th: "อย่าค้ำประกันให้ใคร", en: "Don't guarantee anyone's loan." },
    love: { th: "อย่าเพิ่งเชื่อคำหวาน ดูที่การกระทำ", en: "Don't trust sweet words yet; watch what they do." },
    health: { th: "ระวังอาหารไม่สะอาด", en: "Be careful with unclean food." },
    advice: { th: "ความไม่ประมาทเป็นทางแห่งความไม่ตาย", en: "Heedfulness is the path to the deathless." },
  },
  {
    level: "good",
    verse: {
      th: "น้ำใสในบ่อลึก มองเห็นถึงก้น\nใจที่ซื่อตรง ใครก็ไว้ใจ",
      en: "Clear water in a deep well shows its bottom;\nan honest heart earns everyone's trust.",
    },
    work: { th: "ได้รับความไว้วางใจให้ดูแลงานสำคัญ", en: "You're trusted with something important." },
    money: { th: "ค้าขายสุจริตมีกำไร", en: "Honest trade brings profit." },
    love: { th: "ความจริงใจชนะใจอีกฝ่าย", en: "Sincerity wins their heart." },
    health: { th: "นอนหลับสนิท", en: "Deep, restful sleep." },
    advice: { th: "สัจจะค้ำจุนชีวิต พูดอย่างไรทำอย่างนั้น", en: "Truthfulness holds life up; do what you say." },
  },
  {
    level: "fair",
    verse: {
      th: "ใบไม้ร่วงเมื่อถึงฤดู\nปล่อยวางสิ่งเก่า ให้ใบใหม่ได้ผลิ",
      en: "Leaves fall when the season turns;\nlet the old go so new leaves can grow.",
    },
    work: { th: "อาจมีการเปลี่ยนแปลง ยอมรับแล้วปรับตัว", en: "Change may come; accept it and adapt." },
    money: { th: "เคลียร์หนี้เก่าก่อนเริ่มสิ่งใหม่", en: "Clear old debts before starting anything new." },
    love: { th: "ปล่อยอดีต แล้วจะพบคนที่ใช่", en: "Release the past to meet the right person." },
    health: { th: "ระวังภูมิแพ้ช่วงเปลี่ยนฤดู", en: "Watch for allergies as the seasons change." },
    advice: { th: "การปล่อยวางไม่ใช่การยอมแพ้ แต่คือการวางของหนักลง", en: "Letting go is not giving up; it is setting down a heavy load." },
  },
  {
    level: "great",
    verse: {
      th: "พระจันทร์เต็มดวงคืนวันเพ็ญ\nสิ่งที่ตั้งใจไว้ จะสมบูรณ์พร้อม",
      en: "A full moon on the holy night;\nwhat you have set your heart on will be complete.",
    },
    work: { th: "งานสำเร็จครบถ้วนตามเป้า", en: "Goals reached in full." },
    money: { th: "รายได้เพิ่มขึ้นชัดเจน", en: "Income clearly rises." },
    love: { th: "สมหวังในความรัก มีข่าวดีเรื่องคู่", en: "Love fulfilled; happy news about a partner." },
    health: { th: "สุขภาพดีทั้งกายและใจ", en: "Healthy in body and mind." },
    advice: { th: "เมื่อทุกอย่างพร้อม อย่าลืมความอ่อนน้อม", en: "When all is complete, remain humble." },
  },
  {
    level: "good",
    verse: {
      th: "สายน้ำไหลอ้อมโขดหิน\nอ่อนแต่ไม่แพ้ ไปถึงทะเลได้",
      en: "The stream flows around the rocks;\nsoft yet unbeaten, it reaches the sea.",
    },
    work: { th: "ใช้ความนุ่มนวลแก้ปัญหาแล้วจะสำเร็จ", en: "Gentleness solves the problem." },
    money: { th: "หาช่องทางใหม่ รายได้จะไหลมา", en: "Find another route and income will flow." },
    love: { th: "ยอมกันบ้าง ความรักจะยืนยาว", en: "Give a little and love will last." },
    health: { th: "ฝึกหายใจลึกๆ คลายเครียด", en: "Deep breathing eases stress." },
    advice: { th: "ขันติ ความอดทน เป็นตบะอย่างยิ่ง", en: "Patient endurance is the highest practice." },
  },
  {
    level: "caution",
    verse: {
      th: "ไฟในกองฟาง ลุกง่ายดับยาก\nโกรธเพียงครั้งเดียว อาจเผาความดีจนหมด",
      en: "Fire in a haystack catches fast and dies hard;\none flash of anger can burn all that's good.",
    },
    work: { th: "หลีกเลี่ยงการโต้เถียงกับหัวหน้า", en: "Avoid arguments with superiors." },
    money: { th: "อย่าซื้อของตามอารมณ์", en: "Don't buy on impulse." },
    love: { th: "ใจเย็นๆ ช่วงนี้ทะเลาะกันง่าย", en: "Stay calm; quarrels come easily now." },
    health: { th: "ระวังความดันและอาการปวดหัว", en: "Watch your blood pressure and headaches." },
    advice: { th: "พึงชนะความโกรธด้วยความไม่โกรธ", en: "Conquer anger with non-anger." },
  },
  {
    level: "good",
    verse: {
      th: "ผึ้งเก็บน้ำหวานจากดอกไม้\nไม่ทำให้ดอกช้ำ ไม่ทำให้สีจาง",
      en: "The bee gathers nectar from the flower\nwithout harming its color or scent.",
    },
    work: { th: "ทำงานร่วมกับผู้อื่นได้ดี ทุกฝ่ายได้ประโยชน์", en: "Teamwork goes well; everyone benefits." },
    money: { th: "กำไรพอดี ไม่เอาเปรียบใคร", en: "Fair profit, taking advantage of no one." },
    love: { th: "ดูแลกันอย่างอ่อนโยน", en: "Care for each other gently." },
    health: { th: "กินผักผลไม้ให้มาก", en: "Eat plenty of fruit and vegetables." },
    advice: { th: "จงเป็นเหมือนผึ้ง ได้ประโยชน์โดยไม่เบียดเบียน", en: "Be like the bee: take what you need without causing harm." },
  },
  {
    level: "fair",
    verse: {
      th: "ทางขึ้นเขายังอีกยาวไกล\nพักดื่มน้ำ แล้วค่อยเดินต่อ",
      en: "The mountain path is still long;\nstop for water, then walk on.",
    },
    work: { th: "งานหนัก ต้องใช้เวลา", en: "A heavy load that takes time." },
    money: { th: "ค่อยๆ เก็บ อย่าหวังรวยเร็ว", en: "Save slowly; don't chase quick riches." },
    love: { th: "ต้องพยายามมากขึ้นอีกนิด", en: "It needs a little more effort." },
    health: { th: "ระวังความเหนื่อยสะสม", en: "Beware of built-up fatigue." },
    advice: { th: "ความเพียรอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น", en: "Where there is persistence, there is success." },
  },
  {
    level: "great",
    verse: {
      th: "ต้นโพธิ์แผ่กิ่งก้านให้ร่มเงา\nบุญที่ทำไว้ กลับมาคุ้มครองท่าน",
      en: "The bodhi tree spreads its shade;\nthe merit you have made returns to shelter you.",
    },
    work: { th: "มีคนดีเข้ามาช่วยเหลือ งานรุ่งเรือง", en: "Good people come to help; work flourishes." },
    money: { th: "มีโชคลาภผ่านผู้ใหญ่", en: "Good fortune through elders." },
    love: { th: "พบคู่ที่มีบุญร่วมกันมา", en: "You meet someone you share good karma with." },
    health: { th: "แคล้วคลาดปลอดภัย", en: "You are kept safe from harm." },
    advice: { th: "บุญไม่ได้อยู่ที่ขอ แต่อยู่ที่ทำ", en: "Merit isn't asked for; it is made." },
  },
  {
    level: "good",
    verse: {
      th: "ดอกมะลิบานยามเช้า หอมไปไกล\nความดีไม่ต้องป่าวประกาศ ใครก็รู้",
      en: "Jasmine blooms at dawn and its scent travels far;\ngoodness needs no announcement.",
    },
    work: { th: "ผลงานเป็นที่ประจักษ์ ชื่อเสียงดี", en: "Your work speaks for itself." },
    money: { th: "มีรายได้จากคำแนะนำของคนที่ชื่นชม", en: "Income through reputation and referrals." },
    love: { th: "มีคนแอบชื่นชม", en: "Someone quietly admires you." },
    health: { th: "ดูแลผิวพรรณและการนอน", en: "Care for your skin and sleep." },
    advice: { th: "กลิ่นดอกไม้ไม่อาจทวนลม แต่กลิ่นของคนดีหอมทวนลม", en: "The scent of flowers cannot go against the wind, but the fragrance of the good can." },
  },
  {
    level: "caution",
    verse: {
      th: "ปลาติดเบ็ดเพราะเหยื่อหอม\nสิ่งที่ดูง่ายเกินไป อาจมีกับดักซ่อนอยู่",
      en: "The fish is hooked by tempting bait;\nwhat looks too easy may hide a trap.",
    },
    work: { th: "ระวังข้อเสนอที่ดีเกินจริง", en: "Beware offers that seem too good to be true." },
    money: { th: "ระวังมิจฉาชีพและการพนัน", en: "Watch out for scams and gambling." },
    love: { th: "อย่าตัดสินคนจากภายนอก", en: "Don't judge by appearances." },
    health: { th: "งดเหล้าและของมึนเมา", en: "Avoid alcohol and intoxicants." },
    advice: { th: "ความสันโดษ รู้จักพอ เป็นทรัพย์อย่างยิ่ง", en: "Contentment is the greatest wealth." },
  },
  {
    level: "fair",
    verse: {
      th: "เรือข้ามฟากรอคนให้เต็มลำ\nช้าไปบ้าง แต่ไปถึงพร้อมกัน",
      en: "The ferry waits until it is full;\nslower, perhaps, but everyone arrives together.",
    },
    work: { th: "งานกลุ่มล่าช้า ต้องประสานงานให้ดี", en: "Group work is delayed; coordinate carefully." },
    money: { th: "เงินเข้าช้ากว่าที่คิด", en: "Money arrives later than expected." },
    love: { th: "ฟังความเห็นของอีกฝ่าย", en: "Listen to your partner's view." },
    health: { th: "ระวังไข้หวัด", en: "Watch out for colds." },
    advice: { th: "ความสามัคคีนำสุขมาให้ ไปด้วยกันไปได้ไกล", en: "Harmony brings happiness; together you go further." },
  },
  {
    level: "good",
    verse: {
      th: "แม่น้ำกว้างย่อมมีเรือข้ามฟาก\nเรื่องที่คิดว่าไปไม่ถึง ยังมีทางเสมอ",
      en: "The wide river has its ferry;\nwhat seemed out of reach has a way across.",
    },
    work: { th: "เรื่องที่ค้างไว้จะคลี่คลาย", en: "Pending matters get resolved." },
    money: { th: "ได้ทุนหรือความช่วยเหลือตามที่หวัง", en: "Funding or support comes as hoped." },
    love: { th: "ระยะทางไม่เป็นอุปสรรค", en: "Distance is no obstacle." },
    health: { th: "อาการเรื้อรังดีขึ้น", en: "A lingering condition improves." },
    advice: { th: "อย่าท้อ เมื่อใจไม่ยอมแพ้ ทางย่อมมี", en: "Don't lose heart; where the mind won't give up, a way appears." },
  },
  {
    level: "great",
    verse: {
      th: "นาข้าวเหลืองทองทั่วทุ่ง\nสิ่งที่หว่านไว้ ได้เก็บเกี่ยวเต็มยุ้ง",
      en: "Golden rice fills the fields;\nwhat you sowed now fills the granary.",
    },
    work: { th: "ผลงานโดดเด่น ได้รางวัล", en: "Outstanding results; rewards follow." },
    money: { th: "มั่งคั่ง มีเหลือเก็บ", en: "Abundance, with plenty to save." },
    love: { th: "เหมาะกับการแต่งงานหรือสร้างครอบครัว", en: "A good time to marry or start a family." },
    health: { th: "อายุยืน สุขภาพดี", en: "Long life and good health." },
    advice: { th: "หว่านพืชเช่นไร ย่อมได้ผลเช่นนั้น", en: "As the seed is sown, so is the fruit reaped." },
  },
  {
    level: "fair",
    verse: {
      th: "หมอกยามเช้าคลุมทางเดิน\nอย่ารีบร้อน รอแดดส่องก่อนออกเดินทาง",
      en: "Morning mist covers the path;\ndon't hurry, wait for the sun before setting out.",
    },
    work: { th: "รอข้อมูลให้ครบก่อนตัดสินใจ", en: "Wait for full information before deciding." },
    money: { th: "ชะลอการซื้อของชิ้นใหญ่", en: "Postpone big purchases." },
    love: { th: "ใจยังสับสน ให้เวลากับตัวเอง", en: "Feelings are mixed; give yourself time." },
    health: { th: "พักสายตาและนอนให้พอ", en: "Rest your eyes and get enough sleep." },
    advice: { th: "ใจขุ่นเหมือนน้ำขุ่น ตั้งไว้นิ่งๆ แล้วจะใสเอง", en: "A troubled mind is like muddy water; leave it still and it clears." },
  },
  {
    level: "good",
    verse: {
      th: "ช่างปั้นค่อยๆ ขึ้นรูปดินเหนียว\nฝีมือที่ฝึกฝน จะสร้างงานงดงาม",
      en: "The potter slowly shapes the clay;\npractised hands create beautiful work.",
    },
    work: { th: "การเรียนรู้ทักษะใหม่ให้ผลดี", en: "Learning a new skill pays off." },
    money: { th: "รายได้จากฝีมือของตนเอง", en: "Income from your own craft." },
    love: { th: "ค่อยๆ เรียนรู้กัน ความรักจะงดงาม", en: "Learn each other slowly and love grows beautiful." },
    health: { th: "ฝึกสมาธิช่วยให้ใจสงบ", en: "Meditation calms the mind." },
    advice: { th: "ตนแลเป็นที่พึ่งแห่งตน ฝึกตนให้ดี", en: "You are your own refuge; train yourself well." },
  },
  {
    level: "caution",
    verse: {
      th: "ถ้วยชาที่เต็มปรี่ เติมอะไรก็ล้น\nเทของเก่าออกก่อน จึงรับสิ่งใหม่ได้",
      en: "A cup filled to the brim overflows;\nempty it first to receive something new.",
    },
    work: { th: "อย่าดื้อรั้น ฟังคำแนะนำของผู้อื่น", en: "Don't be stubborn; listen to advice." },
    money: { th: "ระวังรายจ่ายฟุ่มเฟือย", en: "Beware of extravagant spending." },
    love: { th: "ความหึงหวงทำให้ห่างกัน", en: "Jealousy pushes you apart." },
    health: { th: "ระวังกินมากเกินไป", en: "Don't overeat." },
    advice: { th: "ความถือตัวคือกำแพง ความถ่อมตนคือประตู", en: "Pride is a wall; humility is a door." },
  },
  {
    level: "great",
    verse: {
      th: "ประทีปส่องสว่างทั่วพระอุโบสถ\nปัญญาเกิด ความมืดในใจมลายสิ้น",
      en: "Lamps light the whole ordination hall;\nwisdom rises and the darkness in the heart is gone.",
    },
    work: { th: "คิดการใดสำเร็จ แก้ปัญหาได้เฉียบขาด", en: "Ideas succeed; you solve problems decisively." },
    money: { th: "การเงินมั่นคง ตัดสินใจถูกต้อง", en: "Finances are secure; your choices are sound." },
    love: { th: "เข้าใจกันลึกซึ้ง", en: "A deep understanding between you." },
    health: { th: "จิตใจผ่องใส ร่างกายแข็งแรง", en: "Bright mind, strong body." },
    advice: { th: "แสงสว่างเสมอด้วยปัญญาไม่มี", en: "There is no light equal to wisdom." },
  },
];
