'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAdminAuth, clearAdminAuth } from '@/lib/adminSystem';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const admin = getAdminAuth();

  const isLoginPage = pathname === '/admin/login';

  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบ Admin/Developer Console หรือไม่?')) {
      clearAdminAuth();
      router.replace('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.adminShell}>
      {/* Console Header */}
      <header className={styles.adminHeader}>
        <div className={styles.headerRow}>
          <div className={styles.brandArea}>
            <span style={{ fontSize: '18px' }}>🛡️</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '1px', color: '#F8FAFC' }}>
                  MEEPRO CONSOLE
                </span>
                <span className={admin?.role === 'DEVELOPER' ? styles.devBadge : styles.adminBadge}>
                  {admin?.role || 'ADMIN'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                {admin?.name || 'Administrator'} • v1.0.4 Production
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className={styles.healthIndicators}>
              <span>
                <span className={styles.healthDot} /> API: 42ms
              </span>
              <span>
                <span className={styles.healthDot} /> OTP Gateway: OK
              </span>
            </div>

            <Link
              href="/home"
              target="_blank"
              style={{
                fontSize: '11px',
                color: '#94A3B8',
                textDecoration: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #334155',
              }}
            >
              🌐 หน้าลูกค้า
            </Link>

            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #7F1D1D',
                color: '#F87171',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Nav Tabs */}
      <nav className={styles.adminNav}>
        <Link
          href="/admin/dashboard"
          className={`${styles.navItem} ${pathname === '/admin/dashboard' ? styles.navItemActive : ''}`}
        >
          <span>🖥️</span>
          <span>แดชบอร์ดระบบ (Telemetry)</span>
        </Link>
        <Link
          href="/admin/system-config"
          className={`${styles.navItem} ${pathname === '/admin/system-config' ? styles.navItemActive : ''}`}
        >
          <span>⚙️</span>
          <span>ตั้งค่าระบบ & OTP Gateway</span>
        </Link>
        <Link
          href="/admin/roles"
          className={`${styles.navItem} ${pathname === '/admin/roles' ? styles.navItemActive : ''}`}
        >
          <span>🛡️</span>
          <span>สิทธิ์การใช้งาน (RBAC Matrix)</span>
        </Link>
        <Link
          href="/admin/page-builder"
          className={`${styles.navItem} ${pathname === '/admin/page-builder' ? styles.navItemActive : ''}`}
        >
          <span>🎨</span>
          <span>จัดหน้าเว็บ (Visual Page Builder)</span>
        </Link>
        <Link
          href="/admin/logs"
          className={`${styles.navItem} ${pathname === '/admin/logs' ? styles.navItemActive : ''}`}
        >
          <span>📜</span>
          <span>บันทึกเหตุการณ์ (Logs & Audit)</span>
        </Link>
      </nav>

      <main className={styles.adminContent}>{children}</main>
    </div>
  );
}
