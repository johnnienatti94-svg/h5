/**
 * MeePro CMS v2.1 — Runtime Zod Validation Schemas for Widget Configurations
 * Specification Reference: MeePro_Project_Update_v2.1.md Section 5 & 6
 */

import { z } from 'zod';

// ============================================================================
// 1. Common Sub-Schemas
// ============================================================================

export const dataSourceSchema = z.object({
  type: z.enum([
    'manual',
    'category',
    'brand',
    'collection',
    'promotion',
    'search_query',
    'recently_viewed',
    'recommended',
  ]),
  targetId: z.string().optional(),
  query: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(6),
  sortBy: z.enum(['default', 'price_asc', 'price_desc', 'popularity', 'newest']).default('default'),
});

export const actionLinkSchema = z.object({
  label: z.string().max(60).optional(),
  href: z.string().max(255).default('#'),
  isExternal: z.boolean().default(false),
});

// ============================================================================
// 2. Header & Navigation Schemas
// ============================================================================

export const headerLogoSchema = z.object({
  logoUrl: z.string().default('/logo.jpg'),
  brandName: z.string().default('มีโปรโฟน'),
  mallBadgeText: z.string().default('MALL'),
  showMallBadge: z.boolean().default(true),
  showNotificationBell: z.boolean().default(true),
  showCartButton: z.boolean().default(true),
});

export const announcementBarSchema = z.object({
  text: z.string().min(1).max(200),
  linkHref: z.string().optional(),
  bgColor: z.string().default('#007ACC'),
  textColor: z.string().default('#FFFFFF'),
  isClosable: z.boolean().default(false),
});

export const searchBarSchema = z.object({
  placeholder: z.string().default('ค้นหาสมาร์ตโฟน, แท็บเล็ต, แกดเจ็ต...'),
  enableLiveSuggest: z.boolean().default(true),
  popularKeywords: z.array(z.string()).default(['iPhone 16', 'iPad Pro', 'Galaxy S25', 'Xiaomi 15']),
});

export const categoryNavSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      icon: z.string(),
      href: z.string(),
    })
  ).min(1),
});

export const stickyBottomNavSchema = z.object({
  items: z.array(
    z.object({
      label: z.string(),
      route: z.string(),
      icon: z.string(),
      badge: z.string().optional(),
    })
  ).length(5),
});

// ============================================================================
// 3. Banners & Content Schemas
// ============================================================================

export const heroBannerSchema = z.object({
  headline: z.string().max(120).optional(),
  subheadline: z.string().max(200).optional(),
  tag: z.string().max(40).optional(),
  imageUrl: z.string().optional(),
  mobileImageUrl: z.string().optional(),
  ctaLabel: z.string().max(40).optional(),
  ctaHref: z.string().optional(),
  overlayColor: z.string().optional(),
  banners: z.array(z.any()).optional(),
  autoSlideIntervalMs: z.number().optional(),
}).passthrough();

export const bannerCarouselSchema = z.object({
  autoPlayInterval: z.number().int().min(2000).max(15000).default(4000),
  slides: z.array(heroBannerSchema).min(1),
});

export const imageGridSchema = z.object({
  columns: z.number().int().min(1).max(4).default(2),
  gap: z.number().int().default(12),
  images: z.array(
    z.object({
      imageUrl: z.string(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      href: z.string().optional(),
      spanCols: z.number().int().min(1).max(2).default(1),
    })
  ).min(1),
});

export const videoPlayerSchema = z.object({
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().optional(),
  autoPlay: z.boolean().default(false),
  loop: z.boolean().default(false),
  caption: z.string().max(150).optional(),
});

export const richTextSchema = z.object({
  contentHtml: z.string(),
  align: z.enum(['left', 'center', 'right']).default('left'),
});

export const imageWithTextSchema = z.object({
  imageUrl: z.string(),
  imagePosition: z.enum(['left', 'right']).default('left'),
  title: z.string().max(120),
  body: z.string(),
  ctaLabel: z.string().max(40).optional(),
  ctaHref: z.string().optional(),
});

export const ctaButtonSchema = z.object({
  label: z.string().min(1).max(60),
  href: z.string(),
  variant: z.enum(['primary', 'secondary', 'outline', 'destructive']).default('primary'),
  size: z.enum(['sm', 'md', 'lg']).default('md'),
  isFullWidth: z.boolean().default(true),
});

// ============================================================================
// 4. Product Browsing Schemas
// ============================================================================

export const productGridSchema = z.object({
  dataSource: dataSourceSchema,
  columnsMobile: z.number().int().default(2),
  columnsDesktop: z.number().int().default(4),
  showInstallmentBadge: z.boolean().default(true),
  showAddToCartQuickBtn: z.boolean().default(true),
});

export const productCarouselSchema = z.object({
  dataSource: dataSourceSchema,
  showInstallmentBadge: z.boolean().default(true),
  itemsPerViewMobile: z.number().default(2),
  itemsPerViewDesktop: z.number().default(4),
});

export const featuredProductSchema = z.object({
  productId: z.string(),
  spotlightBadge: z.string().default('FLAGSHIP DEAL'),
  keySpecs: z.array(z.string()).optional(),
  specialPromoNote: z.string().optional(),
});

export const collectionTilesSchema = z.object({
  tiles: z.array(
    z.object({
      title: z.string(),
      itemCountText: z.string().optional(),
      imageUrl: z.string(),
      href: z.string(),
    })
  ).min(1),
});

export const tabbedProductsSchema = z.object({
  tabs: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      dataSource: dataSourceSchema,
    })
  ).min(2),
});

export const brandShowcaseSchema = z.object({
  brands: z.array(
    z.object({
      name: z.string(),
      logoUrl: z.string().optional(),
      href: z.string(),
    })
  ).min(1),
});

export const recentlyViewedSchema = z.object({
  maxItems: z.number().int().min(1).max(12).default(6),
  emptyMessage: z.string().default('ยังไม่มีประวัติสินค้าที่เข้าชม'),
});

export const recommendedProductsSchema = z.object({
  algorithm: z.enum(['trending', 'collaborative', 'similar']).default('trending'),
  limit: z.number().int().min(1).max(20).default(6),
});

// ============================================================================
// 5. Promotions & Urgency Schemas
// ============================================================================

export const saleDealSectionSchema = z.object({
  bannerTitle: z.string().default('Flash Deals ด่วนพิเศษ'),
  expiresAt: z.string().datetime().optional(),
  dataSource: dataSourceSchema,
});

export const countdownTimerSchema = z.object({
  targetDate: z.string(),
  headline: z.string().default('โปรโมชั่นสิ้นสุดในอีก'),
  expiredMessage: z.string().default('โปรโมชั่นหมดเวลาแล้ว'),
});

export const couponVoucherBlockSchema = z.object({
  vouchers: z.array(
    z.object({
      code: z.string().min(3).max(20),
      discountAmountText: z.string(),
      minSpendText: z.string().optional(),
      expiresText: z.string().optional(),
    })
  ).min(1),
});

export const bundleOfferSchema = z.object({
  title: z.string(),
  originalTotalPrice: z.number().positive(),
  bundlePrice: z.number().positive(),
  savingsText: z.string(),
  products: z.array(
    z.object({
      name: z.string(),
      imageUrl: z.string(),
    })
  ).min(2),
});

export const shoppableImageSchema = z.object({
  imageUrl: z.string(),
  hotspots: z.array(
    z.object({
      xPercent: z.number().min(0).max(100),
      yPercent: z.number().min(0).max(100),
      productName: z.string(),
      price: z.number().positive(),
      href: z.string(),
    })
  ).min(1),
});

// ============================================================================
// 6. Trust & Information Schemas
// ============================================================================

export const reviewsTestimonialsSchema = z.object({
  averageRating: z.number().min(1).max(5).default(4.9),
  totalReviewsCount: z.number().int().default(1580),
  reviews: z.array(
    z.object({
      author: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string(),
      verifiedPurchase: z.boolean().default(true),
      dateText: z.string().optional(),
    })
  ).min(1),
});

export const trustBadgesSchema = z.object({
  badges: z.array(
    z.object({
      icon: z.string(),
      title: z.string(),
      description: z.string().optional(),
    })
  ).min(1),
});

export const paymentOptionsSchema = z.object({
  title: z.string().default('ช่องทางการชำระเงิน & ผ่อน 0%'),
  acceptedBanks: z.array(z.string()).default(['KBank', 'SCB', 'Krungthai', 'BBL', 'TTB']),
  installmentTerms: z.string().default('ผ่อน 0% สูงสุด 10 เดือน รู้ผลอนุมัติไวใน 3 นาที'),
});

export const shippingReturnsSchema = z.object({
  deliveryDaysText: z.string().default('จัดส่งด่วนทั่วไทย 1-3 วันทำการ'),
  freeShippingMinAmount: z.number().default(0),
  returnPolicyText: z.string().default('เปลี่ยนเครื่องใหม่ภายใน 7 วันหากมีปัญหาจากการผลิต'),
});

export const faqAccordionSchema = z.object({
  items: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    })
  ).min(1),
});

export const storeLocatorSchema = z.object({
  title: z.string().default('ค้นหาสาขาใกล้คุณ (45 สาขาทั่วประเทศ)'),
  mapEmbedUrl: z.string().optional(),
  featuredBranches: z.array(
    z.object({
      name: z.string(),
      address: z.string(),
      phone: z.string(),
      hours: z.string(),
    })
  ).optional(),
});

// ============================================================================
// 7. Engagement & Support Schemas
// ============================================================================

export const signupLeadFormSchema = z.object({
  title: z.string().default('สมัครเช็กวงเงินผ่อนล่วงหน้า'),
  subtitle: z.string().default('กรอกเบอร์โทรเพื่อรับวงเงินพร้อมใช้สูงสุด ฿50,000'),
  ctaButtonText: z.string().default('ตรวจสอบวงเงินทันที'),
});

export const socialMediaFeedSchema = z.object({
  platform: z.enum(['instagram', 'tiktok', 'facebook']).default('instagram'),
  posts: z.array(
    z.object({
      imageUrl: z.string(),
      caption: z.string().optional(),
      postUrl: z.string().optional(),
    })
  ).min(1),
});

export const floatingChatButtonSchema = z.object({
  channels: z.array(
    z.object({
      name: z.string(),
      icon: z.string(),
      linkUrl: z.string(),
    })
  ).min(1),
});

export const promoPopupModalSchema = z.object({
  imageUrl: z.string(),
  headline: z.string().optional(),
  couponCode: z.string().optional(),
  actionHref: z.string().default('#'),
  delaySeconds: z.number().int().min(1).max(30).default(3),
});

// ============================================================================
// 8. Layout & Embed Schemas
// ============================================================================

export const spacerDividerSchema = z.object({
  heightPx: z.number().int().min(4).max(120).default(24),
  showDividerLine: z.boolean().default(false),
  lineColor: z.string().default('#E2E8F0'),
});

export const footerSchema = z.object({
  copyrightText: z.string().default('© 2026 MeePro. All rights reserved.'),
  hotline: z.string().default('02-000-0000'),
  disclaimerText: z.string().optional(),
  links: z.array(
    z.object({
      label: z.string(),
      href: z.string(),
    })
  ).default([]),
});

export const customEmbedSchema = z.object({
  embedCode: z.string()
    .refine((val) => !val.includes('<script') && !val.includes('javascript:'), {
      message: 'Script tags and inline javascript are prohibited in custom embeds for security reasons.',
    }),
  sandbox: z.boolean().default(true),
  allowedDomains: z.array(z.string()).default(['youtube.com', 'google.com/maps']),
});

// ============================================================================
// 9. Master Registry & Runtime Validation Dispatcher
// ============================================================================

export const WIDGET_SCHEMAS: Record<string, z.ZodTypeAny> = {
  HEADER_LOGO: headerLogoSchema,
  ANNOUNCEMENT_BAR: announcementBarSchema,
  SEARCH_BAR: searchBarSchema,
  CATEGORY_NAV: categoryNavSchema,
  STICKY_BOTTOM_NAV: stickyBottomNavSchema,
  HERO_BANNER: heroBannerSchema,
  BANNER_CAROUSEL: bannerCarouselSchema,
  IMAGE_GRID: imageGridSchema,
  VIDEO_PLAYER: videoPlayerSchema,
  RICH_TEXT: richTextSchema,
  IMAGE_WITH_TEXT: imageWithTextSchema,
  CTA_BUTTON: ctaButtonSchema,
  PRODUCT_GRID: productGridSchema,
  PRODUCT_CAROUSEL: productCarouselSchema,
  FEATURED_PRODUCT: featuredProductSchema,
  COLLECTION_TILES: collectionTilesSchema,
  TABBED_PRODUCTS: tabbedProductsSchema,
  BRAND_SHOWCASE: brandShowcaseSchema,
  RECENTLY_VIEWED: recentlyViewedSchema,
  RECOMMENDED_PRODUCTS: recommendedProductsSchema,
  SALE_DEAL_SECTION: saleDealSectionSchema,
  COUNTDOWN_TIMER: countdownTimerSchema,
  COUPON_VOUCHER_BLOCK: couponVoucherBlockSchema,
  BUNDLE_OFFER: bundleOfferSchema,
  SHOPPABLE_IMAGE: shoppableImageSchema,
  REVIEWS_TESTIMONIALS: reviewsTestimonialsSchema,
  TRUST_BADGES: trustBadgesSchema,
  PAYMENT_OPTIONS: paymentOptionsSchema,
  SHIPPING_RETURNS: shippingReturnsSchema,
  FAQ_ACCORDION: faqAccordionSchema,
  STORE_LOCATOR: storeLocatorSchema,
  SIGNUP_LEAD_FORM: signupLeadFormSchema,
  SOCIAL_MEDIA_FEED: socialMediaFeedSchema,
  FLOATING_CHAT_BUTTON: floatingChatButtonSchema,
  PROMO_POPUP_MODAL: promoPopupModalSchema,
  SPACER_DIVIDER: spacerDividerSchema,
  FOOTER: footerSchema,
  CUSTOM_EMBED: customEmbedSchema,
};

/**
 * Validates a widget configuration against its registered Zod schema at runtime.
 */
export function validateWidgetConfig(
  widgetType: string,
  config: unknown
): { isValid: boolean; data?: any; error?: string } {
  const schema = WIDGET_SCHEMAS[widgetType.toUpperCase()];
  if (!schema) {
    // If widget type not strictly registered yet, allow generic object
    return { isValid: true, data: config };
  }

  const result = schema.safeParse(config);
  if (result.success) {
    return { isValid: true, data: result.data };
  }

  return {
    isValid: false,
    error: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
  };
}
