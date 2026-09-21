'use client';

import React, { useState, useMemo } from 'react';
import { ALL_PRODUCTS, DetailedProduct } from '@/lib/productsData';
import styles from './catalog.module.css';

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'smartphone', label: 'สมาร์ทโฟน' },
  { id: 'tablet', label: 'แท็บเล็ต' },
  { id: 'laptop', label: 'แล็ปท็อป' },
  { id: 'watch', label: 'สมาร์ทวอทช์' },
  { id: 'audio', label: 'หูฟัง & ลำโพง' },
  { id: 'accessory', label: 'อุปกรณ์เสริม' },
];

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'discount'>('default');
  const [activeProduct, setActiveProduct] = useState<DetailedProduct | null>(null);

  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchBrand = selectedBrand === 'all' || product.brand.toLowerCase() === selectedBrand.toLowerCase();

      return matchSearch && matchCategory && matchBrand;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.promoPrice - b.promoPrice;
      if (sortBy === 'price-desc') return b.promoPrice - a.promoPrice;
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedBrand, sortBy]);

  return (
    <div className={styles.catalogContainer}>
      {/* Sticky Search Bar (Spec Sec 17) */}
      <div className={styles.searchHeader}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="ค้นหาสินค้า เช่น iPhone, iPad, Galaxy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearSearchBtn} onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className={styles.categoryBar}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.categoryPill} ${selectedCategory === cat.id ? styles.categoryPillActive : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Brand and Sort Filters */}
      <div className={styles.filterControls}>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">ทุกแบรนด์</option>
          <option value="apple">Apple</option>
          <option value="samsung">Samsung</option>
          <option value="xiaomi">Xiaomi</option>
          <option value="oppo">OPPO</option>
          <option value="vivo">vivo</option>
          <option value="sony">Sony</option>
          <option value="marshall">Marshall</option>
          <option value="anker">Anker</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className={styles.filterSelect}
        >
          <option value="default">เรียงลำดับ: แนะนำ</option>
          <option value="price-asc">ราคา: ต่ำ - สูง</option>
          <option value="price-desc">ราคา: สูง - ต่ำ</option>
          <option value="discount">ส่วนลดมากสุด</option>
        </select>
      </div>

      <div className={styles.resultsCount}>
        พบสินค้าทั้งหมด {filteredProducts.length} รายการ
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📦</div>
          <p>ไม่พบสินค้าที่คุณค้นหา</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedBrand('all');
            }}
            style={{
              marginTop: '12px',
              padding: '6px 14px',
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className={styles.productCard}
              onClick={() => setActiveProduct(p)}
            >
              <div className={styles.cardMedia}>
                {p.badge && <span className={styles.discountBadge}>{p.badge}</span>}
                <span>{p.imageUrl}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{p.name}</h3>

                <div className={styles.priceBox}>
                  <span className={styles.promoPrice}>฿{p.promoPrice.toLocaleString()}</span>
                  {p.originalPrice > p.promoPrice && (
                    <span className={styles.originalPrice}>฿{p.originalPrice.toLocaleString()}</span>
                  )}
                </div>

                {p.installmentMonths > 0 && (
                  <span className={styles.installmentPill}>
                    ผ่อน 0% {p.installmentMonths} ด.
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Bottom Sheet Modal */}
      {activeProduct && (
        <div className={styles.modalOverlay} onClick={() => setActiveProduct(null)}>
          <div className={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setActiveProduct(null)}>
              ✕
            </button>

            <div className={styles.modalHero}>
              <div className={styles.modalIcon}>{activeProduct.imageUrl}</div>
              <h2 className={styles.modalTitle}>{activeProduct.name}</h2>
              <div className={styles.priceBox} style={{ alignItems: 'center' }}>
                <span className={styles.promoPrice} style={{ fontSize: '22px' }}>
                  ฿{activeProduct.promoPrice.toLocaleString()}
                </span>
                {activeProduct.originalPrice > activeProduct.promoPrice && (
                  <span className={styles.originalPrice}>
                    ราคาปกติ ฿{activeProduct.originalPrice.toLocaleString()} (ประหยัด ฿{(activeProduct.originalPrice - activeProduct.promoPrice).toLocaleString()})
                  </span>
                )}
              </div>
            </div>

            {/* Installment Plan Simulation */}
            <div className={styles.installmentCalcCard}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent)' }}>
                💳 ผ่อนสบาย 0% นานสูงสุด {activeProduct.installmentMonths} เดือน
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                เริ่มต้นเพียง <strong>฿{Math.round(activeProduct.promoPrice / activeProduct.installmentMonths).toLocaleString()}</strong> / เดือน
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                รองรับบัตรเครดิต KBank, SCB, Krungsri, KTC, BBL
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: '12px 0' }}>
              {activeProduct.description}
            </p>

            {/* Specs Table */}
            <div style={{ fontSize: '13px', fontWeight: 700, margin: '8px 0 4px' }}>
              ข้อมูลจำเพาะ (Specifications)
            </div>
            <table className={styles.specTable}>
              <tbody>
                {Object.entries(activeProduct.specs).map(([key, val]) => (
                  <tr key={key} className={styles.specRow}>
                    <td className={styles.specKey}>{key}</td>
                    <td className={styles.specVal}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className={styles.actionBtnPrimary}
              onClick={() => {
                alert(`คุณได้ติดต่อเจ้าหน้าที่สาขาสำหรับ: ${activeProduct.name}`);
                setActiveProduct(null);
              }}
            >
              ติดต่อพนักงานสาขาเพื่อจองสินค้า / ผ่อนชำระ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
