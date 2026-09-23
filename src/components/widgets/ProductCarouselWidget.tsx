'use client';

import React from 'react';
import { resolveProductsFromDataSource, DetailedProduct } from '@/lib/productsData';
import { useCart } from '@/context/CartContext';

interface Props {
  widget: {
    id: string;
    title?: string;
    subtitle?: string;
    viewAllLink?: string;
    config?: {
      dataSource?: {
        type?: string;
        targetId?: string;
        limit?: number;
      };
      showInstallmentBadge?: boolean;
    };
  };
}

export default function ProductCarouselWidget({ widget }: Props) {
  const { addToCart } = useCart();
  const cfg = widget.config || {};
  const products = resolveProductsFromDataSource(cfg.dataSource);

  return (
    <div className="w-full my-5">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
            {widget.title || 'สินค้าแนะนำพิเศษ'}
          </h2>
          {widget.subtitle && <p className="text-xs text-[#64748B] mt-0.5">{widget.subtitle}</p>}
        </div>
        {widget.viewAllLink && (
          <a href={widget.viewAllLink} className="text-xs font-bold text-[#007ACC] hover:underline">
            ดูทั้งหมด ›
          </a>
        )}
      </div>

      {/* Swipeable Carousel */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1 snap-x">
        {products.map((p) => (
          <div
            key={p.id}
            className="min-w-[170px] sm:min-w-[210px] snap-start rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-3 flex flex-col justify-between group hover:border-[#007ACC]/40 transition-all shrink-0"
          >
            <div>
              <div className="relative aspect-square rounded-xl bg-slate-50 flex items-center justify-center text-4xl mb-2 overflow-hidden">
                {p.badge && (
                  <span className="absolute top-1.5 left-1.5 bg-[#FF6E00] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}
                <span>{p.imageUrl}</span>
              </div>
              <div className="text-[10px] font-bold text-[#007ACC] uppercase tracking-wider">{p.brand}</div>
              <h3 className="text-xs font-bold text-[#0F172A] line-clamp-2 leading-snug mb-1">{p.name}</h3>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-extrabold text-[#007ACC]">฿{p.promoPrice.toLocaleString()}</span>
                {p.originalPrice > p.promoPrice && (
                  <span className="text-[10px] text-slate-400 line-through">฿{p.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => addToCart(p, 1)}
                className="mt-1 h-7 bg-slate-100 hover:bg-[#007ACC] text-[#0F172A] hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                <span>ใส่ตะกร้า</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
