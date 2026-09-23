'use client';

import React from 'react';
import Link from 'next/link';

interface Tile {
  title: string;
  itemCountText?: string;
  imageUrl: string;
  href: string;
}

interface Props {
  widget: {
    id: string;
    title?: string;
    subtitle?: string;
    config?: {
      tiles?: Tile[];
    };
  };
}

const DEFAULT_TILES: Tile[] = [
  {
    title: 'Flagship Smartphones',
    itemCountText: '12 รายการ',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    href: '/catalog?category=smartphone',
  },
  {
    title: 'Work & Study Tablets',
    itemCountText: '8 รายการ',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    href: '/catalog?category=tablet',
  },
  {
    title: 'Smartwatches & Audio',
    itemCountText: '15 รายการ',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
    href: '/catalog?category=watch',
  },
];

export default function CollectionTilesWidget({ widget }: Props) {
  const cfg = widget.config || {};
  const tiles = cfg.tiles && cfg.tiles.length > 0 ? cfg.tiles : DEFAULT_TILES;

  return (
    <div className="w-full my-5">
      {widget.title && (
        <div className="mb-3 px-1">
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">{widget.title}</h2>
          {widget.subtitle && <p className="text-xs text-[#64748B] mt-0.5">{widget.subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tiles.map((t, idx) => (
          <Link
            key={idx}
            href={t.href}
            className="group relative rounded-2xl overflow-hidden min-h-[140px] p-4 flex flex-col justify-end text-white border border-[#E2E8F0] shadow-xs"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${t.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="relative z-10">
              <h3 className="text-sm font-bold leading-snug group-hover:text-amber-300 transition-colors">
                {t.title}
              </h3>
              {t.itemCountText && (
                <span className="text-[10px] text-slate-300 mt-0.5 inline-block">
                  {t.itemCountText}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
