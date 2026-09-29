'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Smartphone,
  AlertCircle,
  FileText,
  XCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import type { TradeInApplication } from '@/features/tradein/types';
import { TRADEIN_STATUS_LABELS } from '@/features/tradein/types';
function formatThaiDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const yearBE = d.getFullYear() + 543;
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${yearBE} เวลา ${hours}:${mins} น.`;
  } catch {
    return isoString;
  }
}

export default function CustomerTradeInDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [application, setApplication] = useState<TradeInApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchApplication = useCallback(async () => {
    if (!params.id) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/tradein/applications/${params.id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ไม่พบรายการใบสมัคร');
      }
      setApplication(data.application);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void fetchApplication();
  }, [fetchApplication]);

  const handleDecision = async (decision: 'ACCEPTED' | 'DECLINED') => {
    if (!application) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/tradein/applications/${application.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          expectedRevision: application.revision,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ไม่สามารถบันทึกการตัดสินใจได้');
      }

      setApplication(data.application);
      alert(decision === 'ACCEPTED' ? 'ยอมรับข้อเสนอเรียบร้อยแล้ว' : 'บันทึกการปฏิเสธข้อเสนอแล้ว');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-3 border-[#007ACC] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลคำขอแลกเงิน...</p>
      </div>
    );
  }

  if (errorMsg || !application) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
        <AlertCircle size={36} className="text-rose-500 mx-auto" />
        <p className="text-sm font-bold text-slate-800">{errorMsg || 'ไม่พบข้อมูลใบสมัคร'}</p>
        <Link
          href="/home?tab=tradein"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#007ACC]"
        >
          <ArrowLeft size={14} />
          <span>กลับไปหน้าประเมินราคา</span>
        </Link>
      </div>
    );
  }

  const statusMeta = TRADEIN_STATUS_LABELS[application.status] || {
    label: application.status,
    color: '#64748B',
    bg: '#F1F5F9',
  };

  const activeOffer = application.finalOfferSnapshot || application.quoteSnapshot;

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/home?tab=tradein"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={14} />
          <span>กลับไปหน้าแรก</span>
        </Link>
        <span className="text-[11px] font-mono text-slate-400">Ref: {application.reference}</span>
      </div>

      {/* Main Status Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone size={20} className="text-[#007ACC]" />
            <div>
              <h1 className="text-sm font-bold text-slate-900">
                {application.deviceDisplaySummary.modelName} ({application.deviceDisplaySummary.storageLabel})
              </h1>
              <p className="text-[11px] text-slate-500">
                {application.deviceDisplaySummary.colorLabel} • {application.deviceDisplaySummary.marketVariantLabel}
              </p>
            </div>
          </div>
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={{ color: statusMeta.color, backgroundColor: statusMeta.bg }}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* Offer Summary Box */}
        <div className="p-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-600 font-semibold">
              {application.finalOfferSnapshot ? 'ข้อเสนอราคาสุดท้าย (หลังตรวจสภาพ)' : 'ราคาประเมินเบื้องต้น'}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-bold text-[#007ACC]">
                ฿{activeOffer.finalCashOfferMinor.toLocaleString()}
              </span>
              <span className="text-xs text-slate-600">บาท</span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
            Rev. #{application.revision}
          </span>
        </div>

        {/* Action Panel for FINAL_OFFER_READY */}
        {application.status === 'FINAL_OFFER_READY' && (
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">เจ้าหน้าที่ตรวจสภาพเครื่องและเสนอราคาเรียบร้อยแล้ว</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  กรุณาตรวจสอบข้อเสนอและกด "ยอมรับข้อเสนอ" เพื่อดำเนินการส่งมอบเครื่องและรับเงินสด
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleDecision('DECLINED')}
                className="flex-1 h-10 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                ปฏิเสธข้อเสนอ
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleDecision('ACCEPTED')}
                className="flex-2 h-10 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <CheckCircle2 size={16} />
                <span>ยอมรับข้อเสนอรับเงินสด</span>
              </button>
            </div>
          </div>
        )}

        {/* Accepted Banner */}
        {application.status === 'ACCEPTED' && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">คุณได้ยอมรับข้อเสนอราคาซื้อคืนแล้ว</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                เจ้าหน้าที่กำลังดำเนินการลงชื่อออกจากระบบและจัดเตรียมเอกสารการจ่ายเงินสด/โอนเงิน
              </p>
            </div>
          </div>
        )}

        {/* Completed Banner */}
        {application.status === 'COMPLETED' && (
          <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-300 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700">
              <ShieldCheck size={18} />
              <span>การแลกเงินเสร็จสมบูรณ์เรียบร้อยแล้ว</span>
            </div>
            {application.paymentRecord && (
              <p className="text-[11px] text-emerald-800">
                จ่ายเงินแล้วจำนวน ฿{application.paymentRecord.amountMinor.toLocaleString()} บาท (เลขอ้างอิง:{' '}
                {application.paymentRecord.transactionReference})
              </p>
            )}
          </div>
        )}
      </div>

      {/* Appointment Card */}
      {application.appointment && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-xs space-y-2">
          <h2 className="font-bold text-slate-800 flex items-center gap-1.5">
            <Calendar size={15} className="text-[#007ACC]" />
            <span>ข้อมูลนัดหมายตรวจสภาพเครื่อง</span>
          </h2>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <MapPin size={13} className="text-slate-400" />
              <span>{application.appointment.branchName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Clock size={13} className="text-slate-400" />
              <span>{formatThaiDateTime(application.appointment.startsAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side Inspection Deltas (if inspected) */}
      {application.finalOfferSnapshot && application.finalOfferSnapshot.inspectionDeltas.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-xs space-y-2">
          <h2 className="font-bold text-slate-800 flex items-center gap-1.5">
            <FileText size={15} className="text-[#007ACC]" />
            <span>เปรียบเทียบผลตรวจสภาพเครื่องจริง (Declared vs Inspected)</span>
          </h2>
          <div className="space-y-1.5">
            {application.finalOfferSnapshot.inspectionDeltas.map((delta, i) => (
              <div key={i} className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px]">
                <p className="font-bold text-slate-800">{delta.topicTitle}</p>
                <div className="flex justify-between text-slate-600 mt-0.5">
                  <span>แจ้งไว้: {delta.declaredOptionLabel}</span>
                  <span className="font-semibold text-amber-900">ตรวจพบ: {delta.inspectedOptionLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs text-xs space-y-2.5">
        <h2 className="font-bold text-slate-800">ประวัติการดำเนินการ (Audit Timeline)</h2>
        <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-1.5">
          {application.events.map((evt, i) => (
            <div key={i} className="relative space-y-0.5">
              <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-[#007ACC] border-2 border-white" />
              <p className="font-semibold text-slate-800 text-[11px]">{evt.message}</p>
              <p className="text-[10px] text-slate-400">
                {new Date(evt.createdAt).toLocaleString('th-TH')} • {evt.actorKind}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
