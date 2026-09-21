'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser, clearAuth } from '@/lib/auth';
import PrivacyPolicyModal from '@/components/auth/PrivacyPolicyModal';
import styles from './account.module.css';

interface MockOrder {
  id: string;
  item: string;
  price: string;
  date: string;
  status: string;
  icon: string;
}

const MOCK_ORDERS: MockOrder[] = [
  {
    id: "ORD-2026-8812",
    item: "iPhone 16 Pro 128GB (ผ่อน 0% 10 เดือน)",
    price: "฿36,900",
    date: "18 ก.ย. 2569",
    status: "กำลังจัดส่งโดย MeePro Express",
    icon: "📱",
  },
  {
    id: "ORD-2026-7731",
    item: "Anker Prime 6-in-1 GaN Charging Station",
    price: "฿3,490",
    date: "05 ส.ค. 2569",
    status: "จัดส่งสำเร็จแล้ว",
    icon: "🔌",
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('089-123-4567');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const user = getAuthUser();
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, []);

  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบ MeePro หรือไม่?')) {
      clearAuth();
      router.replace('/login');
    }
  };

  // Format display phone: 089-xxx-4567
  const displayPhone = phone.length >= 10
    ? `${phone.slice(0, 3)}-xxx-${phone.slice(-4)}`
    : phone;

  return (
    <div className={styles.accountContainer}>
      {/* Profile Header Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>👤</div>
          <div>
            <div className={styles.userPhone}>
              <span>{displayPhone}</span>
              <span className={styles.verifiedBadge}>✓ ยืนยันแล้ว</span>
            </div>
            <div className={styles.memberTier}>⭐ MeePro Gold Member</div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statVal}>450</span>
            <span className={styles.statLabel}>พอยท์สะสม</span>
          </div>
          <div className={styles.statItem} onClick={() => setShowCouponsModal(true)} style={{ cursor: 'pointer' }}>
            <span className={styles.statVal} style={{ color: 'var(--color-accent)' }}>3</span>
            <span className={styles.statLabel}>คูปองของฉัน</span>
          </div>
          <div className={styles.statItem} onClick={() => setShowOrdersModal(true)} style={{ cursor: 'pointer' }}>
            <span className={styles.statVal}>2</span>
            <span className={styles.statLabel}>คำสั่งซื้อ</span>
          </div>
        </div>
      </div>

      {/* Security Statement (Spec Sec 8) */}
      <div className={styles.securityNotice}>
        <span style={{ fontSize: '18px' }}>🛡️</span>
        <div className={styles.securityNoticeText}>
          <strong>ความปลอดภัยของข้อมูล:</strong> ข้อมูลของคุณจะถูกจัดเก็บอย่างปลอดภัย และได้รับการดูแลตามนโยบายความเป็นส่วนตัว
        </div>
      </div>

      {/* Menu Group 1: Shopping & Orders */}
      <div className={styles.menuGroup}>
        <div className={styles.menuGroupTitle}>การสั่งซื้อ & สิทธิประโยชน์</div>

        <button className={styles.menuItem} onClick={() => setShowOrdersModal(true)}>
          <div className={styles.menuItemLeft}>
            <span className={styles.menuIcon}>📦</span>
            <span>ประวัติคำสั่งซื้อ & ติดตามพัสดุ</span>
          </div>
          <span className={styles.menuArrow}>›</span>
        </button>

        <button className={styles.menuItem} onClick={() => setShowCouponsModal(true)}>
          <div className={styles.menuItemLeft}>
            <span className={styles.menuIcon}>🎟️</span>
            <span>คูปองส่วนลดของฉัน (3 ใบ)</span>
          </div>
          <span className={styles.menuArrow}>›</span>
        </button>

        <button
          className={styles.menuItem}
          onClick={() => alert('บริการสัญญาผ่อนชำระ: สัญญาผ่อนปกติ ไม่มีค้างชำระ')}
        >
          <div className={styles.menuItemLeft}>
            <span className={styles.menuIcon}>📄</span>
            <span>สัญญาผ่อนชำระ MeePro 0%</span>
          </div>
          <span className={styles.menuArrow}>›</span>
        </button>
      </div>

      {/* Menu Group 2: Settings & Privacy */}
      <div className={styles.menuGroup}>
        <div className={styles.menuGroupTitle}>การตั้งค่า & ความเป็นส่วนตัว</div>

        <div className={styles.menuItem}>
          <div className={styles.menuItemLeft}>
            <span className={styles.menuIcon}>🔔</span>
            <span>การแจ้งเตือนโปรโมชั่นและสถานะคำสั่งซื้อ</span>
          </div>
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
          />
        </div>

        <button className={styles.menuItem} onClick={() => setShowPolicyModal(true)}>
          <div className={styles.menuItemLeft}>
            <span className={styles.menuIcon}>📜</span>
            <span>นโยบายความเป็นส่วนตัว (PDPA Privacy Policy)</span>
          </div>
          <span className={styles.menuArrow}>›</span>
        </button>
      </div>

      {/* Logout Button */}
      <button className={styles.logoutBtn} onClick={handleLogout}>
        <span>🚪</span>
        <span>ออกจากระบบ</span>
      </button>

      {/* PDPA Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
      />

      {/* Orders Bottom Sheet Modal */}
      {showOrdersModal && (
        <div className={styles.simpleModalOverlay} onClick={() => setShowOrdersModal(false)}>
          <div className={styles.simpleModalSheet} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>📦 ประวัติคำสั่งซื้อของคุณ</h3>
              <button
                onClick={() => setShowOrdersModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MOCK_ORDERS.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-bg-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    <span>{ord.id}</span>
                    <span>{ord.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                    <span style={{ fontSize: '24px' }}>{ord.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{ord.item}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{ord.price}</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '11px' }}>
                      ● {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coupons Bottom Sheet Modal */}
      {showCouponsModal && (
        <div className={styles.simpleModalOverlay} onClick={() => setShowCouponsModal(false)}>
          <div className={styles.simpleModalSheet} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>🎟️ คูปองส่วนลดที่ใช้ได้</h3>
              <button
                onClick={() => setShowCouponsModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px', border: '1px dashed var(--color-primary)', borderRadius: '8px', background: 'var(--color-bg-secondary)' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary)' }}>ส่วนลด ฿500</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>ขั้นต่ำ ฿15,000 • โค้ด: MEEPRO500</div>
              </div>
              <div style={{ padding: '10px', border: '1px dashed var(--color-primary)', borderRadius: '8px', background: 'var(--color-bg-secondary)' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary)' }}>ส่วนลด ฿1,000</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>ขั้นต่ำ ฿30,000 • โค้ด: FLAGSHIP1K</div>
              </div>
              <div style={{ padding: '10px', border: '1px dashed var(--color-primary)', borderRadius: '8px', background: 'var(--color-bg-secondary)' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary)' }}>ส่วนลด 10% อุปกรณ์เสริม</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>ลดสูงสุด ฿800 • โค้ด: AUDIO10</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
