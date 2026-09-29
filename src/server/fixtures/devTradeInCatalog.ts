import type {
  TradeInCategory,
  TradeInBrand,
  TradeInModel,
  TradeInStorageOption,
  TradeInColorOption,
  TradeInMarketVariantOption,
  TradeInDeviceConfiguration,
  AssessmentTopic,
} from '@/features/tradein/types';

export const DEV_TRADEIN_CATEGORIES: TradeInCategory[] = [
  { id: 'cat-phone', name: 'สมาร์ตโฟน', slug: 'smartphones', isActive: true, displayOrder: 1, iconName: 'smartphone' },
  { id: 'cat-tablet', name: 'แท็บเล็ต', slug: 'tablets', isActive: true, displayOrder: 2, iconName: 'tablet' },
];

export const DEV_TRADEIN_BRANDS: TradeInBrand[] = [
  { id: 'brand-apple', name: 'Apple', slug: 'apple', categoryIds: ['cat-phone', 'cat-tablet'], isActive: true, displayOrder: 1, logoUrl: '/brands/apple.svg' },
  { id: 'brand-samsung', name: 'Samsung', slug: 'samsung', categoryIds: ['cat-phone', 'cat-tablet'], isActive: true, displayOrder: 2, logoUrl: '/brands/samsung.svg' },
  { id: 'brand-oppo', name: 'OPPO', slug: 'oppo', categoryIds: ['cat-phone'], isActive: true, displayOrder: 3, logoUrl: '/brands/oppo.svg' },
];

export const DEV_TRADEIN_MODELS: TradeInModel[] = [
  {
    id: 'model-ip-13',
    name: 'iPhone 13',
    slug: 'iphone-13',
    categoryId: 'cat-phone',
    brandId: 'brand-apple',
    imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    displayOrder: 1,
    supportedFeatures: { hasFaceId: true, hasWirelessCharging: true },
  },
  {
    id: 'model-ip-14',
    name: 'iPhone 14',
    slug: 'iphone-14',
    categoryId: 'cat-phone',
    brandId: 'brand-apple',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    displayOrder: 2,
    supportedFeatures: { hasFaceId: true, hasWirelessCharging: true },
  },
  {
    id: 'model-ip-15-pro',
    name: 'iPhone 15 Pro',
    slug: 'iphone-15-pro',
    categoryId: 'cat-phone',
    brandId: 'brand-apple',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    displayOrder: 3,
    supportedFeatures: { hasFaceId: true, hasWirelessCharging: true },
  },
  {
    id: 'model-ss-s23',
    name: 'Galaxy S23',
    slug: 'galaxy-s23',
    categoryId: 'cat-phone',
    brandId: 'brand-samsung',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    displayOrder: 4,
    supportedFeatures: { hasFingerprint: true, hasWirelessCharging: true },
  },
  {
    id: 'model-ss-a54',
    name: 'Galaxy A54 5G',
    slug: 'galaxy-a54-5g',
    categoryId: 'cat-phone',
    brandId: 'brand-samsung',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    displayOrder: 5,
    supportedFeatures: { hasFingerprint: true },
  },
  {
    id: 'model-op-reno10',
    name: 'Reno 10 Pro 5G',
    slug: 'reno-10-pro-5g',
    categoryId: 'cat-phone',
    brandId: 'brand-oppo',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600&auto=format&fit=crop&q=80',
    isActive: true,
    displayOrder: 6,
    supportedFeatures: { hasFingerprint: true },
  },
];

// Step 4: Storage only
export const DEV_TRADEIN_STORAGES: TradeInStorageOption[] = [
  { id: 'storage-128gb', name: '128 GB', label: '128GB', sizeValueGb: 128, isActive: true, displayOrder: 1 },
  { id: 'storage-256gb', name: '256 GB', label: '256GB', sizeValueGb: 256, isActive: true, displayOrder: 2 },
  { id: 'storage-512gb', name: '512 GB', label: '512GB', sizeValueGb: 512, isActive: true, displayOrder: 3 },
  { id: 'storage-1tb', name: '1 TB', label: '1TB', sizeValueGb: 1024, isActive: true, displayOrder: 4 },
];

// Step 5: Color
export const DEV_TRADEIN_COLORS: TradeInColorOption[] = [
  { id: 'color-midnight', name: 'มิดไนท์ (Midnight)', label: 'Midnight', hexCode: '#1C232B', isActive: true, displayOrder: 1 },
  { id: 'color-starlight', name: 'สตาร์ไลท์ (Starlight)', label: 'Starlight', hexCode: '#F8F6F0', isActive: true, displayOrder: 2 },
  { id: 'color-blue', name: 'สีฟ้า (Blue)', label: 'Blue', hexCode: '#215E7C', isActive: true, displayOrder: 3 },
  { id: 'color-pink', name: 'สีชมพู (Pink)', label: 'Pink', hexCode: '#FADDD7', isActive: true, displayOrder: 4 },
  { id: 'color-titanium-black', name: 'แบล็ค ไทเทเนียม', label: 'Black Titanium', hexCode: '#3C3B37', isActive: true, displayOrder: 5 },
  { id: 'color-natural-titanium', name: 'เนเชอรัล ไทเทเนียม', label: 'Natural Titanium', hexCode: '#9F988F', isActive: true, displayOrder: 6 },
];

// Step 6: Market Variant
export const DEV_TRADEIN_MARKET_VARIANTS: TradeInMarketVariantOption[] = [
  { id: 'mkt-th', name: 'เครื่องศูนย์ไทย (TH/A)', label: 'เครื่องศูนย์ไทย (TH)', code: 'TH', adjustmentType: 'NONE', adjustmentValue: 0, isActive: true, displayOrder: 1 },
  { id: 'mkt-lla', name: 'เครื่องนอก อเมริกา (LL/A)', label: 'เครื่องนอก (LL/A)', code: 'LL/A', adjustmentType: 'PERCENTAGE', adjustmentValue: 8, isActive: true, displayOrder: 2 },
  { id: 'mkt-zpa', name: 'เครื่องนอก ฮ่องกง/สิงคโปร์ (ZP/A)', label: 'เครื่องนอก (ZP/A)', code: 'ZP/A', adjustmentType: 'PERCENTAGE', adjustmentValue: 5, isActive: true, displayOrder: 3 },
  { id: 'mkt-other', name: 'เครื่องนอก ประเทศอื่นๆ', label: 'เครื่องนอก อื่นๆ', code: 'OTHER', adjustmentType: 'PERCENTAGE', adjustmentValue: 10, isActive: true, displayOrder: 4 },
];

// Base buyback configurations (illustrative demo fixtures, including the exact test fixture)
export const DEV_TRADEIN_CONFIGURATIONS: TradeInDeviceConfiguration[] = [
  // iPhone 13 128GB Midnight TH (Test Fixture: Base 23,000 THB)
  {
    id: 'cfg-ip13-128-midnight-th',
    modelId: 'model-ip-13',
    storageOptionId: 'storage-128gb',
    colorOptionId: 'color-midnight',
    marketVariantOptionId: 'mkt-th',
    baseBuybackPriceMinor: 23000,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'cfg-ip13-128-blue-th',
    modelId: 'model-ip-13',
    storageOptionId: 'storage-128gb',
    colorOptionId: 'color-blue',
    marketVariantOptionId: 'mkt-th',
    baseBuybackPriceMinor: 23000,
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'cfg-ip13-128-starlight-th',
    modelId: 'model-ip-13',
    storageOptionId: 'storage-128gb',
    colorOptionId: 'color-starlight',
    marketVariantOptionId: 'mkt-th',
    baseBuybackPriceMinor: 23000,
    isActive: true,
    displayOrder: 3,
  },
  {
    id: 'cfg-ip13-128-pink-th',
    modelId: 'model-ip-13',
    storageOptionId: 'storage-128gb',
    colorOptionId: 'color-pink',
    marketVariantOptionId: 'mkt-th',
    baseBuybackPriceMinor: 23000,
    isActive: true,
    displayOrder: 4,
  },
  {
    id: 'cfg-ip13-256-midnight-th',
    modelId: 'model-ip-13',
    storageOptionId: 'storage-256gb',
    colorOptionId: 'color-midnight',
    marketVariantOptionId: 'mkt-th',
    baseBuybackPriceMinor: 25500,
    isActive: true,
    displayOrder: 5,
  },
  // iPhone 14 128GB TH
  {
    id: 'cfg-ip14-128-midnight-th',
    modelId: 'model-ip-14',
    storageOptionId: 'storage-128gb',
    colorOptionId: 'color-midnight',
    marketVariantOptionId: 'mkt-th',
    baseBuybackPriceMinor: 26000,
    isActive: true,
    displayOrder: 6,
  },
  // iPhone 15 Pro 128GB TH
  {
    id: 'cfg-ip15p-128-titanium-th',
    modelId: 'model-ip-15-pro',
    storageOptionId: 'storage-128gb',
    colorOptionId: 'color-natural-titanium',
    marketVariantOptionId: 'mkt-th',
    baseBuybackPriceMinor: 32000,
    isActive: true,
    displayOrder: 7,
  },
  // Galaxy S23 128GB TH
  {
    id: 'cfg-s23-128-midnight-th',
    modelId: 'model-ss-s23',
    storageOptionId: 'storage-128gb',
    colorOptionId: 'color-midnight',
    marketVariantOptionId: 'mkt-th',
    baseBuybackPriceMinor: 16500,
    isActive: true,
    displayOrder: 8,
  },
  // Galaxy A54 128GB TH
  {
    id: 'cfg-a54-128-midnight-th',
    modelId: 'model-ss-a54',
    storageOptionId: 'storage-128gb',
    colorOptionId: 'color-midnight',
    marketVariantOptionId: 'mkt-th',
    baseBuybackPriceMinor: 7500,
    isActive: true,
    displayOrder: 9,
  },
  // Reno 10 Pro 256GB TH
  {
    id: 'cfg-reno10-256-midnight-th',
    modelId: 'model-op-reno10',
    storageOptionId: 'storage-256gb',
    colorOptionId: 'color-midnight',
    marketVariantOptionId: 'mkt-th',
    baseBuybackPriceMinor: 9500,
    isActive: true,
    displayOrder: 10,
  },
];

// ---------------------------------------------------------------------------
// Configurable Assessment Topics & Options
// ---------------------------------------------------------------------------

export const DEV_TRADEIN_TOPICS: AssessmentTopic[] = [
  // 1. Battery
  {
    id: 'battery',
    title: 'สุขภาพแบตเตอรี่ (Battery Health)',
    subtitle: 'เลือกเปอร์เซ็นต์ความจุสูงสุดของแบตเตอรี่',
    isRequired: true,
    isMultiSelect: false,
    options: [
      { id: 'bat-90-100', label: '90–100%', adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'bat-80-89', label: '80–89%', adjustmentType: 'PERCENTAGE', adjustmentValue: 5 }, // -5% of base in test fixture
      { id: 'bat-75-79', label: '75–79%', adjustmentType: 'PERCENTAGE', adjustmentValue: 10 },
      { id: 'bat-below-75', label: 'ต่ำกว่า 75%', adjustmentType: 'FIXED', adjustmentValue: 1800, overlapGroup: 'OVERLAP_BATTERY_REPLACE' },
      { id: 'bat-unknown', label: 'ไม่ทราบ / ตรวจสอบไม่ได้', adjustmentType: 'PERCENTAGE', adjustmentValue: 8 },
      { id: 'bat-swollen', label: 'แบตเตอรี่บวม ดันหน้าจอหรือฝาหลัง', adjustmentType: 'MANUAL_ASSESSMENT', adjustmentValue: 0, manualReviewRequired: true },
    ],
  },

  // 2. Accessories
  {
    id: 'accessories',
    title: 'อุปกรณ์และกล่องบรรจุภัณฑ์',
    subtitle: 'ความสมบูรณ์ของกล่องและอุปกรณ์ที่มาพร้อมเครื่อง',
    isRequired: true,
    isMultiSelect: false,
    options: [
      { id: 'acc-box-complete', label: 'มีกล่อง และอุปกรณ์ครบชุด', adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'acc-box-incomplete', label: 'มีกล่อง แต่อุปกรณ์ไม่ครบ', adjustmentType: 'FIXED', adjustmentValue: 300 },
      { id: 'acc-nobox-complete', label: 'ไม่มีกล่อง แต่อุปกรณ์ครบ', adjustmentType: 'FIXED', adjustmentValue: 300 },
      { id: 'acc-nobox-incomplete', label: 'ไม่มีกล่อง และอุปกรณ์ไม่ครบ (เฉพาะตัวเครื่อง)', adjustmentType: 'FIXED', adjustmentValue: 500 },
    ],
  },

  // 3. Warranty
  {
    id: 'warranty',
    title: 'ระยะเวลาประกันศูนย์คงเหลือ',
    subtitle: 'ตรวจสอบจากศูนย์บริการทางการของผู้ผลิต',
    isRequired: true,
    isMultiSelect: false,
    options: [
      { id: 'war-over-4m', label: 'ประกันศูนย์คงเหลือมากกว่า 4 เดือน', adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'war-under-4m', label: 'ประกันเหลือน้อยกว่า 4 เดือน หรือหมดประกันแล้ว', adjustmentType: 'FIXED', adjustmentValue: 500 }, // -500 in test fixture
      { id: 'war-unknown', label: 'ไม่ทราบระยะเวลาประกัน', adjustmentType: 'FIXED', adjustmentValue: 500 },
    ],
  },

  // 4. Body condition (Do not duplicate)
  {
    id: 'body_condition',
    title: 'สภาพตัวเครื่องและขอบรอบตัวเครื่อง',
    subtitle: 'สภาพภายนอก รอยขนแมว รอยบุบ หรือการบิดงอ',
    isRequired: true,
    isMultiSelect: false,
    options: [
      { id: 'body-none', label: 'ไม่มีรอยขีดข่วน (สวยเหมือนใหม่)', adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'body-light', label: 'รอยขนแมวเล็กน้อยตามการใช้งาน', adjustmentType: 'FIXED', adjustmentValue: 400 },
      { id: 'body-heavy', label: 'รอยถลอกลึก / สีลอกชัดเจน', adjustmentType: 'FIXED', adjustmentValue: 900 },
      { id: 'body-dented', label: 'มีรอยตกกระแทก / ขอบบุบ', adjustmentType: 'FIXED', adjustmentValue: 1500 },
      { id: 'body-cracked-bent', label: 'ตัวเครื่องแตก / ฝาหลังแตก / เครื่องงอ', adjustmentType: 'FIXED', adjustmentValue: 2500, overlapGroup: 'OVERLAP_CHASSIS_REPAIR' },
    ],
  },

  // 5. Screen surface
  {
    id: 'screen_surface',
    title: 'สภาพผิวกระจกหน้าจอ',
    subtitle: 'ตรวจดูรอยขีดข่วนบนกระจกหน้าจอ (ไม่รวมการแสดงผล)',
    isRequired: true,
    isMultiSelect: false,
    options: [
      { id: 'screen-none', label: 'ไม่มีรอยขีดข่วน (สวยใส)', adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'screen-light', label: 'รอยขนแมวบางๆ สังเกตเห็นได้เมื่อสะท้อนแสง', adjustmentType: 'FIXED', adjustmentValue: 500 },
      { id: 'screen-deep', label: 'รอยขูดลึก หรือรอยครูดชัดเจน', adjustmentType: 'FIXED', adjustmentValue: 1200 },
      { id: 'screen-cracked', label: 'กระจกหน้าจอแตกร้าว', adjustmentType: 'REPAIR_DEDUCTION', adjustmentValue: 3500, overlapGroup: 'OVERLAP_SCREEN_REPLACEMENT' },
    ],
  },

  // 6. Display panel
  {
    id: 'display',
    title: 'การแสดงผลของหน้าจอ (Display)',
    subtitle: 'ตรวจดูความผิดปกติของภาพ แสง สี เม็ดสี',
    isRequired: true,
    isMultiSelect: true,
    options: [
      { id: 'disp-normal', label: 'แสดงผลปกติ ไม่มีจุดหรือเส้นผิดปกติ', isExclusive: true, adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'disp-lines', label: 'มีเส้นบนหน้าจอ (Line on display)', adjustmentType: 'REPAIR_DEDUCTION', adjustmentValue: 4500, overlapGroup: 'OVERLAP_SCREEN_REPLACEMENT' },
      { id: 'disp-black-spots', label: 'มีจุดดำ / จอเบิร์น / ไบร์ทสปอต (Black spots)', adjustmentType: 'REPAIR_DEDUCTION', adjustmentValue: 4000, overlapGroup: 'OVERLAP_SCREEN_REPLACEMENT' },
      { id: 'disp-failure', label: 'จอแสดงผลดับ / ภาพล้ม / สีกระพริบ', adjustmentType: 'REPAIR_DEDUCTION', adjustmentValue: 5000, overlapGroup: 'OVERLAP_SCREEN_REPLACEMENT' },
    ],
  },

  // 7. Functional issues
  {
    id: 'functional_issues',
    title: 'การทำงานของฟังก์ชันภายในเครื่อง',
    subtitle: 'เลือกฟังก์ชันที่มีปัญหา หรือเลือก "ทำงานได้ปกติทุกฟังก์ชัน"',
    isRequired: true,
    isMultiSelect: true,
    options: [
      { id: 'func-none', label: 'ทำงานได้ปกติทุกฟังก์ชัน ไม่มีปัญหา', isExclusive: true, adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'func-touchscreen', label: 'ระบบสัมผัส (Touchscreen มีจุดทัชไม่ติด)', adjustmentType: 'REPAIR_DEDUCTION', adjustmentValue: 3800, overlapGroup: 'OVERLAP_SCREEN_REPLACEMENT' },
      { id: 'func-wifi-bt-gps', label: 'Wi-Fi / Bluetooth / GPS ใช้งานไม่ได้', adjustmentType: 'FIXED', adjustmentValue: 1500 },
      { id: 'func-cellular', label: 'สัญญาณโทรเข้า-ออก / อินเทอร์เน็ตซิมไม่เสถียร', adjustmentType: 'FIXED', adjustmentValue: 1800 },
      { id: 'func-vibration', label: 'ระบบสั่นไม่ทำงาน', adjustmentType: 'FIXED', adjustmentValue: 600 },
      { id: 'func-biometric', label: 'ระบบสแกนใบหน้า (Face ID) หรือสแกนนิ้วมือ ใช้งานไม่ได้', adjustmentType: 'FIXED', adjustmentValue: 2200 },
      { id: 'func-buttons', label: 'ปุ่มกด (Home, Power, ปรับระดับเสียง) กดยากหรือไม่ตอบสนอง', adjustmentType: 'FIXED', adjustmentValue: 700 },
      { id: 'func-audio', label: 'ลำโพง หรือไมโครโฟน เสียงแตก / ไม่ได้ยิน', adjustmentType: 'FIXED', adjustmentValue: 900 },
      { id: 'func-front-camera', label: 'กล้องหน้า ภาพมัว / สั่น / ไม่โฟกัส', adjustmentType: 'FIXED', adjustmentValue: 1500 },
      { id: 'func-rear-camera', label: 'กล้องหลัง ภาพมัว / สั่น / เลนส์แตก', adjustmentType: 'FIXED', adjustmentValue: 2500 },
      { id: 'func-flash', label: 'ไฟแฟลช หรือไฟฉายไม่ติด', adjustmentType: 'FIXED', adjustmentValue: 500 },
      { id: 'func-sensors', label: 'เซ็นเซอร์แนบหู หรือเซ็นเซอร์วัดแสงไม่ทำงาน', adjustmentType: 'FIXED', adjustmentValue: 600 },
      { id: 'func-charging-port', label: 'พอร์ตชาร์จหลวม / ชาร์จไม่เข้า', adjustmentType: 'FIXED', adjustmentValue: 1100 },
    ],
  },

  // 8. Repair history
  {
    id: 'repair_history',
    title: 'ประวัติการแกะซ่อมตัวเครื่อง',
    subtitle: 'เคยผ่านการเปิดเครื่องหรือเปลี่ยนอะไหล่หรือไม่',
    isRequired: true,
    isMultiSelect: false,
    options: [
      { id: 'rep-never', label: 'ไม่เคยซ่อม ไม่เคยแกะเครื่อง', adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'rep-authorized', label: 'เคยซ่อมศูนย์บริการทางการ (มีหลักฐาน)', requiresEvidence: true, adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'rep-third-party', label: 'เคยซ่อมร้านภายนอก (เปลี่ยนอะไหล่เทียบ)', requiresDetails: true, adjustmentType: 'PERCENTAGE', adjustmentValue: 10 },
      { id: 'rep-unknown', label: 'ไม่ทราบประวัติการซ่อม', adjustmentType: 'PERCENTAGE', adjustmentValue: 5 },
    ],
  },

  // 9. Damage history
  {
    id: 'damage_history',
    title: 'ประวัติความเสียหายหนัก (ตกน้ำ / ซ่อมเมนบอร์ด)',
    subtitle: 'เลือกรายการความเสียหายที่เคยเกิดขึ้น',
    isRequired: true,
    isMultiSelect: true,
    options: [
      { id: 'dmg-neither', label: 'ไม่เคยตกน้ำ และไม่เคยซ่อมบอร์ด', isExclusive: true, adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'dmg-water', label: 'เคยโดนน้ำ หรือมีความชื้นสะสมภายใน', adjustmentType: 'MANUAL_ASSESSMENT', adjustmentValue: 0, manualReviewRequired: true },
      { id: 'dmg-motherboard', label: 'เคยซ่อมเมนบอร์ด / ยกชิปประมวลผล', adjustmentType: 'MANUAL_ASSESSMENT', adjustmentValue: 0, manualReviewRequired: true },
      { id: 'dmg-unknown', label: 'ไม่ทราบ', isExclusive: true, adjustmentType: 'PERCENTAGE', adjustmentValue: 8 },
    ],
  },

  // 10. Account lock
  {
    id: 'account_lock',
    title: 'สถานะการลงชื่อเข้าใช้บัญชี (iCloud / Google Account)',
    subtitle: 'เครื่องต้องสามารถลงชื่อออกและล้างข้อมูลได้ 100%',
    isRequired: true,
    isMultiSelect: false,
    options: [
      { id: 'lock-removed', label: 'ลงชื่อออก (Sign out) เรียบร้อยแล้ว', adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'lock-can-remove', label: 'ยังไม่ได้ลงชื่อออก แต่สามารถลงชื่อออกได้ก่อนส่งมอบ', adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'lock-cannot-remove', label: 'ไม่สามารถลงชื่อออกได้ / ลืมรหัสผ่าน', adjustmentType: 'HOLD_OR_REJECT', adjustmentValue: 0, eligibilityHold: true },
      { id: 'lock-unknown', label: 'ไม่แน่ใจสถานะบัญชี', adjustmentType: 'MANUAL_ASSESSMENT', adjustmentValue: 0, manualReviewRequired: true },
    ],
  },

  // 11. Ownership
  {
    id: 'ownership',
    title: 'การยืนยันความเป็นเจ้าของเครื่อง',
    subtitle: 'ผู้ขอนำเครื่องมาแลกเงินต้องเป็นเจ้าของอย่างถูกต้องตามกฎหมาย',
    isRequired: true,
    isMultiSelect: false,
    options: [
      { id: 'own-confirmed', label: 'ข้าพเจ้ายืนยันว่าเป็นเจ้าของเครื่องอย่างถูกต้อง', adjustmentType: 'NO_DEDUCTION', adjustmentValue: 0 },
      { id: 'own-needs-verification', label: 'จำเป็นต้องใช้เอกสารยืนยันสิทธิ์เพิ่มเติม', adjustmentType: 'MANUAL_ASSESSMENT', adjustmentValue: 0, manualReviewRequired: true },
    ],
  },
];

// Branch appointment capacity defaults
export interface BranchSlotCapacity {
  branchId: string;
  maxSlotsPerHour: number;
  openHour: number; // e.g. 10 for 10:00
  closeHour: number; // e.g. 21 for 21:00
}

export const DEV_BRANCH_CAPACITIES: BranchSlotCapacity[] = [
  { branchId: '00000000-0000-4000-8000-000000000001', maxSlotsPerHour: 4, openHour: 10, closeHour: 19 },
  { branchId: '00000000-0000-4000-8000-000000000002', maxSlotsPerHour: 4, openHour: 10, closeHour: 19 },
  { branchId: '00000000-0000-4000-8000-000000000003', maxSlotsPerHour: 3, openHour: 10, closeHour: 19 },
];
