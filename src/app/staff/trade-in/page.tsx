'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useStaffGuard } from '@/lib/staffAuth';
import type { TradeInApplication, TradeInApplicationStatus } from '@/features/tradein/types';
import { TRADEIN_STATUS_LABELS } from '@/features/tradein/types';

export default function StaffTradeInQueuePage() {
  const { staff, isChecking } = useStaffGuard();

  const [applications, setApplications] = useState<TradeInApplication[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/staff/tradein/applications', window.location.origin);
      if (selectedStatus !== 'ALL') {
        url.searchParams.set('status', selectedStatus);
      }
      if (searchTerm.trim()) {
        url.searchParams.set('search', searchTerm.trim());
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success && Array.isArray(data.applications)) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error('Failed to load trade-in queue:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchTerm]);

  useEffect(() => {
    if (staff) {
      void fetchApplications();
    }
  }, [staff, fetchApplications]);

  if (isChecking) {
    return <div className="p-8 text-center text-xs text-slate-500">กำลังตรวจสอบสิทธิ์เจ้าหน้าที่...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Smartphone size={20} className="text-[#007ACC]" />
            <span>คิวงานตรวจสภาพเครื่องแลกเงิน (Trade-in Queue)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการคิวตรวจสภาพเครื่อง ตีราคาซื้อคืน และบันทึกการส่งมอบ-จ่ายเงิน
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-[#007ACC] rounded-lg border border-blue-200">
            {staff?.branchId ? `สาขาของคุณ: ${staff.branchId}` : 'ผู้ดูแลระบบส่วนกลาง (HQ)'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, เลขอ้างอิง หรือ IMEI..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:border-[#007ACC] focus:outline-none"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="p-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:border-[#007ACC] focus:outline-none"
        >
          <option value="ALL">สถานะทั้งหมด</option>
          <option value="SUBMITTED">ส่งคำขอแล้ว (SUBMITTED)</option>
          <option value="UNDER_REVIEW">กำลังตรวจสอบ (UNDER_REVIEW)</option>
          <option value="APPOINTMENT_CONFIRMED">ยืนยันนัดตรวจ (APPOINTMENT_CONFIRMED)</option>
          <option value="FINAL_OFFER_READY">รอตอบรับข้อเสนอ (FINAL_OFFER_READY)</option>
          <option value="ACCEPTED">ลูกค้ายอมรับ (ACCEPTED)</option>
          <option value="COMPLETED">สำเร็จแล้ว (COMPLETED)</option>
        </select>
      </div>

      {/* Queue List */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">กำลังโหลดรายการ...</div>
      ) : applications.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
          ไม่พบรายการคำขอในสถานะที่เลือก
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map((app) => {
            const statusMeta = TRADEIN_STATUS_LABELS[app.status] || {
              label: app.status,
              color: '#64748B',
              bg: '#F1F5F9',
            };
            const offer = app.finalOfferSnapshot || app.quoteSnapshot;

            return (
              <Link
                key={app.id}
                href={`/staff/trade-in/${app.id}`}
                className="block bg-white rounded-xl p-3 border border-slate-200 hover:border-[#007ACC] shadow-xs transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{app.reference}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{ color: statusMeta.color, backgroundColor: statusMeta.bg }}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800">
                      {app.deviceDisplaySummary.modelName} ({app.deviceDisplaySummary.storageLabel})
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>ลูกค้า: {app.contactName} ({app.verifiedPhone})</span>
                      {app.appointment && (
                        <span className="flex items-center gap-1 text-[#007ACC]">
                          <Calendar size={12} />
                          <span>{new Date(app.appointment.startsAt).toLocaleDateString('th-TH')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">ราคาเสนอ</span>
                    <span className="text-sm font-bold text-[#007ACC]">
                      ฿{offer.finalCashOfferMinor.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Rev. #{app.revision}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
