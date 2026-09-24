'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  RefreshCw,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useStaffGuard } from '@/lib/staffAuth';
import type { PublicApplication, ApplicationStatus } from '@/features/applications/types';
import { STATUS_LABELS } from '@/features/applications/types';
import styles from '../staff.module.css';

const TABS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'ทั้งหมด' },
  { key: 'SUBMITTED', label: 'ส่งคำขอแล้ว' },
  { key: 'UNDER_REVIEW', label: 'กำลังตรวจสอบ' },
  { key: 'NEEDS_INFO', label: 'ขอข้อมูลเพิ่ม' },
  { key: 'APPROVED', label: 'อนุมัติแล้ว' },
  { key: 'APPOINTMENT_SET', label: 'นัดหมายแล้ว' },
  { key: 'COMPLETED', label: 'สำเร็จแล้ว' },
  { key: 'CANCELLED', label: 'ยกเลิก/ปฏิเสธ' },
];

export default function StaffApplicationsQueuePage() {
  const { staff, isChecking } = useStaffGuard();

  const [applications, setApplications] = useState<PublicApplication[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentStatus, setCurrentStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: '15',
      });
      if (currentStatus !== 'ALL') {
        params.set('status', currentStatus);
      }
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/staff/applications?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'ไม่สามารถโหลดรายการใบสมัครได้');
        return;
      }

      setApplications(data.applications || []);
      setStatusCounts(data.statusCounts || {});
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentStatus, searchQuery]);

  useEffect(() => {
    if (staff) {
      void fetchApplications();
    }
  }, [staff, fetchApplications]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    void fetchApplications();
  };

  if (isChecking || !staff) {
    return <div className="p-8 text-center text-slate-500">กำลังตรวจสอบสิทธิ์เจ้าหน้าที่...</div>;
  }

  const isBranchManager = staff.role === 'BRANCH_MANAGER';

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#142B4A] text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">คิวตรวจสอบใบสมัครผ่อนชำระ</h1>
            <span className="text-xs bg-[#FF6E00] text-white px-2.5 py-0.5 rounded font-bold">
              {staff.role}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {isBranchManager
              ? `ขอบเขตงาน: สาขา ${staff.branchId}`
              : 'ขอบเขตงาน: ทุกสาขา (HQ / Admin Scope)'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchApplications()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold self-start sm:self-center transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="ค้นหาด้วยรหัสใบสมัคร (APP-...), ชื่อลูกค้า, หรือเบอร์โทรศัพท์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#CBD5E1] text-xs text-[#142B4A] outline-none focus:border-[#FF6E00]"
            />
          </div>
          <button
            type="submit"
            className="px-5 h-11 bg-[#142B4A] hover:bg-[#0E1E34] text-white text-xs font-bold rounded-xl shrink-0 transition-colors"
          >
            ค้นหา
          </button>
        </form>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {TABS.map((tab) => {
            const count = statusCounts[tab.key] ?? 0;
            const isActive = currentStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setCurrentStatus(tab.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#142B4A] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold">{errorMsg}</div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#FF6E00]" />
            <span>กำลังโหลดคิวใบสมัคร...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <p>ไม่พบรายการใบสมัครในสถานะหรือเงื่อนไขที่ค้นหา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                  <th className="py-3 px-4 font-bold">รหัสใบสมัคร</th>
                  <th className="py-3 px-4 font-bold">ลูกค้าผู้สมัคร</th>
                  <th className="py-3 px-4 font-bold">สินค้า / รุ่น</th>
                  <th className="py-3 px-4 font-bold">แผนผ่อนชำระ</th>
                  <th className="py-3 px-4 font-bold">สาขารับเครื่อง</th>
                  <th className="py-3 px-4 font-bold">สถานะ</th>
                  <th className="py-3 px-4 font-bold">วันที่ส่ง</th>
                  <th className="py-3 px-4 font-bold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {applications.map((app) => {
                  const statusCfg = STATUS_LABELS[app.status] || {
                    label: app.status,
                    color: '#64748B',
                    bg: '#F1F5F9',
                  };

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#142B4A]">
                        {app.reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#142B4A]">{app.contactName}</div>
                        <div className="text-[11px] text-[#64748B]">{app.verifiedPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#142B4A]">{app.productSnapshot.name}</div>
                        <div className="text-[11px] text-[#64748B]">
                          {app.variantSnapshot.storage} • {app.variantSnapshot.color}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#FF6E00]">
                          {app.offerSnapshot.monthlyInstallmentFormatted} / ด.
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          ดาวน์ {app.offerSnapshot.downPaymentFormatted} ({app.offerSnapshot.tenorMonths} งวด)
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#142B4A]">
                        {app.branchSnapshot.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                        >
                          ● {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {new Date(app.createdAt).toLocaleDateString('th-TH')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/staff/applications/${app.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#142B4A] hover:bg-[#0E1E34] text-white rounded-lg font-bold text-xs transition-colors shadow-xs"
                        >
                          <Eye size={13} />
                          <span>ตรวจสอบ</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <div>
              แสดงหน้า <strong>{currentPage}</strong> จากทั้งหมด <strong>{totalPages}</strong> หน้า (รวม {total} รายการ)
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#CBD5E1] bg-white disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
