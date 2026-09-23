'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Slide {
  headline: string;
  subheadline?: string;
  imageUrl: string;
  tag?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

interface Props {
  widget: {
    id: string;
    config?: {
      autoPlayInterval?: number;
      slides?: Slide[];
    };
  };
}

const DEFAULT_SLIDES: Slide[] = [
  {
    tag: 'FLAGSHIP LAUNCH',
    headline: 'iPhone 16 Pro Max พร้อมส่งทันที',
    subheadline: 'ผ่อน 0% สูงสุด 10 เดือน เริ่มต้นเพียง ฿4,890/เดือน รู้ผลอนุมัติใน 3 นาที',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&auto=format&fit=crop&q=80',
    ctaLabel: 'สั่งซื้อเลย',
    ctaHref: '/catalog?category=smartphone',
  },
  {
    tag: 'SPECIAL PROMO',
    headline: 'iPad Air ชิป M2 รุ่นใหม่ล่าสุด',
    subheadline: 'บางเฉียบ ทรงพลัง ตอบโจทย์ทุกการเรียนรู้และการทำงาน',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&auto=format&fit=crop&q=80',
    ctaLabel: 'ดูรายละเอียด',
    ctaHref: '/catalog?category=tablet',
  },
  {
    tag: 'FLASH DEAL',
    headline: 'Galaxy S25 Ultra รับเครดิตเงินคืน ฿2,000',
    subheadline: 'เทคโนโลยี Galaxy AI ขั้นสุด ยกระดับการถ่ายภาพระดับสตูดิโอ',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&auto=format&fit=crop&q=80',
    ctaLabel: 'ช้อปด่วน',
    ctaHref: '/catalog?q=Samsung',
  },
];

export default function BannerCarouselWidget({ widget }: Props) {
  const cfg = widget.config || {};
  const slides = cfg.slides && cfg.slides.length > 0 ? cfg.slides : DEFAULT_SLIDES;
  const interval = cfg.autoPlayInterval || 4500;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [slides.length, interval]);

  const slide = slides[current];

  return (
    <div className="w-full my-4 relative rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0] bg-slate-900 text-white min-h-[200px] sm:min-h-[280px] flex flex-col justify-end">
      {/* Background Image with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
        style={{ backgroundImage: `url(${slide.imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-5 sm:p-7 flex flex-col items-start max-w-2xl">
        {slide.tag && (
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF6E00] text-white px-2.5 py-0.5 rounded-full mb-2 shadow-xs">
            {slide.tag}
          </span>
        )}
        <h2 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-sm mb-1">
          {slide.headline}
        </h2>
        {slide.subheadline && (
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3 line-clamp-2">
            {slide.subheadline}
          </p>
        )}
        {slide.ctaLabel && (
          <Link
            href={slide.ctaHref || '/catalog'}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#007ACC] hover:bg-[#0061A3] text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <span>{slide.ctaLabel}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        )}
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`ไปที่สไลด์ ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
