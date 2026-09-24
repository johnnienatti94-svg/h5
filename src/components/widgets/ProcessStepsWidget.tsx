'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, Smartphone, Store } from 'lucide-react';

interface Step {
  step: number;
  title: string;
  description: string;
  badge?: string;
  iconName?: string;
}

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      title?: string;
      subtitle?: string;
      steps?: Step[];
      ctaLabel?: string;
      ctaHref?: string;
    };
  };
}

const DEFAULT_STEPS: Step[] = [
  {
    step: 1,
    title: 'เลือกสินค้า & คำนวณค่างวด',
    description: 'เลือกสมาร์ตโฟน แท็บเล็ต พร้อมคำนวณค่างวด 0% ที่เหมาะกับคุณ',
    badge: 'ขั้นตอนที่ 1',
  },
  {
    step: 2,
    title: 'ยืนยันตัวตนด้วย OTP',
    description: 'กรอกเบอร์โทรศัพท์และรับรหัส OTP 6 หลัก ปลอดภัย สะดวกรวดเร็ว',
    badge: 'ขั้นตอนที่ 2',
  },
  {
    step: 3,
    title: 'รู้ผลอนุมัติใน 3 นาที',
    description: 'ระบบประมวลผลเครดิตอัตโนมัติ ไม่ต้องมีสลิปเงินเดือนหรือคนค้ำ',
    badge: 'ขั้นตอนที่ 3',
  },
  {
    step: 4,
    title: 'นัดรับเครื่องที่สาขา',
    description: 'เลือก 45 สาขาทั่วประเทศ ตรวจสอบเครื่องและรับกลับได้ทันที',
    badge: 'ขั้นตอนที่ 4',
  },
];

export default function ProcessStepsWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const title = cfg.title || widget?.title || 'ขั้นตอนการสมัครผ่อนง่ายๆ 4 สเต็ป';
  const subtitle = cfg.subtitle || 'อนุมัติไว ได้เครื่องแท้ศูนย์ไทย ไม่ยุ่งยาก';
  const steps = cfg.steps && cfg.steps.length > 0 ? cfg.steps : DEFAULT_STEPS;
  const ctaLabel = cfg.ctaLabel || 'เริ่มต้นเช็กวงเงินผ่อน';
  const ctaHref = cfg.ctaHref || '/apply';

  const icons = [Smartphone, Clock, CheckCircle2, Store];

  return (
    <section
      aria-label={title}
      className="w-full my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-orange-50/20 to-white border border-[#E2E8F0] shadow-xs"
    >
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-[#FF6E00] text-xs font-bold mb-2">
          ขั้นตอนง่าย ไม่ซับซ้อน
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-[#142B4A] tracking-tight">{title}</h2>
        <p className="text-sm text-[#64748B] mt-1.5">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
        {steps.map((item, index) => {
          const IconComponent = icons[index % icons.length];
          return (
            <div
              key={item.step || index}
              className="relative bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs hover:border-[#FF6E00]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-[#FF6E00] flex items-center justify-center font-bold text-lg">
                    <IconComponent size={22} />
                  </div>
                  <span className="text-[11px] font-bold text-[#FF6E00] bg-orange-50 px-2.5 py-1 rounded-lg">
                    {item.badge || `สเต็ป ${index + 1}`}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#142B4A] mb-1.5">{item.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF6E00] text-white font-bold text-sm shadow-md hover:bg-[#e06100] transition-colors"
        >
          <span>{ctaLabel}</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
