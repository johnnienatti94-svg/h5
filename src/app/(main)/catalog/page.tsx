'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ALL_PRODUCTS, DetailedProduct } from '@/lib/productsData';
import { useCart } from '@/context/CartContext';
import styles from './catalog.module.css';

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'smartphone', label: 'สมาร์ตโฟน' },
  { id: 'tablet', label: 'แท็บเล็ต' },
  { id: 'laptop', label: 'แล็ปท็อป' },
  { id: 'watch', label: 'สมาร์ตวอทช์' },
  { id: 'audio', label: 'หูฟัง & ลำโพง' },
  { id: 'accessory', label: 'อุปกรณ์เสริม' },
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCat = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'discount'>('default');
  const [activeProduct, setActiveProduct] = useState<DetailedProduct | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchQuery(q);
    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: DetailedProduct) => {
    e.stopPropagation();
    addToCart(product, 1);
    showToast(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว!`);
  };

  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((product) => {
      const matchSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      {/* Search & Active Filter Info */}
      {searchQuery && (
        <div className="mx-4 mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <span className="text-xs text-[#007ACC] font-semibold">
            🔍 ผลการค้นหาสำหรับ: &ldquo;{searchQuery}&rdquo;
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-[#64748B] hover:text-[#0F172A] font-bold"
          >
            ล้างค้นหา ✕
          </button>
        </div>
      )}

      {/* Category Pills Bar (Solid Background) */}
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
                {p.imageUrl && (p.imageUrl.startsWith('http') || p.imageUrl.startsWith('/')) ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                  />
                ) : (
                  <span style={{ fontSize: '38px' }}>{p.imageUrl || '📦'}</span>
                )}
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

                {/* Quick Add To Cart Button */}
                <button
                  type="button"
                  className="mt-2 w-full py-1.5 px-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#007ACC] text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95"
                  onClick={(e) => handleQuickAdd(e, p)}
                >
                  <span className="material-symbols-outlined text-[15px]">add_shopping_cart</span>
                  ใส่ตะกร้า
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] bg-[#0F172A] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <span className="text-[#16A365]">✓</span>
          <span>{toastMessage}</span>
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
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-action)' }}>
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

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="flex-1 py-3 px-3 bg-[#EFF6FF] text-[#007ACC] border border-[#BFDBFE] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
                onClick={() => {
                  addToCart(activeProduct, 1);
                  showToast(`เพิ่ม ${activeProduct.name} ลงในตะกร้าแล้ว!`);
                  setActiveProduct(null);
                }}
              >
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                ใส่ตะกร้า
              </button>

              <button
                type="button"
                className="flex-[1.4] py-3 px-3 bg-[#FF6E00] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/25 transition-all active:scale-98"
                onClick={() => {
                  addToCart(activeProduct, 1);
                  setActiveProduct(null);
                  setIsCartOpen(true);
                }}
              >
                <span>ผ่อนชำระทันที</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '240px', width: '100%', borderRadius: '16px' }} />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
