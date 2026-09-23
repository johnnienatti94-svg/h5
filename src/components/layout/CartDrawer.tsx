'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const {
    items,
    totalCount,
    subtotal,
    discountAmount,
    totalPrice,
    estimatedMonthlyInstallment,
    appliedVoucher,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    applyVoucher,
    removeVoucher,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code) return;
    const res = applyVoucher(code);
    setCouponFeedback(res.message);
    if (res.success) {
      setCouponInput('');
    }
    setTimeout(() => setCouponFeedback(null), 3500);
  };

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      clearCart();
      setCheckoutSuccess(false);
      setIsCartOpen(false);
    }, 2500);
  };

  return (
    <div className={styles.overlay} onClick={() => setIsCartOpen(false)}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className="material-symbols-outlined text-[22px] text-[#007ACC]">shopping_bag</span>
            <span className="font-bold text-[16px] text-[#0F172A]">ตะกร้าสินค้าของฉัน</span>
            <span className={styles.itemCountBadge}>{totalCount}</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsCartOpen(false)}
            aria-label="ปิดตะกร้า"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {checkoutSuccess ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>✓</div>
            <h3 className={styles.successTitle}>ส่งคำขอจองสำเร็จ!</h3>
            <p className={styles.successDesc}>
              เจ้าหน้าที่สาขาได้รับรายการสินค้าของคุณแล้ว จะทำการติดต่อกลับภายใน 15 นาที เพื่อยืนยันสัญญาสินเชื่อ/การรับเครื่อง
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛍️</div>
            <h3 className={styles.emptyTitle}>ตะกร้าของคุณยังว่างอยู่</h3>
            <p className={styles.emptySubtitle}>
              เลือกดูสมาร์ตโฟนหรือแกดเจ็ตโปรโมชั่นพิเศษ แล้วเพิ่มลงในตะกร้าได้เลย
            </p>
            <button
              className={styles.shopNowBtn}
              onClick={() => {
                setIsCartOpen(false);
                window.location.href = '/catalog';
              }}
            >
              เลือกชมสินค้าทันที
            </button>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className={styles.itemList}>
              {items.map(({ product, quantity }) => (
                <div key={product.id} className={styles.itemCard}>
                  <div className={styles.itemMedia}>
                    <span className="text-[32px]">{product.imageUrl}</span>
                  </div>
                  <div className={styles.itemDetails}>
                    <h4 className={styles.itemName}>{product.name}</h4>
                    <div className={styles.itemPriceRow}>
                      <span className={styles.itemPrice}>
                        ฿{product.promoPrice.toLocaleString()}
                      </span>
                      {product.originalPrice > product.promoPrice && (
                        <span className={styles.itemOriginalPrice}>
                          ฿{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className={styles.installmentNote}>
                      ผ่อน 0% {product.installmentMonths} ด. ~ ฿{Math.round(product.promoPrice / product.installmentMonths).toLocaleString()}/ด.
                    </div>

                    {/* Quantity controls */}
                    <div className={styles.qtyRow}>
                      <div className={styles.qtyBox}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(product.id, -1)}
                          aria-label="ลดจำนวน"
                        >
                          -
                        </button>
                        <span className={styles.qtyNumber}>{quantity}</span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(product.id, 1)}
                          aria-label="เพิ่มจำนวน"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(product.id)}
                        aria-label="ลบออกจากตะกร้า"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher Section */}
            <div className={styles.voucherSection}>
              <div className={styles.voucherInputRow}>
                <input
                  type="text"
                  placeholder="กรอกโค้ดส่วนลด เช่น MEEPRO500"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className={styles.voucherInput}
                />
                <button
                  type="button"
                  className={styles.applyCouponBtn}
                  onClick={() => handleApplyCoupon()}
                >
                  ใช้โค้ด
                </button>
              </div>

              {couponFeedback && (
                <div className={styles.voucherFeedback}>{couponFeedback}</div>
              )}

              {appliedVoucher ? (
                <div className={styles.appliedVoucherPill}>
                  <span>🎟️ ใช้โค้ด {appliedVoucher} (ลด ฿{discountAmount.toLocaleString()})</span>
                  <button type="button" onClick={removeVoucher} className={styles.removeVoucherBtn}>
                    ✕
                  </button>
                </div>
              ) : (
                <div className={styles.quickVouchers}>
                  <span className="text-[11px] text-[#64748B]">โค้ดแนะนำ:</span>
                  <button
                    type="button"
                    className={styles.quickCodePill}
                    onClick={() => handleApplyCoupon('MEEPRO500')}
                  >
                    MEEPRO500 (-฿500)
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary & Checkout Footer */}
            <div className={styles.footer}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>ยอดรวมสินค้า</span>
                <span className={styles.summaryVal}>฿{subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>ส่วนลดคูปอง</span>
                  <span className={styles.summaryDiscount}>-฿{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>ค่าจัดส่ง</span>
                <span className="text-[#16A365] font-semibold text-[13px]">ฟรีค่าส่งทั่วประเทศ</span>
              </div>

              <div className={styles.divider} />

              <div className={styles.totalRow}>
                <div>
                  <div className={styles.totalLabel}>ยอดรวมทั้งสิ้น</div>
                  <div className={styles.installmentHighlight}>
                    หรือผ่อน 0% เพียง <strong>฿{estimatedMonthlyInstallment.toLocaleString()}</strong>/ด.
                  </div>
                </div>
                <div className={styles.totalAmount}>
                  ฿{totalPrice.toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                className={styles.checkoutBtn}
                onClick={handleCheckout}
              >
                <span>ดำเนินการสั่งซื้อ / ผ่อนชำระ</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
