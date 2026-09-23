'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Hotspot {
  xPercent: number;
  yPercent: number;
  productName: string;
  price: number;
  href: string;
}

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      imageUrl?: string;
      hotspots?: Hotspot[];
    };
  };
}

const DEFAULT_HOTSPOTS: Hotspot[] = [
  {
    xPercent: 35,
    yPercent: 45,
    productName: 'iPad Pro 11" M4',
    price: 39900,
    href: '/catalog?category=tablet',
  },
  {
    xPercent: 70,
    yPercent: 65,
    productName: 'Apple Pencil Pro',
    price: 4990,
    href: '/catalog?category=accessory',
  },
];

export default function ShoppableImageWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const imageUrl =
    cfg.imageUrl ||
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1000&auto=format&fit=crop&q=80';
  const hotspots = cfg.hotspots && cfg.hotspots.length > 0 ? cfg.hotspots : DEFAULT_HOTSPOTS;
  const [activeSpot, setActiveSpot] = useState<number | null>(null);

  return (
    <div className="w-full my-5">
      {widget?.title && (
        <h2 className="text-base sm:text-lg font-bold text-[#0F172A] mb-3 px-1">
          {widget.title}
        </h2>
      )}

      <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="absolute inset-0 bg-black/20" />

        {/* Hotspots */}
        {hotspots.map((spot, idx) => (
          <div
            key={idx}
            style={{ left: `${spot.xPercent}%`, top: `${spot.yPercent}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          >
            {/* Pulsing Pin */}
            <button
              type="button"
              onClick={() => setActiveSpot(activeSpot === idx ? null : idx)}
              className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#007ACC] text-white shadow-lg active:scale-95 transition-transform"
              aria-label={`ดูสินค้า ${spot.productName}`}
            >
              <span className="absolute inset-0 rounded-full bg-[#007ACC] animate-ping opacity-60" />
              <span className="material-symbols-outlined text-[16px] relative z-10">shopping_bag</span>
            </button>

            {/* Popover Bubble */}
            {activeSpot === idx && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-9 w-48 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl border border-slate-200 text-left animate-fade-in z-30">
                <div className="text-[11px] font-bold text-[#0F172A] line-clamp-1">{spot.productName}</div>
                <div className="text-xs font-extrabold text-[#007ACC] mt-0.5">
                  ฿{spot.price.toLocaleString()}
                </div>
                <Link
                  href={spot.href}
                  className="mt-1.5 block w-full py-1 text-center bg-[#007ACC] text-white text-[10px] font-bold rounded-lg hover:bg-[#0061A3] transition-colors"
                >
                  ดูรายละเอียด
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
