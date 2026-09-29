'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Smartphone,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ShieldCheck,
  RotateCcw,
  Send,
  User,
  Phone,
} from 'lucide-react';
import { useStaffGuard } from '@/lib/staffAuth';
import type {
  TradeInApplication,
  CustomerConditionAnswers,
  TradeInOfferAdjustment,
  TradeInHandoverChecklist,
  TradeInPaymentRecord,
} from '@/features/tradein/types';
import { TRADEIN_STATUS_LABELS } from '@/features/tradein/types';

export default function StaffTradeInInspectionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { staff, isChecking } = useStaffGuard();

  const [application, setApplication] = useState<TradeInApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'INSPECTION' | 'HANDOVER' | 'TIMELINE'>('INSPECTION');

  // Staff Inspection State
  const [inspectedAnswers, setInspectedAnswers] = useState<CustomerConditionAnswers>({});
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('0');
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [staffNote, setStaffNote] = useState<string>('');

  // Handover Checklist State
  const [lockRemovedConfirmed, setLockRemovedConfirmed] = useState(false);
  const [wipedConfirmed, setWipedConfirmed] = useState(false);
  const [agreementSigned, setAgreementSigned] = useState(false);

  // Payment Recording State
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CASH_AT_BRANCH' | 'PROMPTPAY'>('BANK_TRANSFER');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  const fetchDetail = useCallback(async () => {
    if (!params.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/staff/tradein/applications/${params.id}`);
      const data = await res.json();
      if (data.success && data.application) {
        setApplication(data.application);
        // Pre-fill inspected answers with declared answers if not yet inspected
        setInspectedAnswers(data.application.inspectedAnswers || data.application.declaredAnswers || {});
      }
    } catch (err) {
      console.error('Failed to load application:', err);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (staff) {
      void fetchDetail();
    }
  }, [staff, fetchDetail]);

  // Handle Save Inspection & Recalculate Final Offer
  const handleSaveInspection = async () => {
    if (!application) return;

    if (adjustmentAmount !== '0' && !adjustmentReason.trim()) {
      alert('กรุณาระบุเหตุผลการปรับปรุงราคาพิเศษ');
      return;
    }

    setIsProcessing(true);
    try {
      const adjustments: TradeInOfferAdjustment[] = [];
      const numAdj = Number(adjustmentAmount);
      if (numAdj !== 0) {
        adjustments.push({
          amountMinor: numAdj,
          reason: adjustmentReason.trim(),
          adjustedByStaffId: staff?.id || 'staff',
          adjustedAt: new Date().toISOString(),
        });
      }

      const res = await fetch(`/api/staff/tradein/applications/${application.id}/inspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectedAnswers,
          manualAdjustments: adjustments,
          staffNote: staffNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการบันทึกผลการตรวจ');
      }

      setApplication(data.application);
      alert('บันทึกผลตรวจสภาพและออกข้อเสนอราคาใหม่เรียบร้อยแล้ว (ลูกค้ารอการตอบรับ)');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Complete Handover & Payment
  const handleCompleteHandover = async () => {
    if (!application) return;

    if (!lockRemovedConfirmed || !wipedConfirmed || !agreementSigned) {
      alert('กรุณาตรวจสอบและกดยืนยันการส่งมอบเครื่องให้ครบทุกข้อ');
      return;
    }

    if (!transactionRef.trim()) {
      alert('กรุณาระบุเลขอ้างอิงการโอนเงิน/สลิปการจ่ายเงิน');
      return;
    }

    const offer = application.finalOfferSnapshot || application.quoteSnapshot;

    setIsProcessing(true);
    try {
      const handoverChecklist: TradeInHandoverChecklist = {
        accountLockRemovedConfirmed: lockRemovedConfirmed,
        deviceWipedConfirmed: wipedConfirmed,
        physicalConditionMatchesOffer: true,
        physicalAgreementSigned: agreementSigned,
      };

      const paymentRecord: TradeInPaymentRecord = {
        method: paymentMethod,
        transactionReference: transactionRef.trim(),
        amountMinor: offer.finalCashOfferMinor,
        paidAt: new Date().toISOString(),
        receiptNumber: receiptNumber.trim() || undefined,
        recordedByStaffId: staff?.id || 'staff',
      };

      const res = await fetch(`/api/staff/tradein/applications/${application.id}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handoverChecklist, paymentRecord }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ไม่สามารถบันทึกการส่งมอบได้');
      }

      setApplication(data.application);
      alert('บันทึกการส่งมอบและจ่ายเงินสดเรียบร้อยแล้ว รายการเสร็จสมบูรณ์!');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isChecking || isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">กำลังโหลดรายละเอียด...</div>;
  }

  if (!application) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500">ไม่พบข้อมูลคำขอแลกเงิน</p>
      </div>
    );
  }

  const statusMeta = TRADEIN_STATUS_LABELS[application.status];
  const activeOffer = application.finalOfferSnapshot || application.quoteSnapshot;

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Link href="/staff/trade-in" className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900">{application.reference}</span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                style={{ color: statusMeta.color, backgroundColor: statusMeta.bg }}
              >
                {statusMeta.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {application.deviceDisplaySummary.modelName} • {application.deviceDisplaySummary.storageLabel}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">ราคาเสนอสุทธิ</span>
          <span className="text-base font-bold text-[#007ACC]">
            ฿{activeOffer.finalCashOfferMinor.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Customer & Device Meta Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <User size={14} className="text-[#007ACC]" />
            <span>ข้อมูลลูกค้า</span>
          </span>
          <p className="text-slate-700">ชื่อ: {application.contactName}</p>
          <p className="text-slate-700">เบอร์โทรศัพท์: {application.verifiedPhone}</p>
          {application.imeiOrSerial && <p className="font-mono text-slate-600">IMEI: {application.imeiOrSerial}</p>}
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin size={14} className="text-[#007ACC]" />
            <span>ข้อมูลการนัดหมาย</span>
          </span>
          <p className="text-slate-700">{application.appointment?.branchName || 'ไม่ระบุสาขา'}</p>
          <p className="text-slate-700">
            {application.appointment?.startsAt
              ? new Date(application.appointment.startsAt).toLocaleString('th-TH')
              : '-'}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('INSPECTION')}
          className={`pb-2 transition-all ${activeTab === 'INSPECTION' ? 'border-b-2 border-[#007ACC] text-[#007ACC]' : 'text-slate-500'}`}
        >
          1. ตรวจสภาพเครื่องจริง (Physical Inspection)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HANDOVER')}
          className={`pb-2 transition-all ${activeTab === 'HANDOVER' ? 'border-b-2 border-[#007ACC] text-[#007ACC]' : 'text-slate-500'}`}
        >
          2. ส่งมอบเครื่อง & จ่ายเงิน (Handover & Payout)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TIMELINE')}
          className={`pb-2 transition-all ${activeTab === 'TIMELINE' ? 'border-b-2 border-[#007ACC] text-[#007ACC]' : 'text-slate-500'}`}
        >
          3. ประวัติเหตุการณ์ (Audit Trail)
        </button>
      </div>

      {/* TAB 1: Physical Inspection Workspace */}
      {activeTab === 'INSPECTION' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">ตรวจสภาพเครื่องและคำนวณข้อเสนอใหม่</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              เปรียบเทียบสภาพที่ลูกค้าแจ้งกับสภาพจริงที่ช่างตรวจพบ ระบบจะคำนวณราคาซื้อคืนใหม่อัตโนมัติ
            </p>
          </div>

          {/* Condition Inspection Matrix */}
          <div className="space-y-3 text-xs">
            {/* Battery */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>สุขภาพแบตเตอรี่:</span>
                <span className="text-slate-500">ลูกค้าแจ้ง: {application.declaredAnswers.battery || '-'}</span>
              </div>
              <select
                value={inspectedAnswers.battery || ''}
                onChange={(e) => setInspectedAnswers((prev) => ({ ...prev, battery: e.target.value }))}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="bat-90-100">90–100% (ไม่หัก)</option>
                <option value="bat-80-89">80–89% (หัก 5%)</option>
                <option value="bat-75-79">75–79% (หัก 10%)</option>
                <option value="bat-below-75">ต่ำกว่า 75% (หัก ฿1,800)</option>
                <option value="bat-swollen">แบตเตอรี่บวม (ต้องตีราคาพิเศษ)</option>
              </select>
            </div>

            {/* Screen Surface */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>สภาพกระจกหน้าจอ:</span>
                <span className="text-slate-500">ลูกค้าแจ้ง: {application.declaredAnswers.screen_surface || '-'}</span>
              </div>
              <select
                value={inspectedAnswers.screen_surface || ''}
                onChange={(e) => setInspectedAnswers((prev) => ({ ...prev, screen_surface: e.target.value }))}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="screen-none">ไม่มีรอยขีดข่วน (สวยใส)</option>
                <option value="screen-light">รอยขนแมวบางๆ (หัก ฿500)</option>
                <option value="screen-deep">รอยขูดลึก (หัก ฿1,200)</option>
                <option value="screen-cracked">กระจกแตกร้าว (หักค่าเปลี่ยนจอ ฿3,500)</option>
              </select>
            </div>

            {/* Body Condition */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span>สภาพตัวเครื่อง/ขอบข้าง:</span>
                <span className="text-slate-500">ลูกค้าแจ้ง: {application.declaredAnswers.body_condition || '-'}</span>
              </div>
              <select
                value={inspectedAnswers.body_condition || ''}
                onChange={(e) => setInspectedAnswers((prev) => ({ ...prev, body_condition: e.target.value }))}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="body-none">ไม่มีรอย (สวยเหมือนใหม่)</option>
                <option value="body-light">รอยขนแมวเล็กน้อย (หัก ฿400)</option>
                <option value="body-heavy">รอยถลอกลึก/สีลอก (หัก ฿900)</option>
                <option value="body-dented">ขอบบุบ (หัก ฿1,500)</option>
                <option value="body-cracked-bent">ฝาหลังแตก/เครื่องงอ (หัก ฿2,500)</option>
              </select>
            </div>
          </div>

          {/* Staff Manual Adjustment with mandatory reason */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-amber-900 block">การปรับราคาพิเศษโดยเจ้าหน้าที่ (Staff Adjustment)</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-amber-800 font-semibold block mb-1">
                  จำนวนเงินปรับปรุง (+/- บาท)
                </label>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="เช่น -500 หรือ +300"
                  className="w-full p-2 rounded-lg border border-amber-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-amber-800 font-semibold block mb-1">
                  เหตุผลการปรับราคา (บังคับระบุ)
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="เช่น ชดเชยสภาพเครื่องไร้รอย หรือ หักค่าเปลี่ยนเลนส์กล้อง"
                  className="w-full p-2 rounded-lg border border-amber-300 bg-white"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleSaveInspection}
            className="w-full h-11 bg-[#007ACC] hover:bg-[#0061A3] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Send size={16} />
            <span>คำนวณและส่งข้อเสนอราคาสุดท้ายให้ลูกค้า (Update Offer)</span>
          </button>
        </div>
      )}

      {/* TAB 2: Handover Checklist & Manual Payment Recording */}
      {activeTab === 'HANDOVER' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">การส่งมอบเครื่องและจ่ายเงินสด (Handover & Payment)</h2>
            <p className="text-slate-500 mt-0.5">
              ตรวจสอบสถานะเครื่องให้พร้อม และบันทึกหลักฐานการชำระเงินก่อนปิดคำขอ
            </p>
          </div>

          {/* Checklist */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block">รายการตรวจสอบการส่งมอบ (Handover Checklist)</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lockRemovedConfirmed}
                onChange={(e) => setLockRemovedConfirmed(e.target.checked)}
                className="rounded text-[#007ACC]"
              />
              <span>ตรวจสอบแล้ว: ปลดล็อก iCloud / Google Account และ Find My ออกจากเครื่องแล้ว 100%</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wipedConfirmed}
                onChange={(e) => setWipedConfirmed(e.target.checked)}
                className="rounded text-[#007ACC]"
              />
              <span>ตรวจสอบแล้ว: ล้างข้อมูลเครื่อง (Factory Data Reset) เรียบร้อยแล้ว</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreementSigned}
                onChange={(e) => setAgreementSigned(e.target.checked)}
                className="rounded text-[#007ACC]"
              />
              <span>ลูกค้าได้ลงนามในหนังสือสัญญาโอนกรรมสิทธิ์เครื่องเรียบร้อยแล้ว</span>
            </label>
          </div>

          {/* Payment Recording */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-900 block">
              บันทึกการชำระเงิน (ยอดเงิน: ฿{activeOffer.finalCashOfferMinor.toLocaleString()} บาท)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">ช่องทางการจ่ายเงิน</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="BANK_TRANSFER">โอนผ่านบัญชีธนาคาร (Bank Transfer)</option>
                  <option value="PROMPTPAY">พร้อมเพย์ (PromptPay)</option>
                  <option value="CASH_AT_BRANCH">เงินสดที่สาขา (Cash at Branch)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 block mb-1">เลขอ้างอิงสลิป / รหัสธุรกรรม</label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="เช่น TRN-202609-9941"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 block mb-1">เลขที่ใบเสร็จรับเงิน (ถ้ามี)</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="เช่น REC-8841"
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isProcessing || application.status === 'COMPLETED'}
            onClick={handleCompleteHandover}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <CheckCircle2 size={16} />
            <span>ยืนยันการรับเครื่องและชำระเงินสำเร็จ (Complete & Issue Receipt)</span>
          </button>
        </div>
      )}

      {/* TAB 3: Audit Timeline */}
      {activeTab === 'TIMELINE' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 text-xs">
          <h2 className="font-bold text-slate-800">ประวัติบันทึกเหตุการณ์ (Audit Events)</h2>
          <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-1.5">
            {application.events.map((evt, i) => (
              <div key={i} className="relative space-y-0.5">
                <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#007ACC] border-2 border-white" />
                <p className="font-semibold text-slate-800 text-[11px]">{evt.message}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(evt.createdAt).toLocaleString('th-TH')} • {evt.actorKind} ({evt.actorId || '-'})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
