'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { ALL_PRODUCTS } from '@/lib/productsData';

interface Props {
  widget?: {
    id?: string;
    config?: {
      title?: string;
      originalTotalPrice?: number;
      bundlePrice?: number;
      savingsText?: string;
      products?: { name: string; imageUrl: string }[];
    };
  };
}

export default function BundleOfferWidget({ widget }: Props) {
  const { addToCart } = useCart();
  const cfg = widget?.config || {};
  const title = cfg.title || 'เซ็ตคู่คุ้มกว่า: iPhone 16 Pro + หูฟัง Marshall Major IV';
  const originalTotal = cfg.originalTotalPrice || 45890;
  const bundlePrice = cfg.bundlePrice || 41900;
  const savings = cfg.savingsText || 'ประหยัดทันที ฿3,990';

  const handleBuyBundle = () => {
    // Add primary phone and accessory
    const phone = ALL_PRODUCTS[0];
    const accessory = ALL_PRODUCTS[10] || ALL_PRODUCTS[1];
    addToCart(phone, 1);
    addToCart(accessory, 1);
  };

  return (
    <div className="w-full my-5 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-[#FF6E00] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
          BUNDLE DEAL
        </span>
        <span className="text-xs font-bold text-amber-800">{savings}</span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-tight mb-4">
        {title}
      </h3>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Bundled Items Preview */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-3xl shadow-xs">
            📱
          </div>
          <span className="text-xl font-bold text-amber-600">+</span>
          <div className="w-16 h-16 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-3xl shadow-xs">
            🎧
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div>
            <div className="text-[10px] text-[#64748B] line-through">
              ราคาปกติ ฿{originalTotal.toLocaleString()}
            </div>
            <div className="text-xl font-black text-[#FF6E00]">
              ฿{bundlePrice.toLocaleString()}
            </div>
          </div>
          <button
            type="button"
            onClick={handleBuyBundle}
            className="h-10 px-5 rounded-xl bg-[#FF6E00] hover:bg-[#E05F00] text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            <span>ซื้อเซ็ตนี้</span>
          </button>
        </div>
      </div>
    </div>
  );
}
