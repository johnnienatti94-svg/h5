'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearStaffAuth, useStaffGuard } from '@/lib/staffAuth';
import styles from './staff.module.css';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { staff, isChecking } = useStaffGuard();

  const isLoginPage = pathname === '/staff/login';

  const handleLogout = async () => {
    if (confirm('คุณต้องการออกจากระบบเจ้าหน้าที่ MeePro หรือไม่?')) {
      await clearStaffAuth();
      router.replace('/staff/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isChecking || !staff) {
    return <div className={styles.staffContent}>กำลังตรวจสอบสิทธิ์...</div>;
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
                <span className={staff.role === 'BRANCH_MANAGER' || staff.role === 'HQ' ? styles.managerBadge : styles.staffBadge}>
                  {staff.role}
                </span>
              </div>
              <div className={styles.branchText}>
                <span>📍 {staff.branchId || 'ไม่กำหนดสาขา'}</span>
                <span>• {staff.name}</span>
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
          href="/staff/applications"
          className={`${styles.navLink} ${pathname.startsWith('/staff/applications') ? styles.navLinkActive : ''}`}
        >
          <span>📋</span>
          <span>คิวใบสมัคร (Applications)</span>
        </Link>
        <Link
          href="/staff/customer-lookup"
          className={`${styles.navLink} ${pathname === '/staff/customer-lookup' ? styles.navLinkActive : ''}`}
        >
          <span>🔍</span>
          <span>ค้นหาลูกค้า (Customer Lookup)</span>
        </Link>
      </nav>


      <main className={styles.staffContent}>{children}</main>
    </div>
  );
}
