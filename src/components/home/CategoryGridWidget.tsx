'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryGridWidget as ICategoryGridWidget } from '@/types/widget';
import styles from './homeWidgets.module.css';

interface Props {
  widget: ICategoryGridWidget;
}

export default function CategoryGridWidget({ widget }: Props) {
  const categories = widget.categories || [];

  return (
    <div className={styles.widgetSection}>
      {widget.title && (
        <div className={styles.sectionHeader}>
          <div className={styles.headerTitleGroup}>
            <h2 className={styles.sectionTitle}>{widget.title}</h2>
            {widget.subtitle && <p className={styles.sectionSubtitle}>{widget.subtitle}</p>}
          </div>
          {widget.viewAllLink && (
            <Link href={widget.viewAllLink} className={styles.viewAllLink}>
              ดูทั้งหมด ›
            </Link>
          )}
        </div>
      )}

      <div className={styles.categoryGrid}>
        {categories.map((cat) => (
          <Link key={cat.id} href={cat.linkUrl || '/catalog'} className={styles.categoryCard}>
            {cat.badge && <span className={styles.categoryBadge}>{cat.badge}</span>}
            <div className={styles.categoryIcon} style={{ background: cat.iconBg }}>
              {cat.icon}
            </div>
            <span className={styles.categoryName}>{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
