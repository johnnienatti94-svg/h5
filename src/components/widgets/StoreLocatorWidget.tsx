'use client';

import Link from 'next/link';
import { MapPin, Store } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import BranchDetailsDialog from '@/components/branches/BranchDetailsDialog';
import type { PublicBranch, StoresListApiResponse } from '@/features/branches/types';

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: { title?: string };
  };
}

export default function StoreLocatorWidget({ widget }: Props) {
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState<PublicBranch | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [returnFocusElement, setReturnFocusElement] = useState<HTMLElement | null>(null);
  const title = widget?.config?.title || widget?.title || 'ค้นหาสาขาใกล้คุณ';

  useEffect(() => {
    let active = true;
    void fetch('/api/stores')
      .then(async (response) => {
        const result = await response.json() as StoresListApiResponse;
        if (!response.ok || !result.success) throw new Error('Store request failed');
        if (active) {
          setBranches(result.data.stores);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => { active = false; };
  }, []);

  const regions = useMemo(
    () => Array.from(new Set(branches.map((branch) => branch.region).filter((value): value is string => Boolean(value)))),
    [branches],
  );
  const filtered = selectedRegion === 'all' ? branches : branches.filter((branch) => branch.region === selectedRegion);

  return (
    <section className="w-full my-6 p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm" aria-labelledby={`store-widget-${widget?.id || 'default'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF6E00] flex items-center justify-center shrink-0">
            <Store size={23} aria-hidden="true" />
          </div>
          <div>
            <h2 id={`store-widget-${widget?.id || 'default'}`} className="text-lg font-bold text-[#142B4A]">{title}</h2>
            <p className="text-sm text-[#64748B]">ดูข้อมูลติดต่อและเส้นทางจากข้อมูลสาขาที่เผยแพร่แล้ว</p>
          </div>
        </div>
        <Link href="/stores" className="inline-flex min-h-11 items-center text-sm font-bold text-[#FF6E00] hover:underline self-start sm:self-auto">
          ดูสาขาทั้งหมด
        </Link>
      </div>

      {regions.length > 1 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1" role="group" aria-label="กรองสาขาตามภูมิภาค">
          <button type="button" onClick={() => setSelectedRegion('all')} aria-pressed={selectedRegion === 'all'} className={`min-h-11 px-4 rounded-full text-sm font-bold whitespace-nowrap ${selectedRegion === 'all' ? 'bg-[#142B4A] text-white' : 'bg-slate-100 text-[#475569]'}`}>ทั้งหมด</button>
          {regions.map((region) => (
            <button key={region} type="button" onClick={() => setSelectedRegion(region)} aria-pressed={selectedRegion === region} className={`min-h-11 px-4 rounded-full text-sm font-bold whitespace-nowrap ${selectedRegion === region ? 'bg-[#142B4A] text-white' : 'bg-slate-100 text-[#475569]'}`}>{region}</button>
          ))}
        </div>
      )}

      {status === 'loading' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="status" aria-label="กำลังโหลดสาขา">
          {[0, 1, 2].map((item) => <div key={item} className="h-36 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : status === 'error' ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-[#64748B]">ไม่สามารถโหลดข้อมูลสาขาได้ในขณะนี้</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-[#64748B]">ยังไม่มีสาขาที่เผยแพร่ในภูมิภาคนี้</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.slice(0, 3).map((branch) => (
            <article key={branch.id} className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC] flex flex-col">
              <span className="text-xs font-bold text-[#FF6E00]">{branch.region || branch.province || 'MeePro Store'}</span>
              <h3 className="mt-1 text-base font-bold text-[#142B4A] leading-snug">{branch.name}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-600 line-clamp-2 leading-relaxed">{branch.fullAddress}</p>
              <button
                type="button"
                onClick={(event) => { setReturnFocusElement(event.currentTarget); setSelectedBranch(branch); }}
                className="mt-4 min-h-11 w-full rounded-xl bg-[#FF6E00] px-3 text-sm font-bold text-white inline-flex items-center justify-center gap-2 hover:bg-[#E56200] transition-colors"
              >
                <MapPin size={17} aria-hidden="true" /> ดูรายละเอียดสาขา
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedBranch && (
        <BranchDetailsDialog branch={selectedBranch} onClose={() => setSelectedBranch(null)} returnFocusElement={returnFocusElement} />
      )}
    </section>
  );
}
