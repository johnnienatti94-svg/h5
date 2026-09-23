'use client';

import React from 'react';
import Link from 'next/link';

interface Props {
  widget: {
    id: string;
    config?: {
      categories?: { id: string; label: string; icon: string; href: string }[];
    };
  };
}

const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด', icon: 'apps', href: '/catalog' },
  { id: 'phone', label: 'สมาร์ตโฟน', icon: 'smartphone', href: '/catalog?category=smartphone' },
  { id: 'tablet', label: 'แท็บเล็ต', icon: 'tablet_mac', href: '/catalog?category=tablet' },
  { id: 'laptop', label: 'แล็ปท็อป', icon: 'laptop_mac', href: '/catalog?category=laptop' },
  { id: 'watch', label: 'สมาร์ตวอทช์', icon: 'watch', href: '/catalog?category=watch' },
  { id: 'audio', label: 'หูฟัง/ลำโพง', icon: 'headphones', href: '/catalog?category=audio' },
  { id: 'accessory', label: 'อุปกรณ์เสริม', icon: 'cable', href: '/catalog?category=accessory' },
];

export default function CategoryNavWidget({ widget }: Props) {
  const cfg = widget.config || {};
  const categories = cfg.categories || DEFAULT_CATEGORIES;

  return (
    <div className="w-full my-3">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className="flex flex-col items-center gap-1.5 min-w-[64px] group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex items-center justify-center text-[#0F172A] group-hover:border-[#007ACC] group-hover:bg-[#EFF6FF] group-hover:text-[#007ACC] group-hover:scale-105 transition-all">
              <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
            </div>
            <span className="text-[11px] font-semibold text-[#64748B] group-hover:text-[#007ACC] text-center whitespace-nowrap transition-colors">
              {cat.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
