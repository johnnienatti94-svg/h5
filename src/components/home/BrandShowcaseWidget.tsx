'use client';

import React from 'react';
import Link from 'next/link';
import { BrandShowcaseWidget as IBrandShowcaseWidget } from '@/types/widget';
import styles from './homeWidgets.module.css';

interface Props {
  widget: IBrandShowcaseWidget;
}

export default function BrandShowcaseWidget({ widget }: Props) {
  const brands = widget.brands || [];

  return (
    <div className={styles.widgetSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitleGroup}>
          <h2 className={styles.sectionTitle}>{widget.title}</h2>
          {widget.subtitle && <p className={styles.sectionSubtitle}>{widget.subtitle}</p>}
        </div>
      </div>

      <div className={styles.brandScroller}>
        {brands.map((brand) => (
          <Link key={brand.id} href={brand.linkUrl || '/catalog'} className={styles.brandChip}>
            <span className={styles.brandLogo}>{brand.logo}</span>
            <span className={styles.brandName}>{brand.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
