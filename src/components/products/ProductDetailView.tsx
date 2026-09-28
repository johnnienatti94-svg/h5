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
import {
  calculateDownPayment,
  calculateInstallmentPackages,
  InstallmentTerm,
} from '@/lib/financing';
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
  const [selectedTerm, setSelectedTerm] = useState<InstallmentTerm>(24);
  const [selectedBranchSlug, setSelectedBranchSlug] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addToCart } = useCart();

  // Down payment and 6 installment packages (6, 9, 12, 15, 18, 24)
  const downPaymentInfo = calculateDownPayment(
    selectedVariant.cashPriceMinor,
    (selectedVariant as any).downPaymentMinor,
    (selectedVariant as any).originalDownPaymentMinor
  );

  const installmentPackages = calculateInstallmentPackages(
    selectedVariant.cashPriceMinor,
    downPaymentInfo.downPayment
  );

  const activePackage =
    installmentPackages.find((p) => p.months === selectedTerm) ||
    installmentPackages[installmentPackages.length - 1];

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
    // Adapt to CartContext format with Down Payment as product price
    const cartItem = {
      id: selectedVariant.id,
      name: `${product.name} (${selectedVariant.name})`,
      category: (product.category.slug as any) || 'smartphone',
      categoryName: product.category.name,
      brand: (product.brand.name as any) || 'Apple',
      imageUrl: currentImage.url,
      originalPrice: downPaymentInfo.originalDownPayment,
      promoPrice: downPaymentInfo.downPayment,
      discountPercent:
        downPaymentInfo.downDiscount > 0
          ? Math.round(
              (downPaymentInfo.downDiscount / downPaymentInfo.originalDownPayment) * 100
            )
          : 0,
      installmentMonths: activePackage.months,
      inStock: selectedVariant.isInStock,
      description: product.summary,
      specs: product.specs,
    };

    addToCart(cartItem, 1);
    showToast(
      `เพิ่ม ${product.name} ลงในตะกร้าแล้ว (เงินดาวน์ ฿${downPaymentInfo.downPayment.toLocaleString()})`
    );
  };

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
            {(() => {
              const anyP = product as any;
              const tagsList = (anyP.tags && anyP.tags.length > 0)
                ? anyP.tags
                : (anyP.badges && anyP.badges.length > 0)
                ? anyP.badges.map((b: string) => ({ label: b }))
                : anyP.badge
                ? [{ label: anyP.badge }]
                : [];
              if (tagsList.length === 0) return null;
              return (
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
                  {tagsList.slice(0, 3).map((tag: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-[#FF6E00] text-white shadow-sm leading-tight"
                    >
                      {tag.icon && <span>{tag.icon}</span>}
                      <span>{tag.label}</span>
                    </span>
                  ))}
                </div>
              );
            })()}
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
            {(() => {
              const anyP = product as any;
              const tagsList = (anyP.tags && anyP.tags.length > 0)
                ? anyP.tags
                : (anyP.badges && anyP.badges.length > 0)
                ? anyP.badges.map((b: string) => ({ label: b }))
                : anyP.badge
                ? [{ label: anyP.badge }]
                : [];
              return tagsList.slice(0, 3).map((tag: any, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF6E00] border border-[#FF6E00]/30"
                >
                  {tag.icon && <span>{tag.icon}</span>}
                  <span>{tag.label}</span>
                </span>
              ));
            })()}
          </div>

          <div>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <p className={styles.productSummary}>{product.summary}</p>
          </div>

          {/* Down Payment Box (Website never shows full cash price) */}
          <div className={styles.priceBox}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#FF6E00] uppercase tracking-wide">
                เงินดาวน์รับเครื่อง (Down Payment)
              </span>
              <span className="text-[11px] font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                ผ่อนเริ่มต้น {formatBaht(installmentPackages[installmentPackages.length - 1].monthlyAmountMinor)}/ด.
              </span>
            </div>
            <div className={styles.cashPriceRow}>
              <span className={styles.cashPrice}>
                ดาวน์ {formatBaht(downPaymentInfo.downPaymentMinor)}
              </span>
              {downPaymentInfo.originalDownPaymentMinor > downPaymentInfo.downPaymentMinor && (
                <span className={styles.compareAtPrice}>
                  {formatBaht(downPaymentInfo.originalDownPaymentMinor)}
                </span>
              )}
              {downPaymentInfo.downDiscountMinor > 0 && (
                <span className={styles.saveBadge}>
                  ลดค่าดาวน์ {formatBaht(downPaymentInfo.downDiscountMinor)}
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

          {/* 6 Installment Packages Selection (6, 9, 12, 15, 18, 24 months) */}
          <div className={styles.offersContainer}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className={styles.selectorLabel}>เลือกแพ็กเกจผ่อนชำระ:</span>
                <p className="text-xs text-[#64748B] mt-0.5">อนุมัติไว ไม่ต้องใช้บัตรเครดิต</p>
              </div>
              <span className="text-[11px] font-bold text-[#FF6E00] bg-[#FFF6EF] border border-[#FFD9BD] px-2 py-0.5 rounded-md">
                ค่างวดต่ำสุด 24 งวด
              </span>
            </div>

            {/* Quick Term Selector: 6 9 12 15 18 24 months */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
              {installmentPackages.map((pkg) => {
                const isSelected = pkg.months === selectedTerm;
                return (
                  <button
                    key={pkg.months}
                    type="button"
                    onClick={() => setSelectedTerm(pkg.months)}
                    className={`py-2 px-1 rounded-xl text-center border transition-all flex flex-col items-center justify-center relative ${
                      isSelected
                        ? 'border-[#FF6E00] bg-[#FFF6EF] text-[#FF6E00] font-bold shadow-xs ring-1 ring-[#FF6E00]'
                        : 'border-[#CBD5E1] bg-white text-slate-700 hover:border-[#FF6E00]/60'
                    }`}
                  >
                    {pkg.isLowestMonthly && (
                      <span className="absolute -top-2 bg-[#FF6E00] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-xs">
                        ต่ำสุด
                      </span>
                    )}
                    <span className="text-xs font-black">{pkg.months} เดือน</span>
                    <span className="text-[10px] mt-0.5 font-medium">
                      {formatBaht(pkg.monthlyAmountMinor)}/ด.
                    </span>
                  </button>
                );
              })}
            </div>


          </div>



          {/* Primary Action Group */}
          <div className={styles.actionGroup}>
            <Link
              href={`/apply?product=${product.slug}&variant=${selectedVariant.id}&months=${activePackage.months}&down=${downPaymentInfo.downPayment}`}
              className={styles.applyButton}
            >
              <CreditCard size={20} />
              <span>
                สมัครผ่อนแพ็กเกจนี้ ({activePackage.months} เดือน • {formatBaht(activePackage.monthlyAmountMinor)}/ด.)
              </span>
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
