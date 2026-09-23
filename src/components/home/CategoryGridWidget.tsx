'use client';

import React from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  PlugZap,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CategoryGridWidget as ICategoryGridWidget } from '@/types/widget';
import styles from './homeWidgets.module.css';

interface Props {
  widget: ICategoryGridWidget;
}

// Map category IDs or keywords to modern vector icons
function renderCategoryIcon(iconKey: string, name: string) {
  const key = (iconKey || name || '').toLowerCase();

  if (key.includes('phone') || key.includes('สมาร์ทโฟน') || key === '📱') {
    return <Smartphone size={22} color="#2563EB" />;
  }
  if (key.includes('tablet') || key.includes('แท็บเล็ต') || key === '📲') {
    return <Tablet size={22} color="#7C3AED" />;
  }
  if (key.includes('laptop') || key.includes('แล็ปท็อป') || key.includes('computer') || key === '💻') {
    return <Laptop size={22} color="#0EA5E9" />;
  }
  if (key.includes('watch') || key.includes('สมาร์ทวอทช์') || key === '⌚') {
    return <Watch size={22} color="#F97316" />;
  }
  if (key.includes('audio') || key.includes('หูฟัง') || key.includes('ลำโพง') || key === '🎧') {
    return <Headphones size={22} color="#10B981" />;
  }
  if (key.includes('accessory') || key.includes('อุปกรณ์เสริม') || key === '🔌') {
    return <PlugZap size={22} color="#EC4899" />;
  }

  // Fallback if string emoji or other
  if (iconKey && iconKey.length <= 2) {
    return <span style={{ fontSize: '22px' }}>{iconKey}</span>;
  }

  return <Layers size={22} color="#6366F1" />;
}

export default function CategoryGridWidget({ widget }: Props) {
  const config = (widget.config || {}) as any;
  const categories = widget.categories || config.categories || [];
  const title = widget.title || config.title || 'หมวดหมู่สินค้า';
  const subtitle = widget.subtitle || config.subtitle;
  const viewAllLink = widget.viewAllLink || config.viewAllLink || '/catalog';

  if (!categories.length) return null;

  return (
    <div className={styles.widgetSection} style={{ padding: '0 16px' }}>
      {/* Section Header */}
      <div className={styles.modernSectionHeader}>
        <div>
          <h2 className={styles.modernSectionTitle}>
            <span>🧭</span>
            <span>{title}</span>
          </h2>
          {subtitle && <p className={styles.modernSectionSubtitle}>{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link href={viewAllLink} className={styles.modernViewAllLink}>
            <span>ดูทั้งหมด</span>
            <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* Modern Category Grid */}
      <div className={styles.modernCategoryGrid}>
        {categories.map((cat: any, idx: number) => {
          const isHot = cat.badge && (cat.badge.toLowerCase().includes('hot') || cat.badge.includes('ลด'));
          const isNew = cat.badge && (cat.badge.toLowerCase().includes('new') || cat.badge.includes('ใหม่'));

          return (
            <Link
              key={cat.id || idx}
              href={cat.linkUrl || cat.href || '/catalog'}
              className={styles.modernCategoryCard}
            >
              {/* Floating Badge */}
              {cat.badge && (
                <span
                  className={`${styles.modernCategoryBadge} ${
                    isHot ? styles.badgeHot : isNew ? styles.badgeNew : styles.badgeDefault
                  }`}
                >
                  {cat.badge}
                </span>
              )}

              {/* Glowing Icon Wrapper */}
              <div
                className={styles.modernCategoryIconWrapper}
                style={{
                  background: cat.iconBg || 'rgba(37, 99, 235, 0.08)',
                }}
              >
                {renderCategoryIcon(cat.icon, cat.name)}
              </div>

              {/* Category Name */}
              <span className={styles.modernCategoryName}>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
