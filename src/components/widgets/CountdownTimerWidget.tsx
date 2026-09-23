'use client';

import React, { useState, useEffect } from 'react';

interface Props {
  widget?: {
    id?: string;
    config?: {
      targetDate?: string;
      headline?: string;
      expiredMessage?: string;
    };
  };
}

export default function CountdownTimerWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const headline = cfg.headline || 'โปรโมชั่นผ่อน 0% พิเศษจะสิ้นสุดในอีก';
  const expiredMessage = cfg.expiredMessage || 'โปรโมชั่นหมดเวลาแล้ว';

  const [days, setDays] = useState(1);
  const [hours, setHours] = useState(14);
  const [minutes, setMinutes] = useState(32);
  const [seconds, setSeconds] = useState(40);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev > 0) return prev - 1;
        setMinutes((m) => {
          if (m > 0) return m - 1;
          setHours((h) => {
            if (h > 0) return h - 1;
            setDays((d) => (d > 0 ? d - 1 : 0));
            return 23;
          });
          return 59;
        });
        return 59;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="w-full my-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6E00] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">timer</span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0F172A]">{headline}</h3>
          <p className="text-xs text-[#64748B]">รับสิทธิ์ดอกเบี้ย 0% 10 เดือน พร้อมของแถมครบชุด</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <div className="w-12 h-11 bg-slate-900 text-white rounded-lg font-black text-lg flex items-center justify-center shadow-xs">
            {pad(days)}
          </div>
          <span className="text-[10px] text-[#64748B] font-bold mt-1 uppercase">วัน</span>
        </div>
        <span className="text-xl font-bold text-slate-400 mb-4">:</span>
        <div className="flex flex-col items-center">
          <div className="w-12 h-11 bg-slate-900 text-white rounded-lg font-black text-lg flex items-center justify-center shadow-xs">
            {pad(hours)}
          </div>
          <span className="text-[10px] text-[#64748B] font-bold mt-1 uppercase">ชม.</span>
        </div>
        <span className="text-xl font-bold text-slate-400 mb-4">:</span>
        <div className="flex flex-col items-center">
          <div className="w-12 h-11 bg-slate-900 text-white rounded-lg font-black text-lg flex items-center justify-center shadow-xs">
            {pad(minutes)}
          </div>
          <span className="text-[10px] text-[#64748B] font-bold mt-1 uppercase">นาที</span>
        </div>
        <span className="text-xl font-bold text-slate-400 mb-4">:</span>
        <div className="flex flex-col items-center">
          <div className="w-12 h-11 bg-red-600 text-white rounded-lg font-black text-lg flex items-center justify-center shadow-xs">
            {pad(seconds)}
          </div>
          <span className="text-[10px] text-red-600 font-bold mt-1 uppercase">วินาที</span>
        </div>
      </div>
    </div>
  );
}
