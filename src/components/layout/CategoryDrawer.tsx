'use client';

import React from 'react';
import Link from 'next/link';
import styles from './CategoryDrawer.module.css';

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'smartphone', label: 'สมาร์ตโฟน', icon: 'smartphone', count: '12 รุ่น' },
  { id: 'tablet', label: 'แท็บเล็ต', icon: 'tablet_mac', count: '6 รุ่น' },
  { id: 'laptop', label: 'แล็ปท็อป', icon: 'laptop_mac', count: '4 รุ่น' },
  { id: 'watch', label: 'สมาร์ตวอทช์', icon: 'watch', count: '5 รุ่น' },
  { id: 'audio', label: 'หูฟัง & ลำโพง', icon: 'headphones', count: '8 รุ่น' },
  { id: 'accessory', label: 'อุปกรณ์เสริม', icon: 'power', count: '15 รุ่น' },
];

const QUICK_SERVICES = [
  { href: '/home?tab=tradein', label: 'มือถือแลกเงิน (Trade-In)', icon: 'currency_exchange', badge: 'ตีราคาสูง' },
  { href: '/promotion', label: 'Flash Sale & คูปองลดราคา', icon: 'local_fire_department', badge: 'HOT' },
  { href: '/billing', label: 'ตรวจสอบและชำระบิลค่างวด', icon: 'receipt_long' },
  { href: '/stores', label: 'ค้นหาสาขา MeePro', icon: 'storefront' },
  { href: '/about', label: 'เกี่ยวกับมีโปรโฟน', icon: 'info' },
  { href: '/account', label: 'บัญชีและการตั้งค่า', icon: 'person' },
];

export default function CategoryDrawer({ isOpen, onClose }: CategoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Navigation Header */}
        <div className={styles.profileCard}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>
              <span className="material-symbols-outlined text-[26px] text-white" aria-hidden="true">storefront</span>
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>MeePro</div>
              <div className={styles.userPhone}>สินค้า บริการ และสาขา</div>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="ปิดเมนู">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

        </div>

        {/* Drawer Content Body */}
        <div className={styles.contentBody}>
          {/* Categories Section */}
          <div className={styles.sectionTitle}>
            <span>หมวดหมู่สินค้า</span>
            <Link href="/catalog" onClick={onClose} className={styles.viewAllLink}>
              ดูทั้งหมด ›
            </Link>
          </div>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog?category=${cat.id}`}
                onClick={onClose}
                className={styles.categoryItem}
              >
                <div className={styles.categoryIconWrap}>
                  <span className="material-symbols-outlined text-[22px] text-[#007ACC]">{cat.icon}</span>
                </div>
                <div className={styles.categoryText}>
                  <div className={styles.categoryName}>{cat.label}</div>
                  <div className={styles.categoryCount}>{cat.count}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Services Section */}
          <div className={styles.sectionTitle} style={{ marginTop: '20px' }}>
            <span>บริการและสิทธิประโยชน์</span>
          </div>
          <div className={styles.serviceList}>
            {QUICK_SERVICES.map((srv) => (
              <Link
                key={srv.href}
                href={srv.href}
                onClick={onClose}
                className={styles.serviceItem}
              >
                <div className={styles.serviceIconWrap}>
                  <span className="material-symbols-outlined text-[20px] text-[#64748B]">{srv.icon}</span>
                </div>
                <span className={styles.serviceLabel}>{srv.label}</span>
                {srv.badge && (
                  <span className={styles.serviceBadge}>{srv.badge}</span>
                )}
                <span className="material-symbols-outlined text-[16px] text-[#CBD5E1] ml-auto">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.hotlineBox}>
            <span className="material-symbols-outlined text-[18px] text-[#142B4A]" aria-hidden="true">verified_user</span>
            <div className={styles.hotlineText}>
              <div>ข้อมูลบัญชีและใบสมัครต้องเข้าสู่ระบบก่อนใช้งาน</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
