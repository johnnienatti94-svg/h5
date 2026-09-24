'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, ExternalLink, Tag } from 'lucide-react';
import { formatBaht } from '@/lib/currency';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  basePriceMinor: number;
  monthlyFromMinor?: number;
  installmentMonths?: number[];
  isActive?: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const brands = ['ALL', ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#142B4A]">จัดการสินค้า (Product Catalog)</h1>
          <p className="text-sm text-slate-500 mt-1">
            แคตตาล็อกสินค้าสมาร์ตโฟน แท็บเล็ต รุ่นเรือธง ค่างวดเริ่มต้น และตัวเลือกสินค้า
          </p>
        </div>
        <Link
          href="/products"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span>ดูหน้าร้านค้า</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อรุ่น หรือแบรนด์..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedBrand === b
                  ? 'bg-[#142B4A] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">สินค้า</th>
                <th className="py-3.5 px-4">แบรนด์ / หมวดหมู่</th>
                <th className="py-3.5 px-4">ราคาเต็ม</th>
                <th className="py-3.5 px-4">ผ่อนเริ่มต้น / เดือน</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-bold text-[#142B4A]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#007ACC] flex items-center justify-center shrink-0">
                        <ShoppingBag size={16} />
                      </div>
                      <div>
                        <div>{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">slug: {item.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <span className="font-bold text-slate-800">{item.brand}</span>
                    <span className="text-slate-400 ml-1.5">• {item.category}</span>
                  </td>
                  <td className="py-4 px-4 text-xs font-bold text-slate-900 font-mono">
                    {formatBaht(item.basePriceMinor)}
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <span className="font-bold text-[#FF6E00] font-mono">
                      {item.monthlyFromMinor ? formatBaht(item.monthlyFromMinor) : '-'}
                    </span>
                    <span className="text-slate-400 text-[11px] ml-1">/ ด.</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      href={`/products/${item.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    >
                      <span>ดูหน้าร้าน</span>
                      <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
