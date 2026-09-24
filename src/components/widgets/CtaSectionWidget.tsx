'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      title?: string;
      description?: string;
      primaryButtonLabel?: string;
      primaryButtonHref?: string;
      secondaryButtonLabel?: string;
      secondaryButtonHref?: string;
      badgeText?: string;
    };
  };
}

export default function CtaSectionWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const title = cfg.title || widget?.title || 'พร้อมเป็นเจ้าของสมาร์ตโฟนเครื่องใหม่แล้วหรือยัง?';
  const description =
    cfg.description || 'สมัครง่าย ไม่ต้องมีคนค้ำ ดอกเบี้ย 0% สูงสุด 10 เดือน รับเครื่องได้ที่ 45 สาขาทั่วไทย';
  const primaryButtonLabel = cfg.primaryButtonLabel || 'เช็กวงเงินและสมัครทันที';
  const primaryButtonHref = cfg.primaryButtonHref || '/apply';
  const secondaryButtonLabel = cfg.secondaryButtonLabel || 'ดูสมาร์ตโฟนทั้งหมด';
  const secondaryButtonHref = cfg.secondaryButtonHref || '/products';
  const badgeText = cfg.badgeText || 'อนุมัติไวใน 3 นาที';

  return (
    <section
      aria-label={title}
      className="w-full my-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#142B4A] via-[#1A365D] to-[#FF6E00] text-white shadow-xl relative overflow-hidden text-center"
    >
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="max-w-2xl mx-auto relative z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-amber-300 text-xs font-bold mb-4">
          <Zap size={14} />
          {badgeText}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">{title}</h2>
        <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-8">{description}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={primaryButtonHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#FF6E00] text-white font-bold text-sm shadow-md hover:bg-[#e06100] transition-colors"
          >
            <span>{primaryButtonLabel}</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            href={secondaryButtonHref}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-colors"
          >
            <span>{secondaryButtonLabel}</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            ข้อมูลปลอดภัยตามมาตรฐาน PDPA
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            รับประกันเครื่องศูนย์ไทย 1 ปีเต็ม
          </span>
        </div>
      </div>
    </section>
  );
}
