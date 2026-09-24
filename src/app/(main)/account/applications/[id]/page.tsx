'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import type { PublicApplication } from '@/features/applications/types';
import { STATUS_LABELS } from '@/features/applications/types';

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [application, setApplication] = useState<PublicApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/applications/${params.id}`);
        const data = await res.json();
        if (!active) return;

        if (!res.ok || !data.success) {
          setError(data.message || 'ไม่สามารถโหลดข้อมูลใบสมัครได้');
          return;
        }

        setApplication(data.application);
      } catch {
        if (active) setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    if (params.id) {
      void fetchDetail();
    }

    return () => {
      active = false;
    };
  }, [params.id]);

  const handleCancelApplication = async () => {
    if (!application) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/applications/${application.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'ไม่สามารถยกเลิกใบสมัครได้');
        return;
      }
      setApplication(data.application);
      setShowCancelModal(false);
    } catch {
      alert('เกิดข้อผิดพลาดในการยกเลิก');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-12" role="status">
        <div className="h-64 rounded-2xl border border-[#E2E8F0] bg-white animate-pulse" />
        <span className="sr-only">กำลังโหลดข้อมูลใบสมัคร...</span>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <XCircle size={28} />
          </div>
          <h1 className="text-xl font-bold text-[#142B4A]">ไม่พบข้อมูลใบสมัคร</h1>
          <p className="text-sm text-[#64748B] mt-2 mb-6">{error || 'ใบสมัครอาจถูกลบหรือไม่มีสิทธิ์เข้าถึง'}</p>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6E00] text-white rounded-xl font-bold text-sm"
          >
            <ArrowLeft size={16} />
            <span>กลับสู่หน้าบัญชี</span>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_LABELS[application.status] || {
    label: application.status,
    color: '#64748B',
    bg: '#F1F5F9',
  };

  const canCancel = ['SUBMITTED', 'UNDER_REVIEW'].includes(application.status);

  return (
    <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-5">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#142B4A]"
        >
          <ArrowLeft size={16} />
          <span>กลับสู่หน้าบัญชี</span>
        </Link>
        <span className="text-xs font-mono font-bold text-[#142B4A] bg-slate-100 px-2.5 py-1 rounded-md">
          {application.reference}
        </span>
      </div>

      {/* Header Status Card */}
      <section className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-[#64748B]">สถานะใบสมัคร</span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
              >
                ● {statusConfig.label}
              </span>
              <span className="text-xs text-[#64748B]">
                (อัปเดตล่าสุด: {new Date(application.updatedAt).toLocaleDateString('th-TH')})
              </span>
            </div>
          </div>

          {canCancel && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors self-start sm:self-center"
            >
              ยกเลิกคำขอสมัคร
            </button>
          )}
        </div>
      </section>

      {/* Product & Installment Breakdown */}
      <section className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
          <Smartphone size={18} className="text-[#FF6E00]" />
          <span>รายละเอียดสินค้าและข้อตกลงผ่อนชำระ</span>
        </h2>

        <div className="flex gap-4 items-center bg-[#FFF6EF] p-4 rounded-xl border border-[#FFE4D1]">
          <div className="w-16 h-16 bg-white rounded-lg border border-[#FFE4D1] p-1 shrink-0 flex items-center justify-center">
            <Image
              src={application.productSnapshot.heroImageUrl}
              alt={application.productSnapshot.name}
              width={60}
              height={60}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#142B4A]">{application.productSnapshot.name}</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              ความจุ {application.variantSnapshot.storage} • สี {application.variantSnapshot.color}
            </p>
            <div className="text-xs font-bold text-[#FF6E00] mt-1">
              ผ่อน 0% {application.offerSnapshot.monthlyInstallmentFormatted} / เดือน ({application.offerSnapshot.tenorMonths} งวด)
            </div>
          </div>
        </div>

        {/* Financial Ledger Table */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs space-y-2 text-[#475569]">
          <div className="flex justify-between">
            <span>ราคาเงินสดเต็มจำนวน:</span>
            <span className="font-semibold text-[#142B4A]">{application.variantSnapshot.cashPriceFormatted}</span>
          </div>
          <div className="flex justify-between">
            <span>เงินดาวน์ (ชำระวันรับเครื่อง):</span>
            <span className="font-semibold text-[#FF6E00]">{application.offerSnapshot.downPaymentFormatted}</span>
          </div>
          <div className="flex justify-between">
            <span>ค่างวดต่อเดือน:</span>
            <span className="font-semibold text-[#142B4A]">
              {application.offerSnapshot.monthlyInstallmentFormatted} × {application.offerSnapshot.tenorMonths} เดือน
            </span>
          </div>
          <div className="flex justify-between">
            <span>ค่าธรรมเนียมสัญญา:</span>
            <span>{application.offerSnapshot.feeMinor > 0 ? `${application.offerSnapshot.feeMinor / 100} บาท` : '0 บาท (ฟรี)'}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#E2E8F0] font-bold text-sm text-[#142B4A]">
            <span>ยอดรวมทั้งสิ้นตลอดสัญญา:</span>
            <span className="text-[#FF6E00]">{application.offerSnapshot.totalPayableFormatted}</span>
          </div>
        </div>
      </section>

      {/* Selected Branch Section */}
      <section className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
          <MapPin size={18} className="text-[#FF6E00]" />
          <span>สาขาที่นัดหมายรับเครื่อง & ตรวจสอบเอกสาร</span>
        </h2>

        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
          <div className="font-bold text-sm text-[#142B4A]">{application.branchSnapshot.name}</div>
          <p className="text-xs text-[#64748B]">{application.branchSnapshot.fullAddress}</p>
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <a
              href={`tel:${application.branchSnapshot.displayPhone}`}
              className="inline-flex items-center gap-1 text-[#142B4A] font-bold hover:underline"
            >
              <Phone size={14} className="text-[#FF6E00]" />
              <span>{application.branchSnapshot.displayPhone}</span>
            </a>
            <a
              href={application.branchSnapshot.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#FF6E00] font-bold hover:underline"
            >
              <ExternalLink size={14} />
              <span>เปิด Google Maps</span>
            </a>
          </div>
        </div>
      </section>

      {/* Appointment Information (if scheduled) */}
      {application.appointment && (
        <section className="bg-purple-50 rounded-2xl p-5 border border-purple-200 shadow-sm space-y-2">
          <h2 className="text-sm font-bold text-purple-950 flex items-center gap-2">
            <Calendar size={18} className="text-purple-600" />
            <span>เวลานัดหมายรับเครื่องที่สาขา</span>
          </h2>
          <div className="text-xs text-purple-800">
            วันและเวลา: <strong>{new Date(application.appointment.startsAt).toLocaleString('th-TH')}</strong>
          </div>
          {application.appointment.note && (
            <p className="text-xs text-purple-700 mt-1">ข้อความจากสาขา: {application.appointment.note}</p>
          )}
        </section>
      )}

      {/* Customer Event Timeline */}
      <section className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
          <Clock size={18} className="text-[#FF6E00]" />
          <span>ประวัติและขั้นตอนการดำเนินการ (Timeline)</span>
        </h2>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
          {application.events.map((evt, idx) => (
            <div key={evt.id || idx} className="relative">
              <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-[#FF6E00]" />
              <div className="text-xs font-bold text-[#142B4A]">
                {evt.message || evt.eventType}
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-0.5">
                {new Date(evt.createdAt).toLocaleString('th-TH')}
              </div>
              {evt.reason && (
                <div className="text-xs text-[#64748B] mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {evt.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <AlertTriangle size={20} />
              <span>ยืนยันการยกเลิกคำขอสมัคร</span>
            </div>
            <p className="text-xs text-[#64748B]">
              เมื่อยกเลิกแล้ว คำขอนี้จะไม่สามารถนำกลับมาดำเนินการต่อได้ หากต้องการผ่อนสินค้า คุณสามารถสร้างคำขอใหม่ได้เสมอ
            </p>
            <div>
              <label className="block text-xs font-bold text-[#142B4A] mb-1">เหตุผลในการยกเลิก (ไม่บังคับ)</label>
              <textarea
                placeholder="ระบุเหตุผลเพื่อเป็นข้อมูลให้เราปรับปรุงบริการ"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#CBD5E1] text-xs text-[#142B4A] outline-none min-h-16"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#64748B]"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleCancelApplication}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                {isCancelling ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกคำขอ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
