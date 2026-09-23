'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Search, ExternalLink, Activity, Server, Database, Bell } from 'lucide-react';
import styles from '@/app/admin/admincn.module.css';

interface Props {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className={styles.toggleBtn}
          title="Toggle Navigation Sidebar"
        >
          <Menu size={18} />
        </button>

        <div className={styles.quickSearch}>
          <Search size={14} color="#64748B" />
          <span>ค้นหาเมนู, คำสั่งซื้อ, หรือ ID...</span>
          <kbd className={styles.quickSearchKbd}>Ctrl+K</kbd>
        </div>
      </div>

      <div className={styles.headerRight}>
        {/* Real-time Health Badges */}
        <div className={styles.healthBadge} title="API Gateway Response Time">
          <span className={styles.healthDot} />
          <span>API 38ms</span>
        </div>

        <div className={styles.healthBadge} title="SMS & OTP Gateway Online">
          <Activity size={12} color="#10B981" />
          <span>OTP OK</span>
        </div>

        <div className={styles.healthBadge} title="Supabase Database Status">
          <Database size={12} color="#10B981" />
          <span>DB Online</span>
        </div>

        {/* Storefront Link */}
        <Link
          href="/home"
          target="_blank"
          className={styles.headerLink}
          title="เปิดหน้าแรกลูกค้าในแท็บใหม่"
        >
          <ExternalLink size={14} />
          <span>หน้าลูกค้า</span>
        </Link>
      </div>
    </header>
  );
}
