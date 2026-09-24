'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Check,
  CreditCard,
  Store,
  ArrowRight,
  ShoppingCart,
  MapPin,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import type {
  PublicProductDetail,
  PublicProductVariant,
  PublicOfferVersion,
} from '@/features/catalog/types';
import type { PublicBranch } from '@/features/branches/types';
import { formatBaht } from '@/features/catalog/types';
import { useCart } from '@/context/CartContext';
import BranchDetailsDialog from '@/components/branches/BranchDetailsDialog';
import styles from './ProductDetail.module.css';

interface Props {
  product: PublicProductDetail;
  availableBranches?: PublicBranch[];
}

export default function ProductDetailView({ product, availableBranches = [] }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<PublicProductVariant>(
    product.variants[0]
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [selectedBranchSlug, setSelectedBranchSlug] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addToCart } = useCart();

  const activeOffer: PublicOfferVersion | undefined =
    product.offers[selectedOfferIndex] || product.offers[0];

  const currentImage =
    product.images[selectedImageIndex] || product.images[0] || { url: '', alt: product.name };

  const currentBranchStocks =
    product.branchAvailability[selectedVariant.id] ||
    Object.values(product.branchAvailability)[0] ||
    [];

  // Find full branch for dialog
  const activeBranch = selectedBranchSlug
    ? availableBranches.find((b) => b.slug === selectedBranchSlug) ?? null
    : null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddToCart = () => {
    // Adapt to CartContext format
    const cartItem = {
      id: selectedVariant.id,
      name: `${product.name} (${selectedVariant.name})`,
      category: (product.category.slug as any) || 'smartphone',
      categoryName: product.category.name,
      brand: (product.brand.name as any) || 'Apple',
      imageUrl: currentImage.url,
      originalPrice: Math.round((selectedVariant.compareAtPriceMinor || selectedVariant.cashPriceMinor) / 100),
      promoPrice: Math.round(selectedVariant.cashPriceMinor / 100),
      discountPercent: selectedVariant.compareAtPriceMinor
        ? Math.round(
            ((selectedVariant.compareAtPriceMinor - selectedVariant.cashPriceMinor) /
              selectedVariant.compareAtPriceMinor) *
              100
          )
        : 0,
      installmentMonths: activeOffer?.installmentCount || 10,
      inStock: selectedVariant.isInStock,
      description: product.summary,
      specs: product.specs,
    };

    addToCart(cartItem, 1);
    showToast(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว`);
  };

  const savingsMinor = selectedVariant.compareAtPriceMinor
    ? selectedVariant.compareAtPriceMinor - selectedVariant.cashPriceMinor
    : 0;

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">หน้าหลัก</Link>
        <span>/</span>
        <Link href="/products">สินค้า</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`}>{product.category.name}</Link>
        <span>/</span>
        <span className="text-[#0F172A] font-semibold truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className={styles.layout}>
        {/* Left Column: Gallery */}
        <div className={styles.galleryCard}>
          <div className={styles.mainImageFrame}>
            {currentImage.url ? (
              <Image
                src={currentImage.url}
                alt={currentImage.alt || product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className={styles.mainImage}
              />
            ) : (
              <span className="text-6xl">📱</span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className={styles.thumbnails} role="tablist" aria-label="รูปภาพสินค้า">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.thumbnailBtn} ${idx === selectedImageIndex ? styles.thumbnailActive : ''}`}
                  onClick={() => setSelectedImageIndex(idx)}
                  aria-label={`ดูรูปที่ ${idx + 1}`}
                >
                  <Image src={img.url} alt={img.alt || ''} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className={styles.detailsCard}>
          <div className={styles.brandConditionRow}>
            <span className={styles.brandBadge}>{product.brand.name}</span>
            <span
              className={`${styles.conditionBadge} ${
                selectedVariant.condition === 'new' ? styles.conditionNew : styles.conditionUsed
              }`}
            >
              {selectedVariant.condition === 'new' ? '✓ เครื่องใหม่แกะกล่อง' : '★ มือสองสภาพ 98%'}
            </span>
          </div>

          <div>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <p className={styles.productSummary}>{product.summary}</p>
          </div>

          {/* Cash Price Box */}
          <div className={styles.priceBox}>
            <div className={styles.cashPriceRow}>
              <span className={styles.cashPrice}>{formatBaht(selectedVariant.cashPriceMinor)}</span>
              {selectedVariant.compareAtPriceMinor && (
                <span className={styles.compareAtPrice}>
                  {formatBaht(selectedVariant.compareAtPriceMinor)}
                </span>
              )}
              {savingsMinor > 0 && (
                <span className={styles.saveBadge}>
                  ประหยัด {formatBaht(savingsMinor)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <ShieldCheck size={16} className="text-[#16A34A]" />
              <span>{selectedVariant.warrantyDescription}</span>
            </div>
          </div>

          {/* Variant Selector: Storage & Color */}
          {product.variants.length > 1 && (
            <div className={styles.selectorSection}>
              <span className={styles.selectorLabel}>เลือกรุ่น / ความจุ / สี:</span>
              <div className={styles.pillGroup}>
                {product.variants.map((v) => {
                  const isSelected = v.id === selectedVariant.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`${styles.choicePill} ${isSelected ? styles.choicePillActive : ''}`}
                      onClick={() => setSelectedVariant(v)}
                    >
                      {v.colorHex && (
                        <span
                          className={styles.colorSwatch}
                          style={{ backgroundColor: v.colorHex }}
                        />
                      )}
                      <span>
                        {v.storageLabel ? `${v.storageLabel} • ` : ''}
                        {v.colorLabel || v.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Immutable Versioned Offers Section */}
          {product.offers.length > 0 && (
            <div className={styles.offersContainer}>
              <div className="flex items-center justify-between">
                <span className={styles.selectorLabel}>แผนการผ่อนชำระ (ดอกเบี้ย 0%):</span>
                <span className="text-xs font-semibold text-[#FF6E00]">ไม่ต้องใช้บัตรเครดิต</span>
              </div>

              <div className="space-y-2">
                {product.offers.map((offer, idx) => {
                  const isSelected = idx === selectedOfferIndex;
                  return (
                    <div
                      key={offer.id}
                      className={`${styles.offerCard} ${isSelected ? styles.offerCardActive : ''}`}
                      onClick={() => setSelectedOfferIndex(idx)}
                      role="radio"
                      aria-checked={isSelected}
                    >
                      <div className={styles.offerTop}>
                        <span className={styles.offerTitle}>{offer.title}</span>
                        <span className={styles.offerMonthly}>
                          {formatBaht(offer.installmentAmountMinor)}/ด.
                        </span>
                      </div>
                      <p className={styles.offerTerms}>{offer.terms}</p>

                      <div className={styles.offerBreakdown}>
                        <div className={styles.breakdownItem}>
                          <span>เงินดาวน์</span>
                          <span>{formatBaht(offer.downPaymentMinor)}</span>
                        </div>
                        <div className={styles.breakdownItem}>
                          <span>จำนวนงวด</span>
                          <span>{offer.installmentCount} เดือน</span>
                        </div>
                        <div className={styles.breakdownItem}>
                          <span>ยอดรวมทั้งสัญญา</span>
                          <span>{formatBaht(offer.totalPayableMinor)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Branch Availability Checker */}
          <div className={styles.branchSection}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#142B4A] flex items-center gap-1.5">
                <Store size={16} className="text-[#FF6E00]" />
                ความพร้อมจำหน่ายที่สาขา (Click & Collect)
              </span>
              <span className="text-[11px] text-[#64748B]">รับเครื่องได้ภายในวัน</span>
            </div>

            <div className={styles.branchList}>
              {currentBranchStocks.map((stock) => (
                <div key={stock.branchId} className={styles.branchRow}>
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedBranchSlug(stock.branchSlug)}
                      className="text-left font-bold text-[#142B4A] hover:text-[#FF6E00] hover:underline"
                    >
                      {stock.branchName}
                    </button>
                    <div className="text-[11px] text-[#64748B]">{stock.publicNote}</div>
                  </div>
                  <span
                    className={
                      stock.status === 'in_stock' ? styles.stockStatusIn : styles.stockStatusLow
                    }
                  >
                    {stock.statusLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action Group */}
          <div className={styles.actionGroup}>
            <Link
              href={`/apply?product=${product.slug}&variant=${selectedVariant.id}&offer=${activeOffer?.id || ''}`}
              className={styles.applyButton}
            >
              <CreditCard size={20} />
              <span>สมัครผ่อนสินค้าเครื่องนี้ (อนุมัติไว)</span>
              <ArrowRight size={18} />
            </Link>

            <div className={styles.secondaryActionRow}>
              <button
                type="button"
                className={styles.cartButton}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} />
                <span>เพิ่มลงตะกร้า</span>
              </button>
              <Link href="/stores" className={styles.branchDialogBtn}>
                <MapPin size={18} />
                <span>ค้นหาสาขาใกล้ฉัน</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Section */}
      <section className={styles.specsSection}>
        <h2 className="text-lg font-bold text-[#142B4A]">ข้อมูลจำเพาะทางเทคนิค (Specifications)</h2>
        <table className={styles.specTable}>
          <tbody>
            {Object.entries(product.specs).map(([key, val]) => (
              <tr key={key} className={styles.specRow}>
                <td className={styles.specKey}>{key}</td>
                <td className={styles.specVal}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] bg-[#142B4A] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <Check size={16} className="text-[#16A34A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reusable Branch Details Dialog */}
      {selectedBranchSlug && (
        <BranchDetailsDialog
          branch={activeBranch}
          unavailableSlug={activeBranch ? undefined : selectedBranchSlug}
          onClose={() => setSelectedBranchSlug(null)}
        />
      )}
    </div>
  );
}
