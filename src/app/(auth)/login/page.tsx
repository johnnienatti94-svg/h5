'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PrivacyPolicyModal from '@/components/auth/PrivacyPolicyModal';
import TurnstileWidget from '@/components/auth/TurnstileWidget';
import HeroBannerWidget from '@/components/home/HeroBannerWidget';
import { DEFAULT_HOMEPAGE_WIDGETS } from '@/lib/homepageWidgets';
import { HeroBannerWidget as IHeroBannerWidget } from '@/types/widget';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/home';

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
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

  // Hero banner state (same as home banner, with CMS sync)
  const [heroWidget, setHeroWidget] = useState<IHeroBannerWidget>(() => {
    const defaultHero = DEFAULT_HOMEPAGE_WIDGETS.find((w) => w.type === 'HERO_BANNER');
    return defaultHero as IHeroBannerWidget;
  });

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const requiresBotVerification = Boolean(turnstileSiteKey);

  // Load home banner from backend if available, fallback to defaults
  useEffect(() => {
    let active = true;
    fetch('/api/cms/pages/home/widgets')
      .then((res) => res.json())
      .then((data) => {
        if (active && data && Array.isArray(data.widgets)) {
          const found = data.widgets.find(
            (w: any) => (w.widget_type || w.type || '').toUpperCase() === 'HERO_BANNER'
          );
          if (found) {
            setHeroWidget({
              id: found.id,
              type: 'HERO_BANNER',
              title: found.title,
              subtitle: found.subtitle,
              banners: found.banners || found.config?.banners,
              config: found.config,
              autoSlideIntervalMs: found.autoSlideIntervalMs || found.config?.autoSlideIntervalMs || 4000,
            } as IHeroBannerWidget);
          }
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
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
          privacyAccepted: true,
          privacyPolicyVersion: '1.0',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'รหัส OTP ไม่ถูกต้อง');
      }

      // Save customer session locally
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'meepro_customer_auth',
          JSON.stringify({
            userId: result.user?.id || 'customer',
            phone: cleanPhone,
            phone_verified: true,
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
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex flex-col items-center justify-center p-3 sm:p-4 select-none py-6 sm:py-10">
      <div className="w-full max-w-[440px] flex flex-col gap-3.5">
        {/* Slide Banner (Same as Home Banner, size optimized for Web & Mobile) */}
        {heroWidget && (
          <div className="w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 bg-[#0F172A]">
            <HeroBannerWidget widget={heroWidget} compact noPadding />
          </div>
        )}

        {/* Login Card */}
        <article
          className="w-full bg-white rounded-3xl shadow-xl sm:shadow-2xl border border-slate-200/80 p-6 sm:p-8 flex flex-col"
          aria-label="การยืนยันตัวตน MeePro"
        >
          {/* Top Brand Header */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 p-1 border border-orange-100 flex items-center justify-center shadow-xs">
              <img src="/logo.jpg" alt="MeePro Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">มีโปรโฟน</span>
              <span className="bg-[#FF6E00] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">
                MALL
              </span>
            </div>
          </div>

          {step === 'phone' ? (
            <div className="space-y-5">
              {/* Heading Area */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  เข้าสู่ระบบ / ลงทะเบียน
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  กรุณากรอกหมายเลขโทรศัพท์มือถือ
                </p>
              </div>

              {/* Phone Number Input Section */}
              <div className="space-y-1.5">
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

              {/* Security / Bot Verification */}
              <div className="space-y-1.5">
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

              {/* PDPA Consent Checkbox */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 shadow-xs">
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

              {/* Action Button & Error */}
              <div className="pt-1">
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
            <div className="space-y-5">
              <div>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#007ACC] font-semibold mb-4 hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>เปลี่ยนหมายเลขโทรศัพท์</span>
                </button>

                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6E00] flex items-center justify-center mx-auto mb-2.5">
                    <span className="material-symbols-outlined text-[26px]">sms</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">ยืนยันรหัส OTP</h2>
                  <p className="text-xs text-slate-500 mt-1">
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
                  className="flex justify-center gap-2 sm:gap-2.5 mb-5 cursor-pointer"
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
                <div className="flex items-center justify-between text-xs px-1 mb-4 text-slate-500">
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
        </article>

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
      </div>
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
