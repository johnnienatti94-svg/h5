'use client';

import React from 'react';
import Link from 'next/link';

interface Props {
  widget: {
    id: string;
    title?: string;
    config?: {
      imageUrl?: string;
      imagePosition?: 'left' | 'right';
      title?: string;
      body?: string;
      ctaLabel?: string;
      ctaHref?: string;
    };
  };
}

export default function ImageWithTextWidget({ widget }: Props) {
  const cfg = widget.config || {};
  const isRight = cfg.imagePosition === 'right';
  const imageUrl =
    cfg.imageUrl ||
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&auto=format&fit=crop&q=80';
  const title = cfg.title || widget.title || 'บริการเปลี่ยนเครื่องเก่าเป็นเครื่องใหม่ (Trade-in)';
  const body =
    cfg.body ||
    'ประเมินราคาเครื่องเดิมของคุณออนไลน์ได้อย่างแม่นยำ พร้อมรับส่วนลดค่าเครื่องใหม่ทันทีสูงสุด ฿5,000 ฟรีค่าจัดส่งและตรวจรับเครื่องถึงบ้าน';
  const ctaLabel = cfg.ctaLabel || 'ประเมินราคาเลย';
  const ctaHref = cfg.ctaHref || '/home';

  return (
    <div className="w-full my-4 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-white shadow-xs">
      <div className={`flex flex-col ${isRight ? 'md:flex-row-reverse' : 'md:flex-row'} items-center`}>
        {/* Image */}
        <div className="w-full md:w-1/2 min-h-[220px] md:min-h-[280px] relative bg-slate-100">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        </div>

        {/* Copy */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center items-start">
          <span className="text-[10px] font-extrabold text-[#007ACC] bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            MeePro Care
          </span>
          <h2 className="text-lg md:text-xl font-bold text-[#0F172A] leading-tight mb-2">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-[#64748B] leading-relaxed mb-4">
            {body}
          </p>
          {ctaLabel && (
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[#007ACC] hover:bg-[#0061A3] text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>{ctaLabel}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
