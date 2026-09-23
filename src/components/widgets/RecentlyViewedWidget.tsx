'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ALL_PRODUCTS, DetailedProduct } from '@/lib/productsData';

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      maxItems?: number;
      emptyMessage?: string;
    };
  };
}

export default function RecentlyViewedWidget({ widget }: Props) {
  const [items, setItems] = useState<DetailedProduct[]>([]);
  const cfg = widget?.config || {};
  const maxItems = cfg.maxItems || 6;
  const emptyMessage = cfg.emptyMessage || 'ยังไม่มีประวัติสินค้าที่เข้าชมล่าสุด';

  useEffect(() => {
    // In production, reads from localStorage 'meepro_recent_views'
    try {
      const raw = localStorage.getItem('meepro_recent_views');
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        const resolved = ALL_PRODUCTS.filter((p) => ids.includes(p.id)).slice(0, maxItems);
        if (resolved.length > 0) {
          setItems(resolved);
          return;
        }
      }
    } catch {
      // fallback
    }
    // Fallback: show first 3 products
    setItems(ALL_PRODUCTS.slice(0, 3));
  }, [maxItems]);

  if (items.length === 0) {
    return (
      <div className="w-full my-4 p-4 text-center text-xs text-[#94A3B8] border border-dashed border-[#E2E8F0] rounded-xl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full my-5">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
          {widget?.title || 'สินค้าที่คุณเพิ่งดูล่าสุด'}
        </h2>
        <span className="text-[11px] text-[#64748B]">ประวัติของคุณ</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1 px-1">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/catalog?q=${encodeURIComponent(p.name)}`}
            className="w-36 shrink-0 rounded-xl bg-white border border-[#E2E8F0] shadow-xs p-2.5 flex flex-col justify-between group hover:border-[#007ACC] transition-all"
          >
            <div>
              <div className="aspect-square rounded-lg bg-slate-50 flex items-center justify-center text-3xl mb-1.5">
                <span>{p.imageUrl}</span>
              </div>
              <h4 className="text-[11px] font-bold text-[#0F172A] line-clamp-1 leading-snug">{p.name}</h4>
            </div>
            <div className="text-xs font-extrabold text-[#007ACC] mt-1">
              ฿{p.promoPrice.toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
