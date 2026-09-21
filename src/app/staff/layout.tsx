'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getStaffAuth, clearStaffAuth } from '@/lib/staffAuth';
import styles from './staff.module.css';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const staff = getStaffAuth();

  const isLoginPage = pathname === '/staff/login';

  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบเจ้าหน้าที่ MeePro หรือไม่?')) {
      clearStaffAuth();
      router.replace('/staff/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.staffShell}>
      {/* Staff Header */}
      <header className={styles.staffHeader}>
        <div className={styles.headerTop}>
          <div className={styles.brandGroup}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px' }}>MEEPRO STAFF</span>
                <span className={staff?.role === 'MANAGER' ? styles.managerBadge : styles.staffBadge}>
                  {staff?.role || 'STAFF'}
                </span>
              </div>
              <div className={styles.branchText}>
                <span>📍 {staff?.branch || 'สาขา CentralWorld'}</span>
                <span>• {staff?.name || 'สมชาย รักบริการ'}</span>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            <Link href="/home" className={styles.previewCustomerLink} target="_blank">
              🌐 ดูหน้าลูกค้า
            </Link>
            <button className={styles.logoutIconBtn} onClick={handleLogout} title="ออกจากระบบเจ้าหน้าที่">
              ออกระบบ 🚪
            </button>
          </div>
        </div>
      </header>

      {/* Staff Navigation Bar */}
      <nav className={styles.staffNav}>
        <Link
          href="/staff/dashboard"
          className={`${styles.navLink} ${pathname === '/staff/dashboard' ? styles.navLinkActive : ''}`}
        >
          <span>📊</span>
          <span>ภาพรวม (Dashboard)</span>
        </Link>
        <Link
          href="/staff/customer-lookup"
          className={`${styles.navLink} ${pathname === '/staff/customer-lookup' ? styles.navLinkActive : ''}`}
        >
          <span>🔍</span>
          <span>ค้นหาลูกค้า (CRM)</span>
        </Link>
        <Link
          href="/staff/homepage-builder"
          className={`${styles.navLink} ${pathname === '/staff/homepage-builder' ? styles.navLinkActive : ''}`}
        >
          <span>🛠️</span>
          <span>จัดหน้าแรก (Widget Builder)</span>
        </Link>
        <Link
          href="/staff/banners"
          className={`${styles.navLink} ${pathname === '/staff/banners' ? styles.navLinkActive : ''}`}
        >
          <span>🖼️</span>
          <span>แบนเนอร์ & แคมเปญ</span>
        </Link>
      </nav>

      <main className={styles.staffContent}>{children}</main>
    </div>
  );
}
