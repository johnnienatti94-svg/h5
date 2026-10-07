'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './TopNav.module.css';

export default function TopNav() {
  const router = useRouter();
  const { totalCount, setIsCartOpen, setIsDrawerOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <header className={styles.topNav} id="top-nav">
      <div className={styles.topNavInner}>
        {/* Left: Mobile Menu & Brand Logo */}
        <div className={styles.navLeft}>
          <button
            className={styles.iconBtn}
            id="menu-button"
            aria-label="เปิดเมนูหมวดหมู่สินค้า"
            type="button"
            onClick={() => setIsDrawerOpen(true)}
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <Link href="/home" className={styles.logoContainer} aria-label="หน้าแรก มีโปรโฟน">
            <img src="/brand-logo.png" alt="มีโปรโฟน" className={styles.brandLogoImg} />
          </Link>
        </div>

        {/* Center: Search Bar on the SAME LEVEL */}
        <form className={styles.tierSearch} onSubmit={handleSearchSubmit}>
          <div className={styles.searchBarWrapper}>
            <span className="material-symbols-outlined text-[20px] text-[#94A3B8] ml-2">search</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="ค้นหาสมาร์ตโฟน, แท็บเล็ต, แกดเจ็ต..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
                aria-label="ล้างการค้นหา"
              >
                ✕
              </button>
            )}
            <button type="submit" className={styles.searchSubmitBtn}>
              ค้นหา
            </button>
          </div>
        </form>

        {/* Right: Notification & Cart Icons on the SAME LEVEL */}
        <div className={styles.rightActions}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="การแจ้งเตือน"
            onClick={() => alert('คุณมีคูปองส่วนลดพิเศษ ฿500 (MEEPRO500) พร้อมใช้งาน!')}
          >
            <span className="material-symbols-outlined text-[23px]">notifications</span>
            <span className={styles.notifDot} />
          </button>

          <button
            type="button"
            className={`${styles.iconBtn} ${styles.cartBtn}`}
            id="top-cart-btn"
            aria-label="เปิดตะกร้าสินค้า"
            onClick={() => setIsCartOpen(true)}
          >
            <span className="material-symbols-outlined text-[23px]">shopping_bag</span>
            {totalCount > 0 && (
              <span className={styles.cartCountBadge}>
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
