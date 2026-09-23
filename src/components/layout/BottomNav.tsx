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
    id: 'billing',
    href: '/billing',
    labelTh: 'บิล',
    labelEn: 'Billing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
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
    id: 'about',
    href: '/about',
    labelTh: 'เกี่ยวกับเรา',
    labelEn: 'About Us',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
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
