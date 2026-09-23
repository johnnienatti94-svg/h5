'use client';

import React from 'react';

interface Props {
  widget: {
    id: string;
    title?: string;
    config?: {
      embedCode?: string;
      sandbox?: boolean;
    };
  };
}

export default function CustomEmbedWidget({ widget }: Props) {
  const cfg = widget.config || {};
  const embedCode = cfg.embedCode || '';

  // Security check: Never render if script tags exist
  const hasScript = embedCode.toLowerCase().includes('<script') || embedCode.toLowerCase().includes('javascript:');

  if (hasScript) {
    return (
      <div className="w-full my-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">security</span>
        <span>ไม่สามารถแสดงผล Embed ได้เนื่องจากตรวจพบแท็กสคริปต์ที่ไม่อนุญาต</span>
      </div>
    );
  }

  if (!embedCode) return null;

  return (
    <div className="w-full my-4 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-white shadow-xs p-2">
      {widget.title && (
        <h3 className="text-xs font-bold text-[#64748B] mb-2 px-2 uppercase tracking-wider">
          {widget.title}
        </h3>
      )}
      <div
        className="w-full overflow-hidden flex justify-center"
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    </div>
  );
}
