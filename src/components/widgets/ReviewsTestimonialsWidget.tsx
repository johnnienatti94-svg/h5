'use client';

import React from 'react';

interface Review {
  author: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  dateText?: string;
  device?: string;
}

interface Props {
  widget?: {
    id?: string;
    title?: string;
    subtitle?: string;
    config?: {
      averageRating?: number;
      totalReviewsCount?: number;
      reviews?: Review[];
    };
  };
}

const DEFAULT_REVIEWS: Review[] = [
  {
    author: 'คุณพัชราภรณ์ ว.',
    rating: 5,
    comment: 'อนุมัติไวมากค่ะ ไม่ถึง 5 นาทีก็ได้เครื่องเลย พนักงานที่สาขาเซ็นทรัลเวิลด์บริการดีมาก แนะนำขั้นตอนชัดเจน 0% 10 เดือนจ่ายสบายมากค่ะ',
    verifiedPurchase: true,
    dateText: 'เมื่อ 2 วันที่แล้ว',
    device: 'iPhone 16 Pro (128GB)',
  },
  {
    author: 'คุณธีรพงษ์ ส.',
    rating: 5,
    comment: 'นำเครื่องเก่ามาเทรด ได้ราคาดีกว่าที่คิดมาก เอามาเป็นส่วนลดดาวน์ S25 Ultra คุ้มสุดๆ การจัดส่งรวดเร็ว ปลอดภัย ประทับใจครับ',
    verifiedPurchase: true,
    dateText: 'เมื่อ 4 วันที่แล้ว',
    device: 'Samsung Galaxy S25 Ultra',
  },
  {
    author: 'คุณกานดา ฤ.',
    rating: 5,
    comment: 'สั่ง iPad Air สำหรับเรียนต่อออนไลน์ ได้ของแถมครบตามโปรโมชั่น บิลผ่อนในแอปดูง่ายและจ่ายผ่านพร้อมเพย์สะดวกมาก แนะนำเลยค่ะ',
    verifiedPurchase: true,
    dateText: 'เมื่อ 1 สัปดาห์ที่แล้ว',
    device: 'iPad Air ชิป M2',
  },
];

export default function ReviewsTestimonialsWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const avg = cfg.averageRating || 4.9;
  const count = cfg.totalReviewsCount || 1580;
  const reviews = cfg.reviews && cfg.reviews.length > 0 ? cfg.reviews : DEFAULT_REVIEWS;

  return (
    <div className="w-full my-6">
      {/* Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
            {widget?.title || 'รีวิวและความประทับใจจากลูกค้า'}
          </h2>
          <p className="text-xs text-[#64748B]">จากลูกค้าที่ผ่อนและรับเครื่องจริงทั่วประเทศ</p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
          <span className="text-amber-500 text-sm">★★★★★</span>
          <span className="text-xs font-bold text-slate-800">{avg}/5.0</span>
          <span className="text-[11px] text-slate-500">({count.toLocaleString()} รีวิว)</span>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {reviews.map((r, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white border border-[#E2E8F0] shadow-xs p-4 flex flex-col justify-between"
          >
            <div>
              {/* Stars & Verified Badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-amber-400 text-xs">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </div>
                {r.verifiedPurchase && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    <span>ผู้ซื้อจริง</span>
                  </span>
                )}
              </div>

              {/* Comment */}
              <p className="text-xs text-[#0F172A] leading-relaxed mb-3">
                "{r.comment}"
              </p>
            </div>

            {/* Author Meta */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold text-[#0F172A]">{r.author}</span>
                {r.device && <div className="text-[10px] text-[#007ACC] font-medium">{r.device}</div>}
              </div>
              {r.dateText && <span className="text-slate-400 text-[10px]">{r.dateText}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
