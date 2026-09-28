'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PrivacyPolicyModal from '@/components/auth/PrivacyPolicyModal';
import TurnstileWidget from '@/components/auth/TurnstileWidget';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/home';

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [policyViewed, setPolicyViewed] = useState(true);
  const [consent, setConsent] = useState(true);
  const [showPolicy, setShowPolicy] = useState(false);
  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const requiresBotVerification = Boolean(turnstileSiteKey);

  // Pre-load saved customer name if returning
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('meepro_customer_name');
      if (savedName) setName(savedName);
    }
  }, []);

  useEffect(() => {
    if (step !== 'otp' || cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, cooldown]);

  const cleanPhoneDigits = phone.replace(/\D/g, '');
  const isPhoneValid = /^0[689]\d{8}$/.test(cleanPhoneDigits);
  const isBotVerified = !requiresBotVerification || Boolean(captchaToken);
  const isReady = isPhoneValid && isBotVerified && consent;

  const requestOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const cleanPhone = cleanPhoneDigits;
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
      const cleanPhone = cleanPhoneDigits;
      const response = await fetch('/api/sms/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          code: otp,
          name: name.trim() || undefined,
          privacyAccepted: true,
          privacyPolicyVersion: '1.0',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'รหัส OTP ไม่ถูกต้อง');
      }

      // Save customer profile locally
      if (typeof window !== 'undefined') {
        const customerName = name.trim() || result.user?.contactName || 'ลูกค้า MeePro';
        localStorage.setItem('meepro_customer_name', customerName);
        localStorage.setItem(
          'meepro_customer_auth',
          JSON.stringify({
            userId: result.user?.id || 'customer',
            phone: cleanPhone,
            phone_verified: true,
            contactName: customerName,
          })
        );
      }

      // Best effort Supabase session sync (safe if mock tokens are returned)
      if (result.session?.access_token && !result.session.access_token.startsWith('mock_')) {
        try {
          await supabase.auth.setSession({
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
          });
        } catch {
          // Ignore
        }
      }

      // Redirect to target or home
      router.replace(redirectParam);
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
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-orange-50/40 flex items-center justify-center p-3 sm:p-6 md:p-10 select-none">
      <article
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]"
        aria-label="การยืนยันตัวตน MeePro"
      >
        {/* Left Hero Column: MeePro Brand & Features (Desktop) */}
        <section className="hidden md:flex md:col-span-5 bg-gradient-to-br from-[#FF6E00] via-[#F25A00] to-[#D44700] text-white p-8 flex-col justify-between relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-black/10 blur-xl pointer-events-none" />

          {/* Top Brand Info */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center">
                <img src="/logo.jpg" alt="MeePro Logo" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight">มีโปรโฟน</span>
                  <span className="bg-white text-[#FF6E00] text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                    MALL
                  </span>
                </div>
                <p className="text-[11px] text-white/80 font-medium">ผ่อนมือถือ สมาร์ตโฟน แกดเจ็ต</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white leading-snug mb-3">
              ผ่อนง่าย ได้เครื่องทันที <br />
              <span className="text-orange-100 font-medium text-lg">เริ่มต้นดาวน์น้อย ดอกเบี้ย 0%</span>
            </h2>

            <div className="space-y-3 mt-6">
              <div className="flex items-start gap-3 bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                <span className="material-symbols-outlined text-[20px] text-orange-200 mt-0.5">bolt</span>
                <div>
                  <h4 className="text-[13px] font-bold">สมัครง่าย อนุมัติไวใน 3 นาที</h4>
                  <p className="text-[11px] text-white/80">ไม่ต้องใช้บัตรเครดิต อนุมัติทันใจ</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                <span className="material-symbols-outlined text-[20px] text-orange-200 mt-0.5">storefront</span>
                <div>
                  <h4 className="text-[13px] font-bold">รับเครื่องที่สาขา หรือจัดส่งฟรี</h4>
                  <p className="text-[11px] text-white/80">เลือกสาขาใกล้บ้าน พร้อมนัดหมายเวลารับ</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                <span className="material-symbols-outlined text-[20px] text-orange-200 mt-0.5">verified_user</span>
                <div>
                  <h4 className="text-[13px] font-bold">เครื่องแท้ศูนย์ไทย 100%</h4>
                  <p className="text-[11px] text-white/80">ประกันเต็มปี มีทีมงานดูแลตลอดการใช้งาน</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-6 border-t border-white/20 mt-6 flex items-center gap-2 text-white/90">
            <span className="material-symbols-outlined text-[18px] text-emerald-300">check_circle</span>
            <span className="text-[11px] font-semibold">เครือข่ายศูนย์บริการครอบคลุมกว่า 20 สาขา</span>
          </div>
        </section>

        {/* Right Form Column (Desktop & Mobile) */}
        <section className="col-span-1 md:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
          {/* Mobile Top Header (Visible on Mobile only) */}
          <div className="md:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 p-1 border border-orange-100 flex items-center justify-center">
                <img src="/logo.jpg" alt="MeePro Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <span className="font-bold text-slate-800 text-base">มีโปรโฟน</span>
              <span className="bg-[#FF6E00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">MALL</span>
            </div>
            <span className="text-xs text-[#007ACC] font-semibold">ผ่อน 0% ทุกรุ่น</span>
          </div>

          {step === 'phone' ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Heading Area */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    เข้าสู่ระบบ / ลงทะเบียน
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    กรอกเบอร์มือถือและชื่อของคุณ เพื่อเข้าใช้งานและสั่งซื้อสินค้า
                  </p>
                </div>

                {/* 1. Full Name Input (Customer Registration) */}
                <div className="space-y-1.5 mb-4">
                  <label className="block text-xs font-semibold text-slate-700">
                    ชื่อ - นามสกุล <span className="text-slate-400 font-normal">(สำหรับสั่งซื้อและรับเครื่อง)</span>
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-[#007ACC] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#007ACC]/10 transition-all h-[48px] px-3.5 shadow-xs">
                    <span className="material-symbols-outlined text-[20px] text-slate-400 mr-2">person</span>
                    <input
                      id="name-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น คุณสมชาย ใจดี"
                      className="w-full h-full bg-transparent border-none text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Phone Number Input */}
                <div className="space-y-1.5 mb-4">
                  <label className="block text-xs font-semibold text-slate-700">
                    หมายเลขโทรศัพท์มือถือ <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-50/70 border border-slate-200 focus-within:border-[#007ACC] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#007ACC]/10 transition-all h-[48px] shadow-xs overflow-hidden">
                    <div className="flex items-center gap-1 pl-3.5 pr-2.5 h-full border-r border-slate-200 bg-slate-100/70 text-slate-700">
                      <span className="text-xs font-bold">+66</span>
                      <span className="material-symbols-outlined text-slate-400 text-[16px]">phone_iphone</span>
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
                      className="w-full h-full bg-transparent border-none px-3.5 text-[15px] font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  {phone.length > 0 && !isPhoneValid && (
                    <p className="text-[11px] text-amber-600 font-medium pl-1">
                      กรุณากรอกเบอร์มือถือ 10 หลัก (ขึ้นต้นด้วย 06, 08 หรือ 09)
                    </p>
                  )}
                </div>

                {/* 3. Security / Bot Verification */}
                <div className="space-y-1.5 mb-4">
                  {turnstileSiteKey ? (
                    <div className="min-h-[65px] overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
                      <TurnstileWidget
                        key={turnstileResetKey}
                        siteKey={turnstileSiteKey}
                        onTokenChange={setCaptchaToken}
                        onError={() => setError('ไม่สามารถตรวจสอบความปลอดภัยได้ กรุณาลองใหม่')}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                      <span className="material-symbols-outlined text-[18px] text-emerald-600">verified_user</span>
                      <span className="text-xs font-medium">เข้าสู่ระบบปลอดภัยด้วยรหัส OTP มาตรฐาน 2-Factor</span>
                    </div>
                  )}
                </div>

                {/* 4. PDPA Consent */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 mb-4 shadow-xs">
                  <label className="flex items-start gap-2.5 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#007ACC] focus:ring-0 mt-0.5 accent-[#007ACC]"
                    />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <span>ฉันได้อ่านและยอมรับ </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPolicy(true);
                        }}
                        className="text-[#007ACC] font-semibold hover:underline"
                      >
                        นโยบายการคุ้มครองข้อมูลส่วนบุคคล (PDPA)
                      </button>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Button & Error */}
              <div className="pt-2">
                {error && (
                  <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2" role="alert">
                    <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  id="request-otp-button"
                  disabled={!isReady || loading}
                  onClick={requestOtp}
                  className={`w-full h-[50px] rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-md ${
                    isReady && !loading
                      ? 'bg-[#FF6E00] hover:bg-[#E65100] text-white active:scale-98 cursor-pointer shadow-orange-500/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังส่งรหัส OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>ขอรับรหัส OTP</span>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-400 mt-3">
                  ระบบจะส่งรหัสผ่านทาง SMS ไปยังหมายเลขที่คุณระบุ
                </p>
              </div>
            </div>
          ) : (
            /* Step 2: OTP Verification */
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#007ACC] font-semibold mb-6 hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>เปลี่ยนหมายเลขโทรศัพท์</span>
                </button>

                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6E00] flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-[26px]">sms</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">ยืนยันรหัส OTP</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    รหัส 6 หลักถูกส่งไปยังหมายเลข
                  </p>
                  <p className="text-base font-bold text-[#007ACC] mt-0.5 tracking-wide">
                    {maskPhone(phone)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    (รหัสทดสอบในโหมดพัฒนา: <strong className="text-slate-600">123456</strong>)
                  </p>
                </div>

                {/* 6 Digit Split Box */}
                <div
                  className="flex justify-center gap-2 sm:gap-2.5 mb-6 cursor-pointer"
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
                        className={`w-11 h-13 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-extrabold transition-all bg-white ${
                          isCurrent
                            ? 'border-[#007ACC] ring-2 ring-[#007ACC]/20'
                            : char
                            ? 'border-slate-800 text-slate-900'
                            : 'border-slate-200 text-slate-300'
                        }`}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>

                {/* Resend OTP Row */}
                <div className="flex items-center justify-between text-xs px-2 mb-4 text-slate-500">
                  <button
                    type="button"
                    disabled={cooldown > 0 || loading}
                    onClick={resendOtp}
                    className="flex items-center gap-1 font-semibold text-[#007ACC] disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>ขอรหัส OTP อีกครั้ง</span>
                  </button>
                  <span className="font-medium text-slate-400">
                    {cooldown > 0 ? `รออีก ${cooldown} วินาที` : 'สามารถขอรหัสใหม่ได้'}
                  </span>
                </div>
              </div>

              <div>
                {error && (
                  <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2" role="alert">
                    <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  id="verify-otp-button"
                  disabled={otp.length !== 6 || loading}
                  onClick={verifyOtp}
                  className={`w-full h-[50px] rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-md ${
                    otp.length === 6 && !loading
                      ? 'bg-[#007ACC] hover:bg-[#0061A3] text-white active:scale-98 cursor-pointer shadow-blue-500/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>กำลังตรวจสอบรหัส...</span>
                    </>
                  ) : (
                    <>
                      <span>ยืนยันและเข้าสู่ระบบ</span>
                      <span className="material-symbols-outlined text-[18px]">login</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* PDPA Privacy Policy Modal */}
        {showPolicy && (
          <PrivacyPolicyModal
            onAccept={() => {
              setPolicyViewed(true);
              setConsent(true);
              setShowPolicy(false);
            }}
          />
        )}
      </article>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#FF6E00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
