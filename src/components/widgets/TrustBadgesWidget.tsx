'use client';

import React from 'react';

interface Badge {
  icon: string;
  title: string;
  description?: string;
}

interface Props {
  widget?: {
    id?: string;
    config?: {
      badges?: Badge[];
    };
  };
}

const DEFAULT_BADGES: Badge[] = [
  {
    icon: 'verified',
    title: 'ของแท้ 100% ศูนย์ไทย',
    description: 'เครื่องใหม่แกะกล่อง ประกันศูนย์ไทย 1 ปีเต็ม',
  },
  {
    icon: 'bolt',
    title: 'อนุมัติไวใน 3 นาที',
    description: 'ไม่ต้องมีสลิปเงินเดือน ไม่ต้องใช้คนค้ำประกัน',
  },
  {
    icon: 'credit_card',
    title: 'ผ่อน 0% นาน 10 เดือน',
    description: 'ดอกเบี้ยพิเศษ พร้อมรับเครื่องได้ทันที',
  },
  {
    icon: 'store',
    title: '45 สาขาทั่วประเทศ',
    description: 'รับเครื่องหรือส่งตรวจเช็กได้ทุกสาขาใกล้บ้าน',
  },
];

export default function TrustBadgesWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const badges = cfg.badges && cfg.badges.length > 0 ? cfg.badges : DEFAULT_BADGES;

  return (
    <div className="w-full my-5 py-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {badges.map((b, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-3.5 flex flex-col items-center text-center group hover:border-[#007ACC]/50 hover:shadow-sm transition-all"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#007ACC] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[24px]">{b.icon}</span>
            </div>
            <h3 className="text-xs font-bold text-[#0F172A] leading-snug mb-1">{b.title}</h3>
            {b.description && (
              <p className="text-[10px] text-[#64748B] leading-relaxed line-clamp-2">
                {b.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
