'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ALL_PRODUCTS } from '@/lib/productsData';
import styles from './promotion.module.css';

const VOUCHERS = [
  {
    id: 'v-1',
    value: '฿500',
    cond: 'ขั้นต่ำ ฿15,000',
    title: 'คูปองส่วนลดเปิดตัวสินค้าใหม่',
    expiry: 'ใช้ได้ถึง 30 ก.ย. 2569',
    code: 'MEEPRO500',
  },
  {
    id: 'v-2',
    value: '฿1,000',
    cond: 'ขั้นต่ำ ฿30,000',
    title: 'คูปองส่วนลดพิเศษสมาร์ทโฟนเรือธง',
    expiry: 'ใช้ได้ถึง 15 ต.ค. 2569',
    code: 'FLAGSHIP1K',
  },
  {
    id: 'v-3',
    value: '10%',
    cond: 'ลดสูงสุด ฿800',
    title: 'ส่วนลดอุปกรณ์เสริม & หูฟังบลูทูธ',
    expiry: 'ใช้ได้ถึง 31 ธ.ค. 2569',
    code: 'AUDIO10',
  },
];

const BANK_PARTNERS = [
  { bank: 'กสิกรไทย (KBank)', icon: '🟢', offer: 'ผ่อน 0% นาน 10 เดือน', note: 'รับเครดิตเงินคืนสูงสุด 5%' },
  { bank: 'ไทยพาณิชย์ (SCB)', icon: '🟣', offer: 'ผ่อน 0% นาน 10 เดือน', note: 'แลกคะแนนลดเพิ่ม 10%' },
  { bank: 'กรุงศรี (Krungsri)', icon: '🟡', offer: 'ผ่อน 0% นาน 10 เดือน', note: 'Cashback ทันทีไม่ต้องรอ' },
  { bank: 'เคทีซี (KTC)', icon: '🔵', offer: 'ผ่อน 0% นาน 10 เดือน', note: 'ใช้คะแนน KTC FOREVER' },
];

export default function PromotionPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Live Flash Sale Countdown Timer (HH:MM:SS)
  const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 42, seconds: 15 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const flashSaleProducts = ALL_PRODUCTS.filter((p) => p.isFlashSale);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className={styles.promoContainer}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <span className={styles.heroBadge}>PROMOTION OF THE MONTH</span>
        <h1 className={styles.heroTitle}>มหกรรมลดราคากลางปี MeePro Super Deal</h1>
        <p className={styles.heroDesc}>
          ช้อปสมาร์ทโฟนและแก็ดเจ็ตแท้ ประกันศูนย์ไทย ลดสูงสุด 20% พร้อมโปรโมชั่นผ่อน 0% สูงสุด 10 เดือน
        </p>
      </div>

      {/* Flash Sale Card with Countdown Timer */}
      <div className={styles.flashSaleCard}>
        <div className={styles.flashHeader}>
          <span style={{ fontSize: '20px' }}>⚡</span>
          <div>
            <div className={styles.flashTitle}>FLASH SALE</div>
            <div style={{ fontSize: '10px', opacity: 0.9 }}>ดีลพิเศษจำกัดเวลา</div>
          </div>
        </div>

        <div className={styles.timerBox}>
          <span className={styles.timeSegment}>{formatNumber(timeLeft.hours)}</span>
          <span className={styles.timerSeparator}>:</span>
          <span className={styles.timeSegment}>{formatNumber(timeLeft.minutes)}</span>
          <span className={styles.timerSeparator}>:</span>
          <span className={styles.timeSegment}>{formatNumber(timeLeft.seconds)}</span>
        </div>
      </div>

      {/* Installment Partners */}
      <div className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span>💳</span>
            <span>โปรโมชั่นผ่อน 0% ผ่านบัตรเครดิต</span>
          </h2>
        </div>
        <div className={styles.installmentRow}>
          {BANK_PARTNERS.map((b, idx) => (
            <div key={idx} className={styles.bankCard}>
              <div className={styles.bankIcon}>{b.icon}</div>
              <div className={styles.bankName}>{b.bank}</div>
              <div className={styles.bankOffer}>{b.offer}</div>
              <div className={styles.bankNote}>{b.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Claimable Vouchers */}
      <div className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span>🎟</span>
            <span>คูปองส่วนลดพิเศษ</span>
          </h2>
        </div>
        <div className={styles.voucherGrid}>
          {VOUCHERS.map((v) => (
            <div key={v.id} className={styles.voucherCard}>
              <div className={styles.voucherLeft}>
                <span className={styles.voucherValue}>{v.value}</span>
                <span className={styles.voucherCond}>{v.cond}</span>
              </div>
              <div className={styles.voucherRight}>
                <div>
                  <div className={styles.voucherTitle}>{v.title}</div>
                  <div className={styles.voucherExpiry}>{v.expiry}</div>
                </div>
                <div className={styles.voucherBottom}>
                  <span className={styles.voucherCode}>{v.code}</span>
                  <button
                    className={styles.copyBtn}
                    onClick={() => handleCopy(v.code)}
                  >
                    {copiedCode === v.code ? '✓ คัดลอกแล้ว' : 'คัดลอกโค้ด'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flash Sale Product Showcase */}
      <div className={styles.sectionWrapper}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span>🔥</span>
            <span>สินค้าลดราคาเฉพาะช่วงนี้</span>
          </h2>
          <Link href="/catalog" style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
            ดูสินค้าทั้งหมด ›
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
          {flashSaleProducts.map((p) => (
            <Link
              key={p.id}
              href="/catalog"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  aspectRatio: '1',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  marginBottom: 'var(--space-2)',
                  position: 'relative',
                }}
              >
                {p.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: 'var(--color-error)',
                      color: '#FFF',
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '10px',
                    }}
                  >
                    {p.badge}
                  </span>
                )}
                {p.imageUrl}
              </div>

              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  lineHeight: '1.3',
                  marginBottom: 'var(--space-2)',
                  minHeight: '28px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {p.name}
              </div>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ฿{p.promoPrice.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-tertiary)', textDecoration: 'line-through' }}>
                  ฿{p.originalPrice.toLocaleString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
