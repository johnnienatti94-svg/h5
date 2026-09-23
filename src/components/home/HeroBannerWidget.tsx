'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { HeroBannerWidget as IHeroBannerWidget } from '@/types/widget';
import styles from './homeWidgets.module.css';

interface Props {
  widget: IHeroBannerWidget;
}

export default function HeroBannerWidget({ widget }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Normalize banners from config or root
  const config = (widget.config || {}) as any;
  const banners = widget.banners || config.banners || (config.imageUrl ? [{
    id: 'b-single',
    imageUrl: config.imageUrl,
    title: config.headline || widget.title || 'MeePro Promotion',
    tag: config.tag || 'Special Offer',
    linkUrl: config.ctaHref || '/catalog',
    bgColor: config.overlayColor || 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
  }] : []);

  const intervalMs = widget.autoSlideIntervalMs || config.autoSlideIntervalMs || 4500;

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
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    } else if (distance < -minSwipeDistance) {
      setCurrentIdx((prev) => (prev - 1 + banners.length) % banners.length);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % banners.length);
  };

  if (!banners.length) return null;

  return (
    <div className={styles.widgetSection} style={{ padding: '0 16px' }}>
      <div className={styles.modernBannerWrapper}>
        <div
          className={styles.bannerSliderContainer}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {banners.map((b: any, idx: number) => {
            const isActive = idx === currentIdx;
            const hasImage = Boolean(b.imageUrl && b.imageUrl.trim() !== '');

            return (
              <Link
                key={b.id || idx}
                href={b.linkUrl || '/catalog'}
                className={`${styles.modernBannerSlide} ${isActive ? styles.modernBannerSlideActive : ''}`}
                style={{
                  background: b.bgColor || 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)',
                }}
              >
                {/* Background Image with Darkened Ambient Overlay */}
                {hasImage && (
                  <div className={styles.bannerImageLayer}>
                    <Image
                      src={b.imageUrl}
                      alt={b.title || 'Banner'}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 768px) 100vw, 1200px"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className={styles.bannerGradientOverlay} />
                  </div>
                )}

                {/* Banner Content Foreground */}
                <div className={styles.bannerContentForeground}>
                  {b.tag && (
                    <span className={styles.modernBannerTag}>
                      <Sparkles size={12} />
                      {b.tag}
                    </span>
                  )}
                  <h3 className={styles.modernBannerTitle}>{b.title}</h3>
                  {b.subtitle && (
                    <p className={styles.modernBannerSubtitle}>{b.subtitle}</p>
                  )}

                  <div className={styles.modernBannerCta}>
                    <span>ช้อปโปรโมชั่นเลย</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Desktop Left / Right Controls */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className={`${styles.bannerNavBtn} ${styles.bannerNavBtnLeft}`}
                aria-label="Previous Slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className={`${styles.bannerNavBtn} ${styles.bannerNavBtnRight}`}
                aria-label="Next Slide"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Modern Pill Pagination */}
        {banners.length > 1 && (
          <div className={styles.modernBannerPagination}>
            {banners.map((b: any, idx: number) => (
              <button
                type="button"
                key={b.id || idx}
                className={`${styles.modernBannerDot} ${idx === currentIdx ? styles.modernBannerDotActive : ''}`}
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
