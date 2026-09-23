'use client';

import React from 'react';
import Link from 'next/link';

interface GridImage {
  imageUrl: string;
  title?: string;
  subtitle?: string;
  href?: string;
  spanCols?: number;
}

interface Props {
  widget: {
    id: string;
    title?: string;
    subtitle?: string;
    config?: {
      columns?: number;
      images?: GridImage[];
    };
  };
}

const DEFAULT_IMAGES: GridImage[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    title: 'iPhone Trade-in',
    subtitle: 'นำเครื่องเก่ามาแลก รับส่วนลดเพิ่มสูงสุด ฿5,000',
    href: '/catalog?category=smartphone',
    spanCols: 2,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80',
    title: 'Samsung Galaxy Series',
    subtitle: 'ผ่อนสบาย 0% เริ่มต้น ฿990/ด.',
    href: '/catalog?q=Samsung',
    spanCols: 1,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    title: 'iPad & Tablet Pro',
    subtitle: 'พร้อมปากกา Stylus ฟรี',
    href: '/catalog?category=tablet',
    spanCols: 1,
  },
];

export default function ImageGridWidget({ widget }: Props) {
  const cfg = widget.config || {};
  const images = cfg.images && cfg.images.length > 0 ? cfg.images : DEFAULT_IMAGES;

  return (
    <div className="w-full my-4">
      {widget.title && (
        <div className="mb-3 px-1">
          <h2 className="text-base font-bold text-[#0F172A]">{widget.title}</h2>
          {widget.subtitle && <p className="text-xs text-[#64748B] mt-0.5">{widget.subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {images.map((item, idx) => {
          const Wrapper = item.href ? Link : 'div';
          return (
            <Wrapper
              key={idx}
              href={item.href || '#'}
              className="group relative rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-xs bg-slate-900 min-h-[160px] flex flex-col justify-end p-4 transition-all hover:shadow-md"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative z-10 text-white">
                {item.title && (
                  <h3 className="text-sm font-bold leading-snug group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                )}
                {item.subtitle && (
                  <p className="text-[11px] text-slate-200 mt-0.5 line-clamp-2">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
