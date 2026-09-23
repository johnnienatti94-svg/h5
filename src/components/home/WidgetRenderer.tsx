'use client';

import React from 'react';
import { AnyWidget } from '@/types/widget';
import CustomerGreetingWidget from './CustomerGreetingWidget';
import HeroBannerWidget from './HeroBannerWidget';
import CategoryGridWidget from './CategoryGridWidget';
import ProductShowcaseWidget from './ProductShowcaseWidget';
import CampaignBannerWidget from './CampaignBannerWidget';
import BrandShowcaseWidget from './BrandShowcaseWidget';

// Phase 4: Core Content & Global Layout Widgets
import AnnouncementBarWidget from '@/components/widgets/AnnouncementBarWidget';
import SearchBarWidget from '@/components/widgets/SearchBarWidget';
import CategoryNavWidget from '@/components/widgets/CategoryNavWidget';
import BannerCarouselWidget from '@/components/widgets/BannerCarouselWidget';
import ImageGridWidget from '@/components/widgets/ImageGridWidget';
import VideoPlayerWidget from '@/components/widgets/VideoPlayerWidget';
import RichTextWidget from '@/components/widgets/RichTextWidget';
import ImageWithTextWidget from '@/components/widgets/ImageWithTextWidget';
import CtaButtonWidget from '@/components/widgets/CtaButtonWidget';
import SpacerDividerWidget from '@/components/widgets/SpacerDividerWidget';
import FooterWidget from '@/components/widgets/FooterWidget';
import CustomEmbedWidget from '@/components/widgets/CustomEmbedWidget';

// Phase 5: Product Browsing & Promotion Widgets
import ProductGridWidget from '@/components/widgets/ProductGridWidget';
import ProductCarouselWidget from '@/components/widgets/ProductCarouselWidget';
import FeaturedProductWidget from '@/components/widgets/FeaturedProductWidget';
import CollectionTilesWidget from '@/components/widgets/CollectionTilesWidget';
import TabbedProductsWidget from '@/components/widgets/TabbedProductsWidget';
import RecentlyViewedWidget from '@/components/widgets/RecentlyViewedWidget';
import RecommendedProductsWidget from '@/components/widgets/RecommendedProductsWidget';
import SaleDealSectionWidget from '@/components/widgets/SaleDealSectionWidget';
import CountdownTimerWidget from '@/components/widgets/CountdownTimerWidget';
import CouponVoucherBlockWidget from '@/components/widgets/CouponVoucherBlockWidget';
import BundleOfferWidget from '@/components/widgets/BundleOfferWidget';
import ShoppableImageWidget from '@/components/widgets/ShoppableImageWidget';

// Phase 6: Trust, Information & Engagement Widgets
import ReviewsTestimonialsWidget from '@/components/widgets/ReviewsTestimonialsWidget';
import TrustBadgesWidget from '@/components/widgets/TrustBadgesWidget';
import PaymentOptionsWidget from '@/components/widgets/PaymentOptionsWidget';
import ShippingReturnsWidget from '@/components/widgets/ShippingReturnsWidget';
import FaqAccordionWidget from '@/components/widgets/FaqAccordionWidget';
import StoreLocatorWidget from '@/components/widgets/StoreLocatorWidget';
import SignupLeadFormWidget from '@/components/widgets/SignupLeadFormWidget';
import SocialMediaFeedWidget from '@/components/widgets/SocialMediaFeedWidget';
import FloatingChatButtonWidget from '@/components/widgets/FloatingChatButtonWidget';
import PromoPopupModalWidget from '@/components/widgets/PromoPopupModalWidget';

interface Props {
  widgets: AnyWidget[];
}

export default function WidgetRenderer({ widgets }: Props) {
  // Sort and filter active widgets only (Spec Sec 9 & 13)
  const activeWidgets = [...widgets]
    .filter((w) => w.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div style={{ width: '100%', paddingBottom: 'var(--space-6)' }}>
      {activeWidgets.map((widget) => {
        const type = widget.type ? widget.type.toUpperCase() : '';
        switch (type) {
          // Navigation & Header
          case 'ANNOUNCEMENT_BAR':
            return <AnnouncementBarWidget key={widget.id} widget={widget} />;
          case 'SEARCH_BAR':
            return <SearchBarWidget key={widget.id} widget={widget} />;
          case 'CATEGORY_NAV':
            return <CategoryNavWidget key={widget.id} widget={widget} />;

          // Banners & Content
          case 'HERO_BANNER':
            return <HeroBannerWidget key={widget.id} widget={widget as any} />;
          case 'BANNER_CAROUSEL':
            return <BannerCarouselWidget key={widget.id} widget={widget} />;
          case 'IMAGE_GRID':
            return <ImageGridWidget key={widget.id} widget={widget} />;
          case 'VIDEO_PLAYER':
            return <VideoPlayerWidget key={widget.id} widget={widget} />;
          case 'RICH_TEXT':
            return <RichTextWidget key={widget.id} widget={widget} />;
          case 'IMAGE_WITH_TEXT':
            return <ImageWithTextWidget key={widget.id} widget={widget} />;
          case 'CTA_BUTTON':
            return <CtaButtonWidget key={widget.id} widget={widget} />;

          // Phase 5: Product Browsing
          case 'PRODUCT_GRID':
            return <ProductGridWidget key={widget.id} widget={widget} />;
          case 'PRODUCT_CAROUSEL':
            return <ProductCarouselWidget key={widget.id} widget={widget} />;
          case 'FEATURED_PRODUCT':
            return <FeaturedProductWidget key={widget.id} widget={widget} />;
          case 'COLLECTION_TILES':
            return <CollectionTilesWidget key={widget.id} widget={widget} />;
          case 'TABBED_PRODUCTS':
            return <TabbedProductsWidget key={widget.id} widget={widget} />;
          case 'RECENTLY_VIEWED':
            return <RecentlyViewedWidget key={widget.id} widget={widget} />;
          case 'RECOMMENDED_PRODUCTS':
            return <RecommendedProductsWidget key={widget.id} widget={widget} />;

          // Phase 5: Promotions & Urgency
          case 'SALE_DEAL_SECTION':
            return <SaleDealSectionWidget key={widget.id} widget={widget} />;
          case 'COUNTDOWN_TIMER':
            return <CountdownTimerWidget key={widget.id} widget={widget} />;
          case 'COUPON_VOUCHER_BLOCK':
            return <CouponVoucherBlockWidget key={widget.id} widget={widget} />;
          case 'BUNDLE_OFFER':
            return <BundleOfferWidget key={widget.id} widget={widget} />;
          case 'SHOPPABLE_IMAGE':
            return <ShoppableImageWidget key={widget.id} widget={widget} />;

          // Phase 6: Trust, Information & Engagement
          case 'REVIEWS_TESTIMONIALS':
            return <ReviewsTestimonialsWidget key={widget.id} widget={widget} />;
          case 'TRUST_BADGES':
            return <TrustBadgesWidget key={widget.id} widget={widget} />;
          case 'PAYMENT_OPTIONS':
            return <PaymentOptionsWidget key={widget.id} widget={widget} />;
          case 'SHIPPING_RETURNS':
            return <ShippingReturnsWidget key={widget.id} widget={widget} />;
          case 'FAQ_ACCORDION':
            return <FaqAccordionWidget key={widget.id} widget={widget} />;
          case 'STORE_LOCATOR':
            return <StoreLocatorWidget key={widget.id} widget={widget} />;
          case 'SIGNUP_LEAD_FORM':
            return <SignupLeadFormWidget key={widget.id} widget={widget} />;
          case 'SOCIAL_MEDIA_FEED':
            return <SocialMediaFeedWidget key={widget.id} widget={widget} />;
          case 'FLOATING_CHAT_BUTTON':
            return <FloatingChatButtonWidget key={widget.id} widget={widget} />;
          case 'PROMO_POPUP_MODAL':
            return <PromoPopupModalWidget key={widget.id} widget={widget} />;

          // Existing / Foundational
          case 'CUSTOMER_GREETING':
            return <CustomerGreetingWidget key={widget.id} widget={widget as any} />;
          case 'CATEGORY_GRID':
            return <CategoryGridWidget key={widget.id} widget={widget as any} />;
          case 'PRODUCT_SHOWCASE':
            return <ProductShowcaseWidget key={widget.id} widget={widget as any} />;
          case 'CAMPAIGN_BANNER':
            return <CampaignBannerWidget key={widget.id} widget={widget as any} />;
          case 'BRAND_SHOWCASE':
            return <BrandShowcaseWidget key={widget.id} widget={widget as any} />;

          // Layout & Embed
          case 'SPACER_DIVIDER':
            return <SpacerDividerWidget key={widget.id} widget={widget} />;
          case 'FOOTER':
            return <FooterWidget key={widget.id} widget={widget} />;
          case 'CUSTOM_EMBED':
            return <CustomEmbedWidget key={widget.id} widget={widget} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
