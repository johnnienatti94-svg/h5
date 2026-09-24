'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrivacyPolicyModal from '@/components/auth/PrivacyPolicyModal';
import TurnstileWidget from '@/components/auth/TurnstileWidget';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [policyViewed, setPolicyViewed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const requiresBotVerification = process.env.NODE_ENV === 'production' || Boolean(turnstileSiteKey);

  useEffect(() => {
    if (step !== 'otp' || cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, cooldown]);

  const isPhoneValid = /^0[689]\d{8}$/.test(phone.replace(/\D/g, ''));
  const isBotVerified = !requiresBotVerification || Boolean(captchaToken);
  const isReady = isPhoneValid && isBotVerified && consent;

  const requestOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const response = await fetch('/api/sms/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, captchaToken }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'ไม่สามารถส่งรหัส OTP ได้');
      }
      setCooldown(result.cooldownRemaining || 60);
      setStep('otp');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setCaptchaToken(null);
      setTurnstileResetKey((value) => value + 1);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const response = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, code: otp }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'รหัส OTP ไม่ถูกต้อง');
      }
      if (!result.session?.access_token || !result.session?.refresh_token) {
        throw new Error('ไม่สามารถสร้างเซสชันที่ปลอดภัยได้');
      }
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });
      if (sessionError) throw sessionError;
      router.replace('/home');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'เกิดข้อผิดพลาดในการตรวจสอบรหัส OTP');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setOtp('');
    setCaptchaToken(null);
    setTurnstileResetKey((value) => value + 1);
    setStep('phone');
  };

  const formatPhoneDisplay = (val: string) => {
    const raw = val.replace(/\D/g, '');
    if (raw.length <= 3) return raw;
    if (raw.length <= 6) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6, 10)}`;
  };

  const maskPhone = (val: string) => {
    const raw = val.replace(/\D/g, '');
    if (raw.length === 10) {
      return `${raw.slice(0, 3)}-xxx-${raw.slice(6)}`;
    }
    return val;
  };

  return (
    <main className="flex min-h-dvh items-start justify-center bg-[#E5E7EB] sm:items-center sm:p-4 select-none">
      {/* Stitch 375x812px Mobile Frame Canvas */}
      <article
        className="w-full max-w-[375px] min-h-[812px] bg-[#F8FAFC] flex flex-col relative overflow-hidden shadow-2xl sm:rounded-[36px] border border-[#E2E8F0]"
        aria-label="การยืนยันตัวตน MeePro"
      >
        {/* Top App Bar (MeePro Brand Orange Navigation Anchor - Stitch Screen 01) */}
        <header className="w-full bg-[#FF6E00] h-14 flex items-center justify-center px-4 z-30 shadow-sm relative shrink-0">
          <div className="flex items-center justify-center tracking-tight">
            <span className="text-[20px] text-white font-extrabold tracking-tight">
              MeePro
            </span>
          </div>
        </header>

        {/* Scrollable Content Canvas */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 flex flex-col justify-between">
          {step === 'phone' ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* 1. Promotional Banner Card (Stitch Screen 01) */}
                <div className="w-full rounded-[18px] bg-gradient-to-r from-[#FFF4EC] to-[#FFF0E6] border border-[#FED7AA] p-3.5 mb-4 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <div className="flex-1 pr-1">
                      <span className="inline-flex items-center gap-1 bg-[#FF6E00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1.5 shadow-xs">
                        <span className="material-symbols-outlined text-[12px]">bolt</span>
                        โปรโมชั่นพิเศษ
                      </span>
                      <h2 className="text-[15px] font-bold text-[#0F172A] leading-tight">
                        ผ่อนง่าย อนุมัติไว
                      </h2>
                      <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                        เริ่มต้นดาวน์น้อย พร้อมรับเครื่องทันที
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-[#FF6E00]">
                        <span>สมัครง่ายใน 3 นาที</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </div>
                    </div>

                    {/* Smartphone Illustration Box */}
                    <div className="w-18 h-18 rounded-xl bg-white/90 p-1 shrink-0 shadow-xs border border-orange-100 flex items-center justify-center text-[#FF6E00]">
                      <span className="material-symbols-outlined text-[40px]">smartphone</span>
                    </div>
                  </div>

                  {/* Decorative Background Circles */}
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#FF6E00]/10 pointer-events-none" />
                  <div className="absolute right-12 -top-6 w-16 h-16 rounded-full bg-[#FF6E00]/5 pointer-events-none" />
                </div>

                {/* 2. Form Heading Area */}
                <div className="mb-4">
                  <h1 className="text-[24px] font-bold text-[#0F172A] tracking-tight">
                    เข้าสู่ระบบ / ลงทะเบียน
                  </h1>
                  <p className="text-[13px] text-[#64748B] mt-0.5">
                    กรุณากรอกเบอร์มือถือ
                  </p>
                </div>

                {/* 3. Phone Number Input Section */}
                <div className="space-y-1.5 mb-3.5">
                  <label className="block text-[13px] text-[#0F172A] font-semibold">
                    หมายเลขโทรศัพท์มือถือ
                  </label>
                  <div className="flex items-center rounded-xl bg-white border border-[#E2E8F0] focus-within:border-[#007ACC] focus-within:ring-1 focus-within:ring-[#007ACC] transition-all h-[50px] shadow-xs overflow-hidden">
                    <div className="flex items-center gap-1 pl-3.5 pr-2.5 h-full border-r border-[#E2E8F0] bg-slate-50/70 text-[#0F172A]">
                      <span className="text-[13px] font-semibold text-slate-700">+66</span>
                      <span className="material-symbols-outlined text-[#64748B] text-[16px]">expand_more</span>
                    </div>
                    <input
                      id="phone-input"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={12}
                      value={formatPhoneDisplay(phone)}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="08x-xxx-xxxx"
                      className="w-full h-full bg-transparent border-none px-3 text-[16px] font-semibold text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4. Bot verification */}
                <div className="space-y-1.5 mb-3.5">
                  <span className="block text-[13px] text-[#0F172A] font-semibold">ตรวจสอบความปลอดภัย</span>
                  {turnstileSiteKey ? (
                    <div className="min-h-[65px] overflow-hidden rounded-xl border border-[#E2E8F0] bg-white p-2">
                      <TurnstileWidget
                        key={turnstileResetKey}
                        siteKey={turnstileSiteKey}
                        onTokenChange={setCaptchaToken}
                        onError={() => setError('ไม่สามารถตรวจสอบความปลอดภัยได้ กรุณาลองใหม่')}
                      />
                    </div>
                  ) : process.env.NODE_ENV === 'production' ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700" role="alert">
                      ระบบเข้าสู่ระบบยังไม่ได้ตั้งค่า Turnstile กรุณาติดต่อผู้ดูแลระบบ
                    </p>
                  ) : (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      โหมดพัฒนา: ยังไม่ได้ตั้งค่า Turnstile และไม่สามารถเปิดใช้เงื่อนไขนี้ใน production ได้
                    </p>
                  )}
                </div>

                {/* 5. Privacy Policy Link */}
                <div className="mb-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPolicy(true)}
                    className="group inline-flex items-center gap-1.5 text-[#007ACC] hover:text-[#0061A3] active:scale-98 transition-all text-[13px] font-semibold text-left focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#007ACC] group-hover:translate-x-0.5 transition-transform">
                      open_in_new
                    </span>
                    <span className="underline underline-offset-4 decoration-[#007ACC]/40">
                      ดูนโยบายการคุ้มครองข้อมูลส่วนบุคคล
                    </span>
                  </button>
                </div>

                {/* 6. Consent Checkbox Component (Disabled Until Viewed - Stitch Screen 01 to 04) */}
                <div
                  className={`rounded-xl border border-[#E2E8F0] bg-white p-3 mb-1.5 shadow-xs transition-all ${
                    consent ? 'ring-1 ring-[#007ACC]/50' : ''
                  }`}
                >
                  <label
                    className={`flex items-start gap-2.5 select-none ${
                      policyViewed ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!policyViewed}
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-[#007ACC] focus:ring-0 mt-0.5 accent-[#007ACC] disabled:opacity-40"
                    />
                    <span
                      className={`text-[12px] leading-snug ${
                        policyViewed ? 'text-[#0F172A] font-medium' : 'text-slate-400 font-normal'
                      }`}
                    >
                      ฉันได้อ่านและเข้าใจนโยบายการคุ้มครองข้อมูลส่วนบุคคลแล้ว
                    </span>
                  </label>
                </div>

                {/* Helper status text */}
                <div className="flex items-center gap-1 px-1 text-[11px] mb-2">
                  <span
                    className={`material-symbols-outlined text-[14px] ${
                      policyViewed ? 'text-[#16A365]' : 'text-slate-400'
                    }`}
                  >
                    {policyViewed ? 'check_circle' : 'info'}
                  </span>
                  <p className={policyViewed ? 'text-[#16A365] font-medium' : 'text-[#64748B]'}>
                    {policyViewed
                      ? 'อ่านนโยบายแล้ว — สามารถเลือกช่องยอมรับได้'
                      : 'กรุณาดูนโยบายก่อน จึงจะสามารถเลือกช่องด้านบนได้'}
                  </p>
                </div>
              </div>

              {/* Action Button & Security Footnote */}
              <div className="mt-4 pt-2">
                {error && (
                  <p className="mb-2 text-center text-xs text-red-600 font-medium" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  disabled={!isReady || loading}
                  onClick={requestOtp}
                  className={`w-full h-[50px] rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all shadow-xs ${
                    isReady && !loading
                      ? 'bg-[#007ACC] hover:bg-[#0061A3] text-white active:scale-98 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{loading ? 'กำลังส่ง...' : 'กดรับ OTP'}</span>
                  <span className="material-symbols-outlined text-[18px]">lock_open</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 mt-3 text-[#64748B]">
                  <span className="material-symbols-outlined text-[14px] text-[#16A365]">verified</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    OTP และเซสชันจัดการโดย Supabase Auth
                  </span>
                </div>

              </div>
            </div>
          ) : (
            /* Stitch Screen 05: OTP Verification Form */
            <div className="flex-1 flex flex-col justify-between pt-4">
              <div>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="flex items-center gap-1 text-xs text-[#007ACC] font-semibold mb-4 hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>เปลี่ยนหมายเลขโทรศัพท์</span>
                </button>

                <div className="text-center mb-6">
                  <h1 className="text-[24px] font-bold text-[#0F172A]">รหัส OTP</h1>
                  <p className="text-[13px] text-[#64748B] mt-1">
                    เราได้ทำการส่งรหัสยืนยัน 6 หลัก ไปยังหมายเลข
                  </p>
                  <p className="text-[18px] font-bold text-[#007ACC] mt-1">
                    {maskPhone(phone)}
                  </p>
                </div>

                {/* 6 Digit Split Box */}
                <div
                  className="flex justify-center gap-2 mb-6 cursor-pointer"
                  onClick={() => document.getElementById('hidden-otp-input')?.focus()}
                >
                  <input
                    id="hidden-otp-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="sr-only"
                    autoFocus
                  />
                  {Array.from({ length: 6 }, (_, i) => {
                    const char = otp[i] || '';
                    const isCurrent = i === otp.length;
                    return (
                      <div
                        key={i}
                        className={`w-11 h-13 rounded-xl border-2 flex items-center justify-center text-[22px] font-bold transition-all bg-white ${
                          isCurrent
                            ? 'border-[#007ACC] ring-2 ring-[#007ACC]/20'
                            : char
                            ? 'border-[#0F172A] text-[#0F172A]'
                            : 'border-[#E2E8F0] text-slate-300'
                        }`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>

                {/* Resend OTP Row */}
                <div className="flex items-center justify-between text-xs px-2 mb-4">
                  <button
                    type="button"
                    disabled={cooldown > 0 || loading}
                    onClick={resendOtp}
                    className="flex items-center gap-1 font-semibold text-[#007ACC] disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>รับรหัส OTP อีกครั้ง</span>
                  </button>
                  <span className="text-[#64748B] font-medium">{cooldown} วินาที</span>
                </div>
              </div>

              <div>
                {error && (
                  <p className="mb-2 text-center text-xs text-red-600 font-medium" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  disabled={otp.length !== 6 || loading}
                  onClick={verifyOtp}
                  className={`w-full h-[50px] rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all shadow-xs ${
                    otp.length === 6 && !loading
                      ? 'bg-[#007ACC] hover:bg-[#0061A3] text-white active:scale-98 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{loading ? 'กำลังยืนยัน...' : 'ยืนยัน'}</span>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PDPA Privacy Policy Modal (Stitch Screen 02) */}
        {showPolicy && (
          <PrivacyPolicyModal
            onAccept={() => {
              setPolicyViewed(true);
              setShowPolicy(false);
            }}
          />
        )}
      </article>
    </main>
  );
}
