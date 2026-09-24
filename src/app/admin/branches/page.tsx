'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Store,
  MapPin,
  Phone,
  ExternalLink,
  Plus,
  CheckCircle,
  AlertCircle,
  Search,
  Edit2,
  Trash2,
  X,
  Clock,
  Navigation,
} from 'lucide-react';
import type { PublicBranch, StoresListApiResponse } from '@/features/branches/types';
import BranchDetailsDialog from '@/components/branches/BranchDetailsDialog';

interface BranchFormData {
  id?: string;
  name: string;
  slug: string;
  province: string;
  region: string;
  fullAddress: string;
  displayPhone: string;
  openingHours: string;
  googleMapsUrl: string;
  directions: string;
}

const EMPTY_BRANCH_FORM: BranchFormData = {
  name: '',
  slug: '',
  province: 'กรุงเทพมหานคร',
  region: 'กรุงเทพฯ',
  fullAddress: '',
  displayPhone: '',
  openingHours: 'ทุกวัน 10:00 - 21:00 น.',
  googleMapsUrl: '',
  directions: '',
};

const REGIONS = ['ทั้งหมด', 'กรุงเทพฯ', 'ปริมณฑล', 'ภาคกลาง', 'ภาคเหนือ', 'ภาคอีสาน', 'ภาคใต้', 'ภาคตะวันออก'];

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ทั้งหมด');
  const [selectedBranch, setSelectedBranch] = useState<PublicBranch | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<BranchFormData>(EMPTY_BRANCH_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadBranches = async () => {
    try {
      const res = await fetch('/api/stores');
      const data = (await res.json()) as StoresListApiResponse;
      if (data.success && Array.isArray(data.data?.stores)) {
        setBranches(data.data.stores);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBranches();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData(EMPTY_BRANCH_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (branch: PublicBranch) => {
    setModalMode('edit');
    setFormData({
      id: branch.id,
      name: branch.name,
      slug: branch.slug,
      province: branch.province || 'กรุงเทพมหานคร',
      region: branch.region || 'กรุงเทพฯ',
      fullAddress: branch.fullAddress,
      displayPhone: branch.displayPhone,
      openingHours: Array.isArray(branch.openingHours) ? branch.openingHours.join(' | ') : (branch.openingHours || ''),
      googleMapsUrl: branch.googleMapsUrl,
      directions: branch.directions || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.fullAddress.trim() || !formData.displayPhone.trim()) {
      setStatusMsg({ text: 'กรุณากรอกชื่อสาขา ที่อยู่ และเบอร์โทรศัพท์', type: 'error' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/admin/branches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug || undefined,
            province: formData.province,
            region: formData.region,
            fullAddress: formData.fullAddress,
            displayPhone: formData.displayPhone,
            openingHours: formData.openingHours.split('|').map((s) => s.trim()),
            googleMapsUrl: formData.googleMapsUrl || undefined,
            directions: formData.directions || undefined,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMsg({ text: `✅ เพิ่มสาขา "${formData.name}" เรียบร้อยแล้ว`, type: 'success' });
          setIsModalOpen(false);
          await loadBranches();
        } else {
          setStatusMsg({ text: `❌ บันทึกไม่สำเร็จ: ${data.error || 'Unknown error'}`, type: 'error' });
        }
      } else {
        // Edit mode
        const res = await fetch(`/api/admin/branches/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug || undefined,
            province: formData.province,
            region: formData.region,
            fullAddress: formData.fullAddress,
            displayPhone: formData.displayPhone,
            openingHours: formData.openingHours.split('|').map((s) => s.trim()),
            googleMapsUrl: formData.googleMapsUrl || undefined,
            directions: formData.directions || undefined,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMsg({ text: `✅ แก้ไขสาขา "${formData.name}" เรียบร้อยแล้ว`, type: 'success' });
          setIsModalOpen(false);
          await loadBranches();
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

  const handleDelete = async (branch: PublicBranch) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสาขา "${branch.name}" (${branch.slug})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/branches/${branch.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ text: `✅ ลบสาขา "${branch.name}" เรียบร้อยแล้ว`, type: 'success' });
        await loadBranches();
      } else {
        setStatusMsg({ text: `❌ ลบไม่สำเร็จ: ${data.error || 'Unknown error'}`, type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: `❌ เกิดข้อผิดพลาด: ${err.message}`, type: 'error' });
    }
  };

  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.fullAddress.toLowerCase().includes(search.toLowerCase()) ||
      b.displayPhone.includes(search) ||
      b.slug.toLowerCase().includes(search.toLowerCase());
    const matchesRegion =
      selectedRegion === 'ทั้งหมด' || b.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#142B4A]">จัดการสาขา (Store Branches)</h1>
          <p className="text-sm text-slate-500 mt-1">
            เพิ่ม แก้ไข และลบข้อมูลสาขา ข้อมูลติดต่อ เวลาเปิดทำการ และพิกัด Google Maps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/stores"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>ดูหน้าร้านค้าจริง</span>
            <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6E00] hover:bg-[#e56300] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>เพิ่มสาขาใหม่</span>
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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อสาขา, slug, ที่อยู่ หรือเบอร์โทร..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setSelectedRegion(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedRegion === r
                  ? 'bg-[#142B4A] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
        <span>แสดง {filteredBranches.length} จากทั้งหมด {branches.length} สาขา</span>
      </div>

      {/* Table */}
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
                <th className="py-3.5 px-4">ชื่อสาขา & Slug</th>
                <th className="py-3.5 px-4">ภูมิภาค / จังหวัด</th>
                <th className="py-3.5 px-4">เบอร์โทรติดต่อ</th>
                <th className="py-3.5 px-4">เวลาเปิด-ปิด</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-bold text-[#142B4A]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6E00] flex items-center justify-center shrink-0">
                        <Store size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{branch.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">/{branch.slug}</div>
                        <div className="text-[11px] font-normal text-slate-500 line-clamp-1 max-w-sm mt-0.5">
                          {branch.fullAddress}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                      {branch.region}
                    </span>
                    <span className="text-slate-400 ml-1.5">{branch.province}</span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-[#007ACC] font-semibold">
                    {branch.displayPhone}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500">
                    {Array.isArray(branch.openingHours) ? branch.openingHours[0] : branch.openingHours}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedBranch(branch)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                        title="พรีวิว Modal"
                      >
                        พรีวิว
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(branch)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                        title="แก้ไขสาขา"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(branch)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                        title="ลบสาขา"
                      >
                        <Trash2 size={13} />
                      </button>
                      <a
                        href={branch.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                        title="เปิดใน Google Maps"
                      >
                        แผนที่ ↗
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBranches.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                    ไม่พบข้อมูลสาขาที่ตรงกับเงื่อนไขค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Dialog: Add / Edit Branch */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6E00] flex items-center justify-center">
                  <Store size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#142B4A]">
                    {modalMode === 'create' ? 'เพิ่มสาขาใหม่' : 'แก้ไขข้อมูลสาขา'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    ข้อมูลจะอัปเดตบนหน้าร้านค้าและระบบค้นหาสาขาทันที
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
                    ชื่อสาขา <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น MeePro Central Rama 9"
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
                    placeholder="เช่น central-rama-9"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ภูมิภาค</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                  >
                    {REGIONS.filter((r) => r !== 'ทั้งหมด').map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">จังหวัด</label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="เช่น กรุงเทพมหานคร, เชียงใหม่"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ที่อยู่สาขาแบบเต็ม <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.fullAddress}
                  onChange={(e) => setFormData({ ...formData, fullAddress: e.target.value })}
                  placeholder="เช่น ชั้น 4 ห้อง 401 เลขที่ 9/9 ถ. พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayPhone}
                    onChange={(e) => setFormData({ ...formData, displayPhone: e.target.value })}
                    placeholder="เช่น 02-123-4567 หรือ 089-123-4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs font-mono"
                  />
                  <span className="text-[10px] text-slate-400">ระบบจะแปลงเป็น +66 อัตโนมัติ</span>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">เวลาเปิด-ปิด</label>
                  <input
                    type="text"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    placeholder="เช่น ทุกวัน 10:00 - 21:00 น."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Google Maps URL (ลิงก์แผนที่)
                </label>
                <input
                  type="text"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  จุดสังเกต / การเดินทาง (Directions)
                </label>
                <input
                  type="text"
                  value={formData.directions}
                  onChange={(e) => setFormData({ ...formData, directions: e.target.value })}
                  placeholder="เช่น ชั้น 4 โซนมือถือ ข้าง Power Buy (MRT พระราม 9)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                />
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
                  {submitting ? 'กำลังบันทึก...' : modalMode === 'create' ? 'เพิ่มสาขา' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      {selectedBranch && (
        <BranchDetailsDialog
          branch={selectedBranch}
          onClose={() => setSelectedBranch(null)}
        />
      )}
    </div>
  );
}
