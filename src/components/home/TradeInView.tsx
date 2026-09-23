'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface PhoneModel {
  id: string;
  brand: string;
  name: string;
  basePrice: number;
}

const mockModels: PhoneModel[] = [
  { id: 'ip-15-pro', brand: 'Apple', name: 'iPhone 15 Pro (128GB)', basePrice: 26000 },
  { id: 'ip-14', brand: 'Apple', name: 'iPhone 14 (128GB)', basePrice: 17500 },
  { id: 'ip-13', brand: 'Apple', name: 'iPhone 13 (128GB)', basePrice: 13500 },
  { id: 'ss-s23', brand: 'Samsung', name: 'Galaxy S23 (128GB)', basePrice: 14000 },
  { id: 'ss-a54', brand: 'Samsung', name: 'Galaxy A54 5G (128GB)', basePrice: 7200 },
  { id: 'op-reno', brand: 'OPPO', name: 'Reno 10 Pro 5G', basePrice: 9500 },
];

export default function TradeInView() {
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedModelId, setSelectedModelId] = useState('ip-13');
  const [conditionGrade, setConditionGrade] = useState<'A' | 'B' | 'C'>('A');
  const [isCalculated, setIsCalculated] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const availableModels = mockModels.filter((m) => m.brand === selectedBrand);
  const currentModel = mockModels.find((m) => m.id === selectedModelId) || availableModels[0];

  const calculateEstimate = () => {
    if (!currentModel) return 0;
    const multipliers = { A: 1.0, B: 0.85, C: 0.65 };
    return Math.round(currentModel.basePrice * multipliers[conditionGrade]);
  };

  const estimatedValue = calculateEstimate();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Main Hero / Promotional Banner */}
      <section className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-white via-[#F8F9FF] to-[#D1E4FF]/30 border border-[#E2E8F0] p-4 shadow-sm">
        <div className="relative z-10 flex flex-col justify-between max-w-[210px]">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF6E00]/10 text-[#FF6E00] text-[11px] font-bold mb-1.5 border border-[#FF6E00]/20">
              <span className="material-symbols-outlined text-[13px]">local_fire_department</span>
              <span>ประเมินไว จ่ายจริง</span>
            </div>
            <h1 className="text-[22px] leading-[28px] text-[#0F172A] font-bold tracking-tight">
              เปลี่ยนมือถือ<br />เป็นเงินสด
            </h1>
          </div>

          {/* Key Value Proposition Badges */}
          <div className="mt-3 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[#0F172A] text-[12px] font-medium">
              <span className="material-symbols-outlined text-[#16A365] text-[16px]">check_circle</span>
              <span>อนุมัติไว ภายใน 5 นาที</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#0F172A] text-[12px] font-medium">
              <span className="material-symbols-outlined text-[#16A365] text-[16px]">check_circle</span>
              <span>ให้ราคาสูง ยุติธรรม</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#0F172A] text-[12px] font-medium">
              <span className="material-symbols-outlined text-[#16A365] text-[16px]">check_circle</span>
              <span>ปลอดภัย 100% สัญญาชัดเจน</span>
            </div>
          </div>
        </div>

        {/* Hero Illustration / Icon */}
        <div className="absolute right-2 bottom-2 w-32 h-36 flex items-center justify-center pointer-events-none opacity-90">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FF6E00]/20 to-[#007ACC]/20 blur-xl absolute" />
            <span className="material-symbols-outlined text-[80px] text-[#007ACC]/70">currency_exchange</span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Valuation Calculator */}
      <section className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#007ACC]">
              <span className="material-symbols-outlined text-[18px]">calculate</span>
            </div>
            <h2 className="text-[15px] font-bold text-[#0F172A]">คำนวณราคาประเมินเบื้องต้น</h2>
          </div>
          <span className="text-[11px] font-medium text-[#16A365] bg-emerald-50 px-2 py-0.5 rounded-full">
            ฟรี ไม่มีข้อผูกมัด
          </span>
        </div>

        {/* Brand Selector */}
        <div>
          <label className="text-[12px] font-semibold text-[#64748B] block mb-1.5">1. เลือกยี่ห้อ</label>
          <div className="flex gap-2">
            {['Apple', 'Samsung', 'OPPO'].map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => {
                  setSelectedBrand(brand);
                  const firstOfBrand = mockModels.find((m) => m.brand === brand);
                  if (firstOfBrand) setSelectedModelId(firstOfBrand.id);
                  setIsCalculated(false);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedBrand === brand
                    ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Model Selector */}
        <div>
          <label className="text-[12px] font-semibold text-[#64748B] block mb-1.5">2. เลือกรุ่นสมาร์ตโฟน</label>
          <select
            value={selectedModelId}
            onChange={(e) => {
              setSelectedModelId(e.target.value);
              setIsCalculated(false);
            }}
            className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-[#F8FAFC] focus:border-[#007ACC] focus:outline-none"
          >
            {availableModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Grade */}
        <div>
          <label className="text-[12px] font-semibold text-[#64748B] block mb-1.5">3. สภาพตัวเครื่อง</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { grade: 'A', title: 'เกรด A', desc: 'สวยเหมือนใหม่' },
              { grade: 'B', title: 'เกรด B', desc: 'มีรอยใช้งานทั่วไป' },
              { grade: 'C', title: 'เกรด C', desc: 'มีรอยตก/จอร้าว' },
            ].map((item) => (
              <button
                key={item.grade}
                type="button"
                onClick={() => {
                  setConditionGrade(item.grade as 'A' | 'B' | 'C');
                  setIsCalculated(false);
                }}
                className={`p-2 rounded-xl border text-center transition-all ${
                  conditionGrade === item.grade
                    ? 'border-[#007ACC] bg-blue-50 text-[#007ACC]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:bg-slate-50'
                }`}
              >
                <p className="text-xs font-bold">{item.title}</p>
                <p className="text-[10px] opacity-80 mt-0.5">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Estimate Value Display */}
        <div className="pt-2">
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#64748B]">ราคาประเมินรับแลกสูงสุด</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[26px] font-bold text-[#007ACC]">
                  ฿{estimatedValue.toLocaleString()}
                </span>
                <span className="text-xs text-[#64748B]">บาท</span>
              </div>
            </div>
            <span className="text-[10px] text-[#16A365] bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 font-semibold">
              รับเงินทันที
            </span>
          </div>
        </div>

        {/* CTA */}
        {!bookingSuccess ? (
          <button
            type="button"
            onClick={() => setBookingSuccess(true)}
            className="w-full h-12 bg-[#007ACC] hover:bg-[#0061A3] active:scale-[0.98] transition-all text-white text-[14px] font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>จองคิวนำเครื่องมาแลกเงินที่สาขา</span>
          </button>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-xs font-bold text-[#16A365] flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              จองคิวสำเร็จ! หมายเลขคิว #TR-8821
            </p>
            <p className="text-[11px] text-[#64748B] mt-1">
              แสดงรหัสนี้แก่เจ้าหน้าที่สาขา MeePro ใกล้บ้านคุณได้เลย
            </p>
          </div>
        )}
      </section>

      {/* 3. Benefit Cards (2x2 Grid) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#0F172A]">จุดเด่นของการแลกเงินกับ MeePro</h2>
          <span className="text-[11px] text-[#64748B] font-medium">มาตรฐานสากล</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#007ACC] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[20px]">calculate</span>
            </div>
            <h3 className="text-[13px] font-semibold text-[#0F172A]">ประเมินราคาฟรี</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">รู้ราคาทันที ภายใน 1 นาที</p>
          </div>

          <div className="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6E00] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <h3 className="text-[13px] font-semibold text-[#0F172A]">อนุมัติไว</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">เอกสารน้อย รับเงินเร็ว</p>
          </div>

          <div className="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A365] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
            </div>
            <h3 className="text-[13px] font-semibold text-[#0F172A]">ปลอดภัย 100%</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">ลบข้อมูลหมดจด ปลอดภัยสูงสุด</p>
          </div>

          <div className="bg-white rounded-xl p-3 border border-[#E2E8F0] shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#007ACC] flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <h3 className="text-[13px] font-semibold text-[#0F172A]">รับเงินหลายช่องทาง</h3>
            <p className="text-[11px] text-[#64748B] mt-0.5">โอนเข้าบัญชี หรือรับสดที่สาขา</p>
          </div>
        </div>
      </section>

      {/* 4. Process Flow (3 Steps) */}
      <section className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#E2E8F0] pb-2">
          <span className="text-[14px] font-bold text-[#0F172A] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#007ACC] text-[18px]">sync_alt</span>
            <span>ขั้นตอนการแลกเงินง่ายๆ</span>
          </span>
          <span className="text-[11px] font-semibold text-[#FF6E00]">3 ขั้นตอน</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#007ACC] text-white flex items-center justify-center font-bold text-xs shadow-sm mb-1.5">
              1
            </div>
            <p className="text-[11px] font-semibold text-[#0F172A]">ประเมินราคา</p>
            <p className="text-[10px] text-[#64748B]">ผ่านระบบออนไลน์</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#007ACC] text-white flex items-center justify-center font-bold text-xs shadow-sm mb-1.5">
              2
            </div>
            <p className="text-[11px] font-semibold text-[#0F172A]">ตรวจสภาพ</p>
            <p className="text-[10px] text-[#64748B]">ที่สาขาใกล้บ้าน</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-[#16A365] text-white flex items-center justify-center font-bold text-xs shadow-sm mb-1.5">
              3
            </div>
            <p className="text-[11px] font-semibold text-[#0F172A]">รับเงินทันที</p>
            <p className="text-[10px] text-[#64748B]">โอนเข้าบัญชีทันใจ</p>
          </div>
        </div>
      </section>
    </div>
  );
}
