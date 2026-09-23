'use client';

import React, { useState } from 'react';

interface Props {
  widget?: {
    id?: string;
    title?: string;
    subtitle?: string;
    config?: {
      title?: string;
      subtitle?: string;
      ctaButtonText?: string;
    };
  };
}

export default function SignupLeadFormWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const title = cfg.title || widget?.title || 'เช็กวงเงินผ่อนล่วงหน้า อนุมัติไวใน 3 นาที';
  const subtitle =
    cfg.subtitle ||
    widget?.subtitle ||
    'กรอกเบอร์โทรศัพท์เพื่อตรวจสอบวงเงินพร้อมใช้สูงสุด ฿50,000 โดยไม่ต้องใช้เอกสาร';
  const ctaText = cfg.ctaButtonText || 'ตรวจสอบวงเงินทันที';

  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 9) {
      setSubmitted(true);
    }
  };

  return (
    <div className="w-full my-6 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white shadow-lg border border-slate-700">
      <div className="max-w-xl mx-auto text-center">
        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FF6E00] text-white px-2.5 py-0.5 rounded-full mb-2 inline-block">
          FAST APPROVAL
        </span>
        <h2 className="text-lg sm:text-xl font-black text-white leading-tight mb-2">
          {title}
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          {subtitle}
        </p>

        {submitted ? (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold animate-fade-in flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>บันทึกข้อมูลสำเร็จ! เจ้าหน้าที่กำลังตรวจสอบวงเงินเบื้องต้นให้คุณ</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="กรอกเบอร์โทรศัพท์ (เช่น 081-xxx-xxxx)"
              className="h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-[#007ACC] focus:bg-white/15 flex-1 max-w-sm"
              required
            />
            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-[#007ACC] hover:bg-[#0061A3] text-white text-xs font-extrabold shadow-md transition-all active:scale-95 shrink-0"
            >
              {ctaText}
            </button>
          </form>
        )}

        <p className="text-[10px] text-slate-400 mt-3">
          * ข้อมูลของคุณได้รับการคุ้มครองตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) ปลอดภัย 100%
        </p>
      </div>
    </div>
  );
}
