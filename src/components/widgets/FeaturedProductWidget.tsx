'use client';

import React from 'react';
import { ALL_PRODUCTS, DetailedProduct } from '@/lib/productsData';
import { useCart } from '@/context/CartContext';

interface Props {
  widget: {
    id: string;
    config?: {
      productId?: string;
      spotlightBadge?: string;
      specialPromoNote?: string;
    };
  };
}

export default function FeaturedProductWidget({ widget }: Props) {
  const { addToCart } = useCart();
  const cfg = widget.config || {};
  const product: DetailedProduct =
    ALL_PRODUCTS.find((p) => p.id === cfg.productId) || ALL_PRODUCTS[0];

  const badge = cfg.spotlightBadge || 'FLAGSHIP SPOTLIGHT';
  const promoNote =
    cfg.specialPromoNote || 'รับฟรีเคสกันกระแทก + ฟิล์มกระจกนิรภัยมูลค่า ฿1,290 เมื่อสั่งซื้อวันนี้';

  return (
    <div className="w-full my-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white p-5 sm:p-7 shadow-lg relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#007ACC]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        {/* Visual Media */}
        <div className="w-full md:w-2/5 aspect-square max-w-[260px] rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-7xl shadow-inner shrink-0">
          <span className="animate-pulse">{product.imageUrl}</span>
        </div>

        {/* Product Details & Purchase Trigger */}
        <div className="w-full md:w-3/5 flex flex-col items-start">
          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF6E00] text-white px-2.5 py-0.5 rounded-full mb-2">
            {badge}
          </span>
          <div className="text-xs font-bold text-[#007ACC] uppercase tracking-wide mb-1">
            {product.brand} Official Store
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
            {product.name}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {product.description}
          </p>

          {/* Pricing Box */}
          <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/10 mb-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-300 uppercase">ราคาโปรโมชั่นพิเศษ</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  ฿{product.promoPrice.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  ฿{product.originalPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                ผ่อน 0% {product.installmentMonths || 10} ด.
              </span>
              <div className="text-[10px] text-slate-300 mt-1">
                เริ่มต้น ฿{Math.round(product.promoPrice / 10).toLocaleString()}/ด.
              </div>
            </div>
          </div>

          {promoNote && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium mb-4">
              <span className="material-symbols-outlined text-[16px]">redeem</span>
              <span>{promoNote}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => addToCart(product, 1)}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#007ACC] hover:bg-[#0061A3] text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>สั่งซื้อและเริ่มผ่อนทันที</span>
          </button>
        </div>
      </div>
    </div>
  );
}
