'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Search,
  Filter,
  ArrowUpDown,
  Store,
  ShieldCheck,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Package,
  Check,
  Sparkles,
} from 'lucide-react';
import type {
  PaginatedCatalogResult,
  ProductCondition,
} from '@/features/catalog/types';
import type { PublicBranch } from '@/features/branches/types';
import { formatBaht } from '@/features/catalog/types';
import { useCart } from '@/context/CartContext';

interface Props {
  initialData: PaginatedCatalogResult;
  availableBranches?: PublicBranch[];
}

export default function ProductsCatalogView({ initialData, availableBranches = [] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<PaginatedCatalogResult>(initialData);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addToCart } = useCart();

  // Active filters from URL
  const currentCategory = searchParams.get('category') || 'all';
  const currentBrand = searchParams.get('brand') || 'all';
  const currentCondition = searchParams.get('condition') || 'all';
  const currentStorage = searchParams.get('storage') || 'all';
  const currentBranch = searchParams.get('branch') || 'all';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentPage = Number(searchParams.get('page')) || 1;

  // Sync state and fetch data when URL parameters change
  useEffect(() => {
    let active = true;
    const queryString = searchParams.toString();
    fetch(`/api/products?${queryString}`)
      .then((res) => res.json())
      .then((res) => {
        if (active && res.success) {
          setData(res.data);
        }
      })
      .catch((err) => console.error('Failed to load products:', err));

    return () => {
      active = false;
    };
  }, [searchParams]);

  const updateParam = (updates: Record<string, string | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === undefined || val === 'all' || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset to page 1 on filter changes unless changing page directly
    if (!('page' in updates)) {
      params.delete('page');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam({ q: searchInput.trim() || null });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(
      {
        id: product.id,
        name: product.name,
        category: product.categorySlug || 'smartphone',
        categoryName: product.categoryName || 'สมาร์ตโฟน',
        brand: product.brand || 'Apple',
        imageUrl: product.thumbnailUrl,
        originalPrice: Math.round((product.compareAtPriceMinor || product.minCashPriceMinor) / 100),
        promoPrice: Math.round(product.minCashPriceMinor / 100),
        discountPercent: product.compareAtPriceMinor
          ? Math.round(
              ((product.compareAtPriceMinor - product.minCashPriceMinor) /
                product.compareAtPriceMinor) *
                100
            )
          : 0,
        installmentMonths: product.bestInstallmentMonths || 10,
        inStock: true,
        description: product.summary,
        specs: {},
      },
      1
    );

    showToast(`เพิ่ม ${product.name} ลงในตะกร้าแล้ว`);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6">
      {/* Header Banner */}
      <header className="bg-gradient-to-br from-[#FFF6EF] via-white to-[#F6F7F9] p-6 sm:p-8 rounded-3xl border border-[#FFE2CC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#FF6E00] tracking-wider uppercase">
              MEEPRO CATALOG
            </span>
            <span className="bg-[#142B4A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              ผ่อน 0% ทุกรุ่น
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A]">
            สินค้าทั้งหมด
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            สมาร์ตโฟน แท็บเล็ต แกดเจ็ตเครื่องแท้ ผ่อนสบายไม่ต้องใช้บัตรเครดิต
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-80 relative">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ค้นหาชื่อรุ่น แบรนด์ ความจุ..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-white border border-[#CBD5E1] text-sm text-[#142B4A] focus:outline-none focus:border-[#FF6E00] focus:ring-2 focus:ring-[#FF6E00]/20 shadow-xs"
          />
          <Search size={18} className="absolute left-3 top-3 text-[#94A3B8]" />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                updateParam({ q: null });
              }}
              className="absolute right-3 top-3 text-xs text-[#94A3B8] hover:text-[#142B4A]"
            >
              ✕
            </button>
          )}
        </form>
      </header>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist">
        <button
          type="button"
          onClick={() => updateParam({ category: 'all' })}
          className={`h-10 px-4 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            currentCategory === 'all'
              ? 'bg-[#FF6E00] text-white shadow-xs'
              : 'bg-white text-[#142B4A] border border-[#CBD5E1] hover:border-[#FF6E00]'
          }`}
        >
          ทั้งหมด
        </button>
        {data.availableCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => updateParam({ category: cat.slug })}
            className={`h-10 px-4 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              currentCategory === cat.slug
                ? 'bg-[#FF6E00] text-white shadow-xs'
                : 'bg-white text-[#142B4A] border border-[#CBD5E1] hover:border-[#FF6E00]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filters Bar: Brand, Condition, Branch, Sort */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Brand Filter */}
          <select
            value={currentBrand}
            onChange={(e) => updateParam({ brand: e.target.value })}
            className="h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#142B4A] font-medium focus:outline-none focus:border-[#FF6E00]"
          >
            <option value="all">ทุกแบรนด์</option>
            {data.availableBrands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={currentCondition}
            onChange={(e) => updateParam({ condition: e.target.value })}
            className="h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#142B4A] font-medium focus:outline-none focus:border-[#FF6E00]"
          >
            <option value="all">สภาพเครื่องทั้งหมด</option>
            <option value="new">เครื่องใหม่แกะกล่อง</option>
            <option value="used">เครื่องมือสองคัดเกรด</option>
          </select>

          {/* Storage Filter */}
          {data.availableStorages.length > 0 && (
            <select
              value={currentStorage}
              onChange={(e) => updateParam({ storage: e.target.value })}
              className="h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#142B4A] font-medium focus:outline-none focus:border-[#FF6E00]"
            >
              <option value="all">ทุกความจุ</option>
              {data.availableStorages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {/* Branch Availability Filter */}
          <select
            value={currentBranch}
            onChange={(e) => updateParam({ branch: e.target.value })}
            className="h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#142B4A] font-medium focus:outline-none focus:border-[#FF6E00]"
          >
            <option value="all">พร้อมรับทุกสาขา</option>
            {availableBranches.map((br) => (
              <option key={br.id} value={br.slug}>
                รับที่ {br.name.replace('MeePro Store ', '').replace('MeePro Flagship Store ', '')}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Controls & Counter */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-[#64748B] hidden sm:inline">
            พบ {data.total} รายการ
          </span>

          <select
            value={currentSort}
            onChange={(e) => updateParam({ sort: e.target.value })}
            className="h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#142B4A] font-semibold focus:outline-none focus:border-[#FF6E00]"
          >
            <option value="featured">เรียงลำดับ: แนะนำ</option>
            <option value="price_asc">ราคา: ต่ำ - สูง</option>
            <option value="price_desc">ราคา: สูง - ต่ำ</option>
            <option value="newest">สินค้ามาใหม่ล่าสุด</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {data.products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E2E8F0] shadow-xs space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 text-[#FF6E00] flex items-center justify-center">
            <Package size={32} />
          </div>
          <h2 className="text-lg font-bold text-[#142B4A]">ไม่พบสินค้าที่ตรงกับเงื่อนไข</h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดูสินค้าทั้งหมด
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              updateParam({
                q: null,
                category: 'all',
                brand: 'all',
                condition: 'all',
                storage: 'all',
                branch: 'all',
              });
            }}
            className="px-5 py-2 rounded-full bg-[#142B4A] text-white text-xs font-bold hover:bg-[#1E3A5F] transition-colors"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {data.products.map((p) => {
            const savings = p.compareAtPriceMinor
              ? p.compareAtPriceMinor - p.minCashPriceMinor
              : 0;

            return (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group bg-white rounded-2xl p-3 sm:p-4 border border-[#E2E8F0] shadow-xs hover:border-[#FFB380] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Media Frame */}
                  <div className="relative w-full aspect-square rounded-xl bg-[#F8FAFC] overflow-hidden mb-3">
                    {p.badge && (
                      <span className="absolute top-2 left-2 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF6E00] text-white shadow-xs">
                        {p.badge}
                      </span>
                    )}
                    {p.thumbnailUrl ? (
                      <Image
                        src={p.thumbnailUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px"
                        className="object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        📱
                      </div>
                    )}
                  </div>

                  {/* Brand & Title */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#FF6E00] uppercase tracking-wide">
                      {p.brand}
                    </span>
                    <h2 className="text-sm font-bold text-[#142B4A] line-clamp-2 leading-snug group-hover:text-[#FF6E00] transition-colors">
                      {p.name}
                    </h2>
                  </div>
                </div>

                {/* Price & Installment */}
                <div className="pt-3 mt-2 border-t border-[#F1F5F9] space-y-1.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base sm:text-lg font-extrabold text-[#142B4A]">
                      {formatBaht(p.minCashPriceMinor)}
                    </span>
                    {p.compareAtPriceMinor && (
                      <span className="text-[11px] text-[#94A3B8] line-through">
                        {formatBaht(p.compareAtPriceMinor)}
                      </span>
                    )}
                  </div>

                  {p.bestInstallmentMonthlyMinor && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF6EF] text-[#FF6E00] text-[11px] font-bold">
                      <span>ผ่อน {formatBaht(p.bestInstallmentMonthlyMinor)}/ด.</span>
                      <span className="text-[10px] text-[#C94F00]">
                        (0% {p.bestInstallmentMonths}ด.)
                      </span>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, p)}
                    className="w-full mt-2 h-9 rounded-xl bg-[#F1F5F9] hover:bg-[#FF6E00] hover:text-white text-[#142B4A] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingCart size={15} />
                    <span>ใส่ตะกร้า</span>
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={data.page <= 1}
            onClick={() => updateParam({ page: String(data.page - 1) })}
            className="w-10 h-10 rounded-xl bg-white border border-[#CBD5E1] text-[#142B4A] disabled:opacity-40 flex items-center justify-center hover:border-[#FF6E00]"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-bold text-[#142B4A] px-3">
            หน้า {data.page} จาก {data.totalPages}
          </span>
          <button
            type="button"
            disabled={data.page >= data.totalPages}
            onClick={() => updateParam({ page: String(data.page + 1) })}
            className="w-10 h-10 rounded-xl bg-white border border-[#CBD5E1] text-[#142B4A] disabled:opacity-40 flex items-center justify-center hover:border-[#FF6E00]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[300] bg-[#142B4A] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <Check size={16} className="text-[#16A34A]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
