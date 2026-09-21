'use client';

import React from 'react';
import { AnyWidget } from '@/types/widget';
import CustomerGreetingWidget from './CustomerGreetingWidget';
import HeroBannerWidget from './HeroBannerWidget';
import CategoryGridWidget from './CategoryGridWidget';
import ProductShowcaseWidget from './ProductShowcaseWidget';
import CampaignBannerWidget from './CampaignBannerWidget';
import BrandShowcaseWidget from './BrandShowcaseWidget';

interface Props {
  widgets: AnyWidget[];
}

export default function WidgetRenderer({ widgets }: Props) {
  // Sort and filter active widgets only (Spec Sec 9 & 13)
  const activeWidgets = [...widgets]
    .filter((w) => w.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div style={{ width: '100%', paddingBottom: 'var(--space-6)' }}>
      {activeWidgets.map((widget) => {
        switch (widget.type) {
          case 'CUSTOMER_GREETING':
            return <CustomerGreetingWidget key={widget.id} widget={widget} />;
          case 'HERO_BANNER':
            return <HeroBannerWidget key={widget.id} widget={widget} />;
          case 'CATEGORY_GRID':
            return <CategoryGridWidget key={widget.id} widget={widget} />;
          case 'PRODUCT_SHOWCASE':
            return <ProductShowcaseWidget key={widget.id} widget={widget} />;
          case 'CAMPAIGN_BANNER':
            return <CampaignBannerWidget key={widget.id} widget={widget} />;
          case 'BRAND_SHOWCASE':
            return <BrandShowcaseWidget key={widget.id} widget={widget} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
