export interface BranchLocation {
  id: string;
  name: string;
  region: 'bangkok' | 'vicinity' | 'provincial';
  regionName: string;
  address: string;
  floor: string;
  operatingHours: string;
  phone: string;
  displayPhone: string;
  isOpenNow: boolean;
  services: string[];
  googleMapsUrl: string;
  btsMrtNearby?: string;
}

export const MEEPRO_BRANCHES: BranchLocation[] = [
  {
    id: "br-01",
    name: "MeePro Flagship Store CentralWorld",
    region: "bangkok",
    regionName: "กรุงเทพฯ",
    address: "999/9 ถ. พระรามที่ ๑ แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330",
    floor: "ชั้น 4 โซน Atrium (ใกล้ลิฟต์แก้ว)",
    operatingHours: "จันทร์ - อาทิตย์ 10:00 - 22:00 น.",
    phone: "022559001",
    displayPhone: "02-255-9001",
    isOpenNow: true,
    services: [
      "เครื่องจริงให้ทดลองครบทุกรุ่น",
      "ศูนย์บริการ MeePro Care",
      "เปลี่ยนฟิล์ม & แบตเตอรี่ด่วน",
      "บริการสมัครผ่อนชำระ 0%",
      "รับสินค้าที่สั่งซื้อออนไลน์ (BOPIS)",
    ],
    googleMapsUrl: "https://maps.google.com/?q=CentralWorld+Bangkok",
    btsMrtNearby: "BTS ชิดลม / สยาม (มีทางเชื่อม Skywalk)",
  },
  {
    id: "br-02",
    name: "MeePro Experience Store Siam Paragon",
    region: "bangkok",
    regionName: "กรุงเทพฯ",
    address: "991 ถ. พระรามที่ ๑ แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330",
    floor: "ชั้น 3 โซน Living & Technology",
    operatingHours: "จันทร์ - อาทิตย์ 10:00 - 21:30 น.",
    phone: "026108112",
    displayPhone: "02-610-8112",
    isOpenNow: true,
    services: [
      "เครื่องจริงให้ทดลองครบทุกรุ่น",
      "จุดรับเครื่องส่งซ่อมศูนย์แท้",
      "บริการ Trade-in เก่าแลกใหม่",
      "บริการสมัครผ่อนชำระ 0%",
    ],
    googleMapsUrl: "https://maps.google.com/?q=Siam+Paragon+Bangkok",
    btsMrtNearby: "BTS สยาม (ทางออก 3 และ 5)",
  },
  {
    id: "br-03",
    name: "MeePro Store Mega Bangna",
    region: "vicinity",
    regionName: "ปริมณฑล",
    address: "39 หมู่ที่ 6 ถ. บางนา-ตราด ตำบลบางแก้ว อำเภอบางพลี สมุทรปราการ 10540",
    floor: "ชั้น 2 โซน Mega Tech (หน้า HomePro)",
    operatingHours: "จันทร์ - อาทิตย์ 10:00 - 22:00 น.",
    phone: "021051556",
    displayPhone: "02-105-1556",
    isOpenNow: true,
    services: [
      "เครื่องจริงให้ทดลองครบทุกรุ่น",
      "บริการติดฟิล์มกระจกแท้",
      "บริการตรวจเช็คสภาพเครื่อง",
      "บริการสมัครผ่อนชำระ 0%",
    ],
    googleMapsUrl: "https://maps.google.com/?q=Megabangna",
  },
  {
    id: "br-04",
    name: "MeePro Store Central Westgate",
    region: "vicinity",
    regionName: "ปริมณฑล",
    address: "199, 199/1-2 หมู่ที่ 6 ถ. กาญจนาภิเษก ตำบลเสาธงหิน อำเภอบางใหญ่ นนทบุรี 11140",
    floor: "ชั้น 2 โซน Digital (ใกล้โรงภาพยนตร์)",
    operatingHours: "จันทร์ - ศุกร์ 10:30 - 21:00 น. | เสาร์ - อาทิตย์ 10:00 - 21:30 น.",
    phone: "021948822",
    displayPhone: "02-194-8822",
    isOpenNow: true,
    services: [
      "เครื่องจริงให้ทดลองครบทุกรุ่น",
      "บริการ Trade-in เก่าแลกใหม่",
      "บริการสมัครผ่อนชำระ 0%",
      "รับสินค้าที่สั่งซื้อออนไลน์ (BOPIS)",
    ],
    googleMapsUrl: "https://maps.google.com/?q=Central+Westgate",
    btsMrtNearby: "MRT สายสีม่วง สถานีตลาดบางใหญ่",
  },
  {
    id: "br-05",
    name: "MeePro Store Central Chiangmai Festival",
    region: "provincial",
    regionName: "ต่างจังหวัด",
    address: "99, 99/1, 99/2 หมู่ที่ 4 ถ. ซูเปอร์ไฮเวย์ ตำบลฟ้าฮ่าม อำเภอเมืองเชียงใหม่ เชียงใหม่ 50000",
    floor: "ชั้น 3 โซน IT World",
    operatingHours: "จันทร์ - พฤหัส 11:00 - 21:00 น. | ศุกร์ - อาทิตย์ 10:00 - 21:30 น.",
    phone: "053998700",
    displayPhone: "053-998-700",
    isOpenNow: true,
    services: [
      "เครื่องจริงให้ทดลองครบทุกรุ่น",
      "ศูนย์บริการประจำภาคเหนือ",
      "เปลี่ยนแบตเตอรี่ & ซ่อมด่วน",
      "บริการสมัครผ่อนชำระ 0%",
    ],
    googleMapsUrl: "https://maps.google.com/?q=Central+Chiangmai+Festival",
  },
];
