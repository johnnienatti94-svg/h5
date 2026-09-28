'use client';

import React, { useState } from 'react';
import { resolveProductsFromDataSource, DetailedProduct } from '@/lib/productsData';
import { useCart } from '@/context/CartContext';
import { calculateDownPayment, getLowestInstallmentPackage } from '@/lib/financing';

interface Tab {
  id: string;
  label: string;
  dataSource: {
    type?: string;
    targetId?: string;
    limit?: number;
  };
}

interface Props {
  widget: {
    id: string;
    title?: string;
    config?: {
      tabs?: Tab[];
    };
  };
}

const DEFAULT_TABS: Tab[] = [
  { id: 'hot', label: '🔥 ดีลยอดฮิต', dataSource: { type: 'promotion', limit: 4 } },
  { id: 'apple', label: 'Apple', dataSource: { type: 'brand', targetId: 'Apple', limit: 4 } },
  { id: 'samsung', label: 'Samsung', dataSource: { type: 'brand', targetId: 'Samsung', limit: 4 } },
  { id: 'tablets', label: 'แท็บเล็ต', dataSource: { type: 'category', targetId: 'tablet', limit: 4 } },
];

export default function TabbedProductsWidget({ widget }: Props) {
  const { addToCart } = useCart();
  const cfg = widget.config || {};
  const tabs = cfg.tabs && cfg.tabs.length > 0 ? cfg.tabs : DEFAULT_TABS;
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const products = resolveProductsFromDataSource(activeTab.dataSource);

  const handleAdd = (p: DetailedProduct) => {
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
  };

  return (
    <div className="w-full my-5">
      {/* Title */}
      {widget.title && (
        <h2 className="text-base sm:text-lg font-bold text-[#0F172A] mb-3 px-1">
          {widget.title}
        </h2>
      )}

      {/* Tabs Scroller */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTabId(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeTabId === tab.id
                ? 'bg-[#FF6E00] text-white border-[#FF6E00] shadow-xs'
                : 'bg-white text-[#64748B] hover:text-[#0F172A] border-[#E2E8F0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map((p) => {
          const downInfo = calculateDownPayment(p.promoPrice);
          const lowestPkg = getLowestInstallmentPackage(p.promoPrice, downInfo.downPayment);

          return (
            <div
              key={p.id}
              className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-3 flex flex-col justify-between group hover:border-[#FF6E00]/40 transition-all"
            >
              <div>
                <div className="aspect-square rounded-xl bg-slate-50 flex items-center justify-center text-4xl mb-2">
                  <span>{p.imageUrl}</span>
                </div>
                <div className="text-[10px] font-bold text-[#FF6E00] uppercase tracking-wider">{p.brand}</div>
                <h3 className="text-xs font-bold text-[#0F172A] line-clamp-2 leading-snug mb-1">{p.name}</h3>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1">
                <span className="text-sm font-extrabold text-[#142B4A]">
                  ดาวน์ ฿{downInfo.downPayment.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#FF6E00] bg-[#FFF6EF] font-bold px-1.5 py-0.5 rounded self-start">
                  ผ่อน ฿{lowestPkg.monthlyAmount.toLocaleString()}/ด. ({lowestPkg.months}ด.)
                </span>
                <button
                  type="button"
                  onClick={() => handleAdd(p)}
                  className="mt-1 h-7 bg-slate-100 hover:bg-[#FF6E00] text-[#0F172A] hover:text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>ใส่ตะกร้า</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
