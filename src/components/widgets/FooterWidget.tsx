'use client';

import React from 'react';
import Link from 'next/link';

interface Props {
  widget?: {
    id?: string;
    config?: {
      copyrightText?: string;
      hotline?: string;
      disclaimerText?: string;
      links?: { label: string; href: string }[];
    };
  };
}

export default function FooterWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const copyright = cfg.copyrightText || '© 2026 MeePro Inc. All rights reserved.';
  const hotline = cfg.hotline || '02-000-0000';
  const disclaimer =
    cfg.disclaimerText ||
    'MeePro คือแพลตฟอร์มให้บริการสินเชื่อดิจิทัลและจำหน่ายอุปกรณ์สื่อสารอย่างถูกต้องตามกฎหมาย ภายใต้การกำกับดูแลของหน่วยงานที่เกี่ยวข้อง เงื่อนไขการอนุมัติสินเชื่อเป็นไปตามเกณฑ์ที่บริษัทฯ กำหนด';

  const defaultLinks = [
    { label: 'เกี่ยวกับเรา', href: '/about' },
    { label: 'บริการของเรา', href: '/services' },
    { label: 'ค้นหาสาขา', href: '/stores' },
    { label: 'คำถามที่พบบ่อย', href: '/faq' },
    { label: 'นโยบายความเป็นส่วนตัว', href: '/privacy' },
    { label: 'เงื่อนไขการให้บริการ', href: '/terms' },
  ];

  const links = cfg.links || defaultLinks;

  return (
    <footer className="w-full mt-10 pt-8 pb-12 border-t border-[#E2E8F0] bg-white text-[#64748B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Brand & Hotline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-[#0F172A] tracking-tight">มีโปรโฟน</span>
            <span className="bg-[#FF6E00] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">MALL</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
            <span className="material-symbols-outlined text-[18px] text-[#007ACC]">headset_mic</span>
            <span>ศูนย์บริการลูกค้า: <strong>{hotline}</strong> (จ.-อา. 09:00 - 20:00 น.)</span>
          </div>
        </div>

        {/* Links Navigation */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium">
          {links.map((item, idx) => (
            <Link key={idx} href={item.href} className="hover:text-[#007ACC] transition-colors">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
          {disclaimer}
        </p>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>{copyright}</span>
          <span>เวอร์ชัน 2.4.0 (Build 2026.09)</span>
        </div>
      </div>
    </footer>
  );
}
