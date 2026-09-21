export type WidgetType =
  | 'CUSTOMER_GREETING'
  | 'HERO_BANNER'
  | 'CATEGORY_GRID'
  | 'PRODUCT_SHOWCASE'
  | 'CAMPAIGN_BANNER'
  | 'BRAND_SHOWCASE';

export interface BaseWidget {
  id: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  sortOrder: number;
  isActive: boolean;
  viewAllLink?: string;
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
  banners: BannerItem[];
  autoSlideIntervalMs?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  linkUrl: string;
  badge?: string;
}

export interface CategoryGridWidget extends BaseWidget {
  type: 'CATEGORY_GRID';
  categories: CategoryItem[];
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
  products: ProductItem[]; // Exactly 6 products for 2x3 slides layout (Sec 12.1)
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
  tagline: string;
  linkUrl: string;
}

export interface BrandShowcaseWidget extends BaseWidget {
  type: 'BRAND_SHOWCASE';
  brands: BrandItem[];
}

export interface CustomerGreetingWidget extends BaseWidget {
  type: 'CUSTOMER_GREETING';
  defaultPoints?: number;
  membershipTier?: 'Member' | 'Silver' | 'Gold' | 'Platinum';
}

export type AnyWidget =
  | CustomerGreetingWidget
  | HeroBannerWidget
  | CategoryGridWidget
  | ProductShowcaseWidget
  | CampaignBannerWidget
  | BrandShowcaseWidget;
