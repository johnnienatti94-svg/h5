'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './BottomNav.module.css';

interface NavTab {
  id: string;
  href: string;
  labelTh: string;
  labelEn: string;
  icon: React.ReactNode;
}

const tabs: NavTab[] = [
  {
    id: 'home',
    href: '/home',
    labelTh: 'หน้าหลัก',
    labelEn: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'catalog',
    href: '/catalog',
    labelTh: 'สินค้า',
    labelEn: 'Catalog',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'promotion',
    href: '/promotion',
    labelTh: 'โปรโมชั่น',
    labelEn: 'Promotion',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    id: 'location',
    href: '/location',
    labelTh: 'สาขา',
    labelEn: 'Location',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: 'account',
    href: '/account',
    labelTh: 'บัญชี',
    labelEn: 'Account',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} id="bottom-nav" aria-label="Main navigation">
      <div className={styles.bottomNavInner}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname?.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              id={`nav-${tab.id}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.navIcon}>{tab.icon}</span>
              <span className={styles.navLabel}>{tab.labelTh}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
