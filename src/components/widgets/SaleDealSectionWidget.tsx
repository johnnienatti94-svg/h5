'use client';

import React, { useState, useEffect } from 'react';
import { resolveProductsFromDataSource } from '@/lib/productsData';
import { useCart } from '@/context/CartContext';

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      bannerTitle?: string;
      expiresAt?: string;
    };
  };
}

export default function SaleDealSectionWidget({ widget }: Props) {
  const { addToCart } = useCart();
  const cfg = widget?.config || {};
  const bannerTitle = cfg.bannerTitle || '⚡ FLASH DEALS ด่วนประจำวัน';

  // Live timer counting down
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashProducts = resolveProductsFromDataSource({
    type: 'flash_sale',
    limit: 4,
  });

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="w-full my-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 p-4 sm:p-6 text-white shadow-md">
      {/* Header with Urgency Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              HOT
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight">{bannerTitle}</h2>
          </div>
          <p className="text-xs text-rose-100 mt-0.5">สินค้าจำนวนจำกัด หมดแล้วหมดเลย</p>
        </div>

        {/* Countdown Pill */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
          <span className="text-[11px] font-bold text-white/90 mr-1">สิ้นสุดใน:</span>
          <span className="bg-white text-slate-900 font-extrabold text-xs px-1.5 py-0.5 rounded">
            {pad(timeLeft.hours)}
          </span>
          <span className="font-bold">:</span>
          <span className="bg-white text-slate-900 font-extrabold text-xs px-1.5 py-0.5 rounded">
            {pad(timeLeft.minutes)}
          </span>
          <span className="font-bold">:</span>
          <span className="bg-white text-slate-900 font-extrabold text-xs px-1.5 py-0.5 rounded">
            {pad(timeLeft.seconds)}
          </span>
        </div>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {flashProducts.map((p) => (
          <div
            key={p.id}
            className="rounded-xl bg-white text-slate-900 p-3 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="aspect-square rounded-lg bg-slate-50 flex items-center justify-center text-4xl mb-2 relative">
                <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                  -{p.discountPercent}%
                </span>
                <span>{p.imageUrl}</span>
              </div>
              <h4 className="text-xs font-bold line-clamp-1 leading-snug">{p.name}</h4>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-sm font-extrabold text-red-600">
                  ฿{p.promoPrice.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 line-through">
                  ฿{p.originalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Inventory Progress Bar */}
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1 overflow-hidden">
                <div className="bg-red-500 h-full rounded-full w-[78%]" />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-medium mb-1.5">
                <span>ขายแล้ว 78%</span>
                <span>เหลือ 5 ชิ้น</span>
              </div>
              <button
                type="button"
                onClick={() => addToCart(p, 1)}
                className="w-full h-7 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold transition-all"
              >
                คว้าเลย
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
