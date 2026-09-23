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
      router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/catalog');
    }
  };

  return (
    <header className={styles.topNav} id="top-nav">
      <div className={styles.topNavInner}>
        {/* Tier 1: Brand, Menu & Utilities */}
        <div className={styles.tierPrimary}>
          {/* Hamburger Menu Toggle */}
          <button
            className={styles.iconBtn}
            id="menu-button"
            aria-label="เปิดเมนูหมวดหมู่สินค้า"
            type="button"
            onClick={() => setIsDrawerOpen(true)}
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          {/* Logo & Mall Badge */}
          <Link href="/home" className={styles.logoContainer}>
            <img src="/logo.jpg" alt="MeePro Logo" className={styles.logoImg} />
            <div className={styles.brandTitleBox}>
              <span className={styles.logoText}>มีโปรโฟน</span>
              <span className={styles.mallBadge}>MALL</span>
            </div>
          </Link>

          {/* Right Action Icons: Notification & Shopping Cart */}
          <div className={styles.rightActions}>
            {/* Notification Bell */}
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="การแจ้งเตือน"
              onClick={() => alert('คุณมีคูปองส่วนลดพิเศษ ฿500 (MEEPRO500) พร้อมใช้งาน!')}
            >
              <span className="material-symbols-outlined text-[23px]">notifications</span>
              <span className={styles.notifDot} />
            </button>

            {/* Shopping Cart Button with Dynamic Badge */}
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

        {/* Tier 2: E-Commerce Search Bar */}
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
      </div>
    </header>
  );
}
