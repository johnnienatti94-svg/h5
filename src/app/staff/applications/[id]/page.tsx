'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  User,
  XCircle,
  MessageSquare,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useStaffGuard } from '@/lib/staffAuth';
import type { PublicApplication, ApplicationStatus } from '@/features/applications/types';
import { STATUS_LABELS } from '@/features/applications/types';
import type { StaffInternalNote } from '@/features/staff/types';

export default function StaffApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { staff, isChecking } = useStaffGuard();

  const [application, setApplication] = useState<PublicApplication | null>(null);
  const [internalNotes, setInternalNotes] = useState<StaffInternalNote[]>([]);
  const [newNote, setNewNote] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Decision Modal States
  const [activeModal, setActiveModal] = useState<
    'UNDER_REVIEW' | 'APPROVED' | 'NEEDS_INFO' | 'REJECTED' | 'APPOINTMENT' | 'COMPLETED' | 'CANCELLED' | null
  >(null);
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [customerMessage, setCustomerMessage] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchDetail = useCallback(async () => {
    if (!params.id) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [appRes, notesRes] = await Promise.all([
        fetch(`/api/staff/applications/${params.id}`),
        fetch(`/api/staff/applications/${params.id}/notes`),
      ]);

      const appData = await appRes.json();
      const notesData = await notesRes.json();

      if (!appRes.ok || !appData.success) {
        setErrorMsg(appData.error || 'ไม่สามารถโหลดใบสมัครได้');
        return;
      }

      setApplication(appData.application);
      if (notesData.success && Array.isArray(notesData.notes)) {
        setInternalNotes(notesData.notes);
      }
    } catch {
      setErrorMsg('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (staff) {
      void fetchDetail();
    }
  }, [staff, fetchDetail]);

  const handleStatusChange = async (targetStatus: ApplicationStatus) => {
    if (!application) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/staff/applications/${application.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toStatus: targetStatus,
          reason: decisionReason || undefined,
          customerMessage: customerMessage || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'ไม่สามารถเปลี่ยนสถานะได้');
        return;
      }

      setApplication(data.application);
      setActiveModal(null);
      setDecisionReason('');
      setCustomerMessage('');
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึกสถานะ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleAppointment = async () => {
    if (!application || !appointmentDate) {
      alert('กรุณาระบุวันและเวลานัดหมาย');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/staff/applications/${application.id}/appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startsAt: new Date(appointmentDate).toISOString(),
          note: decisionReason || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'ไม่สามารถบันทึกนัดหมายได้');
        return;
      }

      setApplication(data.application);
      setActiveModal(null);
      setAppointmentDate('');
      setDecisionReason('');
    } catch {
      alert('เกิดข้อผิดพลาดในการนัดหมาย');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !application) return;

    try {
      const res = await fetch(`/api/staff/applications/${application.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.note) {
        setInternalNotes((prev) => [...prev, data.note]);
        setNewNote('');
      } else {
        alert(data.error || 'ไม่สามารถบันทึกโน้ตได้');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการบันทึกโน้ต');
    }
  };

  if (isChecking || !staff) {
    return <div className="p-8 text-center text-slate-500">กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">กำลังโหลดรายละเอียดใบสมัคร...</div>;
  }

  if (errorMsg || !application) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center max-w-lg mx-auto">
        <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-[#142B4A]">ไม่สามารถเข้าถึงใบสมัครนี้ได้</h2>
        <p className="text-xs text-[#64748B] mt-1 mb-4">{errorMsg || 'ไม่พบใบสมัคร หรืออยู่นอกเหนือขอบเขตสาขาที่ได้รับมอบหมาย'}</p>
        <Link
          href="/staff/applications"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#142B4A] text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft size={14} />
          <span>กลับสู่คิวใบสมัคร</span>
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_LABELS[application.status] || {
    label: application.status,
    color: '#64748B',
    bg: '#F1F5F9',
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-16">
      {/* Top Breadcrumb & Status Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/staff/applications"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#142B4A] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#142B4A]">{application.reference}</span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
              >
                ● {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              ยื่นคำขอเมื่อ {new Date(application.createdAt).toLocaleString('th-TH')} • สาขา {application.branchSnapshot.name}
            </p>
          </div>
        </div>

        <div className="text-xs text-right">
          <span className="text-[#64748B]">เจ้าหน้าที่ตรวจสอบ: </span>
          <strong className="text-[#142B4A]">{staff.name} ({staff.role})</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Applicant, Product, Branch, Audit Trail */}
        <div className="lg:col-span-2 space-y-4">
          {/* 1. Applicant Profile */}
          <section className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
              <User size={18} className="text-[#FF6E00]" />
              <span>ข้อมูลผู้สมัคร</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B] block">ชื่อ-นามสกุล:</span>
                <strong className="text-sm text-[#142B4A]">{application.contactName}</strong>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B] block">เบอร์โทรศัพท์ยืนยัน OTP:</span>
                <a href={`tel:${application.verifiedPhone}`} className="text-sm font-bold text-[#FF6E00] hover:underline flex items-center gap-1">
                  <Phone size={14} />
                  <span>{application.verifiedPhone}</span>
                </a>
              </div>
            </div>

            {application.customerNote && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>หมายเหตุจากลูกค้า:</strong> {application.customerNote}
              </div>
            )}
          </section>

          {/* 2. Device & Offer Breakdown */}
          <section className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
              <Smartphone size={18} className="text-[#FF6E00]" />
              <span>สินค้าและข้อตกลงผ่อนชำระ (Snapshot)</span>
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
                <p className="text-xs text-[#64748B]">
                  ความจุ {application.variantSnapshot.storage} • สี {application.variantSnapshot.color}
                </p>
                <div className="text-xs font-bold text-[#FF6E00] mt-1">
                  ผ่อน 0% {application.offerSnapshot.monthlyInstallmentFormatted} / เดือน ({application.offerSnapshot.tenorMonths} งวด)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B] block">ราคาเงินสด:</span>
                <strong className="text-[#142B4A]">{application.variantSnapshot.cashPriceFormatted}</strong>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B] block">เงินดาวน์:</span>
                <strong className="text-[#FF6E00]">{application.offerSnapshot.downPaymentFormatted}</strong>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B] block">ค่างวดต่อเดือน:</span>
                <strong className="text-[#142B4A]">{application.offerSnapshot.monthlyInstallmentFormatted}</strong>
              </div>
              <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B] block">ยอดรวมทั้งสัญญา:</span>
                <strong className="text-[#142B4A]">{application.offerSnapshot.totalPayableFormatted}</strong>
              </div>
            </div>
          </section>

          {/* 3. Appointment Info */}
          {application.appointment && (
            <section className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-sm text-purple-950">
                <Calendar size={16} className="text-purple-600" />
                <span>กำหนดการนัดหมายรับเครื่องที่สาขา</span>
              </div>
              <div>วันและเวลา: <strong>{new Date(application.appointment.startsAt).toLocaleString('th-TH')}</strong></div>
              <div>สาขา: <strong>{application.branchSnapshot.name}</strong></div>
              {application.appointment.note && <div>บันทึกนัดหมาย: {application.appointment.note}</div>}
            </section>
          )}

          {/* 4. Full Audit Trail */}
          <section className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
              <Clock size={18} className="text-[#FF6E00]" />
              <span>ประวัติและบันทึกการดำเนินการ (Audit Trail)</span>
            </h2>

            <div className="space-y-3 text-xs">
              {application.events.map((evt, idx) => (
                <div key={evt.id || idx} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#142B4A]">{evt.message || evt.eventType}</span>
                    <span className="text-[10px] text-slate-400">{new Date(evt.createdAt).toLocaleString('th-TH')}</span>
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    ผู้ดำเนินการ: <strong>{evt.actorKind}</strong> {evt.customerVisible ? '• (ลูกค้ามองเห็น)' : '• [เฉพาะเจ้าหน้าที่]'}
                  </div>
                  {evt.reason && <p className="text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-200 mt-1">{evt.reason}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Decision Actions & Internal Notes */}
        <div className="space-y-4">
          {/* Decision Action Box */}
          <section className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#FF6E00]" />
              <span>การตัดสินใจและการเปลี่ยนสถานะ</span>
            </h2>

            <div className="space-y-2">
              {application.status === 'SUBMITTED' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange('UNDER_REVIEW')}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                >
                  เริ่มตรวจสอบคำขอ (Under Review)
                </button>
              )}

              {application.status === 'UNDER_REVIEW' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveModal('APPROVED')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    ✓ อนุมัติคำขอ (Approve)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal('NEEDS_INFO')}
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    ขอข้อมูล/เอกสารเพิ่ม (Request Info)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal('REJECTED')}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    ✕ ปฏิเสธคำขอ (Reject)
                  </button>
                </>
              )}

              {application.status === 'APPROVED' && (
                <button
                  type="button"
                  onClick={() => setActiveModal('APPOINTMENT')}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                >
                  📅 นัดหมายรับเครื่องที่สาขา (Set Appointment)
                </button>
              )}

              {application.status === 'APPOINTMENT_SET' && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveModal('COMPLETED')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    ✓ ส่งมอบเครื่องและทำสัญญาสำเร็จ (Complete)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal('APPOINTMENT')}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                  >
                    เปลี่ยนเวลานัดหมาย
                  </button>
                </>
              )}

              {!['COMPLETED', 'REJECTED', 'CANCELLED'].includes(application.status) && (
                <button
                  type="button"
                  onClick={() => setActiveModal('CANCELLED')}
                  className="w-full py-2 text-slate-500 hover:text-red-600 font-semibold text-xs transition-colors"
                >
                  ยกเลิกคำขอสมัคร
                </button>
              )}
            </div>
          </section>

          {/* Internal Staff Notes */}
          <section className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
              <MessageSquare size={18} className="text-[#FF6E00]" />
              <span>บันทึกภายใน (Internal Notes)</span>
            </h2>
            <p className="text-[11px] text-[#64748B]">
              ข้อความส่วนนี้สำหรับเจ้าหน้าที่เท่านั้น ลูกค้าจะไม่สามารถมองเห็นได้
            </p>

            {/* Note Input */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                placeholder="เขียนบันทึกสำหรับเพื่อนร่วมงาน เช่น โทรคุยกับลูกค้าแล้ว..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#CBD5E1] text-xs text-[#142B4A] outline-none min-h-16"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="w-full py-2 bg-[#142B4A] hover:bg-[#0E1E34] text-white rounded-xl font-bold text-xs transition-colors disabled:opacity-40"
              >
                บันทึกโน้ตภายใน
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-2 pt-2 border-t border-[#F1F5F9] max-h-64 overflow-y-auto">
              {internalNotes.length === 0 ? (
                <div className="text-center text-slate-400 py-3 text-[11px]">ยังไม่มีบันทึกภายใน</div>
              ) : (
                internalNotes.map((n) => (
                  <div key={n.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <p className="text-slate-800">{n.note}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>{n.staffName}</span>
                      <span>{new Date(n.createdAt).toLocaleString('th-TH')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Decision Action Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#142B4A]">
              {activeModal === 'APPROVED' && 'ยืนยันการอนุมัติคำขอ'}
              {activeModal === 'NEEDS_INFO' && 'ขอข้อมูล/เอกสารเพิ่มเติมจากลูกค้า'}
              {activeModal === 'REJECTED' && 'ปฏิเสธคำขอสมัคร'}
              {activeModal === 'APPOINTMENT' && 'กำหนดเวลานัดหมายรับเครื่องที่สาขา'}
              {activeModal === 'COMPLETED' && 'ยืนยันส่งมอบเครื่องและทำสัญญาเสร็จสิ้น'}
              {activeModal === 'CANCELLED' && 'ยกเลิกคำขอสมัคร'}
            </h3>

            {activeModal === 'APPOINTMENT' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#142B4A] mb-1">วันและเวลานัดหมาย</label>
                  <input
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#142B4A] mb-1">คำแนะนำเพิ่มเติมสำหรับลูกค้า</label>
                  <input
                    type="text"
                    placeholder="เช่น ติดต่อเคาน์เตอร์ 2 นำบัตรประชาชนตัวจริงมาด้วย"
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#142B4A] mb-1">เหตุผลในการตัดสินใจ (บันทึกเข้าระบบ)</label>
                  <textarea
                    placeholder="ระบุเหตุผลในการตัดสินใจ..."
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#CBD5E1] text-xs outline-none min-h-16"
                  />
                </div>
                {(activeModal === 'NEEDS_INFO' || activeModal === 'APPROVED') && (
                  <div>
                    <label className="block text-xs font-bold text-[#142B4A] mb-1">ข้อความแจ้งเตือนลูกค้า (Customer Message)</label>
                    <input
                      type="text"
                      placeholder="ข้อความที่ลูกค้าจะมองเห็นในไทม์ไลน์..."
                      value={customerMessage}
                      onChange={(e) => setCustomerMessage(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-slate-600"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeModal === 'APPOINTMENT') {
                    void handleScheduleAppointment();
                  } else {
                    void handleStatusChange(activeModal);
                  }
                }}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-[#142B4A] hover:bg-[#0E1E34] text-white text-xs font-bold"
              >
                {isProcessing ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
