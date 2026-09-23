'use client';

import styles from './TopNav.module.css';

export default function TopNav() {
  return (
    <header className={styles.topNav} id="top-nav">
      <div className={styles.topNavInner}>
        {/* Hamburger Menu */}
        <button 
          className={styles.menuButton} 
          id="menu-button"
          aria-label="เปิดเมนู"
          type="button"
        >
          <svg 
            className={styles.menuIcon} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Logo */}
        <div className={styles.logoContainer}>
          <img src="/logo.jpg" alt="มีโปรโฟน" className={styles.logoImg} />
          <span className={styles.logoText}>มีโปรโฟน</span>
        </div>

        {/* Right spacer for centering */}
        <div className={styles.rightSection} />
      </div>
    </header>
  );
}
