/**
 * MeePro CMS v2.1 — Widget Catalog Presets
 * Pre-configured default templates for all 30+ supported widget types.
 */

import { SupportedWidgetType } from './cmsDb';

export interface WidgetCatalogItem {
  type: SupportedWidgetType | string;
  name: string;
  category: 'navigation' | 'banners' | 'products' | 'promotions' | 'trust' | 'engagement' | 'layout';
  description: string;
  icon: string;
  defaultTitle: string;
  defaultConfig: Record<string, any>;
}

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  // 1. Navigation & Headers
  {
    type: 'ANNOUNCEMENT_BAR',
    name: 'Announcement Bar',
    category: 'navigation',
    description: 'แถบประกาศข้อความด้านบนสุดพร้อมลิงก์และปุ่มปิด',
    icon: '📢',
    defaultTitle: 'แถบประกาศข้อความ',
    defaultConfig: {
      message: '🎉 ยินดีต้อนรับสู่ MeePro! รับคูปองส่วนลดพิเศษ ฿500 สำหรับลูกค้าใหม่',
      linkText: 'รับสิทธิ์เลย',
      linkUrl: '/promotion',
      bgColor: '#0F172A',
      textColor: '#FFFFFF',
      isClosable: true,
    },
  },
  {
    type: 'SEARCH_BAR',
    name: 'Search Bar',
    category: 'navigation',
    description: 'กล่องค้นหาสินค้าพร้อมคำค้นหายอดนิยม',
    icon: '🔍',
    defaultTitle: 'ค้นหาสินค้า',
    defaultConfig: {
      placeholder: 'ค้นหาสมาร์ทโฟน แล็ปท็อป แท็บเล็ต หรืออุปกรณ์เสริม...',
      popularSearches: ['iPhone 16 Pro', 'Galaxy S25', 'iPad Air M2', 'MacBook Air'],
      showBarcodeScan: true,
    },
  },
  {
    type: 'CATEGORY_NAV',
    name: 'Category Nav',
    category: 'navigation',
    description: 'แถบเลื่อนหมวดหมู่สินค้าแนวนอน',
    icon: '🧭',
    defaultTitle: 'หมวดหมู่สินค้า',
    defaultConfig: {
      categories: [
        { id: 'smartphones', name: 'สมาร์ทโฟน', icon: '📱', href: '/catalog?category=smartphone' },
        { id: 'tablets', name: 'แท็บเล็ต', icon: '📲', href: '/catalog?category=tablet' },
        { id: 'laptops', name: 'แล็ปท็อป', icon: '💻', href: '/catalog?category=laptop' },
        { id: 'smartwatches', name: 'สมาร์ทวอทช์', icon: '⌚', href: '/catalog?category=watch' },
        { id: 'audio', name: 'หูฟัง & ลำโพง', icon: '🎧', href: '/catalog?category=audio' },
      ],
      showIcons: true,
    },
  },

  // 2. Banners & Content
  {
    type: 'HERO_BANNER',
    name: 'Hero Banner Slider',
    category: 'banners',
    description: 'แบนเนอร์สไลด์ขนาดใหญ่ด้านบนพร้อมปุ่ม Action',
    icon: '🖼️',
    defaultTitle: 'แบนเนอร์หลักประจำเดือน',
    defaultConfig: {
      autoSlideIntervalMs: 4000,
      banners: [
        {
          id: 'b-1',
          imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&auto=format&fit=crop&q=80',
          title: 'iPhone 16 Pro Max เปิดตัวแล้ววันนี้',
          tag: 'โปรเปิดตัวสุดเอ็กซ์คลูซีฟ',
          linkUrl: '/catalog',
          bgColor: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)',
          textColor: '#FFFFFF',
        },
        {
          id: 'b-2',
          imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&auto=format&fit=crop&q=80',
          title: 'Galaxy S25 Ultra รับส่วนลดสูงสุด ฿8,000',
          tag: 'Flash Deal ประจำสัปดาห์',
          linkUrl: '/promotion',
          bgColor: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #6366F1 100%)',
          textColor: '#FFFFFF',
        },
      ],
    },
  },
  {
    type: 'BANNER_CAROUSEL',
    name: 'Banner Carousel',
    category: 'banners',
    description: 'สไลด์แบนเนอร์โปรโมชั่นแบบกะทัดรัดพร้อมระบบ Auto-play',
    icon: '🎠',
    defaultTitle: 'สไลด์แคมเปญพิเศษ',
    defaultConfig: {
      aspectRatio: '16:9',
      autoPlayIntervalSeconds: 4,
      items: [
        {
          id: 'slide-1',
          desktopImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
          mobileImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
          altText: 'Gaming Gear Fest',
          href: '/promotion',
          headline: 'Gaming Gear ลดสูงสุด 40%',
          subheadline: 'อุปกรณ์เกมมิ่งระดับโปร รับประกันศูนย์ไทย',
        },
      ],
    },
  },
  {
    type: 'IMAGE_GRID',
    name: 'Image Grid',
    category: 'banners',
    description: 'ตารางแสดงรูปภาพโปรโมชั่น 2 หรือ 3 คอลัมน์',
    icon: '▦',
    defaultTitle: 'แคมเปญไฮไลท์ประจำวัน',
    defaultConfig: {
      columns: 2,
      gapPx: 12,
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
          altText: 'Smartwatch Deals',
          href: '/catalog?category=watch',
          caption: 'สมาร์ทวอทช์ลดพิเศษ',
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
          altText: 'Premium Audio',
          href: '/catalog?category=audio',
          caption: 'หูฟังตัดเสียงรบกวน',
        },
      ],
    },
  },
  {
    type: 'VIDEO_PLAYER',
    name: 'Video Player',
    category: 'banners',
    description: 'วิดีโอแนะนำสินค้าหรือรีวิวพร้อมปุ่มควบคุม',
    icon: '🎥',
    defaultTitle: 'วิดีโอแนะนำสินค้าใหม่',
    defaultConfig: {
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      autoPlayMuted: true,
      loop: true,
      aspectRatio: '16:9',
    },
  },

  // 3. Product Browsing
  {
    type: 'PRODUCT_GRID',
    name: 'Product Grid',
    category: 'products',
    description: 'ตารางแสดงสินค้าแบบ Responsive 2-4 คอลัมน์',
    icon: '🛍️',
    defaultTitle: 'สินค้าแนะนำสำหรับคุณ',
    defaultConfig: {
      dataSource: { type: 'category', value: 'smartphone' },
      columns: 2,
      showRating: true,
      showInstallmentBadge: true,
      maxItems: 6,
    },
  },
  {
    type: 'PRODUCT_CAROUSEL',
    name: 'Product Carousel',
    category: 'products',
    description: 'สไลด์เลื่อนสินค้าแนวนอน',
    icon: '🎞️',
    defaultTitle: 'สินค้าขายดีประจำสัปดาห์',
    defaultConfig: {
      dataSource: { type: 'featured' },
      maxItems: 8,
    },
  },
  {
    type: 'FEATURED_PRODUCT',
    name: 'Featured Product Spotlight',
    category: 'products',
    description: 'การนำเสนอสินค้าเรือธงเด่นแบบละเอียด',
    icon: '🌟',
    defaultTitle: 'สินค้าไฮไลท์เด่น',
    defaultConfig: {
      productId: 'p-ip16pm',
      customBadgeText: 'RECOMMENDED',
      highlightBullets: [
        'ชิปเซ็ต Apple A18 Pro ทรงพลังที่สุด',
        'กล้อง Fusion 48MP ซูมออปติคัล 5 เท่า',
        'แบตเตอรี่ใช้งานได้ยาวนานตลอดวัน',
      ],
      showDirectBuyButton: true,
    },
  },
  {
    type: 'COLLECTION_TILES',
    name: 'Collection Tiles',
    category: 'products',
    description: 'คอลเลกชันสินค้าจัดกลุ่มพร้อมรูปภาพปก',
    icon: '🏷️',
    defaultTitle: 'คอลเลกชันยอดนิยม',
    defaultConfig: {
      collections: [
        {
          title: 'Flagship Smartphones',
          subtitle: 'สมาร์ทโฟนตัวท็อป ผ่อน 0% สูงสุด 24 เดือน',
          imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
          href: '/catalog?category=smartphone',
          itemCount: 12,
        },
        {
          title: 'Creator Laptops',
          subtitle: 'โน้ตบุ๊กสำหรับสายกราฟิกและตัดต่อ',
          imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
          href: '/catalog?category=laptop',
          itemCount: 8,
        },
      ],
    },
  },
  {
    type: 'TABBED_PRODUCTS',
    name: 'Tabbed Products',
    category: 'products',
    description: 'สินค้าแยกตามแท็บหมวดหมู่คลิกสลับได้ทันที',
    icon: '📑',
    defaultTitle: 'เลือกชมสินค้าตามหมวดหมู่',
    defaultConfig: {
      tabs: [
        { id: 'tab-1', label: 'สมาร์ทโฟน', dataSource: { type: 'category', value: 'smartphone' } },
        { id: 'tab-2', label: 'แท็บเล็ต', dataSource: { type: 'category', value: 'tablet' } },
        { id: 'tab-3', label: 'แล็ปท็อป', dataSource: { type: 'category', value: 'laptop' } },
      ],
    },
  },

  // 4. Promotions & Urgency
  {
    type: 'SALE_DEAL_SECTION',
    name: 'Flash Sale Deals',
    category: 'promotions',
    description: 'โซนลดราคาพิเศษแบบ Flash Deal พร้อมนับถอยหลังและ Progress Bar สินค้าคงเหลือ',
    icon: '⚡',
    defaultTitle: 'Flash Sale พิเศษเวลาจำกัด!',
    defaultConfig: {
      saleEndsAt: new Date(Date.now() + 86400000).toISOString(),
      products: [
        {
          productId: 'p-ip16pm',
          name: 'iPhone 16 Pro Max 256GB',
          originalPrice: 48900,
          salePrice: 44900,
          imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80',
          soldCount: 42,
          stockTotal: 50,
        },
        {
          productId: 'p-s25u',
          name: 'Samsung Galaxy S25 Ultra 512GB',
          originalPrice: 46900,
          salePrice: 40900,
          imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop&q=80',
          soldCount: 38,
          stockTotal: 45,
        },
      ],
    },
  },
  {
    type: 'COUNTDOWN_TIMER',
    name: 'Countdown Timer',
    category: 'promotions',
    description: 'นาฬิกานับถอยหลังโปรโมชั่น ดึงดูดความเร่งด่วน',
    icon: '⏱️',
    defaultTitle: 'โปรโมชั่นสิ้นสุดในอีก',
    defaultConfig: {
      headline: 'Mid-Month Super Mega Sale!',
      targetTimestamp: new Date(Date.now() + 172800000).toISOString(),
      expiredMessage: 'โปรโมชั่นนี้สิ้นสุดลงแล้ว ขอบคุณลูกค้าทุกท่าน',
      bgColor: '#0F172A',
      textColor: '#FFFFFF',
    },
  },
  {
    type: 'COUPON_VOUCHER_BLOCK',
    name: 'Coupon Voucher Block',
    category: 'promotions',
    description: 'คูปองโค้ดส่วนลดพร้อมปุ่มคลิกเพื่อคัดลอกทันที',
    icon: '🎟️',
    defaultTitle: 'คูปองส่วนลดพิเศษ',
    defaultConfig: {
      vouchers: [
        {
          code: 'MEEPRO500',
          discountText: 'ลดทันที ฿500',
          minimumSpendText: 'เมื่อช้อปครบ ฿10,000',
          expiryDateText: 'ใช้ได้ถึงสิ้นเดือนนี้',
        },
        {
          code: 'INSTALL0',
          discountText: 'ผ่อน 0% นาน 24 ด.',
          minimumSpendText: 'สำหรับบัตรเครดิตที่ร่วมรายการ',
          expiryDateText: 'เฉพาะสินค้าที่ร่วมรายการ',
        },
      ],
    },
  },
  {
    type: 'BUNDLE_OFFER',
    name: 'Bundle Offer',
    category: 'promotions',
    description: 'เซ็ตสินค้าราคาพิเศษซื้อคู่ประหยัดกว่า',
    icon: '🎁',
    defaultTitle: 'แพ็กเกจสุดคุ้ม ซื้อคู่ประหยัดกว่า',
    defaultConfig: {
      title: 'iPhone 16 Pro + AirPods Pro 2 Bundle',
      originalTotalPrice: 57890,
      bundlePrice: 51900,
      savingsText: 'ประหยัดทันที ฿5,990',
      products: [
        { name: 'iPhone 16 Pro Max 256GB', imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80' },
        { name: 'AirPods Pro (2nd Gen) USB-C', imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&auto=format&fit=crop&q=80' },
      ],
    },
  },

  // 5. Trust & Information
  {
    type: 'REVIEWS_TESTIMONIALS',
    name: 'Reviews & Testimonials',
    category: 'trust',
    description: 'รีวิวและความประทับใจจากลูกค้าจริง',
    icon: '⭐',
    defaultTitle: 'เสียงตอบรับจากลูกค้า MeePro',
    defaultConfig: {
      averageRating: 4.9,
      totalReviewsCount: 1580,
      reviews: [
        {
          author: 'คุณพัชราภรณ์ ว.',
          rating: 5,
          comment: 'สั่งซื้อ iPhone 16 Pro Max ได้รับของรวดเร็วมาก แพ็กเกจแน่นหนา บริการประทับใจ ผ่อน 0% สะดวกมากค่ะ',
          verifiedPurchase: true,
          dateText: '2 วันที่แล้ว',
        },
        {
          author: 'คุณณัฐพล ส.',
          rating: 5,
          comment: 'สินค้าแท้ศูนย์ไทย 100% ประกันเดินถูกต้อง เช็คเครื่องเรียบร้อยไม่มีตำหนิ แนะนำเลยครับ',
          verifiedPurchase: true,
          dateText: '5 วันที่แล้ว',
        },
      ],
    },
  },
  {
    type: 'TRUST_BADGES',
    name: 'Trust Badges',
    category: 'trust',
    description: 'สัญลักษณ์สร้างความมั่นใจ (ของแท้ 100%, ประกันศูนย์, ส่งฟรี)',
    icon: '🛡️',
    defaultTitle: 'มั่นใจทุกการช้อปที่ MeePro',
    defaultConfig: {
      badges: [
        { icon: 'shield', title: 'ของแท้ 100%', description: 'รับประกันสินค้าแท้จากแบรนด์โดยตรง' },
        { icon: 'truck', title: 'จัดส่งด่วนฟรี', description: 'ส่งฟรีทั่วประเทศ เมื่อมียอดซื้อ ฿1,000' },
        { icon: 'lock', title: 'ชำระเงินปลอดภัย', description: 'เข้ารหัสระดับธนาคาร 256-bit SSL' },
        { icon: 'refresh', title: 'เปลี่ยนคืนใน 7 วัน', description: 'หากพบปัญหาจากตัวเครื่อง เคลมใหม่ทันที' },
      ],
      layout: 'grid',
    },
  },
  {
    type: 'PAYMENT_OPTIONS',
    name: 'Payment Options',
    category: 'trust',
    description: 'ช่องทางการชำระเงินและพันธมิตรบัตรเครดิต',
    icon: '💳',
    defaultTitle: 'ช่องทางการชำระเงินที่รองรับ',
    defaultConfig: {
      heading: 'หลากหลายช่องทางการชำระเงิน พร้อมผ่อน 0%',
      options: [
        { name: 'บัตรเครดิต / เดบิต', icon: 'credit-card', description: 'Visa, Mastercard, JCB, UnionPay' },
        { name: 'สแกน QR พร้อมเพย์', icon: 'qr-code', description: 'สแกนจ่ายได้ทุกธนาคาร ฟรีค่าธรรมเนียม' },
        { name: 'ผ่อนชำระ 0%', icon: 'percent', description: 'ผ่อน 0% นานสูงสุด 24 เดือน กับธนาคารชั้นนำ' },
        { name: 'ทรูมันนี่ วอลเล็ท', icon: 'wallet', description: 'จ่ายสะดวก สะสมทรูพอยท์ได้' },
      ],
    },
  },
  {
    type: 'SHIPPING_RETURNS',
    name: 'Shipping & Returns Policy',
    category: 'trust',
    description: 'นโยบายการจัดส่งและเงื่อนไขการรับประกัน/เปลี่ยนคืนสินค้า',
    icon: '📦',
    defaultTitle: 'การจัดส่งและการรับประกัน',
    defaultConfig: {
      shippingTimeText: 'จัดส่งด่วน 1-2 วันทำการในเขตกทม. และ 2-3 วันสำหรับต่างจังหวัด',
      returnPolicyText: 'สามารถเปลี่ยนสินค้าได้ภายใน 7 วัน นับจากวันที่ได้รับสินค้าตามเงื่อนไขที่กำหนด',
      warrantyText: 'สินค้าทุกชิ้นรับประกันศูนย์ไทยแท้ 1-2 ปีตามนโยบายของผู้ผลิต',
    },
  },
  {
    type: 'FAQ_ACCORDION',
    name: 'FAQ Accordion',
    category: 'trust',
    description: 'คำถามที่พบบ่อยแบบเปิด-ปิดได้',
    icon: '❓',
    defaultTitle: 'คำถามที่พบบ่อย (FAQ)',
    defaultConfig: {
      items: [
        {
          question: 'สินค้าเป็นของแท้ศูนย์ไทยหรือไม่?',
          answer: 'สินค้าทุกชิ้นใน MeePro เป็นของแท้ 100% รับตรงจากผู้ผลิตและตัวแทนจำหน่ายอย่างเป็นทางการ มีประกันศูนย์ไทยเต็มรูปแบบ',
        },
        {
          question: 'เงื่อนไขการผ่อน 0% มีอะไรบ้าง?',
          answer: 'สามารถเลือกผ่อน 0% ได้นานสูงสุด 24 เดือน ผ่านบัตรเครดิตที่ร่วมรายการ เช่น KBank, SCB, KTC, BBL, Krungsri โดยมียอดสั่งซื้อขั้นต่ำ ฿3,000',
        },
        {
          question: 'ระยะเวลาจัดส่งสินค้านานเท่าไร?',
          answer: 'สำหรับพื้นที่กรุงเทพฯ และปริมณฑล จัดส่งภายใน 1-2 วันทำการ สำหรับต่างจังหวัด ใช้เวลา 2-3 วันทำการ',
        },
      ],
    },
  },

  // 6. Engagement & Support
  {
    type: 'STORE_LOCATOR',
    name: 'Store Locator & Branches',
    category: 'engagement',
    description: 'ค้นหาสาขาใกล้เคียงพร้อมเวลาเปิด-ปิดและเบอร์โทร',
    icon: '📍',
    defaultTitle: 'สาขา MeePro ใกล้คุณ',
    defaultConfig: {
      heading: 'แวะชมสินค้าจริงได้ที่หน้าร้าน MeePro ทุกสาขา',
      branches: [
        {
          name: 'MeePro สาขา สยามพารากอน',
          address: 'ชั้น 3 โซนเทคโนโลยี ศูนย์การค้าสยามพารากอน ปทุมวัน กทม.',
          phone: '02-123-4567',
          openingHours: '10:00 - 21:00 น. ทุกวัน',
        },
        {
          name: 'MeePro สาขา เซ็นทรัลเวิลด์',
          address: 'ชั้น 4 โซนดิจิทัล เซ็นทรัลเวิลด์ ราชประสงค์ กทม.',
          phone: '02-234-5678',
          openingHours: '10:00 - 22:00 น. ทุกวัน',
        },
      ],
    },
  },
  {
    type: 'SIGNUP_LEAD_FORM',
    name: 'Newsletter & VIP Signup',
    category: 'engagement',
    description: 'แบบฟอร์มลงทะเบียนรับสิทธิพิเศษและข่าวสาร VIP',
    icon: '✉️',
    defaultTitle: 'รับข่าวสารและสิทธิพิเศษ VIP',
    defaultConfig: {
      headline: 'สมัครสมาชิกรับคูปองส่วนลด ฿200 ทันที',
      subheadline: 'ไม่พลาดข่าวสารโปรโมชั่น Flash Sale และสินค้าเปิดตัวใหม่ก่อนใคร',
      ctaText: 'สมัครสมาชิกฟรี',
      placeholder: 'กรอกอีเมล หรือ เบอร์โทรศัพท์ของคุณ',
    },
  },
  {
    type: 'SOCIAL_MEDIA_FEED',
    name: 'Social Media Feed',
    category: 'engagement',
    description: 'ลิงก์ช่องทางโซเชียลมีเดียของแบรนด์',
    icon: '🌐',
    defaultTitle: 'ติดตามข่าวสาร MeePro',
    defaultConfig: {
      channels: [
        { platform: 'LINE Official', handle: '@meepro', url: 'https://line.me' },
        { platform: 'Facebook', handle: 'MeePro Thailand', url: 'https://facebook.com' },
        { platform: 'TikTok', handle: '@meepro_th', url: 'https://tiktok.com' },
        { platform: 'Instagram', handle: '@meepro.official', url: 'https://instagram.com' },
      ],
    },
  },
  {
    type: 'FLOATING_CHAT_BUTTON',
    name: 'Floating Chat Button',
    category: 'engagement',
    description: 'ปุ่มแชทติดต่อเจ้าหน้าที่แบบลอยมุมขวาล่าง',
    icon: '💬',
    defaultTitle: 'ปุ่มแชทด่วน',
    defaultConfig: {
      channel: 'both',
      lineUrl: 'https://line.me',
      telNumber: '02-000-0000',
      badgeText: 'ปรึกษาฟรี',
    },
  },
  {
    type: 'PROMO_POPUP_MODAL',
    name: 'Promo Popup Modal',
    category: 'engagement',
    description: 'ป๊อปอัปโปรโมชั่นพิเศษแสดงเมื่อลูกค้าเข้าชมหน้าเว็บ',
    icon: '🎁',
    defaultTitle: 'ป๊อปอัปข้อเสนอพิเศษ',
    defaultConfig: {
      imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
      headline: 'ข้อเสนอพิเศษประจำเดือน! ลดทันที ฿500',
      couponCode: 'SPECIAL500',
      actionHref: '/promotion',
      delaySeconds: 3,
    },
  },

  // 7. Layout & Embed
  {
    type: 'SPACER_DIVIDER',
    name: 'Spacer / Divider',
    category: 'layout',
    description: 'ช่องว่างคั่นระยะระหว่าง Widget หรือเส้นแบ่งส่วน',
    icon: '➖',
    defaultTitle: 'ช่องว่างคั่นระยะ',
    defaultConfig: {
      heightPx: 24,
      showDividerLine: false,
      lineColor: '#E2E8F0',
    },
  },
  {
    type: 'FOOTER',
    name: 'Page Footer',
    category: 'layout',
    description: 'ส่วนท้ายหน้าเว็บพร้อมข้อมูลลิขสิทธิ์และเบอร์ติดต่อ',
    icon: '📑',
    defaultTitle: 'ส่วนท้ายหน้าเว็บ',
    defaultConfig: {
      copyrightText: '© 2026 MeePro. All rights reserved.',
      hotline: '02-000-0000',
      disclaimerText: 'เงื่อนไขเป็นไปตามที่บริษัทฯ กำหนด',
      links: [
        { label: 'เกี่ยวกับเรา', href: '/about' },
        { label: 'ข้อกำหนดและเงื่อนไข', href: '/terms' },
        { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy' },
      ],
    },
  },
  {
    type: 'CUSTOM_EMBED',
    name: 'Custom Safe Embed',
    category: 'layout',
    description: 'ฝังโค้ด Iframe ที่ปลอดภัย เช่น YouTube หรือ Google Maps',
    icon: '💻',
    defaultTitle: 'ฝังเนื้อหาปลอดภัย',
    defaultConfig: {
      embedCode: '<iframe width="100%" height="240" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="MeePro Video" frameborder="0" allowfullscreen></iframe>',
      sandbox: true,
      allowedDomains: ['youtube.com', 'google.com/maps'],
    },
  },
];
