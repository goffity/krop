const KEYWORD_MAP: Record<string, string[]> = {
  food: [
    'ข้าว', 'อาหาร', 'กาแฟ', 'ชา', 'นม', 'ก๋วยเตี๋ยว', 'ส้มตำ', 'ไก่', 'หมู', 'ปลา',
    'ผัด', 'ต้ม', 'แกง', 'ราเมน', 'พิซซ่า', 'เบอร์เกอร์', 'ชานม', 'บะหมี่',
    'starbucks', 'cafe', 'amazon', 'mcdonald', 'kfc', 'pizza', 'sushi',
    'grab food', 'foodpanda', 'lineman', 'โรบินฮู้ด',
    'ร้านอาหาร', 'มื้อเที่ยง', 'มื้อเย็น', 'อาหารเช้า', 'ของกิน', 'ขนม',
  ],
  transport: [
    'bts', 'mrt', 'รถไฟ', 'แท็กซี่', 'taxi', 'grab', 'bolt', 'เดินทาง',
    'น้ำมัน', 'ปั๊ม', 'ค่ารถ', 'ค่าทาง', 'ทางด่วน', 'มอเตอร์ไซค์',
    'ที่จอดรถ', 'parking', 'toll', 'ค่าผ่านทาง', 'วิน',
  ],
  shopping: [
    'ช้อปปิ้ง', 'ซื้อของ', 'เสื้อผ้า', 'รองเท้า', 'กระเป๋า',
    'shopee', 'lazada', 'uniqlo', 'h&m', 'zara',
    'tops', 'big c', 'โลตัส', 'เซเว่น', '7-11', 'makro',
    'ของใช้', 'สินค้า',
  ],
  health: [
    'ยา', 'หมอ', 'โรงพยาบาล', 'คลินิก', 'สุขภาพ', 'ฟิตเนส', 'gym',
    'ออกกำลัง', 'วิตามิน', 'ทำฟัน', 'แว่น', 'ตรวจ',
  ],
  entertainment: [
    'หนัง', 'ภาพยนตร์', 'netflix', 'spotify', 'youtube', 'เกม', 'game',
    'คอนเสิร์ต', 'ท่องเที่ยว', 'เที่ยว', 'สวนสนุก', 'บันเทิง',
    'disney', 'hbo', 'steam',
  ],
  bills: [
    'ค่าไฟ', 'ค่าน้ำ', 'ค่าเน็ต', 'ค่าโทรศัพท์', 'ค่าบิล', 'ค่าเช่า',
    'ประกัน', 'ผ่อน', 'สินเชื่อ', 'บัตรเครดิต', 'internet',
    'ais', 'true', 'dtac', 'ค่าส่วนกลาง', 'ค่าห้อง',
  ],
  education: [
    'เรียน', 'หนังสือ', 'คอร์ส', 'course', 'udemy', 'coursera',
    'ค่าเทอม', 'สัมมนา', 'อบรม', 'การศึกษา', 'book',
  ],
};

export function suggestCategory(note: string): string | null {
  if (!note) return null;
  const lower = note.toLowerCase();

  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return null;
}
