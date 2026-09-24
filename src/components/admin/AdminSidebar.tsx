'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Palette,
  ShoppingBag,
  Settings,
  Shield,
  FileText,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { clearAdminAuth, type AdminUser } from '@/lib/adminSystem';
import styles from '@/app/admin/admincn.module.css';

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  adminUser: AdminUser;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  target?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export default function AdminSidebar({ collapsed, onToggle, adminUser }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await clearAdminAuth();
    router.replace('/admin/login');
  };

  const navGroups: NavGroup[] = [
    {
      label: 'MANAGEMENT & CMS',
      items: [
        {
          label: 'แดชบอร์ดระบบ',
          href: '/admin/dashboard',
          icon: <LayoutDashboard size={18} />,
        },
        {
          label: 'จัดหน้าเว็บ (Visual Builder)',
          href: '/admin/page-builder',
          icon: <Palette size={18} />,
          badge: 'v2.1',
        },
        {
          label: 'จัดการหน้าเว็บ (Pages)',
          href: '/admin/pages',
          icon: <FileText size={18} />,
        },
        {
          label: 'คลังสื่อ (Media Library)',
          href: '/admin/media',
          icon: <Palette size={18} />,
        },
        {
          label: 'จัดการสาขา (Branches)',
          href: '/admin/branches',
          icon: <ShoppingBag size={18} />,
        },
        {
          label: 'สินค้า & สต็อก (Products)',
          href: '/admin/products',
          icon: <ShoppingBag size={18} />,
        },
        {
          label: 'ข้อเสนอผ่อน 0% (Offers)',
          href: '/admin/offers',
          icon: <ShoppingBag size={18} />,
        },
        {
          label: 'ตั้งค่าเว็บไซต์ (Site Settings)',
          href: '/admin/settings',
          icon: <Settings size={18} />,
        },
        {
          label: 'รายการสั่งซื้อ (Orders)',
          href: '/admin/orders',
          icon: <ShoppingBag size={18} />,
          badge: '25',
        },
      ],
    },
    {
      label: 'SYSTEM & SECURITY',
      items: [
        {
          label: 'ตั้งค่าระบบ & OTP',
          href: '/admin/system-config',
          icon: <Settings size={18} />,
        },
        {
          label: 'สิทธิ์การใช้งาน (RBAC)',
          href: '/admin/roles',
          icon: <Shield size={18} />,
        },
        {
          label: 'บันทึกเหตุการณ์ (Logs)',
          href: '/admin/logs',
          icon: <FileText size={18} />,
        },
      ],
    },
    {
      label: 'STOREFRONT',
      items: [
        {
          label: 'หน้าแรกลูกค้า (Live Site)',
          href: '/home',
          icon: <ExternalLink size={18} />,
          target: '_blank',
        },
      ],
    },
  ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      {/* Brand Header */}
      <div className={styles.sidebarHeader}>
        <Link href="/admin/dashboard" className={styles.logoContainer}>
          <div className={styles.logoIcon}>M</div>
          {!collapsed && (
            <div className={styles.logoText}>
              <span className={styles.brandName}>MeePro Admin</span>
              <span className={styles.brandVersion}>STUDIO v2.1</span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className={styles.logoutBtn}
          title={collapsed ? 'ขยาย Sidebar' : 'ย่อ Sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav Content */}
      <div className={styles.navContent}>
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className={styles.navGroup}>
            {!collapsed && <span className={styles.groupLabel}>{group.label}</span>}
            {group.items.map((item, iIdx) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={iIdx}
                  href={item.href}
                  target={item.target}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span className={styles.navBadge}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Profile & Logout */}
      <div className={styles.sidebarFooter}>
        <div className={styles.userCard}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {adminUser.name.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div className={styles.userName}>{adminUser.name}</div>
                <div className={styles.userRole}>● {adminUser.role}</div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutBtn}
            title="ออกจากระบบ"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
