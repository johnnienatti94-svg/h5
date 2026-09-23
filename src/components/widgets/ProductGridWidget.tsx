'use client';

import React, { useState } from 'react';
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
        sortBy?: string;
      };
      showInstallmentBadge?: boolean;
      showAddToCartQuickBtn?: boolean;
    };
  };
}

export default function ProductGridWidget({ widget }: Props) {
  const { addToCart } = useCart();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const cfg = widget.config || {};
  const products = resolveProductsFromDataSource(cfg.dataSource);
  const showInstallment = cfg.showInstallmentBadge !== false;
  const showAddBtn = cfg.showAddToCartQuickBtn !== false;

  const handleAdd = (e: React.MouseEvent, p: DetailedProduct) => {
    e.stopPropagation();
    addToCart(p, 1);
    setToastMsg(`เพิ่ม ${p.name} ลงในตะกร้าแล้ว`);
    setTimeout(() => setToastMsg(null), 2000);
  };

  return (
    <div className="w-full my-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
            {widget.title || 'สินค้าแนะนำ'}
          </h2>
          {widget.subtitle && <p className="text-xs text-[#64748B] mt-0.5">{widget.subtitle}</p>}
        </div>
        {widget.viewAllLink && (
          <a href={widget.viewAllLink} className="text-xs font-bold text-[#007ACC] hover:underline">
            ดูทั้งหมด ›
          </a>
        )}
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white text-xs px-4 py-2 rounded-full shadow-lg animate-bounce flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="group relative rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#007ACC]/40 transition-all flex flex-col justify-between overflow-hidden p-3"
          >
            <div>
              {/* Media / Emoji Preview with Badge */}
              <div className="relative aspect-square rounded-xl bg-slate-50 flex items-center justify-center text-5xl mb-2.5 overflow-hidden">
                {p.badge && (
                  <span className="absolute top-2 left-2 bg-[#FF6E00] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                    {p.badge}
                  </span>
                )}
                <span className="group-hover:scale-110 transition-transform duration-300">
                  {p.imageUrl}
                </span>
              </div>

              {/* Title & Brand */}
              <div className="text-[10px] font-bold text-[#007ACC] uppercase tracking-wider mb-0.5">
                {p.brand}
              </div>
              <h3 className="text-xs font-bold text-[#0F172A] line-clamp-2 leading-snug mb-1">
                {p.name}
              </h3>
            </div>

            {/* Price & Actions */}
            <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold text-[#007ACC]">
                  ฿{p.promoPrice.toLocaleString()}
                </span>
                {p.originalPrice > p.promoPrice && (
                  <span className="text-[10px] text-slate-400 line-through">
                    ฿{p.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {showInstallment && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 font-semibold px-1.5 py-0.5 rounded self-start">
                  ผ่อน 0% {p.installmentMonths || 10} ด.
                </span>
              )}

              {showAddBtn && (
                <button
                  type="button"
                  onClick={(e) => handleAdd(e, p)}
                  className="mt-1.5 w-full h-8 bg-slate-100 hover:bg-[#007ACC] text-[#0F172A] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                  <span>ใส่ตะกร้า</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
