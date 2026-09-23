'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MEEPRO_BRANCHES } from '@/lib/branchesData';

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      title?: string;
    };
  };
}

export default function StoreLocatorWidget({ widget }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'bangkok' | 'vicinity' | 'provincial'>('all');
  const title = widget?.config?.title || widget?.title || 'ค้นหาสาขาใกล้คุณ (45 สาขาทั่วประเทศ)';

  const filtered = selectedRegion === 'all'
    ? MEEPRO_BRANCHES
    : MEEPRO_BRANCHES.filter((b) => b.region === selectedRegion);

  return (
    <div className="w-full my-6 p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6E00] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">storefront</span>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">{title}</h2>
            <p className="text-xs text-[#64748B]">รับเครื่องจริงหรือนำเครื่องมาซ่อมได้ทุกวัน</p>
          </div>
        </div>

        <Link
          href="/location"
          className="text-xs font-bold text-[#007ACC] hover:underline self-start sm:self-auto"
        >
          ดูสาขาทั้งหมด ›
        </Link>
      </div>

      {/* Region Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'ทั้งหมด' },
          { id: 'bangkok', label: 'กรุงเทพฯ' },
          { id: 'vicinity', label: 'ปริมณฑล' },
          { id: 'provincial', label: 'ต่างจังหวัด' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedRegion(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedRegion === tab.id
                ? 'bg-[#007ACC] text-white shadow-xs'
                : 'bg-slate-100 text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.slice(0, 3).map((branch) => (
          <div
            key={branch.id}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-xs font-bold text-[#0F172A] leading-snug">{branch.name}</h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                  เปิดอยู่
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                {branch.floor} • {branch.address}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">{branch.displayPhone}</span>
              <a
                href={branch.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#007ACC] font-bold flex items-center gap-0.5 hover:underline"
              >
                <span>แผนที่</span>
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
