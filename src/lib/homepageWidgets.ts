import { AnyWidget } from "@/types/widget";

export const DEFAULT_HOMEPAGE_WIDGETS: AnyWidget[] = [
  {
    id: "HOME-0001",
    type: "CUSTOMER_GREETING",
    title: "ข้อมูลสมาชิก",
    sortOrder: 1,
    isActive: true,
    defaultPoints: 450,
    membershipTier: "Gold",
  },
  {
    id: "HOME-0002",
    type: "HERO_BANNER",
    title: "แบนเนอร์หลัก",
    sortOrder: 2,
    isActive: true,
    autoSlideIntervalMs: 4000,
    banners: [
      {
        id: "b-1",
        imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80",
        title: "iPhone 16 Pro Max เปิดตัวแล้ววันนี้",
        tag: "โปรเปิดตัวสุดเอ็กซ์คลูซีฟ",
        linkUrl: "/catalog?category=smartphone",
        bgColor: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)",
        textColor: "#FFFFFF",
      },
      {
        id: "b-2",
        imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80",
        title: "Galaxy S25 Ultra รับส่วนลดสูงสุด ฿8,000",
        tag: "Flash Deal ประจำสัปดาห์",
        linkUrl: "/promotion",
        bgColor: "linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #6366F1 100%)",
        textColor: "#FFFFFF",
      },
      {
        id: "b-3",
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
        title: "แล็ปท็อป & แท็บเล็ต ผ่อน 0% ทุกรุ่น",
        tag: "Back to School & Work",
        linkUrl: "/promotion",
        bgColor: "linear-gradient(135deg, #064E3B 0%, #059669 50%, #10B981 100%)",
        textColor: "#FFFFFF",
      },
    ],
  },
  {
    id: "HOME-0003",
    type: "CATEGORY_GRID",
    title: "หมวดหมู่ยอดนิยม",
    sortOrder: 3,
    isActive: true,
    categories: [
      {
        id: "c-1",
        name: "สมาร์ทโฟน",
        icon: "smartphone",
        iconBg: "rgba(37, 99, 235, 0.12)",
        linkUrl: "/catalog?category=smartphone",
        badge: "HOT",
      },
      {
        id: "c-2",
        name: "แท็บเล็ต",
        icon: "tablet",
        iconBg: "rgba(124, 58, 237, 0.12)",
        linkUrl: "/catalog?category=tablet",
      },
      {
        id: "c-3",
        name: "แล็ปท็อป",
        icon: "laptop",
        iconBg: "rgba(14, 165, 233, 0.12)",
        linkUrl: "/catalog?category=laptop",
      },
      {
        id: "c-4",
        name: "สมาร์ทวอทช์",
        icon: "watch",
        iconBg: "rgba(249, 115, 22, 0.12)",
        linkUrl: "/catalog?category=watch",
      },
      {
        id: "c-5",
        name: "หูฟัง & ลำโพง",
        icon: "audio",
        iconBg: "rgba(16, 185, 129, 0.12)",
        linkUrl: "/catalog?category=audio",
      },
      {
        id: "c-6",
        name: "อุปกรณ์เสริม",
        icon: "accessory",
        iconBg: "rgba(236, 72, 153, 0.12)",
        linkUrl: "/catalog?category=accessory",
        badge: "ใหม่",
      },
    ],
  },
  {
    id: "HOME-0004",
    type: "PRODUCT_SHOWCASE",
    title: "ลดพิเศษ",
    subtitle: "โปรแรงลดกระหน่ำ จำนวนจำกัด",
    sortOrder: 4,
    isActive: true,
    viewAllLink: "/promotion",
    slidesCount: 3,
    itemsPerSlide: 2,
    products: [
      {
        id: "p-1",
        name: "iPhone 16 Pro 128GB",
        imageUrl: "📱",
        originalPrice: 39900,
        promoPrice: 36900,
        discountPercent: 8,
        installmentMonths: 10,
        badge: "ลด ฿3,000",
        inStock: true,
      },
      {
        id: "p-2",
        name: "Samsung Galaxy S25 256GB",
        imageUrl: "📱",
        originalPrice: 33900,
        promoPrice: 29900,
        discountPercent: 12,
        installmentMonths: 10,
        badge: "ลด ฿4,000",
        inStock: true,
      },
      {
        id: "p-3",
        name: "iPad Air 11-inch M2 Wi-Fi",
        imageUrl: "📲",
        originalPrice: 23900,
        promoPrice: 21500,
        discountPercent: 10,
        installmentMonths: 10,
        badge: "ลด 10%",
        inStock: true,
      },
      {
        id: "p-4",
        name: "Xiaomi 15 Ultra 512GB",
        imageUrl: "📱",
        originalPrice: 35900,
        promoPrice: 31900,
        discountPercent: 11,
        installmentMonths: 10,
        badge: "คุ้มสุด",
        inStock: true,
      },
      {
        id: "p-5",
        name: "AirPods Pro 2 USB-C",
        imageUrl: "🎧",
        originalPrice: 8990,
        promoPrice: 7490,
        discountPercent: 17,
        installmentMonths: 6,
        badge: "ลด 17%",
        inStock: true,
      },
      {
        id: "p-6",
        name: "Galaxy Watch 7 Bluetooth",
        imageUrl: "⌚",
        originalPrice: 10900,
        promoPrice: 8900,
        discountPercent: 18,
        installmentMonths: 6,
        badge: "ลด 18%",
        inStock: true,
      },
    ],
  },
  {
    id: "HOME-0005",
    type: "CAMPAIGN_BANNER",
    title: "แคมเปญพิเศษ",
    sortOrder: 5,
    isActive: true,
    banner: {
      id: "camp-1",
      title: "ผ่อนสบาย 0% นานสูงสุด 10 เดือน",
      description: "เมื่อช้อปสินค้าครบ 3,000 บาทขึ้นไป ผ่านบัตรเครดิตที่ร่วมรายการ พร้อมรับเครดิตเงินคืน",
      tag: "สิทธิพิเศษสมาชิก MeePro",
      buttonText: "เช็คสิทธิ์บัตรเครดิต",
      linkUrl: "/promotion",
      gradient: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
    },
  },
  {
    id: "HOME-0006",
    type: "PRODUCT_SHOWCASE",
    title: "สินค้าแนะนำ",
    subtitle: "คัดสรรรุ่นยอดนิยมเพื่อคุณโดยเฉพาะ",
    sortOrder: 6,
    isActive: true,
    viewAllLink: "/catalog",
    slidesCount: 3,
    itemsPerSlide: 2,
    products: [
      {
        id: "p-7",
        name: "MacBook Air 13 M3 256GB",
        imageUrl: "💻",
        originalPrice: 39900,
        promoPrice: 37900,
        discountPercent: 5,
        installmentMonths: 10,
        badge: "แนะนำ",
        inStock: true,
      },
      {
        id: "p-8",
        name: "Sony WH-1000XM5 ANC",
        imageUrl: "🎧",
        originalPrice: 14990,
        promoPrice: 11990,
        discountPercent: 20,
        installmentMonths: 6,
        badge: "ยอดนิยม",
        inStock: true,
      },
      {
        id: "p-9",
        name: "OPPO Find X8 Pro 5G",
        imageUrl: "📱",
        originalPrice: 34990,
        promoPrice: 31990,
        discountPercent: 9,
        installmentMonths: 10,
        badge: "กล้องเทเล 2 ตัว",
        inStock: true,
      },
      {
        id: "p-10",
        name: "vivo X200 Pro Zeiss 5G",
        imageUrl: "📱",
        originalPrice: 39990,
        promoPrice: 36990,
        discountPercent: 8,
        installmentMonths: 10,
        badge: "Zeiss Lens",
        inStock: true,
      },
      {
        id: "p-11",
        name: "Apple Watch Series 10",
        imageUrl: "⌚",
        originalPrice: 14900,
        promoPrice: 13900,
        discountPercent: 7,
        installmentMonths: 10,
        badge: "บางที่สุด",
        inStock: true,
      },
      {
        id: "p-12",
        name: "Marshall Stanmore III",
        imageUrl: "📻",
        originalPrice: 17990,
        promoPrice: 15490,
        discountPercent: 14,
        installmentMonths: 6,
        badge: "เสียงพรีเมียม",
        inStock: true,
      },
    ],
  },
  {
    id: "HOME-0007",
    type: "BRAND_SHOWCASE",
    title: "แบรนด์ชั้นนำที่เป็นพันธมิตร",
    subtitle: "ของแท้ 100% ประกันศูนย์ไทยทุกชิ้น",
    sortOrder: 7,
    isActive: true,
    brands: [
      { id: "b-apple", name: "Apple", logo: "🍎", tagline: "Official Partner", linkUrl: "/catalog?brand=apple" },
      { id: "b-samsung", name: "Samsung", logo: "✨", tagline: "Galaxy Experience", linkUrl: "/catalog?brand=samsung" },
      { id: "b-xiaomi", name: "Xiaomi", logo: "🟧", tagline: "Smart Living", linkUrl: "/catalog?brand=xiaomi" },
      { id: "b-oppo", name: "OPPO", logo: "🟢", tagline: "Inspiration Ahead", linkUrl: "/catalog?brand=oppo" },
      { id: "b-vivo", name: "vivo", logo: "🔷", tagline: "Joy in Camera", linkUrl: "/catalog?brand=vivo" },
      { id: "b-sony", name: "Sony", logo: "🎵", tagline: "Premium Audio", linkUrl: "/catalog?brand=sony" },
    ],
  },
];

const STORAGE_KEY = "meepro_homepage_widgets_v1";

export function getHomepageWidgets(): AnyWidget[] {
  if (typeof window === "undefined") return DEFAULT_HOMEPAGE_WIDGETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HOMEPAGE_WIDGETS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Migrate any empty banner images so banners are never blank
      const migrated = parsed.map((w: any) => {
        if (w.type === 'HERO_BANNER' || w.type === 'BANNER_CAROUSEL') {
          const banners = w.banners || w.config?.banners;
          if (Array.isArray(banners)) {
            const fallbackImages = [
              'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
              'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80',
              'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
            ];
            const updatedBanners = banners.map((b: any, i: number) => {
              if (!b.imageUrl || b.imageUrl.trim() === '') {
                return { ...b, imageUrl: fallbackImages[i % fallbackImages.length] };
              }
              return b;
            });
            return {
              ...w,
              banners: updatedBanners,
              config: { ...(w.config || {}), banners: updatedBanners },
            };
          }
        }
        return w;
      });
      return migrated.sort((a, b) => a.sortOrder - b.sortOrder);
    }
  } catch (err) {
    console.error("Failed to load widgets from storage:", err);
  }
  return DEFAULT_HOMEPAGE_WIDGETS;
}

export function saveHomepageWidgets(widgets: AnyWidget[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  } catch (err) {
    console.error("Failed to save widgets to storage:", err);
  }
}

export function resetHomepageWidgets(): AnyWidget[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_HOMEPAGE_WIDGETS;
}
