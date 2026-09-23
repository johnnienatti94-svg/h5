'use client';

import React from 'react';

interface Props {
  widget?: {
    id?: string;
    config?: {
      deliveryDaysText?: string;
      returnPolicyText?: string;
    };
  };
}

export default function ShippingReturnsWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const delivery = cfg.deliveryDaysText || 'จัดส่งด่วนทั่วไทย 1-3 วันทำการ มีประกันสินค้าสูญหาย 100%';
  const returns = cfg.returnPolicyText || 'เปลี่ยนเครื่องใหม่ทันทีภายใน 7 วัน หากพบปัญหาจากการผลิตโดยศูนย์บริการมาตรฐาน';

  return (
    <div className="w-full my-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Delivery */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007ACC] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">local_shipping</span>
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#0F172A] mb-1">การจัดส่งทั่วประเทศ</h4>
          <p className="text-xs text-[#64748B] leading-relaxed">{delivery}</p>
        </div>
      </div>

      {/* Returns */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">published_with_changes</span>
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#0F172A] mb-1">การรับประกันและเปลี่ยนเครื่อง</h4>
          <p className="text-xs text-[#64748B] leading-relaxed">{returns}</p>
        </div>
      </div>
    </div>
  );
}
