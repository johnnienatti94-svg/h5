export interface DetailedProduct {
  id: string;
  name: string;
  category: 'smartphone' | 'tablet' | 'laptop' | 'watch' | 'audio' | 'accessory';
  categoryName: string;
  brand: 'Apple' | 'Samsung' | 'Xiaomi' | 'OPPO' | 'vivo' | 'Sony' | 'Marshall' | 'Anker';
  imageUrl: string;
  originalPrice: number;
  promoPrice: number;
  discountPercent: number;
  installmentMonths: number;
  badge?: string;
  isFlashSale?: boolean;
  inStock: boolean;
  description: string;
  specs: { [key: string]: string };
}

export const ALL_PRODUCTS: DetailedProduct[] = [
  {
    id: "prod-1",
    name: "iPhone 16 Pro 128GB Desert Titanium",
    category: "smartphone",
    categoryName: "สมาร์ทโฟน",
    brand: "Apple",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80",
    originalPrice: 39900,
    promoPrice: 36900,
    discountPercent: 8,
    installmentMonths: 10,
    badge: "ลด ฿3,000",
    isFlashSale: true,
    inStock: true,
    description: "ดีไซน์ไทเทเนียมพร้อมปุ่ม Camera Control ใหม่ ชิป A18 Pro ทรงพลัง และระบบกล้องระดับสตูดิโอ",
    specs: {
      "หน้าจอ": "6.3 นิ้ว Super Retina XDR ProMotion 120Hz",
      "ชิปประมวลผล": "Apple A18 Pro 6-core GPU",
      "กล้องหลัก": "Fusion 48MP + Ultra-Wide 48MP + Tele 5x",
      "แบตเตอรี่": "เล่นวิดีโอนานสูงสุด 27 ชั่วโมง",
      "ประกัน": "ศูนย์ไทย 1 ปีเต็ม",
    },
  },
  {
    id: "prod-2",
    name: "Samsung Galaxy S25 Ultra 512GB Titanium Silver",
    category: "smartphone",
    categoryName: "สมาร์ทโฟน",
    brand: "Samsung",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80",
    originalPrice: 48900,
    promoPrice: 43900,
    discountPercent: 10,
    installmentMonths: 10,
    badge: "ลด ฿5,000",
    isFlashSale: true,
    inStock: true,
    description: "Galaxy AI รุ่นล่าสุด พร้อมปากกา S-Pen ในตัว กล้อง 200MP ซูมคมชัด 100x Space Zoom",
    specs: {
      "หน้าจอ": "6.8 นิ้ว Dynamic AMOLED 2X 120Hz",
      "ชิปประมวลผล": "Snapdragon 8 Elite for Galaxy",
      "กล้องหลัก": "200MP OIS + 50MP Periscope 5x",
      "แบตเตอรี่": "5,000 mAh ชาร์จเร็ว 45W",
      "ประกัน": "ศูนย์ไทย 1 ปีเต็ม",
    },
  },
  {
    id: "prod-3",
    name: "iPad Air 11-inch M2 Wi-Fi 128GB Space Gray",
    category: "tablet",
    categoryName: "แท็บเล็ต",
    brand: "Apple",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
    originalPrice: 23900,
    promoPrice: 21500,
    discountPercent: 10,
    installmentMonths: 10,
    badge: "ขายดี",
    inStock: true,
    description: "พลังขับเคลื่อนจากชิป M2 รองรับ Apple Pencil Pro และ Magic Keyboard เพื่อการทำงานอย่างไร้ขีดจำกัด",
    specs: {
      "หน้าจอ": "11 นิ้ว Liquid Retina Display True Tone",
      "ชิปประมวลผล": "Apple M2 8-core CPU 9-core GPU",
      "ความจุ": "128GB",
      "การเชื่อมต่อ": "Wi-Fi 6E + Bluetooth 5.3",
      "ประกัน": "ศูนย์ไทย 1 ปีเต็ม",
    },
  },
  {
    id: "prod-4",
    name: "MacBook Air 13-inch M3 8-core 16GB 256GB Midnight",
    category: "laptop",
    categoryName: "แล็ปท็อป",
    brand: "Apple",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    originalPrice: 39900,
    promoPrice: 37900,
    discountPercent: 5,
    installmentMonths: 10,
    badge: "แนะนำ",
    inStock: true,
    description: "บางเบา พกพาสะดวก พร้อมชิป M3 ประสิทธิภาพสูง รองรับการต่อ 2 จอนอก แบตเตอรี่ใช้งานได้ยาวนาน 18 ชม.",
    specs: {
      "หน้าจอ": "13.6 นิ้ว Liquid Retina 500 nits",
      "ชิปประมวลผล": "Apple M3 8-core CPU 8-core GPU",
      "หน่วยความจำ": "RAM 16GB Unified Memory / SSD 256GB",
      "พอร์ตเชื่อมต่อ": "MagSafe 3, Thunderbolt 3 (USB-C) 2 ช่อง",
      "ประกัน": "ศูนย์ไทย 1 ปีเต็ม",
    },
  },
  {
    id: "prod-5",
    name: "Xiaomi 15 Ultra 512GB Leica Photography Kit",
    category: "smartphone",
    categoryName: "สมาร์ทโฟน",
    brand: "Xiaomi",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80",
    originalPrice: 38900,
    promoPrice: 34900,
    discountPercent: 10,
    installmentMonths: 10,
    badge: "Leica Lens",
    isFlashSale: true,
    inStock: true,
    description: "เซนเซอร์กล้อง 1 นิ้ว ร่วมพัฒนากับ Leica ถ่ายภาพระดับมืออาชีพ ชาร์จไว HyperCharge 90W",
    specs: {
      "หน้าจอ": "6.73 นิ้ว AMOLED 120Hz 3000 nits",
      "ชิปประมวลผล": "Snapdragon 8 Elite 3nm",
      "กล้อง": "Quad Camera 50MP Leica Summicron",
      "แบตเตอรี่": "5,300 mAh HyperCharge 90W",
      "ประกัน": "ศูนย์ไทย 2 ปีเต็ม",
    },
  },
  {
    id: "prod-6",
    name: "AirPods Pro 2 USB-C with MagSafe Case",
    category: "audio",
    categoryName: "หูฟัง & ลำโพง",
    brand: "Apple",
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80",
    originalPrice: 8990,
    promoPrice: 7490,
    discountPercent: 17,
    installmentMonths: 6,
    badge: "ลด 17%",
    inStock: true,
    description: "ตัดเสียงรบกวนดีขึ้น 2 เท่า พร้อมระบบเสียงตามตำแหน่งแบบไดนามิก และเคสชาร์จ USB-C กันน้ำกันฝุ่น",
    specs: {
      "ชิปประมวลผล": "Apple H2 Headphone Chip",
      "การตัดเสียง": "Active Noise Cancellation + Transparency",
      "แบตเตอรี่": "ใช้งานได้นานสูงสุด 30 ชม. เมื่อรวมเคส",
      "พอร์ต": "USB-C พร้อม MagSafe และเสียงแจ้งเตือนเคส",
      "ประกัน": "ศูนย์ไทย 1 ปีเต็ม",
    },
  },
  {
    id: "prod-7",
    name: "Apple Watch Series 10 GPS 42mm Jet Black",
    category: "watch",
    categoryName: "สมาร์ทวอทช์",
    brand: "Apple",
    imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=400&q=80",
    originalPrice: 14900,
    promoPrice: 13900,
    discountPercent: 7,
    installmentMonths: 10,
    badge: "รุ่นใหม่",
    inStock: true,
    description: "ตัวเรือนบางลง จอแสดงผลกว้างขึ้น ตรวจจับภาวะหยุดหายใจขณะหลับ และเซนเซอร์วัดความลึกและอุณหภูมิน้ำ",
    specs: {
      "ขนาดตัวเรือน": "42 มม. อลูมิเนียม Jet Black เงางาม",
      "จอภาพ": "OLED มุมมองกว้างขึ้น สว่างสม่ำเสมอ",
      "เซนเซอร์": "ECG, ออกซิเจนในเลือด, อุณหภูมิ, การนอนหลับ",
      "การชาร์จ": "ชาร์จเร็ว 0-80% ในเวลาเพียง 30 นาที",
      "ประกัน": "ศูนย์ไทย 1 ปีเต็ม",
    },
  },
  {
    id: "prod-8",
    name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    category: "audio",
    categoryName: "หูฟัง & ลำโพง",
    brand: "Sony",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    originalPrice: 14990,
    promoPrice: 11990,
    discountPercent: 20,
    installmentMonths: 6,
    badge: "ลด 20%",
    isFlashSale: true,
    inStock: true,
    description: "หูฟังครอบหูระดับพรีเมียม ตัดเสียงรบกวนอันดับ 1 ชิปคู่ V1 + QN1 ไมโครโฟน 8 ตัว คุยชัดเจน",
    specs: {
      "ไดรเวอร์": "30mm Precision-engineered Unit",
      "เทคโนโลยี": "Hi-Res Audio Wireless, LDAC, DSEE Extreme",
      "แบตเตอรี่": "ใช้งานต่อเนื่องสูงสุด 30 ชั่วโมง",
      "การเชื่อมต่อ": "Bluetooth 5.2 Multipoint 2 อุปกรณ์พร้อมกัน",
      "ประกัน": "ศูนย์ไทย 1 ปีเต็ม",
    },
  },
  {
    id: "prod-9",
    name: "OPPO Find X8 Pro 5G 512GB Space Black",
    category: "smartphone",
    categoryName: "สมาร์ทโฟน",
    brand: "OPPO",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80",
    originalPrice: 34990,
    promoPrice: 31990,
    discountPercent: 9,
    installmentMonths: 10,
    badge: "Dual Telephoto",
    inStock: true,
    description: "ระบบกล้อง Hasselblad Master Camera คู่กับกล้องเทเล 2 ตัว ชิป Dimensity 9400 แบตเตอรี่กลาเซียร์ 5,910 mAh",
    specs: {
      "หน้าจอ": "6.78 นิ้ว AMOLED 1.5K 120Hz",
      "ชิปประมวลผล": "MediaTek Dimensity 9400",
      "กล้อง": "50MP Hasselblad Quad Camera",
      "แบตเตอรี่": "5,910 mAh SUPERVOOC 80W",
      "ประกัน": "ศูนย์ไทย 1 ปีเต็ม",
    },
  },
  {
    id: "prod-10",
    name: "vivo X200 Pro 5G 512GB Titanium Gray",
    category: "smartphone",
    categoryName: "สมาร์ทโฟน",
    brand: "vivo",
    imageUrl: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=400&q=80",
    originalPrice: 39990,
    promoPrice: 36990,
    discountPercent: 8,
    installmentMonths: 10,
    badge: "Zeiss APO",
    inStock: true,
    description: "กล้องเทเล 200MP Zeiss APO พร้อมชิปภาพ V3+ เก็บรายละเอียดได้ลึกที่สุดในทุกสภาพแสง",
    specs: {
      "หน้าจอ": "6.78 นิ้ว LTPO AMOLED 120Hz",
      "ชิปประมวลผล": "Dimensity 9400 + vivo V3+",
      "กล้อง": "200MP Zeiss APO Telephoto + 50MP Sony LYT-818",
      "แบตเตอรี่": "6,000 mAh FlashCharge 90W",
      "ประกัน": "ศูนย์ไทย 2 ปีเต็ม",
    },
  },
  {
    id: "prod-11",
    name: "Marshall Stanmore III Bluetooth Speaker Black",
    category: "audio",
    categoryName: "หูฟัง & ลำโพง",
    brand: "Marshall",
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80",
    originalPrice: 17990,
    promoPrice: 15490,
    discountPercent: 14,
    installmentMonths: 6,
    badge: "เสียงพรีเมียม",
    inStock: true,
    description: "ลำโพงบลูทูธประจำบ้าน ดีไซน์ไอคอนิก ให้เวทีเสียงกว้างขวางและพลังเบสหนักแน่น",
    specs: {
      "กำลังขับ": "80W Class D Amplifier",
      "การเชื่อมต่อ": "Bluetooth 5.2, AUX 3.5mm, RCA",
      "การปรับแต่ง": "ปุ่มหมุน Analog Bass, Treble, Volume",
      "ขนาด": "350 x 203 x 188 มม.",
      "ประกัน": "ศูนย์ไทย 1 ปีเต็ม (Ash Asia)",
    },
  },
  {
    id: "prod-12",
    name: "Anker Prime 6-in-1 GaN Charging Station 140W",
    category: "accessory",
    categoryName: "อุปกรณ์เสริม",
    brand: "Anker",
    imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
    originalPrice: 4290,
    promoPrice: 3490,
    discountPercent: 19,
    installmentMonths: 3,
    badge: "ลด 19%",
    inStock: true,
    description: "สถานีชาร์จ GaN 6 ช่อง จ่ายไฟรวมสูงสุด 140W ชาร์จ MacBook Pro และสมาร์ทโฟนพร้อมกันอย่างปลอดภัย",
    specs: {
      "ช่องจ่ายไฟ": "4x USB-C, 2x USB-A",
      "กำลังไฟสูงสุด": "140W Single Port Power Delivery 3.1",
      "ความปลอดภัย": "ActiveShield 2.0 ตรวจจับความร้อน 3 ล้านครั้ง/วัน",
      "ประกัน": "ศูนย์ไทย 2 ปีเต็ม",
    },
  },
];

/**
 * Resolves authoritative products based on CMS widget dataSource configuration
 * (Specification Section 6)
 */
export function resolveProductsFromDataSource(dataSource?: {
  type?: string;
  targetId?: string;
  query?: string;
  limit?: number;
  sortBy?: string;
}): DetailedProduct[] {
  if (!dataSource) return ALL_PRODUCTS.slice(0, 6);

  let filtered = [...ALL_PRODUCTS];
  const { type = 'manual', targetId, query, limit = 6, sortBy = 'default' } = dataSource;

  switch (type) {
    case 'category':
      if (targetId && targetId !== 'all') {
        filtered = filtered.filter((p) => p.category === targetId);
      }
      break;
    case 'brand':
      if (targetId && targetId !== 'all') {
        filtered = filtered.filter((p) => p.brand.toLowerCase() === targetId.toLowerCase());
      }
      break;
    case 'promotion':
    case 'flash_sale':
      filtered = filtered.filter((p) => p.isFlashSale || p.discountPercent >= 10);
      break;
    case 'search_query':
      if (query) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q)
        );
      }
      break;
    case 'recommended':
    case 'trending':
      filtered = filtered.sort((a, b) => b.discountPercent - a.discountPercent);
      break;
    case 'manual':
    default:
      if (targetId) {
        const ids = targetId.split(',').map((s) => s.trim());
        filtered = filtered.filter((p) => ids.includes(p.id));
      }
      break;
  }

  // Sorting
  if (sortBy === 'price_asc') {
    filtered.sort((a, b) => a.promoPrice - b.promoPrice);
  } else if (sortBy === 'price_desc') {
    filtered.sort((a, b) => b.promoPrice - a.promoPrice);
  } else if (sortBy === 'popularity') {
    filtered.sort((a, b) => b.discountPercent - a.discountPercent);
  }

  return filtered.slice(0, limit);
}

