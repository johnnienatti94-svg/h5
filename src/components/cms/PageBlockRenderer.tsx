'use client';

import React from 'react';
import { AnyWidget } from '@/types/widget';

// Standard Foundational Widgets
import CustomerGreetingWidget from '@/components/home/CustomerGreetingWidget';
import HeroBannerWidget from '@/components/home/HeroBannerWidget';
import CategoryGridWidget from '@/components/home/CategoryGridWidget';
import ProductShowcaseWidget from '@/components/home/ProductShowcaseWidget';
import CampaignBannerWidget from '@/components/home/CampaignBannerWidget';
import BrandShowcaseWidget from '@/components/home/BrandShowcaseWidget';

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

// Phase 6: Spec Section 11 Dedicated Block Types
import ProcessStepsWidget from '@/components/widgets/ProcessStepsWidget';
import ArticleCardsWidget from '@/components/widgets/ArticleCardsWidget';
import BranchPreviewWidget from '@/components/widgets/BranchPreviewWidget';
import ServiceGridWidget from '@/components/widgets/ServiceGridWidget';
import PromotionStripWidget from '@/components/widgets/PromotionStripWidget';
import CtaSectionWidget from '@/components/widgets/CtaSectionWidget';

interface SingleBlockProps {
  widget: AnyWidget;
  isSelected?: boolean;
  onSelect?: (widgetId: string) => void;
  interactiveInEditor?: boolean;
}

export function SingleBlockRenderer({
  widget,
  isSelected = false,
  onSelect,
}: SingleBlockProps) {
  const type = (widget.type || '').toUpperCase();

  const renderComponent = () => {
    switch (type) {
      // 1. Navigation & Headers
      case 'ANNOUNCEMENT_BAR':
        return <AnnouncementBarWidget widget={widget} />;
      case 'SEARCH_BAR':
        return <SearchBarWidget widget={widget} />;
      case 'CATEGORY_NAV':
        return <CategoryNavWidget widget={widget} />;

      // 2. Banners & Content (Spec 11: Hero carousel, Promotion strip, Image + text, Video/poster)
      case 'HERO_BANNER':
        return <HeroBannerWidget widget={widget as any} />;
      case 'BANNER_CAROUSEL':
      case 'HERO_CAROUSEL':
        return <BannerCarouselWidget widget={widget} />;
      case 'PROMOTION_STRIP':
        return <PromotionStripWidget widget={widget} />;
      case 'IMAGE_GRID':
        return <ImageGridWidget widget={widget} />;
      case 'VIDEO_PLAYER':
        return <VideoPlayerWidget widget={widget} />;
      case 'RICH_TEXT':
        return <RichTextWidget widget={widget} />;
      case 'IMAGE_WITH_TEXT':
        return <ImageWithTextWidget widget={widget} />;
      case 'CTA_BUTTON':
        return <CtaButtonWidget widget={widget} />;
      case 'CTA_SECTION':
        return <CtaSectionWidget widget={widget} />;

      // 3. Product Browsing & Services (Spec 11: Service grid, Product collection)
      case 'SERVICE_GRID':
        return <ServiceGridWidget widget={widget} />;
      case 'PRODUCT_GRID':
      case 'PRODUCT_COLLECTION':
        return <ProductGridWidget widget={widget} />;
      case 'PRODUCT_CAROUSEL':
        return <ProductCarouselWidget widget={widget} />;
      case 'FEATURED_PRODUCT':
        return <FeaturedProductWidget widget={widget} />;
      case 'COLLECTION_TILES':
        return <CollectionTilesWidget widget={widget} />;
      case 'TABBED_PRODUCTS':
        return <TabbedProductsWidget widget={widget} />;
      case 'RECENTLY_VIEWED':
        return <RecentlyViewedWidget widget={widget} />;
      case 'RECOMMENDED_PRODUCTS':
        return <RecommendedProductsWidget widget={widget} />;

      // 4. Promotions & Urgency
      case 'SALE_DEAL_SECTION':
        return <SaleDealSectionWidget widget={widget} />;
      case 'COUNTDOWN_TIMER':
        return <CountdownTimerWidget widget={widget} />;
      case 'COUPON_VOUCHER_BLOCK':
        return <CouponVoucherBlockWidget widget={widget} />;
      case 'BUNDLE_OFFER':
        return <BundleOfferWidget widget={widget} />;
      case 'SHOPPABLE_IMAGE':
        return <ShoppableImageWidget widget={widget} />;

      // 5. Trust, Information & Flow (Spec 11: Process steps, Trust features, Branch preview, Approved reviews, Article cards, FAQ accordion)
      case 'PROCESS_STEPS':
        return <ProcessStepsWidget widget={widget} />;
      case 'TRUST_BADGES':
      case 'TRUST_FEATURES':
        return <TrustBadgesWidget widget={widget} />;
      case 'BRANCH_PREVIEW':
        return <BranchPreviewWidget widget={widget} />;
      case 'STORE_LOCATOR':
        return <StoreLocatorWidget widget={widget} />;
      case 'REVIEWS_TESTIMONIALS':
      case 'APPROVED_REVIEWS':
        return <ReviewsTestimonialsWidget widget={widget} />;
      case 'ARTICLE_CARDS':
        return <ArticleCardsWidget widget={widget} />;
      case 'FAQ_ACCORDION':
        return <FaqAccordionWidget widget={widget} />;
      case 'PAYMENT_OPTIONS':
        return <PaymentOptionsWidget widget={widget} />;
      case 'SHIPPING_RETURNS':
        return <ShippingReturnsWidget widget={widget} />;

      // 6. Engagement & Forms
      case 'SIGNUP_LEAD_FORM':
        return <SignupLeadFormWidget widget={widget} />;
      case 'SOCIAL_MEDIA_FEED':
        return <SocialMediaFeedWidget widget={widget} />;
      case 'FLOATING_CHAT_BUTTON':
        return <FloatingChatButtonWidget widget={widget} />;
      case 'PROMO_POPUP_MODAL':
        return <PromoPopupModalWidget widget={widget} />;

      // Legacy / Aliases
      case 'CUSTOMER_GREETING':
        return <CustomerGreetingWidget widget={widget as any} />;
      case 'CATEGORY_GRID':
        return <CategoryGridWidget widget={widget as any} />;
      case 'PRODUCT_SHOWCASE':
        return <ProductShowcaseWidget widget={widget as any} />;
      case 'CAMPAIGN_BANNER':
        return <CampaignBannerWidget widget={widget as any} />;
      case 'BRAND_SHOWCASE':
        return <BrandShowcaseWidget widget={widget as any} />;

      // Layout
      case 'SPACER_DIVIDER':
        return <SpacerDividerWidget widget={widget} />;
      case 'FOOTER':
        return <FooterWidget widget={widget} />;
      case 'CUSTOM_EMBED':
        return <CustomEmbedWidget widget={widget} />;

      default:
        return (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            บล็อก <strong>{widget.type}</strong> (ยังไม่มีตัวเรนเดอร์)
          </div>
        );
    }
  };

  return (
    <div
      id={`block-${widget.id}`}
      data-block-id={widget.id}
      data-block-type={widget.type}
      onClick={onSelect ? () => onSelect(widget.id) : undefined}
      className={`relative transition-all ${
        isSelected
          ? 'ring-2 ring-[#FF6E00] ring-offset-2 rounded-2xl shadow-sm'
          : onSelect
          ? 'hover:ring-1 hover:ring-[#FF6E00]/40 rounded-2xl cursor-pointer'
          : ''
      }`}
    >
      {renderComponent()}
    </div>
  );
}

interface PageBlockRendererProps {
  widgets: AnyWidget[];
  selectedWidgetId?: string | null;
  onSelectWidget?: (widgetId: string) => void;
  filterInactive?: boolean;
}

export default function PageBlockRenderer({
  widgets,
  selectedWidgetId,
  onSelectWidget,
  filterInactive = true,
}: PageBlockRendererProps) {
  const displayedWidgets = [...widgets]
    .filter((w) => !filterInactive || w.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="w-full flex flex-col gap-1 pb-10" data-page-block-renderer="true">
      {displayedWidgets.map((widget) => (
        <SingleBlockRenderer
          key={widget.id}
          widget={widget}
          isSelected={selectedWidgetId === widget.id}
          onSelect={onSelectWidget}
        />
      ))}
    </div>
  );
}
