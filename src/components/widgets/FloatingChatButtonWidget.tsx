'use client';

import React, { useState } from 'react';

interface Channel {
  name: string;
  icon: string;
  linkUrl: string;
  badge?: string;
}

interface Props {
  widget?: {
    id?: string;
    config?: {
      channels?: Channel[];
    };
  };
}

const DEFAULT_CHANNELS: Channel[] = [
  { name: 'LINE Official: @meepro', icon: 'chat', linkUrl: 'https://line.me/R/ti/p/@meepro', badge: 'ตอบไว' },
  { name: 'โทรสายด่วน 02-000-0000', icon: 'call', linkUrl: 'tel:020000000' },
  { name: 'แช็ตกับเจ้าหน้าที่สด', icon: 'support_agent', linkUrl: '#chat' },
];

export default function FloatingChatButtonWidget({ widget }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const cfg = widget?.config || {};
  const channels = cfg.channels && cfg.channels.length > 0 ? cfg.channels : DEFAULT_CHANNELS;

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end">
      {/* Channels Popover */}
      {isOpen && (
        <div className="mb-2 w-60 rounded-2xl bg-white p-3 shadow-xl border border-[#E2E8F0] space-y-2 animate-slide-up">
          <div className="text-xs font-bold text-[#0F172A] pb-1.5 border-b border-slate-100 flex items-center justify-between">
            <span>ปรึกษาทีมงาน MeePro</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          {channels.map((ch, idx) => (
            <a
              key={idx}
              href={ch.linkUrl}
              target={ch.linkUrl.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-[#EFF6FF] text-[#0F172A] hover:text-[#007ACC] transition-all text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#007ACC]">{ch.icon}</span>
                <span>{ch.name}</span>
              </div>
              {ch.badge && (
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {ch.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      )}

      {/* Main Trigger FAB */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#007ACC] hover:bg-[#0061A3] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
        aria-label="ติดต่อฝ่ายบริการลูกค้า"
      >
        <span className="material-symbols-outlined text-[24px]">
          {isOpen ? 'close' : 'support_agent'}
        </span>
      </button>
    </div>
  );
}
