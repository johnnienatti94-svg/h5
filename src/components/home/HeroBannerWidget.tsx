'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';
import { HeroBannerWidget as IHeroBannerWidget } from '@/types/widget';
import styles from './homeWidgets.module.css';

interface Props {
  widget: IHeroBannerWidget;
  compact?: boolean;
  noPadding?: boolean;
}

export default function HeroBannerWidget({ widget, compact, noPadding }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const dragStartY = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const isSwipingRef = useRef(false);

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

  // Auto-play timer (pauses during active touch / drag)
  useEffect(() => {
    if (banners.length <= 1 || isDragging) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [banners.length, intervalMs, isDragging]);

  // Handle Drag Start
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (banners.length <= 1) return;
    setIsDragging(true);
    dragStartX.current = clientX;
    dragStartY.current = clientY;
    isHorizontalSwipe.current = null;
    isSwipingRef.current = false;
  }, [banners.length]);

  // Handle Drag Move (real-time 1:1 pixel tracking)
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    const diffX = clientX - dragStartX.current;
    const diffY = clientY - dragStartY.current;

    // Detect gesture direction on first significant movement
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        if (Math.abs(diffX) >= Math.abs(diffY)) {
          isHorizontalSwipe.current = true;
        } else {
          isHorizontalSwipe.current = false;
          setIsDragging(false);
          setDragOffset(0);
          return;
        }
      }
    }

    if (isHorizontalSwipe.current) {
      if (Math.abs(diffX) > 8) {
        isSwipingRef.current = true;
      }
      setDragOffset(diffX);
    }
  }, [isDragging]);

  // Handle Drag End (snap to next/prev slide or return)
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 45; // Minimum drag distance to trigger slide change
    if (dragOffset < -threshold) {
      // Swiped Left -> Next Slide
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    } else if (dragOffset > threshold) {
      // Swiped Right -> Previous Slide
      setCurrentIdx((prev) => (prev - 1 + banners.length) % banners.length);
    }

    setDragOffset(0);
    setTimeout(() => {
      isSwipingRef.current = false;
    }, 150);
  }, [isDragging, dragOffset, banners.length]);

  if (!banners.length) return null;

  return (
    <div
      className={styles.widgetSection}
      style={{ padding: noPadding ? '0' : '0 16px', marginBottom: noPadding ? '0' : undefined }}
    >
      <div
        className={styles.modernBannerWrapper}
        style={noPadding ? { borderRadius: '24px' } : undefined}
      >
        {/* Main Swipeable Carousel Container */}
        <div
          ref={containerRef}
          className={styles.bannerSliderContainer}
          style={compact ? { height: '185px' } : undefined}
          // Touch gestures (iOS & Android mobile)
          onTouchStart={(e) => {
            const touch = e.touches[0];
            handleDragStart(touch.clientX, touch.clientY);
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            handleDragMove(touch.clientX, touch.clientY);
          }}
          onTouchEnd={handleDragEnd}
          onTouchCancel={handleDragEnd}
          // Pointer / Mouse drag gestures (Desktop & Tablet)
          onMouseDown={(e) => {
            e.preventDefault();
            handleDragStart(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => {
            handleDragMove(e.clientX, e.clientY);
          }}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {/* Horizontal Track sliding 1:1 with finger/mouse */}
          <div
            className={styles.bannerSliderTrack}
            style={{
              transform: `translateX(calc(-${currentIdx * 100}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 0.38s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {banners.map((b: any, idx: number) => {
              const hasImage = Boolean(b.imageUrl && b.imageUrl.trim() !== '');

              return (
                <Link
                  key={b.id || idx}
                  href={b.linkUrl || '/catalog'}
                  draggable={false}
                  onClick={(e) => {
                    // Prevent accidental navigation when finger was swiping
                    if (isSwipingRef.current) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  className={styles.modernBannerSlide}
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
                        draggable={false}
                        sizes="(max-width: 768px) 100vw, 1200px"
                        style={{ objectFit: 'cover', pointerEvents: 'none' }}
                      />
                      <div className={styles.bannerGradientOverlay} />
                    </div>
                  )}

                  {/* Banner Content Foreground */}
                  <div
                    className={styles.bannerContentForeground}
                    style={compact ? { padding: '14px 16px', gap: '5px' } : undefined}
                  >
                    {b.tag && (
                      <span
                        className={styles.modernBannerTag}
                        style={compact ? { padding: '2px 8px', fontSize: '10px' } : undefined}
                      >
                        <Sparkles size={11} />
                        {b.tag}
                      </span>
                    )}
                    <h3
                      className={styles.modernBannerTitle}
                      style={compact ? { fontSize: '15px', lineHeight: 1.25 } : undefined}
                    >
                      {b.title}
                    </h3>
                    {b.subtitle && (
                      <p className={styles.modernBannerSubtitle}>{b.subtitle}</p>
                    )}

                    <div
                      className={styles.modernBannerCta}
                      style={compact ? { padding: '3px 10px', fontSize: '11px', marginTop: '2px' } : undefined}
                    >
                      <span>ช้อปโปรโมชั่นเลย</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
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
