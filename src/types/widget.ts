export type WidgetType =
  // 1. Navigation & Header
  | 'HEADER_LOGO'
  | 'ANNOUNCEMENT_BAR'
  | 'SEARCH_BAR'
  | 'CATEGORY_NAV'
  | 'STICKY_BOTTOM_NAV'
  // 2. Banners & Content
  | 'HERO_BANNER'
  | 'BANNER_CAROUSEL'
  | 'IMAGE_GRID'
  | 'VIDEO_PLAYER'
  | 'RICH_TEXT'
  | 'IMAGE_WITH_TEXT'
  | 'CTA_BUTTON'
  // Legacy / Existing
  | 'CUSTOMER_GREETING'
  | 'CATEGORY_GRID'
  | 'PRODUCT_SHOWCASE'
  | 'CAMPAIGN_BANNER'
  | 'BRAND_SHOWCASE'
  // 7. Layout & Embed
  | 'SPACER_DIVIDER'
  | 'FOOTER'
  | 'CUSTOM_EMBED'
  // General / Generic
  | string;

export interface BaseWidget {
  id: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  sortOrder: number;
  isActive: boolean;
  viewAllLink?: string;
  config?: Record<string, any>;
}

export interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
  tag?: string;
  linkUrl: string;
  bgColor?: string;
  textColor?: string;
}

export interface HeroBannerWidget extends BaseWidget {
  type: 'HERO_BANNER';
  banners?: BannerItem[];
  headline?: string;
  subheadline?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  tag?: string;
  ctaLabel?: string;
  ctaHref?: string;
  autoSlideIntervalMs?: number;
}

export interface AnnouncementBarWidget extends BaseWidget {
  type: 'ANNOUNCEMENT_BAR';
  text?: string;
  linkHref?: string;
  bgColor?: string;
  textColor?: string;
  isClosable?: boolean;
}

export interface SearchBarWidget extends BaseWidget {
  type: 'SEARCH_BAR';
  placeholder?: string;
  popularKeywords?: string[];
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  iconBg?: string;
  linkUrl: string;
  badge?: string;
}

export interface CategoryGridWidget extends BaseWidget {
  type: 'CATEGORY_GRID';
  categories: CategoryItem[];
}

export interface CategoryNavWidget extends BaseWidget {
  type: 'CATEGORY_NAV';
  categories?: { id: string; label: string; icon: string; href: string }[];
}

export interface ProductItem {
  id: string;
  name: string;
  imageUrl: string;
  originalPrice: number;
  promoPrice: number;
  discountPercent: number;
  installmentMonths?: number;
  badge?: string;
  inStock?: boolean;
  category?: string;
}

export interface ProductShowcaseWidget extends BaseWidget {
  type: 'PRODUCT_SHOWCASE';
  products: ProductItem[];
  slidesCount?: number;
  itemsPerSlide?: number;
}

export interface CampaignBannerWidget extends BaseWidget {
  type: 'CAMPAIGN_BANNER';
  banner: {
    id: string;
    imageUrl?: string;
    title: string;
    description: string;
    tag: string;
    buttonText: string;
    linkUrl: string;
    gradient: string;
  };
}

export interface BrandItem {
  id: string;
  name: string;
  logo: string;
  tagline?: string;
  linkUrl: string;
}

export interface BrandShowcaseWidget extends BaseWidget {
  type: 'BRAND_SHOWCASE';
  brands: BrandItem[];
}

export interface CustomerGreetingWidget extends BaseWidget {
  type: 'CUSTOMER_GREETING';
  defaultPoints?: number;
  membershipTier?: 'Member' | 'Silver' | 'Gold' | 'Platinum' | string;
  showMembership?: boolean;
  showPoints?: boolean;
}

export interface BannerCarouselWidget extends BaseWidget {
  type: 'BANNER_CAROUSEL';
  autoPlayInterval?: number;
  slides?: {
    headline: string;
    subheadline?: string;
    imageUrl: string;
    tag?: string;
    ctaLabel?: string;
    ctaHref?: string;
  }[];
}

export interface ImageGridWidget extends BaseWidget {
  type: 'IMAGE_GRID';
  columns?: number;
  images?: {
    imageUrl: string;
    title?: string;
    subtitle?: string;
    href?: string;
    spanCols?: number;
  }[];
}

export interface VideoPlayerWidget extends BaseWidget {
  type: 'VIDEO_PLAYER';
  videoUrl?: string;
  thumbnailUrl?: string;
  caption?: string;
}

export interface RichTextWidget extends BaseWidget {
  type: 'RICH_TEXT';
  contentHtml?: string;
  align?: 'left' | 'center' | 'right';
}

export interface ImageWithTextWidget extends BaseWidget {
  type: 'IMAGE_WITH_TEXT';
  imageUrl?: string;
  imagePosition?: 'left' | 'right';
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface CtaButtonWidget extends BaseWidget {
  type: 'CTA_BUTTON';
  label?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export interface SpacerDividerWidget extends BaseWidget {
  type: 'SPACER_DIVIDER';
  heightPx?: number;
  showDividerLine?: boolean;
}

export interface FooterWidget extends BaseWidget {
  type: 'FOOTER';
  copyrightText?: string;
  hotline?: string;
  disclaimerText?: string;
  links?: { label: string; href: string }[];
}

export interface CustomEmbedWidget extends BaseWidget {
  type: 'CUSTOM_EMBED';
  embedCode?: string;
}

export type AnyWidget = BaseWidget & Record<string, any>;
