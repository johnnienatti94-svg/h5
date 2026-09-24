'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  ShieldCheck,
  Smartphone,
  User,
  FileText,
  AlertCircle,
  Phone,
} from 'lucide-react';
import type { PublicProductDetail, PublicProductVariant, PublicOfferVersion } from '@/features/catalog/types';
import { formatBaht } from '@/features/catalog/types';
import type { PublicBranch } from '@/features/branches/types';
import BranchDetailsDialog from '@/components/branches/BranchDetailsDialog';
import styles from './ApplicationWizard.module.css';

interface ApplicationWizardProps {
  products: PublicProductDetail[];
  branches: PublicBranch[];
  initialProductSlug?: string;
  initialVariantId?: string;
  initialOfferId?: string;
  initialBranchSlug?: string;
}

export default function ApplicationWizard({
  products,
  branches,
  initialProductSlug,
  initialVariantId,
  initialOfferId,
  initialBranchSlug,
}: ApplicationWizardProps) {


  // 1. Resolve Initial Product, Variant, Offer, Branch
  const selectedProduct =
    products.find((p) => p.slug === initialProductSlug || p.id === initialProductSlug) ||
    products[0];

  const [currentVariant, setCurrentVariant] = useState<PublicProductVariant>(() => {
    if (!selectedProduct?.variants?.length) return {} as PublicProductVariant;
    return (
      selectedProduct.variants.find((v) => v.id === initialVariantId) ||
      selectedProduct.variants[0]
    );
  });

  const [currentOffer, setCurrentOffer] = useState<PublicOfferVersion>(() => {
    if (!selectedProduct?.offers?.length) return {} as PublicOfferVersion;
    return (
      selectedProduct.offers.find((o) => o.id === initialOfferId) ||
      selectedProduct.offers[0]
    );
  });

  const [selectedBranch, setSelectedBranch] = useState<PublicBranch>(() => {
    return (
      branches.find((b) => b.slug === initialBranchSlug || b.id === initialBranchSlug) ||
      branches[0]
    );
  });

  // State Management
  const [step, setStep] = useState<number>(1);
  const [dialogBranch, setDialogBranch] = useState<PublicBranch | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Customer Auth & Form
  const [currentUser, setCurrentUser] = useState<{ id: string; phone: string } | null>(null);
  const [contactName, setContactName] = useState<string>('');
  const [nationalId, setNationalId] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [customerNote, setCustomerNote] = useState<string>('');

  // Inline OTP verification states for unauthenticated users
  const [otpPhone, setOtpPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [otpError, setOtpError] = useState<string>('');
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  // Consent
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [privacyAccepted, setPrivacyAccepted] = useState<boolean>(true);
  const [marketingAccepted, setMarketingAccepted] = useState<boolean>(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string>('');
  const [submittedApplication, setSubmittedApplication] = useState<{
    id: string;
    reference: string;
  } | null>(null);

  // Check customer session on mount
  useEffect(() => {
    let active = true;
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (active && data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      } catch {
        // Unauthenticated
      }
    }
    void checkAuth();
    return () => {
      active = false;
    };
  }, []);


  // OTP Countdown Timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Request OTP
  const handleRequestOtp = async () => {
    if (!otpPhone || !/^0[0-9]{9}$/.test(otpPhone.replace(/[-\s]/g, ''))) {
      setOtpError('กรุณากรอกหมายเลขโทรศัพท์ 10 หลัก (เช่น 0812345678)');
      return;
    }

    setIsSendingOtp(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpPhone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOtpError(data.message || 'ไม่สามารถส่ง OTP ได้');
        return;
      }
      setOtpSent(true);
      setOtpCountdown(data.cooldownRemaining || 60);
      if (data.devCode) {
        setOtpCode(data.devCode);
      }
    } catch {
      setOtpError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      setOtpError('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: otpPhone,
          code: otpCode,
          privacyAccepted: true,
          privacyPolicyVersion: '2026-09-01',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOtpError(data.message || 'รหัส OTP ไม่ถูกต้อง');
        return;
      }
      setCurrentUser(data.user);
      setOtpSent(false);
    } catch {
      setOtpError('ไม่สามารถยืนยัน OTP ได้');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Submit Application
  const handleSubmitApplication = async () => {
    if (!currentUser) {
      setSubmissionError('กรุณายืนยันเบอร์โทรศัพท์เพื่อส่งใบสมัคร');
      return;
    }
    if (!contactName.trim()) {
      setSubmissionError('กรุณากรอกชื่อ-นามสกุลผู้สมัคร');
      return;
    }
    if (!privacyAccepted || !termsAccepted) {
      setSubmissionError('กรุณายอมรับข้อกำหนดและนโยบายความเป็นส่วนตัว');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');

    try {
      // Generate client-side idempotency key for this draft submission attempt
      const idempotencyKey = `submit_${selectedProduct.id}_${currentVariant.id}_${Date.now()}`;

      const res = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          variantId: currentVariant.id,
          offerVersionId: currentOffer.id,
          contactName: contactName.trim(),
          selectedBranchId: selectedBranch.id,
          customerNote: customerNote.trim() || undefined,
          privacyAccepted,
          privacyPolicyVersion: '2026-09-01',
          termsAccepted,
          marketingAccepted,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmissionError(data.message || data.error || 'ไม่สามารถส่งใบสมัครได้');
        return;
      }

      setSubmittedApplication({
        id: data.application.id,
        reference: data.application.reference,
      });
    } catch {
      setSubmissionError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const heroImage = selectedProduct.images?.[0]?.url || '/placeholder.png';

  // Success view
  if (submittedApplication) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIconWrap}>
            <Check size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[#142B4A]">ส่งใบสมัครผ่อนชำระเรียบร้อยแล้ว!</h1>
          <p className="text-sm text-[#64748B] mt-2">
            ระบบได้รับข้อมูลของคุณแล้ว เจ้าหน้าที่สาขา{' '}
            <strong className="text-[#142B4A]">{selectedBranch.name}</strong> จะติดต่อกลับเพื่อยืนยันสิทธิ์
          </p>

          <div className={styles.refBadge}>
            รหัสใบสมัคร: {submittedApplication.reference}
          </div>

          <div className="max-w-md mx-auto bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-left text-xs text-[#475569] space-y-2 mt-4">
            <div className="flex justify-between">
              <span>สินค้า:</span>
              <strong className="text-[#142B4A]">
                {selectedProduct.name} ({currentVariant.storageLabel || '-'})
              </strong>
            </div>
            <div className="flex justify-between">
              <span>ค่างวด:</span>
              <strong className="text-[#FF6E00]">
                {formatBaht(currentOffer.installmentAmountMinor)} / เดือน ({currentOffer.installmentCount} งวด)
              </strong>
            </div>
            <div className="flex justify-between">
              <span>สาขารับสินค้า:</span>
              <strong className="text-[#142B4A]">{selectedBranch.name}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
            <Link
              href={`/account/applications/${submittedApplication.id}`}
              className={styles.primaryBtn}
              style={{ maxWidth: '280px' }}
            >
              ติดตามสถานะใบสมัคร
            </Link>
            <Link
              href="/products"
              className={styles.secondaryBtn}
              style={{ maxWidth: '200px' }}
            >
              กลับสู่หน้ารายการสินค้า
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 5-Step Bar */}
      <div className={styles.stepBar} role="navigation" aria-label="ขั้นตอนการสมัครผ่อน">
        {[
          { num: 1, title: 'เลือกข้อเสนอ' },
          { num: 2, title: 'ข้อมูลผู้สมัคร' },
          { num: 3, title: 'เลือกสาขา' },
          { num: 4, title: 'ยินยอมข้อกำหนด' },
          { num: 5, title: 'ยืนยันการสมัคร' },
        ].map((s) => {
          const isDone = step > s.num;
          const isActive = step === s.num;
          return (
            <div key={s.num} className={styles.stepItem}>
              <div
                className={`${styles.stepCircle} ${isActive ? styles.stepCircleActive : ''} ${
                  isDone ? styles.stepCircleDone : ''
                }`}
              >
                {isDone ? <Check size={16} /> : s.num}
              </div>
              <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Product & Offer Review */}
      {step === 1 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <Smartphone size={24} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>ขั้นตอนที่ 1: ตรวจสอบสินค้าและแผนผ่อนชำระ</h2>
              <p className={styles.cardSubtitle}>เลือกรุ่น สี และแผนผ่อน 0% ที่ตรงกับความต้องการของคุณ</p>
            </div>
          </div>

          {/* Product Summary Box */}
          <div className={styles.productSummary}>
            <div className={styles.productImageWrap}>
              <Image
                src={heroImage}
                alt={selectedProduct.name}
                width={80}
                height={80}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className={styles.productInfo}>
              <span className={styles.productBadge}>
                {currentVariant.condition === 'new' ? 'เครื่องใหม่ศูนย์แท้' : 'เครื่องมือสองเกรดเอ'}
              </span>
              <h3 className={styles.productTitle}>{selectedProduct.name}</h3>
              <p className={styles.productVariant}>
                ความจุ {currentVariant.storageLabel || '-'} • สี {currentVariant.colorLabel || '-'}
              </p>
            </div>
          </div>

          {/* Variant Selector */}
          <div className={styles.formGroup}>
            <label className={styles.label}>เลือกรุ่นความจุ & สี</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedProduct.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setCurrentVariant(v)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    currentVariant.id === v.id
                      ? 'border-[#FF6E00] bg-[#FFF6EF] text-[#142B4A] shadow-sm'
                      : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="font-bold text-sm">{v.storageLabel || '-'}</div>
                  <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                    {v.colorHex && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-[#CBD5E1]"
                        style={{ backgroundColor: v.colorHex }}
                      />
                    )}
                    {v.colorLabel || '-'}
                  </div>
                  <div className="text-xs font-semibold text-[#FF6E00] mt-1">{formatBaht(v.cashPriceMinor)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Offer Selector */}
          <div className={styles.formGroup}>
            <label className={styles.label}>เลือกแผนผ่อนชำระ (ดอกเบี้ย 0%)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedProduct.offers.map((offer) => (
                <button
                  key={offer.id}
                  type="button"
                  onClick={() => setCurrentOffer(offer)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    currentOffer.id === offer.id
                      ? 'border-[#FF6E00] bg-[#FFF6EF] shadow-sm'
                      : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-[#142B4A]">ผ่อน 0% นาน {offer.installmentCount} เดือน</span>
                    <span className="text-xs bg-[#FF6E00] text-white px-2 py-0.5 rounded font-bold">0% ดอกเบี้ย</span>
                  </div>
                  <div className="text-xl font-bold text-[#FF6E00]">
                    {formatBaht(offer.installmentAmountMinor)}
                    <span className="text-xs font-normal text-[#64748B]"> / เดือน</span>
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">
                    ดาวน์ {formatBaht(offer.downPaymentMinor)} • ค่าธรรมเนียม {offer.feesTotalMinor > 0 ? `${offer.feesTotalMinor / 100} บาท` : 'ฟรี 0 บาท'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Satang Ledger Breakdown */}
          <div className={styles.ledger}>
            <div className={styles.ledgerRow}>
              <span>ราคาเงินสด</span>
              <span>{formatBaht(currentVariant.cashPriceMinor)}</span>
            </div>
            <div className={styles.ledgerRow}>
              <span>เงินดาวน์</span>
              <span>{formatBaht(currentOffer.downPaymentMinor)}</span>
            </div>
            <div className={styles.ledgerRow}>
              <span>ยอดผ่อนชำระ ({currentOffer.installmentCount} เดือน)</span>
              <span>{formatBaht(currentOffer.installmentAmountMinor)} × {currentOffer.installmentCount} เดือน</span>
            </div>
            <div className={styles.ledgerRow}>
              <span>ค่าธรรมเนียมสัญญา</span>
              <span>{currentOffer.feesTotalMinor > 0 ? `${currentOffer.feesTotalMinor / 100} บาท` : '0 บาท (ฟรี)'}</span>
            </div>
            <div className={styles.ledgerTotal}>
              <span>ยอดรวมทั้งสิ้น (Total Payable)</span>
              <span className={styles.ledgerHighlight}>{formatBaht(currentOffer.totalPayableMinor)}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={styles.primaryBtn}
            >
              <span>ถัดไป: กรอกข้อมูลผู้สมัคร</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Customer Identity & Verified Phone */}
      {step === 2 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <User size={24} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>ขั้นตอนที่ 2: ข้อมูลผู้สมัคร</h2>
              <p className={styles.cardSubtitle}>ยืนยันตัวตนด้วยหมายเลขโทรศัพท์เพื่อความปลอดภัยของสัญญา</p>
            </div>
          </div>

          {/* Authenticated Status or Phone OTP Verification */}
          {currentUser ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-emerald-900">ยืนยันตัวตนผ่าน OTP สำเร็จแล้ว</div>
                  <div className="text-xs text-emerald-700">หมายเลขโทรศัพท์: {currentUser.phone}</div>
                </div>
              </div>
              <span className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                ✓ ยืนยันแล้ว
              </span>
            </div>
          ) : (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-6">
              <h3 className="text-sm font-bold text-[#142B4A] flex items-center gap-2 mb-2">
                <Phone size={16} className="text-[#FF6E00]" />
                ยืนยันหมายเลขโทรศัพท์ด้วยรหัส OTP
              </h3>
              <p className="text-xs text-[#64748B] mb-3">
                เพื่อความปลอดภัยของข้อมูลสัญญา ระบบจะส่งรหัส OTP 6 หลักไปยังเบอร์มือถือของคุณ
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  placeholder="เช่น 0812345678"
                  value={otpPhone}
                  onChange={(e) => setOtpPhone(e.target.value)}
                  disabled={otpSent}
                  className={styles.input}
                  style={{ maxWidth: '280px' }}
                />
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isSendingOtp || otpCountdown > 0}
                  className="px-4 h-12 bg-[#FF6E00] text-white rounded-xl font-bold text-sm hover:bg-[#E05D00] disabled:bg-[#CBD5E1]"
                >
                  {isSendingOtp
                    ? 'กำลังส่ง...'
                    : otpCountdown > 0
                    ? `รอ ${otpCountdown}s`
                    : otpSent
                    ? 'ส่งรหัสอีกครั้ง'
                    : 'ขอรหัส OTP'}
                </button>
              </div>

              {otpSent && (
                <div className="mt-4 pt-3 border-t border-orange-200 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="รหัส OTP 6 หลัก"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className={styles.input}
                    style={{ maxWidth: '200px', letterSpacing: '0.25rem', textAlign: 'center' }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp}
                    className="px-5 h-12 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:bg-[#CBD5E1]"
                  >
                    {isVerifyingOtp ? 'กำลังตรวจสอบ...' : 'ยืนยันรหัส OTP'}
                  </button>
                </div>
              )}

              {otpError && (
                <div className="text-xs text-red-600 mt-2 flex items-center gap-1 font-medium">
                  <AlertCircle size={14} />
                  {otpError}
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              ชื่อ-นามสกุล (ตรงตามบัตรประชาชน) <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="เช่น นาย สมชาย ใจดี"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>เลขประจำตัวประชาชน 13 หลัก</label>
            <input
              type="text"
              maxLength={13}
              placeholder="เลขบัตรประชาชน 13 หลัก"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>ที่อยู่ปัจจุบัน</label>
            <textarea
              placeholder="บ้านเลขที่, หมู่, ซอย, ถนน, ตำบล/แขวง, อำเภอ/เขต"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={styles.textarea}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={styles.formGroup}>
              <label className={styles.label}>จังหวัด</label>
              <input
                type="text"
                placeholder="เช่น กรุงเทพมหานคร"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>รหัสไปรษณีย์</label>
              <input
                type="text"
                maxLength={5}
                placeholder="เช่น 10330"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={styles.secondaryBtn}
            >
              <ChevronLeft size={18} />
              <span>ย้อนกลับ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  alert('กรุณายืนยันเบอร์โทรศัพท์ด้วยรหัส OTP ก่อนดำเนินการต่อ');
                  return;
                }
                if (!contactName.trim()) {
                  alert('กรุณาระบุชื่อ-นามสกุลผู้สมัคร');
                  return;
                }
                setStep(3);
              }}
              className={styles.primaryBtn}
            >
              <span>ถัดไป: เลือกสาขารับสินค้า</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Branch Selection */}
      {step === 3 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <MapPin size={24} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>ขั้นตอนที่ 3: เลือกสาขาสำหรับรับสินค้า & ทำสัญญา</h2>
              <p className={styles.cardSubtitle}>
                เลือกสาขาที่คุณสะดวกเข้ารับเครื่องและตรวจสอบเอกสารสัญญา
              </p>
            </div>
          </div>

          {/* Currently Selected Branch Card */}
          <div className={styles.branchBox}>
            <div className={styles.branchHeader}>
              <div className={styles.branchName}>
                <MapPin size={18} className="text-[#FF6E00]" />
                {selectedBranch.name}
              </div>
              <button
                type="button"
                onClick={() => {
                  setDialogBranch(selectedBranch);
                  setIsDialogOpen(true);
                }}
                className={styles.branchChangeBtn}
              >
                ดูรายละเอียดสาขา / แผนที่
              </button>
            </div>
            <p className="text-xs text-[#64748B] mb-2">{selectedBranch.fullAddress}</p>
            <div className="flex items-center gap-4 text-xs font-semibold text-[#142B4A]">
              <span>📞 {selectedBranch.displayPhone}</span>
              {selectedBranch.openingHours?.[0] && (
                <span>🕒 {selectedBranch.openingHours[0]}</span>
              )}
            </div>
          </div>

          {/* Branch Grid Selector */}
          <div className={styles.formGroup}>
            <label className={styles.label}>หรือเลือกสาขาอื่นจากเครือข่าย MeePro</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedBranch.id === b.id
                      ? 'border-[#FF6E00] bg-[#FFF6EF] shadow-sm'
                      : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <strong className="text-sm text-[#142B4A]">{b.name}</strong>
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {b.province}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{b.fullAddress}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#F1F5F9]">
                    <button
                      type="button"
                      onClick={() => {
                        setDialogBranch(b);
                        setIsDialogOpen(true);
                      }}
                      className="text-xs text-[#FF6E00] font-semibold hover:underline"
                    >
                      ดูแผนที่
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBranch(b)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                        selectedBranch.id === b.id
                          ? 'bg-[#FF6E00] text-white'
                          : 'bg-white border border-[#CBD5E1] text-[#142B4A] hover:bg-slate-50'
                      }`}
                    >
                      {selectedBranch.id === b.id ? '✓ เลือกสาขานี้' : 'เลือกสาขานี้'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => setStep(2)}
              className={styles.secondaryBtn}
            >
              <ChevronLeft size={18} />
              <span>ย้อนกลับ</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className={styles.primaryBtn}
            >
              <span>ถัดไป: ความยินยอมและเงื่อนไข</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Consent & Terms */}
      {step === 4 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <FileText size={24} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>ขั้นตอนที่ 4: ความยินยอมและข้อกำหนดการให้บริการ</h2>
              <p className={styles.cardSubtitle}>
                โปรดอ่านและยอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคลและเงื่อนไขสัญญาผ่อนชำระ
              </p>
            </div>
          </div>

          <div className={styles.consentItem}>
            <input
              type="checkbox"
              id="privacy-consent"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="privacy-consent" className={styles.consentText}>
              <strong>ฉันยอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)</strong>:
              ยินยอมให้ MeePro เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลเพื่อการตรวจสอบสิทธิ์
              การอนุมัติวงเงินผ่อนชำระ และการจัดเตรียมสินค้า ณ สาขาที่เลือก{' '}
              <Link href="/privacy" target="_blank" className={styles.consentLink}>
                อ่านนโยบายความเป็นส่วนตัวฉบับเต็ม
              </Link>
            </label>
          </div>

          <div className={styles.consentItem}>
            <input
              type="checkbox"
              id="terms-consent"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="terms-consent" className={styles.consentText}>
              <strong>ฉันยอมรับข้อกำหนดและเงื่อนไขการให้บริการ</strong>:
              รับทราบว่าการสมัครผ่านระบบนี้เป็นขั้นตอนคำขอเปิดสิทธิ์ผ่อนชำระ
              สัญญาจริงจะดำเนินการและลงนามพร้อมตรวจสอบเครื่อง ณ วันนัดหมายที่สาขา{' '}
              <Link href="/terms" target="_blank" className={styles.consentLink}>
                อ่านข้อกำหนดการให้บริการ
              </Link>
            </label>
          </div>

          <div className={styles.consentItem}>
            <input
              type="checkbox"
              id="marketing-consent"
              checked={marketingAccepted}
              onChange={(e) => setMarketingAccepted(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="marketing-consent" className={styles.consentText}>
              (ไม่บังคับ) ยินยอมรับข้อมูลข่าวสาร สิทธิพิเศษ ส่วนลดพิเศษ และโปรโมชั่นจาก MeePro
            </label>
          </div>

          <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
            <label className={styles.label}>หมายเหตุเพิ่มเติมสำหรับเจ้าหน้าที่สาขา (ถ้ามี)</label>
            <textarea
              placeholder="เช่น ช่วงเวลาที่สะดวกให้โทรติดต่อ หรือข้อมูลสอบถามเพิ่มเติม"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              className={styles.textarea}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => setStep(3)}
              className={styles.secondaryBtn}
            >
              <ChevronLeft size={18} />
              <span>ย้อนกลับ</span>
            </button>
            <button
              type="button"
              disabled={!privacyAccepted || !termsAccepted}
              onClick={() => setStep(5)}
              className={styles.primaryBtn}
            >
              <span>ถัดไป: สรุปและยืนยันการสมัคร</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Idempotent Submission */}
      {step === 5 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className={styles.cardTitle}>ขั้นตอนที่ 5: สรุปข้อมูลและยืนยันการสมัคร</h2>
              <p className={styles.cardSubtitle}>
                กรุณาตรวจสอบความถูกต้องของข้อมูลก่อนยืนยันการส่งใบสมัคร
              </p>
            </div>
          </div>

          {/* Financial & Item Snapshot */}
          <div className="bg-[#FFF6EF] border border-[#FFE4D1] rounded-xl p-4 mb-4">
            <h4 className="font-bold text-sm text-[#142B4A] mb-3 flex items-center gap-1.5">
              <Smartphone size={16} className="text-[#FF6E00]" />
              สินค้าและแผนผ่อนชำระที่เลือก
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#475569]">
              <div>สินค้า: <strong className="text-[#142B4A]">{selectedProduct.name}</strong></div>
              <div>รุ่นความจุ: <strong className="text-[#142B4A]">{currentVariant.storageLabel || '-'} ({currentVariant.colorLabel || '-'})</strong></div>
              <div>เงินดาวน์: <strong className="text-[#FF6E00]">{formatBaht(currentOffer.downPaymentMinor)}</strong></div>
              <div>ค่างวด: <strong className="text-[#FF6E00]">{formatBaht(currentOffer.installmentAmountMinor)} / ด. ({currentOffer.installmentCount} งวด)</strong></div>
              <div>ค่าธรรมเนียม: <strong>{currentOffer.feesTotalMinor > 0 ? `${currentOffer.feesTotalMinor / 100} บาท` : 'ฟรี (0 บาท)'}</strong></div>
              <div>ยอดรวมทั้งสัญญา: <strong className="text-[#142B4A]">{formatBaht(currentOffer.totalPayableMinor)}</strong></div>
            </div>
          </div>

          {/* Applicant & Branch Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-xs space-y-1.5 text-[#475569]">
              <h4 className="font-bold text-sm text-[#142B4A] mb-2 flex items-center gap-1.5">
                <User size={16} className="text-[#FF6E00]" />
                ข้อมูลผู้สมัคร
              </h4>
              <div>ชื่อ-นามสกุล: <strong className="text-[#142B4A]">{contactName}</strong></div>
              <div>เบอร์โทรศัพท์: <strong className="text-[#142B4A]">{currentUser?.phone}</strong></div>
              {nationalId && <div>เลขบัตรประชาชน: {nationalId.slice(0, 1)}xxxxxxxxx{nationalId.slice(-3)}</div>}
              {province && <div>จังหวัด: {province}</div>}
            </div>

            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 text-xs space-y-1.5 text-[#475569]">
              <h4 className="font-bold text-sm text-[#142B4A] mb-2 flex items-center gap-1.5">
                <MapPin size={16} className="text-[#FF6E00]" />
                สาขานัดหมายรับเครื่อง
              </h4>
              <div>สาขา: <strong className="text-[#142B4A]">{selectedBranch.name}</strong></div>
              <div className="line-clamp-2">ที่อยู่: {selectedBranch.fullAddress}</div>
              <div>โทรศัพท์: {selectedBranch.displayPhone}</div>
            </div>
          </div>

          {customerNote && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#64748B] mb-4">
              <strong>หมายเหตุ:</strong> {customerNote}
            </div>
          )}

          {submissionError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 mb-4">
              <AlertCircle size={16} />
              <span>{submissionError}</span>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => setStep(4)}
              disabled={isSubmitting}
              className={styles.secondaryBtn}
            >
              <ChevronLeft size={18} />
              <span>ย้อนกลับ</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitApplication}
              disabled={isSubmitting}
              className={styles.primaryBtn}
            >
              {isSubmitting ? (
                <span>กำลังส่งใบสมัคร...</span>
              ) : (
                <>
                  <span>ยืนยันการส่งใบสมัคร</span>
                  <Check size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Accessible Branch Details Dialog (supports "เลือกสาขานี้") */}
      {isDialogOpen && (
        <BranchDetailsDialog
          branch={dialogBranch}
          onClose={() => setIsDialogOpen(false)}
          onSelect={(b) => {
            setSelectedBranch(b);
            setIsDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
