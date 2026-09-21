export interface CustomerRecord {
  id: string;
  phone: string;
  name: string;
  email: string;
  tier: 'Member' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  phoneVerified: boolean;
  phoneVerifiedAt: string;
  pdpaConsent: {
    accepted: boolean;
    version: string;
    acceptedAt: string;
    privacyPolicyVersion: string;
  };
  totalSpent: number;
  activeContracts: {
    id: string;
    product: string;
    totalAmount: number;
    monthlyInstallment: number;
    remainingMonths: number;
    bank: string;
    status: 'ACTIVE' | 'COMPLETED';
  }[];
  notes?: string[];
}

export const MOCK_CUSTOMERS: CustomerRecord[] = [
  {
    id: "CUST-10029",
    phone: "0891234567",
    name: "คุณกิตติศักดิ์ พัฒนากิจ",
    email: "kittisak.p@example.com",
    tier: "Gold",
    points: 450,
    phoneVerified: true,
    phoneVerifiedAt: "2026-09-20 10:14:22",
    pdpaConsent: {
      accepted: true,
      version: "v1.0",
      acceptedAt: "2026-09-20 10:13:58",
      privacyPolicyVersion: "MeePro-PDPA-2026-v1",
    },
    totalSpent: 40390,
    activeContracts: [
      {
        id: "INS-6901",
        product: "iPhone 16 Pro 128GB Desert Titanium",
        totalAmount: 36900,
        monthlyInstallment: 3690,
        remainingMonths: 9,
        bank: "กสิกรไทย (KBank)",
        status: "ACTIVE",
      },
    ],
    notes: [
      "2026-09-20: สมัครผ่อนผ่านหน้าร้านสาขา CentralWorld รับเครื่องเรียบร้อย",
      "ลูกค้าสนใจอุปกรณ์เสริม MagSafe Charger เพิ่มเติม",
    ],
  },
  {
    id: "CUST-10030",
    phone: "0812345678",
    name: "คุณธนพร สุขเกษม",
    email: "thanaporn.s@example.com",
    tier: "Silver",
    points: 120,
    phoneVerified: true,
    phoneVerifiedAt: "2026-09-21 08:30:11",
    pdpaConsent: {
      accepted: true,
      version: "v1.0",
      acceptedAt: "2026-09-21 08:29:45",
      privacyPolicyVersion: "MeePro-PDPA-2026-v1",
    },
    totalSpent: 11990,
    activeContracts: [],
    notes: [
      "ซื้อหูฟัง Sony WH-1000XM5 ช่วงโปรโมชั่น Flash Sale",
    ],
  },
  {
    id: "CUST-10031",
    phone: "0869998877",
    name: "คุณชานนท์ สิทธิโชค",
    email: "chanon.s@example.com",
    tier: "Platinum",
    points: 1250,
    phoneVerified: true,
    phoneVerifiedAt: "2026-08-15 14:02:40",
    pdpaConsent: {
      accepted: true,
      version: "v1.0",
      acceptedAt: "2026-08-15 14:01:50",
      privacyPolicyVersion: "MeePro-PDPA-2026-v1",
    },
    totalSpent: 125800,
    activeContracts: [
      {
        id: "INS-5542",
        product: "MacBook Air 13-inch M3 + Galaxy S25 Ultra",
        totalAmount: 81800,
        monthlyInstallment: 8180,
        remainingMonths: 4,
        bank: "ไทยพาณิชย์ (SCB)",
        status: "ACTIVE",
      },
    ],
    notes: [
      "ลูกค้า VIP เข้ารับบริการเปลี่ยนฟิล์มฟรีตามสิทธิ์ Platinum",
    ],
  },
];

export function lookupCustomerByPhone(query: string): CustomerRecord | null {
  const clean = query.replace(/[^0-9]/g, '');
  if (!clean) return null;
  return MOCK_CUSTOMERS.find((c) => c.phone.replace(/[^0-9]/g, '').includes(clean)) || null;
}
