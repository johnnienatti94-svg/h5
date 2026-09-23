'use client';

import React, { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      items?: FaqItem[];
    };
  };
}

const DEFAULT_FAQ: FaqItem[] = [
  {
    question: 'สมัครผ่อนกับ MeePro ต้องเตรียมเอกสารอะไรบ้าง?',
    answer: 'ใช้เพียงบัตรประชาชนตัวจริงและเบอร์โทรศัพท์ที่ใช้งานจริง ไม่จำเป็นต้องใช้สลิปเงินเดือนหรือคนค้ำประกัน สามารถทำรายการและทราบผลอนุมัติผ่านระบบได้ภายใน 3 นาที',
  },
  {
    question: 'สามารถไปรับเครื่องที่สาขาได้หรือไม่?',
    answer: 'สามารถเลือกรับเครื่องที่สาขา MeePro ใกล้บ้านได้ทั้ง 45 แห่งทั่วประเทศ หรือเลือกบริการจัดส่งด่วนถึงบ้านพร้อมผู้เชี่ยวชาญช่วยตั้งค่าและโอนย้ายข้อมูลให้ฟรี',
  },
  {
    question: 'บริการมือถือแลกเงิน (Trade-in) มีขั้นตอนอย่างไร?',
    answer: 'ลูกค้าสามารถนำเครื่องเก่ามาให้ผู้เชี่ยวชาญที่สาขาประเมินสภาพ หรือประเมินเบื้องต้นผ่านเมนู Trade-in บนหน้าเว็บเพื่อรับเครดิตเงินสดหรือใช้เป็นส่วนลดดาวน์เครื่องใหม่ได้ทันที',
  },
  {
    question: 'การชำระค่างวดในแต่ละเดือนทำได้อย่างไร?',
    answer: 'ชำระได้ง่ายๆ ผ่านแท็บ "บิลผ่อน" ในหน้าเว็บหรือแอปพลิเคชัน โดยสแกน QR Code พร้อมเพย์ หรือโอนผ่านบัญชีธนาคารได้ตลอด 24 ชั่วโมง พร้อมรับใบเสร็จอิเล็กทรอนิกส์ทันที',
  },
];

export default function FaqAccordionWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const items = cfg.items && cfg.items.length > 0 ? cfg.items : DEFAULT_FAQ;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full my-6">
      <div className="mb-4 px-1">
        <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
          {widget?.title || 'คำถามที่พบบ่อย (FAQ)'}
        </h2>
        <p className="text-xs text-[#64748B]">ข้อสงสัยยอดนิยมเกี่ยวกับการผ่อนและการรับบริการ</p>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left gap-3 text-xs sm:text-sm font-bold text-[#0F172A] hover:text-[#007ACC] transition-colors"
              >
                <span>{item.question}</span>
                <span
                  className={`material-symbols-outlined text-[20px] text-[#94A3B8] transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#007ACC]' : ''
                  }`}
                >
                  keyboard_arrow_down
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-[#64748B] leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
