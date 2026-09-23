'use client';

import React from 'react';

interface Props {
  widget: {
    id: string;
    title?: string;
    config?: {
      contentHtml?: string;
      align?: 'left' | 'center' | 'right';
    };
  };
}

export default function RichTextWidget({ widget }: Props) {
  const cfg = widget.config || {};
  const content =
    cfg.contentHtml ||
    `<h3>ทำไมต้องเลือกผ่อนกับ MeePro?</h3><p>เราเป็นผู้ให้บริการสินเชื่อดิจิทัลและตัวแทนจำหน่ายอุปกรณ์สื่อสารอย่างเป็นทางการ อนุมัติไวใน 3 นาที ไม่ต้องมีผู้ค้ำประกัน รับเครื่องได้ทันทีที่ 45 สาขาทั่วประเทศ</p>`;
  const align = cfg.align || 'left';

  return (
    <div
      style={{ textAlign: align }}
      className="w-full my-4 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-sm text-[#0F172A] leading-relaxed prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
