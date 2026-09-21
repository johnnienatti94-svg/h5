'use client';

import React from 'react';
import Link from 'next/link';
import { CampaignBannerWidget as ICampaignBannerWidget } from '@/types/widget';
import styles from './homeWidgets.module.css';

interface Props {
  widget: ICampaignBannerWidget;
}

export default function CampaignBannerWidget({ widget }: Props) {
  const { banner } = widget;
  if (!banner) return null;

  return (
    <div className={styles.widgetSection}>
      <div
        className={styles.campaignCard}
        style={{
          background: banner.gradient || 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
        }}
      >
        {banner.tag && <span className={styles.campaignTag}>{banner.tag}</span>}
        <h3 className={styles.campaignTitle}>{banner.title}</h3>
        {banner.description && (
          <p className={styles.campaignDescription}>{banner.description}</p>
        )}
        {banner.buttonText && (
          <Link href={banner.linkUrl || '/promotion'} className={styles.campaignButton}>
            {banner.buttonText} ›
          </Link>
        )}
      </div>
    </div>
  );
}
