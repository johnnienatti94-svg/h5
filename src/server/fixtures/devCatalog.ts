import 'server-only';

import type {
  PublicBrand,
  PublicCategory,
  PublicProductDetail,
  PublicProductSummary,
} from '@/features/catalog/types';
import { DEV_BRANCH_FIXTURES } from '@/server/fixtures/devBranches';

export const DEV_CATEGORIES: PublicCategory[] = [
  { id: 'cat-smartphone', slug: 'smartphone', name: 'สมาร์ตโฟน', displayOrder: 1 },
  { id: 'cat-tablet', slug: 'tablet', name: 'แท็บเล็ต', displayOrder: 2 },
  { id: 'cat-laptop', slug: 'laptop', name: 'แล็ปท็อป', displayOrder: 3 },
  { id: 'cat-watch', slug: 'watch', name: 'สมาร์ตวอทช์', displayOrder: 4 },
  { id: 'cat-audio', slug: 'audio', name: 'หูฟัง & ลำโพง', displayOrder: 5 },
  { id: 'cat-accessory', slug: 'accessory', name: 'อุปกรณ์เสริม', displayOrder: 6 },
];

export const DEV_BRANDS: PublicBrand[] = [
  { id: 'brand-apple', slug: 'apple', name: 'Apple' },
  { id: 'brand-samsung', slug: 'samsung', name: 'Samsung' },
  { id: 'brand-xiaomi', slug: 'xiaomi', name: 'Xiaomi' },
  { id: 'brand-oppo', slug: 'oppo', name: 'OPPO' },
  { id: 'brand-vivo', slug: 'vivo', name: 'vivo' },
  { id: 'brand-sony', slug: 'sony', name: 'Sony' },
  { id: 'brand-marshall', slug: 'marshall', name: 'Marshall' },
  { id: 'brand-anker', slug: 'anker', name: 'Anker' },
];

function generateBranchStock(variantId: string) {
  return DEV_BRANCH_FIXTURES.map((branch, index) => {
    const isAvailable = index !== 3; // Westgate is low stock or out
    return {
      branchId: branch.id,
      branchSlug: branch.slug,
      branchName: branch.name,
      province: branch.province || 'กรุงเทพมหานคร',
      status: index === 3 ? ('low_stock' as const) : ('in_stock' as const),
      statusLabel: index === 3 ? 'เหลือ 1 เครื่อง' : 'มีสินค้าพร้อมรับ',
      publicNote: index === 3 ? 'กรุณาโทรตรวจสอบสาขาก่อนเข้ารับ' : 'พร้อมบริการที่สาขา',
    };
  });
}

export const DEV_PRODUCTS: PublicProductDetail[] = [
  {
    id: '00000000-0001-4000-8000-000000000001',
    slug: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    brand: DEV_BRANDS[0], // Apple
    category: DEV_CATEGORIES[0], // smartphone
    summary: 'ดีไซน์ไทเทเนียมเกรด 5 ชิป A18 Pro ทรงพลัง ปุ่ม Camera Control ใหม่ และระบบกล้องระดับสตูดิโอ 48MP',
    description: 'iPhone 16 Pro มาพร้อมกับวัสดุไทเทเนียมสุดแกร่ง หน้าจอ Super Retina XDR 6.3 นิ้ว ProMotion 120Hz ชิปประมวลผล Apple A18 Pro กล้อง Fusion 48MP ซูมออปติคัล 5 เท่า รองรับ 0% นานสูงสุด 24 เดือน',
    tags: [
      { label: 'HOT', icon: '🔥' },
      { label: 'แนะนำ', icon: '⭐' },
      { label: 'ประกันศูนย์', icon: '🛡️' },
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', alt: 'iPhone 16 Pro Desert Titanium ด้านหน้า', displayOrder: 1 },
      { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80', alt: 'iPhone 16 Pro มุมข้างไทเทเนียม', displayOrder: 2 },
    ],
    variants: [
      {
        id: 'var-ip16p-128-dt',
        sku: 'IPHONE-16P-128-DT',
        name: 'iPhone 16 Pro 128GB Desert Titanium',
        condition: 'new',
        storageLabel: '128GB',
        colorLabel: 'Desert Titanium',
        colorHex: '#C5A992',
        cashPriceMinor: 3690000,
        compareAtPriceMinor: 3990000,
        warrantyDescription: 'ประกันศูนย์ไทย 1 ปีเต็ม เข้าศูนย์ Apple Authorized ทั่วประเทศ',
        conditionDescription: 'เครื่องใหม่แท้ 100% ยังไม่แกะซีล',
        isInStock: true,
        attributes: { 'ขนาดจอ': '6.3 นิ้ว', 'ความจุ': '128GB', 'ชิป': 'A18 Pro' },
      },
      {
        id: 'var-ip16p-256-dt',
        sku: 'IPHONE-16P-256-DT',
        name: 'iPhone 16 Pro 256GB Desert Titanium',
        condition: 'new',
        storageLabel: '256GB',
        colorLabel: 'Desert Titanium',
        colorHex: '#C5A992',
        cashPriceMinor: 4090000,
        compareAtPriceMinor: 4390000,
        warrantyDescription: 'ประกันศูนย์ไทย 1 ปีเต็ม เข้าศูนย์ Apple Authorized ทั่วประเทศ',
        conditionDescription: 'เครื่องใหม่แท้ 100% ยังไม่แกะซีล',
        isInStock: true,
        attributes: { 'ขนาดจอ': '6.3 นิ้ว', 'ความจุ': '256GB', 'ชิป': 'A18 Pro' },
      },
      {
        id: 'var-ip16p-128-bt',
        sku: 'IPHONE-16P-128-BT',
        name: 'iPhone 16 Pro 128GB Black Titanium',
        condition: 'new',
        storageLabel: '128GB',
        colorLabel: 'Black Titanium',
        colorHex: '#3C3B37',
        cashPriceMinor: 3690000,
        compareAtPriceMinor: 3990000,
        warrantyDescription: 'ประกันศูนย์ไทย 1 ปีเต็ม เข้าศูนย์ Apple Authorized ทั่วประเทศ',
        conditionDescription: 'เครื่องใหม่แท้ 100% ยังไม่แกะซีล',
        isInStock: true,
        attributes: { 'ขนาดจอ': '6.3 นิ้ว', 'ความจุ': '128GB', 'ชิป': 'A18 Pro' },
      },
    ],
    offers: [
      {
        id: 'off-ip16p-10m',
        offerId: 'offer-ip16p',
        title: 'ผ่อน 0% 10 เดือน (ไม่ต้องใช้บัตรเครดิต)',
        cashPriceMinor: 3690000,
        downPaymentMinor: 0,
        installmentCount: 10,
        installmentAmountMinor: 369000,
        feesTotalMinor: 0,
        totalPayableMinor: 3690000,
        validFrom: '2026-09-01T00:00:00Z',
        validUntil: '2026-10-31T23:59:59Z',
        terms: 'ผ่อนชำระเดือนละ ฿3,690 นาน 10 เดือน ไม่มีดอกเบี้ยและไม่มีค่าธรรมเนียมแอบแฝง อนุมัติไวผ่าน MeePro',
      },
      {
        id: 'off-ip16p-24m',
        offerId: 'offer-ip16p-24m',
        title: 'ผ่อนสบาย 0% 24 เดือน',
        cashPriceMinor: 3690000,
        downPaymentMinor: 0,
        installmentCount: 24,
        installmentAmountMinor: 153750,
        feesTotalMinor: 0,
        totalPayableMinor: 3690000,
        validFrom: '2026-09-01T00:00:00Z',
        validUntil: '2026-10-31T23:59:59Z',
        terms: 'ผ่อนชำระเพียงเดือนละ ฿1,538 นาน 24 เดือน ดอกเบี้ย 0% ตลอดสัญญา',
      },
    ],
    branchAvailability: {
      'var-ip16p-128-dt': generateBranchStock('var-ip16p-128-dt'),
      'var-ip16p-256-dt': generateBranchStock('var-ip16p-256-dt'),
      'var-ip16p-128-bt': generateBranchStock('var-ip16p-128-bt'),
    },
    specs: {
      'หน้าจอ': '6.3 นิ้ว Super Retina XDR OLED ProMotion 120Hz',
      'ชิปประมวลผล': 'Apple A18 Pro 6-core GPU',
      'กล้องหลัก': 'Fusion 48MP + Ultra-Wide 48MP + Telephoto 5x 12MP',
      'กล้องหน้า': 'TrueDepth 12MP พร้อม Autofocus',
      'แบตเตอรี่': 'เล่นวิดีโอนานสูงสุด 27 ชั่วโมง',
      'ระบบชาร์จ': 'USB-C (USB 3), MagSafe 25W',
      'การเชื่อมต่อ': '5G, Wi-Fi 7, Bluetooth 5.3',
    },
    warranty: 'ประกันศูนย์ไทย 1 ปีเต็ม',
    publishedAt: '2026-09-24T00:00:00Z',
  },
  {
    id: '00000000-0001-4000-8000-000000000002',
    slug: 'samsung-galaxy-s25-ultra',
    name: 'Samsung Galaxy S25 Ultra',
    brand: DEV_BRANDS[1], // Samsung
    category: DEV_CATEGORIES[0], // smartphone
    summary: 'Galaxy AI อัจฉริยะ พร้อมปากกา S-Pen ในตัว กล้อง 200MP ซูมคมชัด 100x ชิป Snapdragon 8 Elite',
    description: 'Samsung Galaxy S25 Ultra ที่สุดของสมาร์ตโฟนเรือธง หน้าจอ Dynamic AMOLED 2X 6.8 นิ้ว แบตเตอรี่ 5,000mAh พร้อมระบบระบายความร้อนใหม่และ Galaxy AI ภาษาไทยเต็มรูปแบบ',
    images: [
      { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', alt: 'Samsung Galaxy S25 Ultra Titanium Silver', displayOrder: 1 },
    ],
    variants: [
      {
        id: 'var-s25u-256-ts',
        sku: 'GALAXY-S25U-256-TS',
        name: 'Samsung Galaxy S25 Ultra 256GB Titanium Silver',
        condition: 'new',
        storageLabel: '256GB',
        colorLabel: 'Titanium Silver',
        colorHex: '#D5D5D8',
        cashPriceMinor: 4390000,
        compareAtPriceMinor: 4890000,
        warrantyDescription: 'ประกันศูนย์ซัมซุงประเทศไทย 1 ปีเต็ม',
        conditionDescription: 'เครื่องใหม่แท้ 100% กล่องซีลศูนย์ไทย',
        isInStock: true,
        attributes: { 'ขนาดจอ': '6.8 นิ้ว', 'ความจุ': '256GB', 'ชิป': 'Snapdragon 8 Elite' },
      },
      {
        id: 'var-s25u-512-tb',
        sku: 'GALAXY-S25U-512-TB',
        name: 'Samsung Galaxy S25 Ultra 512GB Titanium Black',
        condition: 'new',
        storageLabel: '512GB',
        colorLabel: 'Titanium Black',
        colorHex: '#2E2E30',
        cashPriceMinor: 4990000,
        compareAtPriceMinor: 5490000,
        warrantyDescription: 'ประกันศูนย์ซัมซุงประเทศไทย 1 ปีเต็ม',
        conditionDescription: 'เครื่องใหม่แท้ 100% กล่องซีลศูนย์ไทย',
        isInStock: true,
        attributes: { 'ขนาดจอ': '6.8 นิ้ว', 'ความจุ': '512GB', 'ชิป': 'Snapdragon 8 Elite' },
      },
    ],
    offers: [
      {
        id: 'off-s25u-10m',
        offerId: 'offer-s25u',
        title: 'ผ่อน 0% 10 เดือน สมัครง่ายอนุมัติไว',
        cashPriceMinor: 4390000,
        downPaymentMinor: 0,
        installmentCount: 10,
        installmentAmountMinor: 439000,
        feesTotalMinor: 0,
        totalPayableMinor: 4390000,
        validFrom: '2026-09-01T00:00:00Z',
        validUntil: '2026-10-31T23:59:59Z',
        terms: 'ผ่อนชำระเดือนละ ฿4,390 นาน 10 เดือน ดอกเบี้ย 0%',
      },
      {
        id: 'off-s25u-24m',
        offerId: 'offer-s25u-24m',
        title: 'ผ่อนยาว 0% 24 เดือน',
        cashPriceMinor: 4390000,
        downPaymentMinor: 0,
        installmentCount: 24,
        installmentAmountMinor: 182916,
        feesTotalMinor: 0,
        totalPayableMinor: 4390000,
        validFrom: '2026-09-01T00:00:00Z',
        validUntil: '2026-10-31T23:59:59Z',
        terms: 'ผ่อนเดือนละ ฿1,830 นาน 24 เดือน ดอกเบี้ย 0%',
      },
    ],
    branchAvailability: {
      'var-s25u-256-ts': generateBranchStock('var-s25u-256-ts'),
      'var-s25u-512-tb': generateBranchStock('var-s25u-512-tb'),
    },
    specs: {
      'หน้าจอ': '6.8 นิ้ว Dynamic AMOLED 2X 120Hz',
      'ชิปประมวลผล': 'Snapdragon 8 Elite for Galaxy',
      'กล้องหลัก': '200MP + 50MP Periscope + 50MP Ultra-Wide',
      'แบตเตอรี่': '5,000 mAh พร้อมชาร์จเร็ว 45W',
      'ปากกา': 'S-Pen ในตัวเครื่อง',
    },
    warranty: 'ประกันศูนย์ไทย 1 ปีเต็ม',
    publishedAt: '2026-09-24T00:00:00Z',
  },
  {
    id: '00000000-0001-4000-8000-000000000003',
    slug: 'ipad-pro-m4-11',
    name: 'iPad Pro 11 นิ้ว (ชิป M4)',
    brand: DEV_BRANDS[0], // Apple
    category: DEV_CATEGORIES[1], // tablet
    summary: 'บางเฉียบที่สุดเท่าที่เคยมีมา จอ Ultra Retina XDR OLED สองชั้น ชิป M4 พลังแรงทะลุพิกัด',
    description: 'iPad Pro รุ่น 11 นิ้ว พร้อมชิป M4 ล่าสุด บางเพียง 5.3 มม. จอภาพ Tandem OLED สีสันสมจริง รองรับ Apple Pencil Pro สำหรับนักสร้างสรรค์',
    images: [
      { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', alt: 'iPad Pro M4 Space Black', displayOrder: 1 },
    ],
    variants: [
      {
        id: 'var-ipad-m4-256-sb',
        sku: 'IPAD-PRO-M4-256-SB',
        name: 'iPad Pro 11 นิ้ว 256GB Wi-Fi Space Black',
        condition: 'new',
        storageLabel: '256GB',
        colorLabel: 'Space Black',
        colorHex: '#252527',
        cashPriceMinor: 3990000,
        compareAtPriceMinor: 4290000,
        warrantyDescription: 'ประกันศูนย์ Apple 1 ปีเต็ม',
        conditionDescription: 'เครื่องใหม่แท้ 100%',
        isInStock: true,
        attributes: { 'ขนาดจอ': '11 นิ้ว', 'ความจุ': '256GB', 'ชิป': 'Apple M4' },
      },
    ],
    offers: [
      {
        id: 'off-ipad-10m',
        offerId: 'offer-ipad-10m',
        title: 'ผ่อน 0% 10 เดือน การศึกษาและวัยทำงาน',
        cashPriceMinor: 3990000,
        downPaymentMinor: 0,
        installmentCount: 10,
        installmentAmountMinor: 399000,
        feesTotalMinor: 0,
        totalPayableMinor: 3990000,
        validFrom: '2026-09-01T00:00:00Z',
        validUntil: '2026-10-31T23:59:59Z',
        terms: 'ผ่อนชำระเดือนละ ฿3,990 นาน 10 เดือน ดอกเบี้ย 0%',
      },
    ],
    branchAvailability: {
      'var-ipad-m4-256-sb': generateBranchStock('var-ipad-m4-256-sb'),
    },
    specs: {
      'หน้าจอ': '11 นิ้ว Ultra Retina XDR Tandem OLED 120Hz',
      'ชิปประมวลผล': 'Apple M4',
      'กล้อง': '12MP Wide พร้อม LiDAR Scanner',
      'ความบาง': 'บางเพียง 5.3 มม.',
    },
    warranty: 'ประกันศูนย์ Apple 1 ปี',
    publishedAt: '2026-09-24T00:00:00Z',
  },
  {
    id: '00000000-0001-4000-8000-000000000004',
    slug: 'macbook-air-m3-13',
    name: 'MacBook Air 13 นิ้ว (ชิป M3)',
    brand: DEV_BRANDS[0], // Apple
    category: DEV_CATEGORIES[2], // laptop
    summary: 'แล็ปท็อปที่บางเบาที่สุด ทรงพลังด้วยชิป M3 แบตเตอรี่ใช้งานได้ยาวนาน 18 ชั่วโมง',
    description: 'MacBook Air ชิป M3 พกพาสะดวก รองรับจอภาพภายนอกสูงสุด 2 จอ ดีไซน์ไร้พัดลมเงียบสนิท พร้อมลำโพงระบบเสียงตามตำแหน่ง',
    images: [
      { url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', alt: 'MacBook Air 13 M3 Midnight', displayOrder: 1 },
    ],
    variants: [
      {
        id: 'var-mba-m3-256-mn',
        sku: 'MBA-13-M3-256-MN',
        name: 'MacBook Air 13 นิ้ว 256GB Midnight',
        condition: 'new',
        storageLabel: '256GB',
        colorLabel: 'Midnight',
        colorHex: '#1E2530',
        cashPriceMinor: 3490000,
        compareAtPriceMinor: 3990000,
        warrantyDescription: 'ประกันศูนย์ Apple 1 ปี',
        conditionDescription: 'เครื่องใหม่แท้ 100%',
        isInStock: true,
        attributes: { 'ขนาดจอ': '13.6 นิ้ว', 'ความจุ': '256GB', 'RAM': '16GB', 'ชิป': 'Apple M3' },
      },
    ],
    offers: [
      {
        id: 'off-mba-10m',
        offerId: 'offer-mba-10m',
        title: 'ผ่อน 0% 10 เดือน สำหรับคนทำงาน',
        cashPriceMinor: 3490000,
        downPaymentMinor: 0,
        installmentCount: 10,
        installmentAmountMinor: 349000,
        feesTotalMinor: 0,
        totalPayableMinor: 3490000,
        validFrom: '2026-09-01T00:00:00Z',
        validUntil: '2026-10-31T23:59:59Z',
        terms: 'ผ่อนชำระเดือนละ ฿3,490 นาน 10 เดือน 0% ดอกเบี้ย',
      },
    ],
    branchAvailability: {
      'var-mba-m3-256-mn': generateBranchStock('var-mba-m3-256-mn'),
    },
    specs: {
      'หน้าจอ': '13.6 นิ้ว Liquid Retina 500 nits',
      'ชิปประมวลผล': 'Apple M3 8-core CPU / 8-core GPU',
      'แบตเตอรี่': 'ใช้งานนานสูงสุด 18 ชั่วโมง',
      'น้ำหนัก': '1.24 กก.',
    },
    warranty: 'ประกันศูนย์ Apple 1 ปี',
    publishedAt: '2026-09-24T00:00:00Z',
  },
  {
    id: '00000000-0001-4000-8000-000000000005',
    slug: 'iphone-15-pro-used',
    name: 'iPhone 15 Pro 128GB (มือสองสภาพ 98%)',
    brand: DEV_BRANDS[0], // Apple
    category: DEV_CATEGORIES[0], // smartphone
    summary: 'เครื่องมือสองคุณภาพเกรด A ผ่านการตรวจเช็ก 40 รายการ แบตเตอรี่ 92%+ สภาพสวยไร้รอย',
    description: 'iPhone 15 Pro มือสองคัดเกรดพรีเมียมจาก MeePro Certified ตรวจเช็กมาตรฐานศูนย์แท้ อุปกรณ์ครบกล่อง พร้อมประกันร้าน 6 เดือนเต็ม',
    images: [
      { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', alt: 'iPhone 15 Pro Natural Titanium มือสอง', displayOrder: 1 },
    ],
    variants: [
      {
        id: 'var-ip15p-used-128-nt',
        sku: 'IPHONE-15P-USED-128-NT',
        name: 'iPhone 15 Pro 128GB Natural Titanium (เกรด 98%)',
        condition: 'used',
        storageLabel: '128GB',
        colorLabel: 'Natural Titanium',
        colorHex: '#9E978E',
        cashPriceMinor: 2890000,
        compareAtPriceMinor: 3490000,
        warrantyDescription: 'ประกันร้าน MeePro Care 6 เดือนเต็ม (ครอบคลุมตัวเครื่องและบอร์ด)',
        conditionDescription: 'สภาพสวยงาม 98% ใช้งานปกติทุกฟังก์ชัน แบตเตอรี่ 92%',
        isInStock: true,
        attributes: { 'ขนาดจอ': '6.1 นิ้ว', 'ความจุ': '128GB', 'สภาพ': 'เกรด A (98%)' },
      },
    ],
    offers: [
      {
        id: 'off-ip15p-used-10m',
        offerId: 'offer-ip15p-used',
        title: 'ผ่อนมือสอง 0% 10 เดือน ไม่ใช้บัตร',
        cashPriceMinor: 2890000,
        downPaymentMinor: 0,
        installmentCount: 10,
        installmentAmountMinor: 289000,
        feesTotalMinor: 0,
        totalPayableMinor: 2890000,
        validFrom: '2026-09-01T00:00:00Z',
        validUntil: '2026-10-31T23:59:59Z',
        terms: 'ผ่อนสบายเดือนละ ฿2,890 นาน 10 เดือน ดอกเบี้ย 0%',
      },
    ],
    branchAvailability: {
      'var-ip15p-used-128-nt': generateBranchStock('var-ip15p-used-128-nt'),
    },
    specs: {
      'หน้าจอ': '6.1 นิ้ว Super Retina XDR ProMotion 120Hz',
      'ชิป': 'A17 Pro',
      'กล้อง': '48MP Pro System',
      'สุขภาพแบตเตอรี่': '92%',
    },
    warranty: 'ประกันร้าน MeePro 6 เดือน',
    publishedAt: '2026-09-24T00:00:00Z',
  },
  {
    id: '00000000-0001-4000-8000-000000000006',
    slug: 'sony-wh-1000xm5',
    name: 'Sony WH-1000XM5 หูฟังไร้สายตัดเสียงรบกวน',
    brand: DEV_BRANDS[5], // Sony
    category: DEV_CATEGORIES[4], // audio
    summary: 'ระบบตัดเสียงรบกวนระดับแถวหน้าของวงการ ไมโครโฟน 8 ตัว ไดรเวอร์ 30 มม. เสียงคมชัดสมบูรณ์แบบ',
    description: 'หูฟังตัดเสียงรบกวนชั้นนำ ดีไซน์น้ำหนักเบา สวมใส่สบาย แบตเตอรี่ใช้งานได้นาน 30 ชั่วโมง พร้อม Fast Charging ชาร์จ 3 นาทีฟังได้ 3 ชม.',
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', alt: 'Sony WH-1000XM5 Black', displayOrder: 1 },
    ],
    variants: [
      {
        id: 'var-xm5-black',
        sku: 'SONY-WH1000XM5-BLK',
        name: 'Sony WH-1000XM5 Black',
        condition: 'new',
        storageLabel: null,
        colorLabel: 'Black',
        colorHex: '#1A1A1A',
        cashPriceMinor: 1299000,
        compareAtPriceMinor: 1499000,
        warrantyDescription: 'ประกันศูนย์ Sony ประเทศไทย 1 ปี',
        conditionDescription: 'เครื่องใหม่แท้ 100%',
        isInStock: true,
        attributes: { 'การเชื่อมต่อ': 'Bluetooth 5.2 / 3.5mm', 'แบตเตอรี่': '30 ชม.' },
      },
    ],
    offers: [
      {
        id: 'off-xm5-6m',
        offerId: 'offer-xm5',
        title: 'ผ่อน 0% 6 เดือน',
        cashPriceMinor: 1299000,
        downPaymentMinor: 0,
        installmentCount: 6,
        installmentAmountMinor: 216500,
        feesTotalMinor: 0,
        totalPayableMinor: 1299000,
        validFrom: '2026-09-01T00:00:00Z',
        validUntil: '2026-10-31T23:59:59Z',
        terms: 'ผ่อนชำระเดือนละ ฿2,165 นาน 6 เดือน ดอกเบี้ย 0%',
      },
    ],
    branchAvailability: {
      'var-xm5-black': generateBranchStock('var-xm5-black'),
    },
    specs: {
      'ระบบตัดเสียง': 'Auto NC Optimizer พร้อมไมโครโฟน 8 ตัว',
      'ไดรเวอร์': '30 มม. Dome Type (CCAW Voice Coil)',
      'แบตเตอรี่': '30 ชั่วโมง (เปิด NC) / 40 ชั่วโมง (ปิด NC)',
    },
    warranty: 'ประกันศูนย์ Sony 1 ปี',
    publishedAt: '2026-09-24T00:00:00Z',
  },
  {
    id: '00000000-0001-4000-8000-000000000007',
    slug: 'iphone-14-pro-max-used',
    name: 'iPhone 14 Pro Max 256GB (มือสองสภาพ 96%)',
    brand: DEV_BRANDS[0], // Apple
    category: DEV_CATEGORIES[0], // smartphone
    summary: 'เครื่องมือสองคัดเกรด A แบตเตอรี่ 89%+ บอดี้สวย ไร้รอยตกหล่น กล้อง 48MP จอ 6.7 นิ้ว',
    description: 'iPhone 14 Pro Max มือสองสภาพเยี่ยม ผ่านการตรวจสอบ 40 รายการ ละเอียดทุกจุด พร้อมรับประกันร้าน 6 เดือนเต็ม ผ่อน 0% ได้ทันที',
    images: [
      { url: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=800&q=80', alt: 'iPhone 14 Pro Max Deep Purple มือสอง', displayOrder: 1 },
    ],
    variants: [
      {
        id: 'var-ip14pm-used-256-dp',
        sku: 'IPHONE-14PM-USED-256-DP',
        name: 'iPhone 14 Pro Max 256GB Deep Purple (เกรด 96%)',
        condition: 'used',
        storageLabel: '256GB',
        colorLabel: 'Deep Purple',
        colorHex: '#4E4352',
        cashPriceMinor: 2490000,
        compareAtPriceMinor: 3790000,
        warrantyDescription: 'ประกันร้าน MeePro Care 6 เดือนเต็ม',
        conditionDescription: 'สภาพสวยงาม 96% ไร้รอย แบตเตอรี่ 89%',
        isInStock: true,
        attributes: { 'ขนาดจอ': '6.7 นิ้ว', 'ความจุ': '256GB', 'สภาพ': 'เกรด A (96%)' },
      },
    ],
    offers: [
      {
        id: 'off-ip14pm-used-10m',
        offerId: 'offer-ip14pm-used',
        title: 'ผ่อนมือสอง 0% 10 เดือน ไม่ใช้บัตร',
        cashPriceMinor: 2490000,
        downPaymentMinor: 0,
        installmentCount: 10,
        installmentAmountMinor: 249000,
        feesTotalMinor: 0,
        totalPayableMinor: 2490000,
        validFrom: '2026-09-01T00:00:00Z',
        validUntil: '2026-12-31T23:59:59Z',
        terms: 'ผ่อนสบายเดือนละ ฿2,490 นาน 10 เดือน ดอกเบี้ย 0%',
      },
    ],
    branchAvailability: {
      'var-ip14pm-used-256-dp': generateBranchStock('var-ip14pm-used-256-dp'),
    },
    specs: {
      'หน้าจอ': '6.7 นิ้ว Super Retina XDR ProMotion 120Hz',
      'ชิป': 'A16 Bionic',
      'กล้อง': '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
      'สุขภาพแบตเตอรี่': '89%',
    },
    warranty: 'ประกันร้าน MeePro 6 เดือน',
    publishedAt: '2026-09-24T00:00:00Z',
  },
  {
    id: '00000000-0001-4000-8000-000000000008',
    slug: 'samsung-s24-ultra-used',
    name: 'Galaxy S24 Ultra 256GB (มือสองสภาพ 99%)',
    brand: DEV_BRANDS[1], // Samsung
    category: DEV_CATEGORIES[0], // smartphone
    summary: 'เครื่องมือสองสภาพนางฟ้า 99% ประกันศูนย์ไทยเหลือ 4 เดือน ปากกา S-Pen ครบ กล้อง 200MP ซูม 100x',
    description: 'Galaxy S24 Ultra Titanium Gray สภาพ 99% ใช้งานน้อย ไร้รอยขีดข่วน พร้อมฟังก์ชัน Galaxy AI ครบครัน ประกันศูนย์ยังเหลือ',
    images: [
      { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', alt: 'Galaxy S24 Ultra มือสอง', displayOrder: 1 },
    ],
    variants: [
      {
        id: 'var-s24u-used-256-tg',
        sku: 'S24U-USED-256-TG',
        name: 'Galaxy S24 Ultra 256GB Titanium Gray (เกรด 99%)',
        condition: 'used',
        storageLabel: '256GB',
        colorLabel: 'Titanium Gray',
        colorHex: '#6B6E70',
        cashPriceMinor: 2990000,
        compareAtPriceMinor: 4390000,
        warrantyDescription: 'ประกันศูนย์ไทยเหลือ 4 เดือน + ประกันร้าน MeePro 6 เดือน',
        conditionDescription: 'สภาพนางฟ้า 99% ไร้รอยขนแมว อุปกรณ์ครบกล่อง',
        isInStock: true,
        attributes: { 'ขนาดจอ': '6.8 นิ้ว', 'ความจุ': '256GB', 'สภาพ': 'เกรด A+ (99%)' },
      },
    ],
    offers: [
      {
        id: 'off-s24u-used-10m',
        offerId: 'offer-s24u-used',
        title: 'ผ่อนมือสอง 0% 10 เดือน ไม่ใช้บัตร',
        cashPriceMinor: 2990000,
        downPaymentMinor: 0,
        installmentCount: 10,
        installmentAmountMinor: 299000,
        feesTotalMinor: 0,
        totalPayableMinor: 2990000,
        validFrom: '2026-09-01T00:00:00Z',
        validUntil: '2026-12-31T23:59:59Z',
        terms: 'ผ่อนสบายเดือนละ ฿2,990 นาน 10 เดือน ดอกเบี้ย 0%',
      },
    ],
    branchAvailability: {
      'var-s24u-used-256-tg': generateBranchStock('var-s24u-used-256-tg'),
    },
    specs: {
      'หน้าจอ': '6.8 นิ้ว Dynamic AMOLED 2X 120Hz',
      'ชิป': 'Snapdragon 8 Gen 3 for Galaxy',
      'กล้อง': '200MP Quad Tele System',
      'สุขภาพแบตเตอรี่': '96%',
    },
    warranty: 'ประกันศูนย์ไทย + ร้าน MeePro',
    publishedAt: '2026-09-24T00:00:00Z',
  },
  {
    id: '00000000-0001-4000-8000-000000000009',
    slug: 'iphone-13-used',
    name: 'iPhone 13 128GB (มือสองสภาพ 95%)',
    brand: DEV_BRANDS[0], // Apple
    category: DEV_CATEGORIES[0], // smartphone
    summary: 'เครื่องมือสองยอดนิยม สภาพ 95% แบตเตอรี่ 88%+ คุ้มค่าที่สุด ผ่อนเริ่มต้นเพียง ฿1,390/เดือน',
    description: 'iPhone 13 Midnight สภาพดีมาก ใช้งานปกติทุกฟังก์ชัน ลำโพง จอสัมผัส กล้อง FaceID ผ่านการตรวจเช็ก 40 รายการ',
    images: [
      { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80', alt: 'iPhone 13 มือสอง', displayOrder: 1 },
    ],
    variants: [
      {
        id: 'var-ip13-used-128-mn',
        sku: 'IPHONE-13-USED-128-MN',
        name: 'iPhone 13 128GB Midnight (เกรด 95%)',
        condition: 'used',
        storageLabel: '128GB',
        colorLabel: 'Midnight',
        colorHex: '#1B2430',
        cashPriceMinor: 1390000,
        compareAtPriceMinor: 2190000,
        warrantyDescription: 'ประกันร้าน MeePro Care 6 เดือนเต็ม',
        conditionDescription: 'สภาพสวยงาม 95% แบตเตอรี่ 88%',
        isInStock: true,
        attributes: { 'ขนาดจอ': '6.1 นิ้ว', 'ความจุ': '128GB', 'สภาพ': 'เกรด A (95%)' },
      },
    ],
    offers: [
      {
        id: 'off-ip13-used-10m',
        offerId: 'offer-ip13-used',
        title: 'ผ่อนมือสอง 0% 10 เดือน ไม่ใช้บัตร',
        cashPriceMinor: 1390000,
        downPaymentMinor: 0,
        installmentCount: 10,
        installmentAmountMinor: 139000,
        feesTotalMinor: 0,
        totalPayableMinor: 1390000,
        validFrom: '2026-09-01T00:00:00Z',
        validUntil: '2026-12-31T23:59:59Z',
        terms: 'ผ่อนสบายเดือนละ ฿1,390 นาน 10 เดือน ดอกเบี้ย 0%',
      },
    ],
    branchAvailability: {
      'var-ip13-used-128-mn': generateBranchStock('var-ip13-used-128-mn'),
    },
    specs: {
      'หน้าจอ': '6.1 นิ้ว Super Retina XDR',
      'ชิป': 'A15 Bionic',
      'กล้อง': '12MP Dual Camera',
      'สุขภาพแบตเตอรี่': '88%',
    },
    warranty: 'ประกันร้าน MeePro 6 เดือน',
    publishedAt: '2026-09-24T00:00:00Z',
  },
];

export function toProductSummary(product: PublicProductDetail): PublicProductSummary {
  const minCash = Math.min(...product.variants.map((v) => v.cashPriceMinor));
  const maxCash = Math.max(...product.variants.map((v) => v.cashPriceMinor));
  const bestOffer = product.offers[0];

  const tags = product.tags && product.tags.length > 0
    ? product.tags
    : product.variants[0]?.condition === 'used'
    ? [{ label: 'มือสองเกรด A', icon: '⭐' }]
    : [{ label: 'แนะนำ', icon: '🔥' }, { label: 'ประกันศูนย์', icon: '🛡️' }];

  const badges = product.badges && product.badges.length > 0
    ? product.badges
    : tags.map((t) => (t.icon ? `${t.icon} ${t.label}` : t.label));

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand.name,
    brandSlug: product.brand.slug,
    category: product.category.name,
    categorySlug: product.category.slug,
    categoryName: product.category.name,
    summary: product.summary,
    condition: product.variants[0]?.condition || 'new',
    thumbnailUrl: product.images[0]?.url || '',
    minCashPriceMinor: minCash,
    maxCashPriceMinor: maxCash,
    compareAtPriceMinor: product.variants[0]?.compareAtPriceMinor,
    bestInstallmentMonths: bestOffer?.installmentCount,
    bestInstallmentMonthlyMinor: bestOffer?.installmentAmountMinor,
    hasZeroPercent: product.offers.some((o) => o.installmentCount > 0),
    badge: badges[0] || null,
    badges,
    tags,
    publishedAt: product.publishedAt,
  };
}

export const DEV_PRODUCT_SUMMARIES: PublicProductSummary[] = DEV_PRODUCTS.map(toProductSummary);
