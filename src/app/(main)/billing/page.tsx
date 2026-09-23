'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface BillingRecord {
  id: string;
  dueDate: string;
  period: string;
  type: string;
  amount: number;
  status: 'paid' | 'pending';
}

const mockHistory: BillingRecord[] = [
  {
    id: 'b-03',
    dueDate: '25 ส.ค. 2567',
    period: 'งวดที่ 3/12',
    type: 'ค่างวดปกติ (iPhone 13)',
    amount: 1290,
    status: 'paid',
  },
  {
    id: 'b-02',
    dueDate: '25 ก.ค. 2567',
    period: 'งวดที่ 2/12',
    type: 'ค่างวดปกติ (iPhone 13)',
    amount: 1290,
    status: 'paid',
  },
  {
    id: 'b-01',
    dueDate: '25 มิ.ย. 2567',
    period: 'งวดที่ 1/12',
    type: 'เงินดาวน์ + งวดแรก',
    amount: 2580,
    status: 'paid',
  },
];

export default function BillingPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'promptpay' | 'bank' | 'card'>('promptpay');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSimulatePayment = () => {
    setIsPaid(true);
    setShowPaymentModal(false);
    triggerToast('ชำระเงินงวดที่ 4 สำเร็จเรียบร้อยแล้ว!');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[16px] text-[#16A365]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title & Greeting */}
      <section className="mb-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-[26px] font-bold text-[#0F172A] tracking-tight">Billing</h1>
          <span className="text-sm font-semibold text-[#64748B]">การเรียกเก็บเงิน</span>
        </div>
        <p className="text-[13px] text-[#64748B] mt-0.5">จัดการและตรวจสอบยอดค่างวดสัญญาของคุณ</p>
      </section>

      {/* Main Billing Card ("ยอดเรียกเก็บถัดไป") */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 mb-5 relative overflow-hidden">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#007ACC] text-[20px]">calendar_today</span>
            <span className="text-sm font-semibold text-[#0F172A]">ยอดเรียกเก็บถัดไป</span>
          </div>

          {isPaid ? (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#16A365] border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">check</span>
              ชำระแล้ว
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              รอชำระ
            </span>
          )}
        </div>

        {/* Product & Contract Metadata */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EBEEF5] flex items-center justify-center text-[#007ACC]">
                <span className="material-symbols-outlined text-[20px]">smartphone</span>
              </div>
              <div>
                <p className="text-[14px] text-[#0F172A] font-semibold">iPhone 13 (128GB)</p>
                <p className="text-[11px] text-[#64748B]">สัญญาเลขที่: MP-2023-8891</p>
              </div>
            </div>

            {!isPaid && (
              <span className="inline-flex items-center bg-orange-50 text-[#FF6E00] border border-orange-200 font-semibold text-[11px] px-2 py-0.5 rounded-md">
                อีก 12 วัน
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1.5 text-[12px] text-[#64748B]">
            <span>เบอร์สัญญา: <strong className="text-[#0F172A] font-medium">081-234-5678</strong></span>
            <span>ครบกำหนด: <strong className="text-[#0F172A] font-semibold">{isPaid ? '25 ต.ค. 2567' : '25 ก.ย. 2567'}</strong></span>
          </div>
        </div>

        {/* Financial Value Display */}
        <div className="mt-4 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-end justify-between">
          <div>
            <span className="text-[12px] text-[#64748B] block">ยอดที่ต้องชำระ</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[30px] font-bold text-[#007ACC] tracking-tight">
                {isPaid ? '0' : '1,290'}
              </span>
              <span className="text-sm font-semibold text-[#0F172A]">บาท</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium text-[#64748B] bg-white px-2 py-1 rounded-md border border-[#E2E8F0] inline-block">
              {isPaid ? 'งวดที่ 5/12 (ถัดไป)' : 'งวดที่ 4/12 (รวม VAT)'}
            </span>
          </div>
        </div>

        {/* Primary CTA Payment Button */}
        {!isPaid ? (
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="w-full h-12 bg-[#007ACC] hover:bg-[#0061A3] active:scale-[0.98] transition-all text-white text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              <span>ชำระเงิน</span>
            </button>

            {/* Secondary Actions */}
            <div className="flex items-center justify-around pt-1 text-[12px]">
              <button
                type="button"
                onClick={() => setShowPaymentModal(true)}
                className="text-[#007ACC] font-medium hover:underline flex items-center gap-1 active:opacity-75"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                <span>สแกน QR ชำระเงิน</span>
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => triggerToast('ดาวน์โหลดใบแจ้งหนี้งวดที่ 4 เรียบร้อยแล้ว')}
                className="text-[#64748B] hover:text-[#0F172A] font-medium flex items-center gap-1 active:opacity-75"
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                <span>ดูรายละเอียดค่างวด</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-[#16A365]">
            <div className="flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>คุณชำระงวดปัจจุบันครบถ้วนแล้ว</span>
            </div>
            <button
              type="button"
              onClick={() => triggerToast('ดาวน์โหลดใบเสร็จรับเงินสำเร็จ')}
              className="underline font-semibold hover:opacity-80"
            >
              ใบเสร็จ
            </button>
          </div>
        )}
      </section>

      {/* Billing History Section ("ประวัติการเรียกเก็บเงิน") */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-[#0F172A]">ประวัติการเรียกเก็บเงิน</h2>
          <span className="text-[#007ACC] text-[12px] font-medium">
            3 งวดที่ผ่านมา
          </span>
        </div>

        <div className="space-y-2.5">
          {mockHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-[#E2E8F0] p-3 flex items-center justify-between shadow-sm hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#16A365] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0F172A]">
                    {item.dueDate} • {item.period}
                  </p>
                  <p className="text-[11px] text-[#64748B]">{item.type}</p>
                  <div className="inline-flex items-center gap-1 text-[11px] text-[#16A365] font-medium mt-0.5">
                    <span>ชำระแล้ว</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end justify-between">
                <span className="text-[14px] font-bold text-[#0F172A]">
                  {item.amount.toLocaleString()} บาท
                </span>
                <button
                  type="button"
                  onClick={() => triggerToast(`ดาวน์โหลดใบเสร็จ ${item.period} สำเร็จ`)}
                  className="mt-2 text-[#64748B] hover:text-[#007ACC] active:scale-95 transition-transform flex items-center gap-0.5 text-[11px]"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  <span>ใบเสร็จ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Support / Assistance Box */}
      <section className="bg-blue-50/80 border border-blue-100 rounded-xl p-3.5 mb-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-[#007ACC] text-[22px] shrink-0 mt-0.5">support_agent</span>
        <div className="text-[12px] leading-tight flex-1">
          <p className="font-semibold text-[#0F172A]">ต้องการความช่วยเหลือเรื่องการชำระเงิน?</p>
          <p className="text-[#64748B] mt-0.5">ติดต่อฝ่ายบริการลูกค้า MeePro ได้ตลอด 24 ชั่วโมง</p>
          <div className="flex items-center gap-3 mt-2 font-medium text-[#007ACC]">
            <a className="inline-flex items-center gap-1 hover:underline" href="tel:021234567">
              <span className="material-symbols-outlined text-[14px]">call</span>
              <span>02-123-4567</span>
            </a>
            <span className="text-blue-200">•</span>
            <a className="inline-flex items-center gap-1 hover:underline" href="https://line.me" target="_blank" rel="noreferrer">
              <span className="material-symbols-outlined text-[14px]">chat</span>
              <span>LINE: @meepro</span>
            </a>
          </div>
        </div>
      </section>

      {/* Payment Sheet Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-[16px] text-[#0F172A]">เลือกช่องทางชำระเงิน</h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="py-3">
              <div className="text-center py-2 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] mb-4">
                <span className="text-xs text-[#64748B]">ยอดเงินที่ต้องชำระ</span>
                <p className="text-[26px] font-bold text-[#007ACC]">฿ 1,290.00</p>
                <span className="text-[11px] text-[#64748B]">งวดที่ 4/12 • iPhone 13</span>
              </div>

              {/* Methods */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('promptpay')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    selectedMethod === 'promptpay'
                      ? 'border-[#007ACC] bg-blue-50/50'
                      : 'border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#007ACC] text-[24px]">qr_code_2</span>
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">พร้อมเพย์ (PromptPay QR)</p>
                      <p className="text-[11px] text-[#64748B]">สแกนจ่ายผ่านทุกแอปธนาคาร ฟรีค่าธรรมเนียม</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={selectedMethod === 'promptpay'}
                    onChange={() => setSelectedMethod('promptpay')}
                    className="accent-[#007ACC]"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('bank')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    selectedMethod === 'bank'
                      ? 'border-[#007ACC] bg-blue-50/50'
                      : 'border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[24px]">account_balance</span>
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">โอนผ่านบัญชีธนาคาร</p>
                      <p className="text-[11px] text-[#64748B]">แนบสลิปเพื่อตรวจสอบยอด</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={selectedMethod === 'bank'}
                    onChange={() => setSelectedMethod('bank')}
                    className="accent-[#007ACC]"
                  />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                className="w-full h-12 bg-[#007ACC] hover:bg-[#0061A3] text-white text-[15px] font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-98"
              >
                <span>ยืนยันการชำระเงิน</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
