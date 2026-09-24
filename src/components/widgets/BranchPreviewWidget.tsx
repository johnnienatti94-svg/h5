'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, MapPin, Phone, ArrowRight } from 'lucide-react';
import BranchDetailsDialog from '@/components/branches/BranchDetailsDialog';
import type { PublicBranch, StoresListApiResponse } from '@/features/branches/types';

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      title?: string;
      subtitle?: string;
      maxBranches?: number;
      showCta?: boolean;
    };
  };
}

export default function BranchPreviewWidget({ widget }: Props) {
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<PublicBranch | null>(null);
  const [returnFocusElement, setReturnFocusElement] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(true);

  const cfg = widget?.config || {};
  const title = cfg.title || widget?.title || 'สาขาบริการใกล้คุณ พร้อมให้คำปรึกษา';
  const subtitle = cfg.subtitle || 'ครอบคลุม 45 สาขาทั่วประเทศ รับเครื่องได้ทันทีหลังอนุมัติ';
  const maxBranches = cfg.maxBranches || 3;

  useEffect(() => {
    let active = true;
    void fetch('/api/stores')
      .then(async (res) => {
        const json = (await res.json()) as StoresListApiResponse;
        if (active && json.success && Array.isArray(json.data?.stores)) {
          setBranches(json.data.stores);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const displayedBranches = branches.slice(0, maxBranches);

  return (
    <section
      aria-label={title}
      className="w-full my-6 p-5 sm:p-7 rounded-3xl bg-white border border-[#E2E8F0] shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6E00] uppercase tracking-wider mb-1">
            <Store size={16} />
            <span>MeePro Official Store</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#142B4A]">{title}</h2>
          <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>
        </div>
        <Link
          href="/stores"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6E00] hover:text-[#e06100] transition-colors"
        >
          <span>ค้นหาครบทั้ง 45 สาขา</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayedBranches.map((branch) => (
            <div
              key={branch.id}
              className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FF6E00]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-[#142B4A]">{branch.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    เปิดให้บริการ
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-[#64748B] mb-2 leading-relaxed">
                  <MapPin size={15} className="text-[#FF6E00] shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{branch.fullAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#475569] mb-4">
                  <Phone size={14} className="text-[#007ACC] shrink-0" />
                  <span>{branch.displayPhone}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={(e) => {
                    setReturnFocusElement(e.currentTarget);
                    setSelectedBranch(branch);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#142B4A] hover:bg-slate-50 transition-colors"
                >
                  รายละเอียด & แผนที่
                </button>
                <Link
                  href={`/apply?branchId=${branch.id}`}
                  className="py-2 px-3 rounded-xl bg-[#FF6E00] text-xs font-bold text-white hover:bg-[#e06100] transition-colors"
                >
                  เลือกสาขานี้
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBranch && (
        <BranchDetailsDialog
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
          returnFocusElement={returnFocusElement}
        />
      )}
    </section>
  );
}
