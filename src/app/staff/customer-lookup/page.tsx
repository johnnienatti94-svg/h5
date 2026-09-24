'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, User, Smartphone, MapPin, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useStaffGuard } from '@/lib/staffAuth';
import type { PublicApplication } from '@/features/applications/types';
import { STATUS_LABELS } from '@/features/applications/types';

export default function CustomerLookupPage() {
  const { staff, isChecking } = useStaffGuard();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [customerData, setCustomerData] = useState<{
    phone: string;
    name?: string;
    applications: PublicApplication[];
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setCustomerData(null);

    try {
      const res = await fetch(`/api/staff/customer-lookup?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'ไม่พบข้อมูลลูกค้าสำหรับหมายเลขนี้');
        return;
      }

      setCustomerData(data.customer);
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking || !staff) {
    return <div className="p-8 text-center text-slate-500">กำลังตรวจสอบสิทธิ์...</div>;
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="bg-[#142B4A] text-white p-5 rounded-2xl">
        <h1 className="text-xl font-bold">ค้นหาประวัติลูกค้า (Customer Lookup)</h1>
        <p className="text-xs text-slate-300 mt-1">
          ค้นหาด้วยหมายเลขโทรศัพท์เพื่อตรวจสอบประวัติใบสมัคร วงเงิน และการทำสัญญาในระบบ
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              placeholder="กรอกเบอร์โทรศัพท์ลูกค้า เช่น 0812345678..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#CBD5E1] text-xs text-[#142B4A] outline-none focus:border-[#FF6E00]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 h-11 bg-[#FF6E00] hover:bg-[#E05D00] text-white text-xs font-bold rounded-xl shrink-0 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'กำลังค้นหา...' : 'ค้นหาข้อมูล'}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {customerData && (
        <div className="space-y-4">
          {/* Customer Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#142B4A] flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#142B4A]">
                  {customerData.name || 'ลูกค้า MeePro'}
                </h2>
                <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>เบอร์ยืนยันแล้ว: {customerData.phone}</span>
                </div>
              </div>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
              ประวัติ {customerData.applications.length} รายการ
            </span>
          </div>

          {/* Applications List */}
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#142B4A]">ประวัติใบสมัครผ่อนชำระทั้งหมด</h3>

            <div className="space-y-3">
              {customerData.applications.map((app) => {
                const statusCfg = STATUS_LABELS[app.status] || {
                  label: app.status,
                  color: '#64748B',
                  bg: '#F1F5F9',
                };

                return (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[#142B4A]">{app.reference}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                        >
                          ● {statusCfg.label}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-[#142B4A]">{app.productSnapshot.name}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        {app.variantSnapshot.storage} • {app.variantSnapshot.color} • สาขา {app.branchSnapshot.name}
                      </div>
                    </div>

                    <Link
                      href={`/staff/applications/${app.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#142B4A] hover:bg-[#0E1E34] text-white rounded-xl text-xs font-bold transition-colors self-start sm:self-center shrink-0"
                    >
                      <span>เปิดดูใบสมัคร</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
