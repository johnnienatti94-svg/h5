'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './BottomNav.module.css';

interface NavTab {
  id: string;
  href: string;
  labelTh: string;
  iconName: string;
  badge?: string;
}

const TABS: NavTab[] = [
  {
    id: 'home',
    href: '/home',
    labelTh: 'หน้าหลัก',
    iconName: 'home',
  },
  {
    id: 'promotion',
    href: '/promotions',
    labelTh: 'โปรโมชั่น',
    iconName: 'local_fire_department',
    badge: 'HOT',
  },
  {
    id: 'catalog',
    href: '/products',
    labelTh: 'สินค้า',
    iconName: 'grid_view',
  },
  {
    id: 'stores',
    href: '/stores',
    labelTh: 'สาขา',
    iconName: 'storefront',
  },
  {
    id: 'account',
    href: '/account',
    labelTh: 'บัญชี',
    iconName: 'person',
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} id="bottom-nav" aria-label="แถบเมนูหลัก">
      <div className={styles.bottomNavInner}>
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              id={`nav-${tab.id}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={styles.iconWrapper}>
                <span className={`material-symbols-outlined ${styles.navIcon} ${isActive ? 'material-symbols-fill' : ''}`}>
                  {tab.iconName}
                </span>
                {tab.badge && (
                  <span className={styles.tabBadge}>{tab.badge}</span>
                )}
              </div>
              <span className={styles.navLabel}>{tab.labelTh}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
