'use client';

import React, { useState } from 'react';
import { resolveProductsFromDataSource, DetailedProduct } from '@/lib/productsData';
import { useCart } from '@/context/CartContext';
import { calculateDownPayment, getLowestInstallmentPackage } from '@/lib/financing';

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
    const downInfo = calculateDownPayment(p.promoPrice);
    const lowestPkg = getLowestInstallmentPackage(p.promoPrice, downInfo.downPayment);
    addToCart(
      {
        ...p,
        originalPrice: downInfo.originalDownPayment,
        promoPrice: downInfo.downPayment,
        installmentMonths: lowestPkg.months,
      },
      1
    );
    setToastMsg(`เพิ่ม ${p.name} ลงในตะกร้าแล้ว (เงินดาวน์ ฿${downInfo.downPayment.toLocaleString()})`);
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
        {products.map((p) => {
          const downInfo = calculateDownPayment(p.promoPrice);
          const lowestPkg = getLowestInstallmentPackage(p.promoPrice, downInfo.downPayment);

          return (
            <div
              key={p.id}
              className="group relative rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#FF6E00]/40 transition-all flex flex-col justify-between overflow-hidden p-3"
            >
              <div>
                {/* Media / Emoji Preview with Badge */}
                <div className="relative aspect-square rounded-xl bg-slate-50 flex items-center justify-center text-5xl mb-2.5 overflow-hidden">
                  {(() => {
                    const anyP = p as any;
                    const tagsList = (anyP.tags && anyP.tags.length > 0)
                      ? anyP.tags
                      : (anyP.badges && anyP.badges.length > 0)
                      ? anyP.badges.map((b: string) => ({ label: b }))
                      : p.badge
                      ? [{ label: p.badge }]
                      : [];

                    if (tagsList.length === 0) return null;

                    return (
                      <div className="absolute top-2 left-2 z-10 flex flex-row flex-wrap gap-1 items-center max-w-[90%] pointer-events-none">
                        {tagsList.slice(0, 3).map((tag: any, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 bg-[#FF6E00] text-white text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap leading-tight"
                          >
                            {tag.icon && <span>{tag.icon}</span>}
                            <span>{tag.label}</span>
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                  <span className="group-hover:scale-110 transition-transform duration-300">
                    {p.imageUrl}
                  </span>
                </div>

                {/* Title & Brand */}
                <div className="text-[10px] font-bold text-[#FF6E00] uppercase tracking-wider mb-0.5">
                  {p.brand}
                </div>
                <h3 className="text-xs font-bold text-[#0F172A] line-clamp-2 leading-snug mb-1">
                  {p.name}
                </h3>
              </div>

              {/* Price & Actions (Down Payment & Lowest Installment) */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-extrabold text-[#142B4A]">
                    ดาวน์ ฿{downInfo.downPayment.toLocaleString()}
                  </span>
                  {downInfo.originalDownPayment > downInfo.downPayment && (
                    <span className="text-[10px] text-slate-400 line-through">
                      ฿{downInfo.originalDownPayment.toLocaleString()}
                    </span>
                  )}
                </div>

                {showInstallment && (
                  <span className="text-[10px] text-[#FF6E00] bg-[#FFF6EF] font-bold px-1.5 py-0.5 rounded self-start">
                    ผ่อน ฿{lowestPkg.monthlyAmount.toLocaleString()}/ด. (0% {lowestPkg.months}ด.)
                  </span>
                )}

                {showAddBtn && (
                  <button
                    type="button"
                    onClick={(e) => handleAdd(e, p)}
                    className="mt-1.5 w-full h-8 bg-slate-100 hover:bg-[#FF6E00] text-[#0F172A] hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                    <span>ใส่ตะกร้า</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
