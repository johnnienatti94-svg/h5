'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { useAdminGuard } from '@/lib/adminSystem';
import styles from './admincn.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { admin, isChecking } = useAdminGuard();

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isChecking || !admin) {
    return <div className={styles.contentArea}>กำลังตรวจสอบสิทธิ์...</div>;
  }

  return (
    <div className={styles.adminLayout}>
      {/* 1. Collapsible AdminCN Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        adminUser={admin}
      />

      {/* 2. Main Content Container */}
      <div className={styles.mainContainer}>
        {/* Top Header */}
        <AdminHeader
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Content Area */}
        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}
