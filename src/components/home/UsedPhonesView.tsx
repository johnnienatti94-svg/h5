'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  BatteryCharging,
  Cpu,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react';
import { formatBaht } from '@/lib/currency';
import { useCart } from '@/context/CartContext';

interface UsedProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug?: string;
  category: string;
  summary?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  minCashPriceMinor: number;
  compareAtPriceMinor?: number;
  bestInstallmentMonths?: number;
  bestInstallmentMonthlyMinor?: number;
  badges?: string[];
  tags?: Array<{ label: string; icon?: string }>;
  condition?: string;
}

// Fallback high-quality fixtures in case API is loading or network is slow
const FALLBACK_USED_PRODUCTS: UsedProduct[] = [
  {
    id: 'used-1',
    slug: 'iphone-15-pro-used',
    name: 'iPhone 15 Pro 128GB (มือสองสภาพ 98%)',
    brand: 'Apple',
    brandSlug: 'apple',
    category: 'สมาร์ตโฟน',
    summary: 'เครื่องมือสองคุณภาพเกรด A ผ่านการตรวจเช็ก 40 รายการ แบตเตอรี่ 92%+ สภาพสวยไร้รอย',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    minCashPriceMinor: 2890000,
    compareAtPriceMinor: 3490000,
    bestInstallmentMonths: 10,
    bestInstallmentMonthlyMinor: 289000,
    badges: ['★ มือสองเกรด 98%', '🔋 แบต 92%', '🛡️ ประกัน 6 เดือน'],
  },
  {
    id: 'used-2',
    slug: 'iphone-14-pro-max-used',
    name: 'iPhone 14 Pro Max 256GB (มือสองสภาพ 96%)',
    brand: 'Apple',
    brandSlug: 'apple',
    category: 'สมาร์ตโฟน',
    summary: 'เครื่องมือสองคัดเกรด A แบตเตอรี่ 89%+ บอดี้สวย ไร้รอยตกหล่น กล้อง 48MP จอ 6.7 นิ้ว',
    imageUrl: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=800&q=80',
    minCashPriceMinor: 2490000,
    compareAtPriceMinor: 3790000,
    bestInstallmentMonths: 10,
    bestInstallmentMonthlyMinor: 249000,
    badges: ['★ มือสองเกรด 96%', '🔋 แบต 89%', '🛡️ ประกัน 6 เดือน'],
  },
  {
    id: 'used-3',
    slug: 'samsung-s24-ultra-used',
    name: 'Galaxy S24 Ultra 256GB (มือสองสภาพ 99%)',
    brand: 'Samsung',
    brandSlug: 'samsung',
    category: 'สมาร์ตโฟน',
    summary: 'เครื่องมือสองสภาพนางฟ้า 99% ประกันศูนย์ไทยเหลือ 4 เดือน ปากกา S-Pen ครบ กล้อง 200MP',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    minCashPriceMinor: 2990000,
    compareAtPriceMinor: 4390000,
    bestInstallmentMonths: 10,
    bestInstallmentMonthlyMinor: 299000,
    badges: ['★ สภาพนางฟ้า 99%', '🛡️ ประกันศูนย์+ร้าน', '✨ Galaxy AI'],
  },
  {
    id: 'used-4',
    slug: 'iphone-13-used',
    name: 'iPhone 13 128GB (มือสองสภาพ 95%)',
    brand: 'Apple',
    brandSlug: 'apple',
    category: 'สมาร์ตโฟน',
    summary: 'เครื่องมือสองยอดนิยม สภาพ 95% แบตเตอรี่ 88%+ คุ้มค่าที่สุด ผ่อนเริ่มต้นเพียง ฿1,390/เดือน',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    minCashPriceMinor: 1390000,
    compareAtPriceMinor: 2190000,
    bestInstallmentMonths: 10,
    bestInstallmentMonthlyMinor: 139000,
    badges: ['★ มือสองเกรด 95%', '🔥 สุดคุ้ม', '🛡️ ประกัน 6 เดือน'],
  },
];

interface UsedPhonesViewProps {
  onSwitchToTradeIn?: () => void;
}

export default function UsedPhonesView({ onSwitchToTradeIn }: UsedPhonesViewProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<UsedProduct[]>(FALLBACK_USED_PRODUCTS);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchUsedProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products?condition=used&pageSize=20');
        if (res.ok) {
          const json = await res.json();
          const items = json.data?.products || json.products || [];
          if (active && Array.isArray(items) && items.length > 0) {
            setProducts(items);
          }
        }
      } catch (err) {
        console.error('Failed to fetch used products, falling back:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchUsedProducts();
    return () => {
      active = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleQuickAdd = (e: React.MouseEvent, p: UsedProduct) => {
    e.preventDefault();
    e.stopPropagation();

    const priceBaht = Math.round(p.minCashPriceMinor / 100);
    const originalBaht = p.compareAtPriceMinor ? Math.round(p.compareAtPriceMinor / 100) : priceBaht;
    const downPayment = Math.round(priceBaht * 0.1);

    addToCart(
      {
        id: p.id,
        name: p.name,
        category: 'smartphone',
        categoryName: 'มือถือมือสอง',
        brand: (p.brand || 'Apple') as any,
        imageUrl: p.imageUrl || p.thumbnailUrl || '',
        originalPrice: originalBaht,
        promoPrice: priceBaht,
        discountPercent: originalBaht > priceBaht ? Math.round(((originalBaht - priceBaht) / originalBaht) * 100) : 0,
        installmentMonths: p.bestInstallmentMonths || 10,
        inStock: true,
        description: p.summary || p.name,
        specs: {},
      },
      1
    );

    showToast(`เพิ่ม ${p.name} ลงในตะกร้าแล้ว`);
  };

  const filteredProducts = products.filter((p) => {
    if (selectedBrand === 'all') return true;
    return (
      (p.brandSlug && p.brandSlug.toLowerCase() === selectedBrand.toLowerCase()) ||
      p.brand.toLowerCase() === selectedBrand.toLowerCase()
    );
  });

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Hero Banner: MeePro Certified Used Phones */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] text-white p-6 sm:p-10 shadow-lg border border-slate-700/50">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Sparkles size={14} className="text-amber-400" />
            <span>MeePro Certified Pre-Owned</span>
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">เกรด A+</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            มือถือมือ 2 คัดเกรดพรีเมียม <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent">
              สภาพนางฟ้า 95% - 99%
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            ผ่านการตรวจเช็กมาตรฐานศูนย์ 40 รายการ แบตเตอรี่สุขภาพ 85%+ ทุกเครื่อง รับประกันร้าน MeePro Care 6 เดือนเต็ม ผ่อน 0% เริ่มต้นหลักร้อย ไม่ต้องใช้บัตรเครดิต
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/products?condition=used"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6E00] to-[#EA580C] hover:from-[#ea6500] hover:to-[#c2410c] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <span>ดูมือถือมือ 2 ทั้งหมด</span>
              <ArrowRight size={16} />
            </Link>

            {onSwitchToTradeIn ? (
              <button
                type="button"
                onClick={onSwitchToTradeIn}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 text-xs sm:text-sm font-bold transition-all"
              >
                <RefreshCw size={14} />
                <span>มีเครื่องเก่า? แลกเงินสด</span>
              </button>
            ) : (
              <Link
                href="/home?tab=tradein"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 text-xs sm:text-sm font-bold transition-all"
              >
                <RefreshCw size={14} />
                <span>มีเครื่องเก่า? แลกเงินสด</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 2. Trust Pillars (จุดเด่นมือสอง MeePro) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007ACC] flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div className="text-xs font-bold text-[#142B4A]">ตรวจเช็ก 40 รายการ</div>
          <p className="text-[11px] text-slate-500">บอร์ด จอ กล้อง ชิป ทำงานสมบูรณ์ 100%</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BatteryCharging size={20} />
          </div>
          <div className="text-xs font-bold text-[#142B4A]">แบตเตอรี่ 85%+ ทุกเครื่อง</div>
          <p className="text-[11px] text-slate-500">แบตแท้ ไม่เสื่อม ใช้งานได้ยาวนานทั้งวัน</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div className="text-xs font-bold text-[#142B4A]">ประกันร้าน 6 เดือน</div>
          <p className="text-[11px] text-slate-500">ดูแลตัวเครื่องและระบบ เคลมได้ 45 สาขา</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6E00] flex items-center justify-center">
            <Cpu size={20} />
          </div>
          <div className="text-xs font-bold text-[#142B4A]">ผ่อน 0% ไม่ใช้บัตร</div>
          <p className="text-[11px] text-slate-500">ใช้บัตรประชาชนใบเดียว อนุมัติไวใน 3 นาที</p>
        </div>
      </section>

      {/* 3. Filter Bar */}
      <section className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 mr-1 shrink-0 flex items-center gap-1">
            <Filter size={14} />
            <span>เลือกแบรนด์:</span>
          </span>
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'apple', label: 'iPhone มือสอง' },
            { id: 'samsung', label: 'Samsung มือสอง' },
            { id: 'xiaomi', label: 'Xiaomi มือสอง' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedBrand(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedBrand === tab.id
                  ? 'bg-[#142B4A] text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Link
          href="/products?condition=used"
          className="text-xs font-bold text-[#007ACC] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>ดูทั้งหมดในแคตตาล็อก ({products.length} รุ่น)</span>
          <ArrowRight size={13} />
        </Link>
      </section>

      {/* 4. Used Phone Product Showcase Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#142B4A] flex items-center gap-2">
              <span>มือถือมือ 2 แนะนำพร้อมส่ง</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                Certified
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              ทุกเครื่องผ่านการฆ่าเชื้อและทำความสะอาด บรรจุพร้อมใช้งาน
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">ไม่พบสินค้าในแบรนด์ที่เลือก</p>
            <button
              type="button"
              onClick={() => setSelectedBrand('all')}
              className="text-xs font-bold text-[#007ACC] hover:underline"
            >
              ดูสินค้ามือสองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const priceBaht = Math.round(p.minCashPriceMinor / 100);
              const compareBaht = p.compareAtPriceMinor ? Math.round(p.compareAtPriceMinor / 100) : null;
              const savings = compareBaht && compareBaht > priceBaht ? compareBaht - priceBaht : null;
              const monthlyBaht = p.bestInstallmentMonthlyMinor
                ? Math.round(p.bestInstallmentMonthlyMinor / 100)
                : Math.round(priceBaht / 10);
              const months = p.bestInstallmentMonths || 10;

              return (
                <div
                  key={p.id}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-[#FF6E00]/40 hover:shadow-md transition-all flex flex-col overflow-hidden relative"
                >
                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-extrabold text-[10px] shadow-2xs">
                      มือ 2 คัดเกรด
                    </span>
                    {savings && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px] shadow-2xs">
                        ประหยัด ฿{savings.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Product Image */}
                  <Link
                    href={`/products/${p.slug}`}
                    className="block relative w-full pt-[75%] bg-slate-50 overflow-hidden"
                  >
                    <img
                      src={p.imageUrl || p.thumbnailUrl || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80'}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {p.brand} • เครื่องแท้ประกันศูนย์
                      </div>
                      <Link
                        href={`/products/${p.slug}`}
                        className="block text-sm font-bold text-[#142B4A] hover:text-[#007ACC] line-clamp-2 transition-colors"
                      >
                        {p.name}
                      </Link>

                      {/* Badges Pill Row */}
                      {p.badges && p.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.badges.slice(0, 2).map((b, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pricing & Installment Rate */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-extrabold text-[#142B4A]">
                            ฿{priceBaht.toLocaleString()}
                          </span>
                          {compareBaht && (
                            <span className="text-xs text-slate-400 line-through">
                              ฿{compareBaht.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Installment Badge */}
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[#FF6E00] font-bold">
                          <span className="px-1.5 py-0.2 rounded bg-orange-50 border border-orange-200 text-[10px]">
                            0% {months} ด.
                          </span>
                          <span>ผ่อน ฿{monthlyBaht.toLocaleString()}/เดือน</span>
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link
                          href={`/products/${p.slug}`}
                          className="w-full py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs text-center transition-colors"
                        >
                          รายละเอียด
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(e, p)}
                          className="w-full py-2 rounded-xl bg-[#007ACC] hover:bg-[#0062a3] text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-95"
                        >
                          <ShoppingCart size={13} />
                          <span>ผ่อนเลย</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Inspection Guarantee Banner */}
      <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-orange-50 border border-blue-200/60 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="space-y-2 max-w-xl text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#007ACC] text-[11px] font-bold">
            <ShieldCheck size={14} />
            <span>MeePro Quality Assurance</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#142B4A]">
            อุ่นใจทุกการใช้งาน ด้วยมาตรฐาน MeePro Care
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            หากตัวเครื่องพบปัญหาการใช้งานตามเงื่อนไข สามารถนำเครื่องเข้ามาตรวจเช็กหรือเปลี่ยนเครื่องได้ที่ MeePro ทั้ง 45 สาขาทั่วประเทศ พร้อมทีมช่างผู้เชี่ยวชาญดูแลตลอดระยะเวลารับประกัน
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
          <Link
            href="/stores"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-[#142B4A] font-bold text-xs text-center transition-colors shadow-2xs"
          >
            ค้นหาสาขาใกล้คุณ (45 สาขา)
          </Link>
          <Link
            href="/products?condition=used"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#142B4A] hover:bg-[#0F172A] text-white font-bold text-xs text-center transition-colors shadow-2xs"
          >
            ช้อปมือถือมือ 2 ทั้งหมด
          </Link>
        </div>
      </section>
    </div>
  );
}
