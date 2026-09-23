'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Props {
  widget: {
    id: string;
    text?: string;
    linkHref?: string;
    bgColor?: string;
    textColor?: string;
    isClosable?: boolean;
    config?: {
      text?: string;
      linkHref?: string;
      bgColor?: string;
      textColor?: string;
      isClosable?: boolean;
    };
  };
}

export default function AnnouncementBarWidget({ widget }: Props) {
  const [closed, setClosed] = useState(false);
  const cfg = widget.config || widget;
  const text = cfg.text || '🔥 โปรโมชั่นพิเศษ! ผ่อน 0% นานสูงสุด 10 เดือน ส่งฟรีทั่วไทย';
  const bgColor = cfg.bgColor || '#007ACC';
  const textColor = cfg.textColor || '#FFFFFF';
  const linkHref = cfg.linkHref;
  const isClosable = cfg.isClosable !== false;

  if (closed) return null;

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className="w-full text-xs font-semibold py-2 px-4 flex items-center justify-between transition-all relative z-20 shadow-xs"
    >
      <div className="flex-1 text-center truncate pr-2">
        {linkHref ? (
          <Link href={linkHref} className="hover:underline flex items-center justify-center gap-1.5">
            <span>{text}</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        ) : (
          <span>{text}</span>
        )}
      </div>
      {isClosable && (
        <button
          type="button"
          onClick={() => setClosed(true)}
          className="text-white/80 hover:text-white text-sm p-1 leading-none shrink-0"
          aria-label="ปิดแถบประกาศ"
        >
          ✕
        </button>
      )}
    </div>
  );
}
