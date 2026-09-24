'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Tag } from 'lucide-react';

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      headline?: string;
      subheadline?: string;
      badgeText?: string;
      ctaText?: string;
      ctaHref?: string;
      bgColor?: string;
    };
  };
}

export default function PromotionStripWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const headline = cfg.headline || 'โปรโมชั่นพิเศษประจำเดือน: ผ่อนสมาร์ตโฟน 0% นานสูงสุด 10 เดือน';
  const subheadline = cfg.subheadline || 'รับฟรี เคส + ฟิล์มกระจกกันรอยมูลค่า ฿1,290 เมื่อรับเครื่องที่สาขา';
  const badgeText = cfg.badgeText || 'SPECIAL DEAL';
  const ctaText = cfg.ctaText || 'ดูข้อเสนอทั้งหมด';
  const ctaHref = cfg.ctaHref || '/products';

  return (
    <aside
      aria-label="แถบโปรโมชั่นพิเศษ"
      className="w-full my-4 rounded-2xl bg-gradient-to-r from-[#142B4A] via-[#1E3A8A] to-[#FF6E00] p-4 sm:p-5 text-white shadow-md relative overflow-hidden"
    >
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 text-amber-300">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                <Tag size={11} />
                {badgeText}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold leading-snug">{headline}</h3>
            <p className="text-xs text-white/80 mt-0.5">{subheadline}</p>
          </div>
        </div>

        <Link
          href={ctaHref}
          className="self-start md:self-auto shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#142B4A] hover:bg-slate-100 font-bold text-xs transition-colors shadow-xs"
        >
          <span>{ctaText}</span>
          <ArrowRight size={14} className="text-[#FF6E00]" />
        </Link>
      </div>
    </aside>
  );
}
