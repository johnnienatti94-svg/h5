'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import PrivacyPolicyModal from '@/components/auth/PrivacyPolicyModal';

type AuthStep = 'phone' | 'otp';

// Format phone: 0891234567 → 089-123-4567
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Mask phone: 0891234567 → 089-xxx-4567
function maskPhone(phone: string): string {
  if (phone.length < 10) return phone;
  return `${phone.slice(0, 3)}-xxx-${phone.slice(6)}`;
}

// Banner items: 430 × 260 proportional
const banners = [
  {
    id: 1,
    tag: 'MeePro Flagship',
    title: 'ยินดีต้อนรับสู่ MeePro',
    desc: 'แหล่งรวมสมาร์ทโฟนและสินค้าไอที ครบจบในที่เดียว',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
  },
  {
    id: 2,
    tag: 'Special Offer',
    title: 'โปรโมชั่นผ่อนสบาย 0%',
    desc: 'ผ่อน 0% สูงสุด 10 เดือน ผ่านบัตรเครดิตชั้นนำ',
    gradient: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #10B981 100%)',
  },
  {
    id: 3,
    tag: 'MeePro Care',
    title: 'บริการครบครันทุกสาขา',
    desc: 'ทดลองเครื่องจริง ตรวจเช็คสภาพ และบริการหลังการขาย',
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #6366F1 100%)',
  },
];

export default function LoginPage() {
  const router = useRouter();

  // Authentication step
  const [step, setStep] = useState<AuthStep>('phone');

  // Phone input state
  const [phoneRaw, setPhoneRaw] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // PDPA consent state
  const [pdpaAccepted, setPdpaAccepted] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Turnstile state
  const [turnstileVerified, setTurnstileVerified] = useState(false);
  const [turnstileLoading, setTurnstileLoading] = useState(false);

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Banner slider state
  const [activeBanner, setActiveBanner] = useState(0);

  // Auto-slide banner
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const phoneDigits = phoneRaw.replace(/\D/g, '');
  const isPhoneValid = phoneDigits.length === 10 && phoneDigits.startsWith('0');
  const canRequestOtp = isPhoneValid && pdpaAccepted && turnstileVerified;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneRaw(raw);
    setPhoneError('');
    if (raw.length === 10 && !raw.startsWith('0')) {
      setPhoneError('หมายเลขโทรศัพท์ต้องขึ้นต้นด้วย 0');
    }
  };

  const handleTurnstileClick = () => {
    if (turnstileVerified) return;
    setTurnstileLoading(true);
    setTimeout(() => {
      setTurnstileLoading(false);
      setTurnstileVerified(true);
    }, 900);
  };

  const handleRequestOtp = () => {
    if (!canRequestOtp) return;
    setStep('otp');
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setOtpSuccess('');
    setResendCooldown(60);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;
      const newDigits = [...otpDigits];
      if (value.length > 1) {
        const pasted = value.slice(0, 6).split('');
        pasted.forEach((d, i) => {
          if (index + i < 6) newDigits[index + i] = d;
        });
        setOtpDigits(newDigits);
        const next = Math.min(index + pasted.length, 5);
        otpRefs.current[next]?.focus();
      } else {
        newDigits[index] = value;
        setOtpDigits(newDigits);
        if (value && index < 5) {
          otpRefs.current[index + 1]?.focus();
        }
      }
      setOtpError('');
      if (newDigits.every((d) => d !== '')) {
        verifyOtpCode(newDigits.join(''));
      }
    },
    [otpDigits]
  );

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtpCode = (code: string) => {
    setIsVerifying(true);
    setOtpError('');
    setTimeout(() => {
      setIsVerifying(false);
      if (code === '123456' || code.length === 6) {
        setOtpSuccess('✓ ยืนยันรหัส OTP สำเร็จ');
        localStorage.setItem(
          'meepro_auth',
          JSON.stringify({
            phone: formatPhone(phoneDigits),
            phone_verified: true,
            phone_verified_at: new Date().toISOString(),
          })
        );
        setTimeout(() => router.replace('/home'), 500);
      } else {
        setOtpError('รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่ (รหัสทดสอบ: 123456)');
      }
    }, 600);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.mobileCard}>
        {/* Brand Header */}
        <header className={styles.brandHeader}>
          <span className={styles.brandLogo}>MEEPRO</span>
          <span className={styles.brandTagline}>Mobile Customer Store</span>
        </header>

        {/* Banner Card — 430 × 260 proportional */}
        <div className={styles.bannerContainer}>
          <div className={styles.bannerCard}>
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={styles.bannerSlide}
                style={{
                  background: banner.gradient,
                  opacity: index === activeBanner ? 1 : 0,
                  transform: index === activeBanner ? 'scale(1)' : 'scale(0.96)',
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                }}
              >
                <span className={styles.bannerBadge}>{banner.tag}</span>
                <h2 className={styles.bannerTitle}>{banner.title}</h2>
                <p className={styles.bannerDesc}>{banner.desc}</p>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className={styles.bannerDots}>
            {banners.map((_, index) => (
              <button
                key={index}
                className={`${styles.bannerDot} ${index === activeBanner ? styles.bannerDotActive : ''}`}
                onClick={() => setActiveBanner(index)}
                aria-label={`ไปยังแบนเนอร์ ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Modern Centered Card */}
        <div className={styles.formCard}>
          {step === 'phone' ? (
            <>
              {/* Centered Heading */}
              <div className={styles.formHeader}>
                <h1 className={styles.formTitle}>เข้าสู่ระบบ / ลงทะเบียน</h1>
                <p className={styles.formSubtitle}>
                  กรอกหมายเลขโทรศัพท์เพื่อรับรหัส OTP สำหรับเข้าใช้งาน
                </p>
              </div>

              {/* Phone Input with Red Asterisk */}
              <div className={styles.inputSection}>
                <label className={styles.inputLabel}>
                  <span>เบอร์โทรศัพท์มือถือ</span>
                  <span className={styles.requiredAsterisk}>*</span>
                </label>
                <div
                  className={`${styles.phoneInputContainer} ${
                    phoneError ? styles.phoneInputContainerError : ''
                  }`}
                >
                  <div className={styles.countryBadge}>
                    <span className={styles.flagIcon}>🇹🇭</span>
                    <span className={styles.countryCode}>+66</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="0xx-xxx-xxxx"
                    value={formatPhone(phoneRaw)}
                    onChange={handlePhoneChange}
                    className={styles.phoneInputField}
                    autoComplete="tel"
                  />
                </div>
                {phoneError && <div className={styles.errorText}>{phoneError}</div>}
              </div>

              {/* PDPA Consent Checkbox */}
              <div className={styles.pdpaWrapper}>
                <label className={styles.pdpaLabel}>
                  <input
                    type="checkbox"
                    checked={pdpaAccepted}
                    onChange={(e) => setPdpaAccepted(e.target.checked)}
                    className={styles.realCheckbox}
                  />
                  <span className={styles.customCheckbox} />
                  <span className={styles.pdpaText}>
                    ข้าพเจ้ายอมรับ{' '}
                    <button
                      type="button"
                      className={styles.policyBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPrivacyModal(true);
                      }}
                    >
                      นโยบายความเป็นส่วนตัว
                    </button>
                  </span>
                </label>
              </div>

              {/* Turnstile Bot Checkbox */}
              <div className={styles.turnstileWrapper}>
                <div
                  className={`${styles.turnstileCard} ${
                    turnstileVerified ? styles.turnstileCardVerified : ''
                  }`}
                  onClick={handleTurnstileClick}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.turnstileBox}>
                    {turnstileLoading && <div className={styles.turnstileSpinner} />}
                    {turnstileVerified && (
                      <span className={styles.turnstileCheckmark}>✓</span>
                    )}
                  </div>
                  <span className={styles.turnstileLabel}>
                    {turnstileVerified
                      ? 'ยืนยันตัวตนสำเร็จ (คุณไม่ใช่โปรแกรมอัตโนมัติ)'
                      : 'ฉันไม่ใช่โปรแกรมอัตโนมัติ'}
                  </span>
                </div>
              </div>

              {/* Primary Green Action Button */}
              <button
                type="button"
                className={styles.submitOtpBtn}
                disabled={!canRequestOtp}
                onClick={handleRequestOtp}
              >
                กดรับ OTP
              </button>
            </>
          ) : (
            /* OTP Verification Screen */
            <div className={styles.otpCard}>
              <h2 className={styles.formTitle}>กรอกรหัส OTP</h2>
              <p className={styles.formSubtitle}>
                รหัส OTP 6 หลัก ถูกส่งไปยัง <strong>{maskPhone(phoneDigits)}</strong>
              </p>

              <div className={styles.otpGrid}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`${styles.otpCell} ${digit ? styles.otpCellFilled : ''}`}
                  />
                ))}
              </div>

              {otpError && <div className={styles.errorText}>{otpError}</div>}
              {otpSuccess && (
                <div style={{ color: '#007849', fontSize: '13px', fontWeight: 700, margin: '8px 0' }}>
                  {otpSuccess}
                </div>
              )}

              {resendCooldown > 0 ? (
                <div className={styles.countdownText}>
                  ส่งรหัสใหม่อีกครั้งได้ใน {resendCooldown} วินาที
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setResendCooldown(60)}
                  className={styles.resendBtn}
                >
                  ส่งรหัส OTP อีกครั้ง
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep('phone')}
                className={styles.backBtn}
              >
                ← เปลี่ยนหมายเลขโทรศัพท์
              </button>
            </div>
          )}

          {/* Security Custody Badge (Spec Sec 8) */}
          <div className={styles.securityBadge}>
            <span style={{ fontSize: '16px' }}>🛡️</span>
            <div className={styles.securityBadgeText}>
              ข้อมูลของคุณจะถูกจัดเก็บอย่างปลอดภัย และได้รับการดูแลตามนโยบายความเป็นส่วนตัว
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Bottom Sheet Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => {
          setPdpaAccepted(true);
          setShowPrivacyModal(false);
        }}
      />
    </div>
  );
}
