'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Store,
  MapPin,
  Phone,
  ExternalLink,
  Plus,
  CheckCircle,
  AlertCircle,
  Search,
} from 'lucide-react';
import type { PublicBranch, StoresListApiResponse } from '@/features/branches/types';
import BranchDetailsDialog from '@/components/branches/BranchDetailsDialog';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<PublicBranch | null>(null);

  const loadBranches = async () => {
    try {
      const res = await fetch('/api/stores');
      const data = (await res.json()) as StoresListApiResponse;
      if (data.success && Array.isArray(data.data?.stores)) {
        setBranches(data.data.stores);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBranches();
  }, []);

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.fullAddress.toLowerCase().includes(search.toLowerCase()) ||
      b.displayPhone.includes(search)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#142B4A]">จัดการสาขา (Store Branches)</h1>
          <p className="text-sm text-slate-500 mt-1">
            ควบคุมรายชื่อสาขา 45 แห่งทั่วไทย ข้อมูลติดต่อ เวลาเปิดทำการ และพิกัด Google Maps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/stores"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>ดูหน้าร้านค้าจริง</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อสาขา ที่อยู่ หรือเบอร์โทร..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          พบทั้งหมด {filteredBranches.length} สาขา
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">ชื่อสาขา</th>
                <th className="py-3.5 px-4">ภูมิภาค / จังหวัด</th>
                <th className="py-3.5 px-4">เบอร์โทรติดต่อ</th>
                <th className="py-3.5 px-4">เวลาเปิด-ปิด</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-bold text-[#142B4A]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6E00] flex items-center justify-center shrink-0">
                        <Store size={16} />
                      </div>
                      <div>
                        <div>{branch.name}</div>
                        <div className="text-[11px] font-normal text-slate-500 line-clamp-1 max-w-xs">
                          {branch.fullAddress}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 font-medium">
                      {branch.region}
                    </span>
                    <span className="text-slate-400 ml-1.5">{branch.province}</span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-[#007ACC]">{branch.displayPhone}</td>
                  <td className="py-4 px-4 text-xs text-slate-500">{branch.openingHours}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBranch(branch)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                      >
                        พรีวิว Dialog
                      </button>
                      <a
                        href={branch.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                        title="เปิดใน Google Maps"
                      >
                        แผนที่ ↗
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedBranch && (
        <BranchDetailsDialog
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
        />
      )}
    </div>
  );
}
