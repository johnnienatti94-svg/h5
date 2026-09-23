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
