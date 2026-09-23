'use client';

import React from 'react';

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      title?: string;
      installmentTerms?: string;
    };
  };
}

const BANKS = [
  { name: 'KBank', color: 'bg-emerald-600', label: 'กสิกรไทย' },
  { name: 'SCB', color: 'bg-purple-700', label: 'ไทยพาณิชย์' },
  { name: 'KTB', color: 'bg-sky-500', label: 'กรุงไทย' },
  { name: 'BBL', color: 'bg-blue-800', label: 'กรุงเทพ' },
  { name: 'TTB', color: 'bg-blue-600', label: 'ทีทีบี' },
  { name: 'BAY', color: 'bg-amber-500', label: 'กรุงศรี' },
  { name: 'PromptPay', color: 'bg-slate-800', label: 'พร้อมเพย์' },
];

export default function PaymentOptionsWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const title = cfg.title || widget?.title || 'ช่องทางการชำระเงินและผ่อนชำระ 0%';
  const terms =
    cfg.installmentTerms ||
    'รองรับการชำระผ่าน PromptPay QR, Mobile Banking และบัตรเครดิตผ่อน 0% สูงสุด 10 เดือน';

  return (
    <div className="w-full my-5 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">payments</span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">{title}</h3>
          <p className="text-xs text-[#64748B]">{terms}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
        {BANKS.map((b) => (
          <div
            key={b.name}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0F172A]"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${b.color}`} />
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
