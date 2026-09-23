'use client';

import React, { useState } from 'react';

interface Voucher {
  code: string;
  discountAmountText: string;
  minSpendText?: string;
  expiresText?: string;
}

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      vouchers?: Voucher[];
    };
  };
}

const DEFAULT_VOUCHERS: Voucher[] = [
  {
    code: 'MEEPRO500',
    discountAmountText: 'ลด ฿500',
    minSpendText: 'ขั้นต่ำ ฿10,000',
    expiresText: 'ใช้ได้ถึงสิ้นเดือนนี้',
  },
  {
    code: 'FLAGSHIP1K',
    discountAmountText: 'ลด ฿1,000',
    minSpendText: 'สำหรับซีรีส์ Pro/Ultra',
    expiresText: 'จำกัด 100 สิทธิ์แรก',
  },
  {
    code: 'SUMMER300',
    discountAmountText: 'ลด ฿300',
    minSpendText: 'สำหรับแท็บเล็ตและอุปกรณ์เสริม',
    expiresText: 'ใช้ได้ทันที',
  },
];

export default function CouponVoucherBlockWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const vouchers = cfg.vouchers && cfg.vouchers.length > 0 ? cfg.vouchers : DEFAULT_VOUCHERS;
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="w-full my-5">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
            {widget?.title || 'คูปองและโค้ดส่วนลดพิเศษ'}
          </h2>
          <p className="text-xs text-[#64748B]">กดเก็บคูปองแล้วนำไปใช้ในขั้นตอนสั่งซื้อได้ทันที</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {vouchers.map((v) => {
          const isCopied = copiedCode === v.code;
          return (
            <div
              key={v.code}
              className="relative rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-[#007ACC]/30 p-4 shadow-xs flex items-center justify-between gap-3 overflow-hidden"
            >
              {/* Left Cutout Circle */}
              <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#F8FAFC] rounded-full border-r border-[#007ACC]/30" />
              {/* Right Cutout Circle */}
              <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#F8FAFC] rounded-full border-l border-[#007ACC]/30" />

              <div className="pl-2">
                <div className="text-base font-black text-[#007ACC] leading-none mb-1">
                  {v.discountAmountText}
                </div>
                {v.minSpendText && (
                  <div className="text-[11px] font-semibold text-[#0F172A]">{v.minSpendText}</div>
                )}
                {v.expiresText && (
                  <div className="text-[10px] text-slate-400 mt-0.5">{v.expiresText}</div>
                )}
                <span className="inline-block mt-1 text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900">
                  {v.code}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(v.code)}
                className={`h-9 px-4 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 ${
                  isCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#007ACC] hover:bg-[#0061A3] text-white active:scale-95'
                }`}
              >
                {isCopied ? 'คัดลอกแล้ว!' : 'เก็บโค้ด'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
