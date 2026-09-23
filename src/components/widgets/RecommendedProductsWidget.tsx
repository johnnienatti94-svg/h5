'use client';

import React from 'react';
import { resolveProductsFromDataSource } from '@/lib/productsData';
import { useCart } from '@/context/CartContext';

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      limit?: number;
    };
  };
}

export default function RecommendedProductsWidget({ widget }: Props) {
  const { addToCart } = useCart();
  const cfg = widget?.config || {};
  const products = resolveProductsFromDataSource({
    type: 'recommended',
    limit: cfg.limit || 4,
  });

  return (
    <div className="w-full my-5">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
            {widget?.title || 'แนะนำเป็นพิเศษสำหรับคุณ'}
          </h2>
          <p className="text-xs text-[#64748B]">คัดสรรดีลคุ้มค่าที่สุดในหมวดหมู่ยอดนิยม</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-3 flex flex-col justify-between group hover:border-[#007ACC]/40 transition-all"
          >
            <div>
              <div className="aspect-square rounded-xl bg-slate-50 flex items-center justify-center text-4xl mb-2">
                <span>{p.imageUrl}</span>
              </div>
              <div className="text-[10px] font-bold text-[#007ACC] uppercase tracking-wider">{p.brand}</div>
              <h3 className="text-xs font-bold text-[#0F172A] line-clamp-2 leading-snug mb-1">{p.name}</h3>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
              <span className="text-sm font-extrabold text-[#007ACC]">฿{p.promoPrice.toLocaleString()}</span>
              <button
                type="button"
                onClick={() => addToCart(p, 1)}
                className="mt-1 h-7 bg-slate-100 hover:bg-[#007ACC] text-[#0F172A] hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <span>ใส่ตะกร้า</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
