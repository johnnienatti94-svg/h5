'use client';

import React, { useEffect, useState } from 'react';
import { Tag, CheckCircle, Percent, Clock, AlertCircle } from 'lucide-react';

interface OfferItem {
  id: string;
  name: string;
  planCode: string;
  months: number;
  interestRateAnnual: number;
  isZeroPercent: boolean;
  effectiveFrom: string;
  effectiveUntil?: string;
  minPriceBaht?: number;
  description: string;
}

const DEFAULT_OFFERS: OfferItem[] = [
  {
    id: 'off-001',
    name: 'ผ่อน 0% นาน 3 เดือน สบายกระเป๋า',
    planCode: 'ZERO_3M_V1',
    months: 3,
    interestRateAnnual: 0,
    isZeroPercent: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description: 'ดอกเบี้ย 0% สำหรับยอดสั่งซื้อตั้งแต่ ฿3,000 ขึ้นไป',
  },
  {
    id: 'off-002',
    name: 'ผ่อน 0% นาน 6 เดือน ยอดนิยม',
    planCode: 'ZERO_6M_V1',
    months: 6,
    interestRateAnnual: 0,
    isZeroPercent: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description: 'โปรโมชั่นร่วมกับพันธมิตรบัตรและสินเชื่อดิจิทัล',
  },
  {
    id: 'off-003',
    name: 'ผ่อน 0% นาน 10 เดือน สำหรับรุ่นเรือธง',
    planCode: 'ZERO_10M_V1',
    months: 10,
    interestRateAnnual: 0,
    isZeroPercent: true,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description: 'ครอบคลุม iPhone 16 Pro, Galaxy S25 และแล็ปท็อปรุ่นที่ร่วมรายการ',
  },
  {
    id: 'off-004',
    name: 'ผ่อนยาว 24 เดือน ดอกเบี้ยพิเศษ 0.69%',
    planCode: 'EXTENDED_24M_V1',
    months: 24,
    interestRateAnnual: 8.28,
    isZeroPercent: false,
    effectiveFrom: '2026-01-01T00:00:00Z',
    description: 'ค่างวดเริ่มต้นสบายๆ แบ่งเบาภาระค่าใช้จ่าย',
  },
];

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<OfferItem[]>(DEFAULT_OFFERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch('/api/offers')
      .then(async (res) => {
        const data = await res.json();
        if (Array.isArray(data.offers) && data.offers.length > 0) {
          setOffers(data.offers);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#142B4A]">
            ข้อเสนอผ่อนชำระ (Installment Offers)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            จัดการแผนผ่อนชำระ 0% ระยะเวลาผ่อน (Tenures) อัตราดอกเบี้ย และช่วงเวลาที่มีผลบังคับใช้
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6E00] flex items-center justify-center font-bold">
                  <Percent size={18} />
                </span>
                {offer.isZeroPercent ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ดอกเบี้ย 0%
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    อัตราพิเศษ
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-[#142B4A] mb-1">{offer.name}</h2>
              <div className="text-xs font-mono text-slate-400 mb-2">{offer.planCode}</div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{offer.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>ระยะเวลาผ่อน:</span>
                <span className="font-bold text-slate-900">{offer.months} เดือน</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>ดอกเบี้ยต่อปี:</span>
                <span className="font-bold text-slate-900">{offer.interestRateAnnual}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
