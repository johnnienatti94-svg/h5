'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { HeroBannerWidget as IHeroBannerWidget } from '@/types/widget';
import styles from './homeWidgets.module.css';

interface Props {
  widget: IHeroBannerWidget;
}

export default function HeroBannerWidget({ widget }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const banners = widget.banners || [];
  const intervalMs = widget.autoSlideIntervalMs || 4000;

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [banners.length, intervalMs]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40;
    if (distance > minSwipeDistance) {
      // Swiped left -> next
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev
      setCurrentIdx((prev) => (prev - 1 + banners.length) % banners.length);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!banners.length) return null;

  return (
    <div className={styles.widgetSection}>
      <div className={styles.heroBannerContainer}>
        <div
          className={styles.bannerSlider}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {banners.map((b, idx) => {
            const isActive = idx === currentIdx;
            return (
              <Link
                key={b.id}
                href={b.linkUrl || '/catalog'}
                className={`${styles.bannerSlide} ${isActive ? styles.bannerSlideActive : ''}`}
                style={{
                  background: b.bgColor || 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                }}
              >
                {b.tag && <span className={styles.bannerTag}>{b.tag}</span>}
                <div className={styles.bannerTitle}>{b.title}</div>
              </Link>
            );
          })}
        </div>

        {/* Pagination Dots */}
        {banners.length > 1 && (
          <div className={styles.bannerPagination}>
            {banners.map((b, idx) => (
              <span
                key={b.id}
                className={`${styles.bannerDot} ${idx === currentIdx ? styles.bannerDotActive : ''}`}
                onClick={() => setCurrentIdx(idx)}
                aria-label={`Banner slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
