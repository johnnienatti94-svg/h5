'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowUpDown,
  Image as ImageIcon,
} from 'lucide-react';
import { formatBaht } from '@/lib/currency';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug?: string;
  category: string;
  categorySlug?: string;
  summary?: string;
  description?: string;
  imageUrl?: string;
  basePriceMinor: number;
  monthlyFromMinor?: number;
  isInStock?: boolean;
  variantsCount?: number;
}

interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  brandSlug: string;
  categorySlug: string;
  summary: string;
  description: string;
  imageUrl: string;
  basePriceBaht: number;
  monthlyFromBaht: number;
  inStock: boolean;
}

const EMPTY_PRODUCT_FORM: ProductFormData = {
  name: '',
  slug: '',
  brandSlug: 'apple',
  categorySlug: 'smartphone',
  summary: '',
  description: '',
  imageUrl: '',
  basePriceBaht: 25900,
  monthlyFromBaht: 2590,
  inStock: true,
};

const BRANDS_LIST = [
  { slug: 'apple', name: 'Apple' },
  { slug: 'samsung', name: 'Samsung' },
  { slug: 'xiaomi', name: 'Xiaomi' },
  { slug: 'oppo', name: 'OPPO' },
  { slug: 'vivo', name: 'vivo' },
  { slug: 'sony', name: 'Sony' },
  { slug: 'marshall', name: 'Marshall' },
  { slug: 'anker', name: 'Anker' },
];

const CATEGORIES_LIST = [
  { slug: 'smartphone', name: 'สมาร์ตโฟน' },
  { slug: 'tablet', name: 'แท็บเล็ต' },
  { slug: 'laptop', name: 'แล็ปท็อป' },
  { slug: 'watch', name: 'สมาร์ตวอทช์' },
  { slug: 'audio', name: 'หูฟัง & ลำโพง' },
  { slug: 'accessory', name: 'อุปกรณ์เสริม' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [sortBy, setSortBy] = useState<'custom' | 'price_asc' | 'price_desc' | 'name'>('custom');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_PRODUCT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
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

  const openCreateModal = () => {
    setModalMode('create');
    setFormData(EMPTY_PRODUCT_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setModalMode('edit');
    const priceBaht = Math.round(p.basePriceMinor / 100);
    const monthlyBaht = p.monthlyFromMinor ? Math.round(p.monthlyFromMinor / 100) : Math.round(priceBaht / 10);

    setFormData({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brandSlug: p.brandSlug || p.brand.toLowerCase(),
      categorySlug: p.categorySlug || 'smartphone',
      summary: p.summary || '',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      basePriceBaht: priceBaht,
      monthlyFromBaht: monthlyBaht,
      inStock: p.isInStock !== undefined ? p.isInStock : true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatusMsg({ text: 'กรุณาระบุชื่อสินค้า', type: 'error' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || undefined,
        brandSlug: formData.brandSlug,
        categorySlug: formData.categorySlug,
        summary: formData.summary,
        description: formData.description,
        imageUrl: formData.imageUrl || undefined,
        basePriceBaht: Number(formData.basePriceBaht),
        monthlyFromBaht: Number(formData.monthlyFromBaht),
        inStock: formData.inStock,
      };

      if (modalMode === 'create') {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMsg({ text: `✅ เพิ่มสินค้า "${formData.name}" เรียบร้อยแล้ว`, type: 'success' });
          setIsModalOpen(false);
          await loadProducts();
        } else {
          setStatusMsg({ text: `❌ บันทึกไม่สำเร็จ: ${data.error || 'Unknown error'}`, type: 'error' });
        }
      } else {
        const res = await fetch(`/api/admin/products/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMsg({ text: `✅ อัปเดตสินค้า "${formData.name}" เรียบร้อยแล้ว`, type: 'success' });
          setIsModalOpen(false);
          await loadProducts();
        } else {
          setStatusMsg({ text: `❌ บันทึกไม่สำเร็จ: ${data.error || 'Unknown error'}`, type: 'error' });
        }
      }
    } catch (err: any) {
      setStatusMsg({ text: `❌ เกิดข้อผิดพลาด: ${err.message}`, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: ProductItem) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${p.name}" (${p.slug})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ text: `✅ ลบสินค้า "${p.name}" เรียบร้อยแล้ว`, type: 'success' });
        await loadProducts();
      } else {
        setStatusMsg({ text: `❌ ลบไม่สำเร็จ: ${data.error || 'Unknown error'}`, type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: `❌ เกิดข้อผิดพลาด: ${err.message}`, type: 'error' });
    }
  };

  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    try {
      const res = await fetch('/api/admin/products/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move', id, direction }),
      });
      if (res.ok) {
        await loadProducts();
      }
    } catch {
      // Ignore
    }
  };

  const brands = ['ALL', ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

  // Filtering & Sorting
  let filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
    const matchesCategory = selectedCategory === 'ALL' || p.categorySlug === selectedCategory || p.category === selectedCategory;
    const matchesStock =
      stockFilter === 'ALL' ||
      (stockFilter === 'IN_STOCK' ? p.isInStock : !p.isInStock);

    return matchesSearch && matchesBrand && matchesCategory && matchesStock;
  });

  if (sortBy === 'price_asc') {
    filtered = [...filtered].sort((a, b) => a.basePriceMinor - b.basePriceMinor);
  } else if (sortBy === 'price_desc') {
    filtered = [...filtered].sort((a, b) => b.basePriceMinor - a.basePriceMinor);
  } else if (sortBy === 'name') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'th'));
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#142B4A]">
            จัดการสินค้า & จัดระเบียบสต็อก (Product Catalog & Organization)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            เพิ่ม ลบ แก้ไขราคา ค่างวดเริ่มต้น และจัดลำดับการแสดงผลสินค้าบนหน้าร้านค้า
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>ดูหน้าร้านค้า</span>
            <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6E00] hover:bg-[#e56300] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>เพิ่มสินค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between transition-all ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{statusMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-slate-500 hover:underline font-bold text-xs"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Organization Controls & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อรุ่น, slug หรือแบรนด์..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <ArrowUpDown size={14} className="text-slate-400" />
              <span className="font-bold">การเรียง:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
              >
                <option value="custom">ลำดับจัดระเบียบ (Organised)</option>
                <option value="price_asc">ราคา: ต่ำ ➔ สูง</option>
                <option value="price_desc">ราคา: สูง ➔ ต่ำ</option>
                <option value="name">ชื่อสินค้า (ก - ฮ)</option>
              </select>
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="ALL">หมวดหมู่ทั้งหมด</option>
              {CATEGORIES_LIST.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Brand Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 mr-2 shrink-0">แบรนด์:</span>
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedBrand === b
                  ? 'bg-[#142B4A] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
        <span>แสดง {filtered.length} จาก {products.length} รายการ (ใช้ปุ่ม ⬆️ ⬇️ เพื่อจัดลำดับสินค้าหน้าร้าน)</span>
      </div>

      {/* Products Table */}
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
                <th className="py-3.5 px-3 text-center w-16">จัดลำดับ</th>
                <th className="py-3.5 px-4">สินค้า & ข้อมูล</th>
                <th className="py-3.5 px-4">แบรนด์ / หมวดหมู่</th>
                <th className="py-3.5 px-4">ราคาเต็ม</th>
                <th className="py-3.5 px-4">ผ่อนเริ่มต้น</th>
                <th className="py-3.5 px-4">สถานะสต็อก</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Order Organiser Controls */}
                  <td className="py-4 px-3 text-center">
                    <div className="inline-flex flex-col items-center gap-0.5">
                      <button
                        type="button"
                        disabled={index === 0 || sortBy !== 'custom'}
                        onClick={() => handleMoveOrder(item.id, 'up')}
                        className="p-1 rounded-md hover:bg-slate-200 text-slate-500 disabled:opacity-20 transition-colors"
                        title="ย้ายขึ้น (Move Up)"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <span className="text-[10px] font-mono font-bold text-slate-400">#{index + 1}</span>
                      <button
                        type="button"
                        disabled={index === filtered.length - 1 || sortBy !== 'custom'}
                        onClick={() => handleMoveOrder(item.id, 'down')}
                        className="p-1 rounded-md hover:bg-slate-200 text-slate-500 disabled:opacity-20 transition-colors"
                        title="ย้ายลง (Move Down)"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-[#142B4A]">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007ACC] flex items-center justify-center shrink-0">
                          <ShoppingBag size={18} />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-[#142B4A]">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">slug: {item.slug}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-xs">
                    <span className="font-bold text-slate-800">{item.brand}</span>
                    <div className="text-slate-400 text-[11px]">{item.category}</div>
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

                  <td className="py-4 px-4 text-xs">
                    {item.isInStock !== false ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        พร้อมขาย
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                        สินค้าหมด
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/products/${item.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="ดูหน้าร้านค้าจริง"
                      >
                        <ExternalLink size={13} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="แก้ไขสินค้า"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                        title="ลบสินค้า"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    ไม่พบสินค้าที่ตรงกับเงื่อนไขค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog: Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6E00] flex items-center justify-center">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#142B4A]">
                    {modalMode === 'create' ? 'เพิ่มสินค้าใหม่ลงแคตตาล็อก' : 'แก้ไขข้อมูลสินค้า'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    ข้อมูลจะอัปเดตบนหน้าร้านค้าและแคตตาล็อกทันที
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ชื่อสินค้า <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น iPhone 16 Pro Max 256GB"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    URL Slug (เว้นว่างไว้เพื่อสร้างอัตโนมัติ)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="เช่น iphone-16-pro-max"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">แบรนด์</label>
                  <select
                    value={formData.brandSlug}
                    onChange={(e) => setFormData({ ...formData, brandSlug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                  >
                    {BRANDS_LIST.map((b) => (
                      <option key={b.slug} value={b.slug}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={formData.categorySlug}
                    onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                  >
                    {CATEGORIES_LIST.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ราคาเต็ม (บาท) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.basePriceBaht}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      setFormData({
                        ...formData,
                        basePriceBaht: p,
                        monthlyFromBaht: Math.round(p / 10),
                      });
                    }}
                    placeholder="เช่น 36900"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ผ่อนเริ่มต้น / เดือน (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyFromBaht}
                    onChange={(e) => setFormData({ ...formData, monthlyFromBaht: Number(e.target.value) })}
                    placeholder="เช่น 3690"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  รูปภาพสินค้า (Image URL)
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/... หรือปล่อยว่างเพื่อใช้ภาพตัวอย่าง"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  คำอธิบายสรุป (Summary)
                </label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="เช่น ดีไซน์ไทเทเนียมเกรด 5 ชิป A18 Pro ทรงพลัง..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="rounded-md border-slate-300 text-[#FF6E00] focus:ring-[#FF6E00]"
                />
                <label htmlFor="inStock" className="font-bold text-slate-700 cursor-pointer">
                  มีสินค้าพร้อมขาย (In Stock)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#FF6E00] hover:bg-[#e56300] text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {submitting
                    ? 'กำลังบันทึก...'
                    : modalMode === 'create'
                    ? 'เพิ่มสินค้า'
                    : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
