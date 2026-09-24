'use client';

import React, { useEffect, useState } from 'react';
import {
  Tag,
  CheckCircle,
  Percent,
  Clock,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import type { OfferWithStatus, OfferStatus } from '@/server/repositories/offersStore';

interface OfferFormData {
  id?: string;
  name: string;
  planCode: string;
  months: number;
  interestRateAnnual: number;
  isZeroPercent: boolean;
  minPriceBaht: number;
  effectiveFrom: string;
  effectiveUntil: string;
  description: string;
  badge: string;
  isActive: boolean;
}

const EMPTY_OFFER_FORM: OfferFormData = {
  name: '',
  planCode: '',
  months: 10,
  interestRateAnnual: 0,
  isZeroPercent: true,
  minPriceBaht: 5000,
  effectiveFrom: new Date().toISOString().slice(0, 16),
  effectiveUntil: '',
  description: '',
  badge: 'พิเศษ',
  isActive: true,
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<OfferWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | OfferStatus>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<OfferFormData>(EMPTY_OFFER_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadOffers = async () => {
    try {
      const res = await fetch('/api/offers');
      const data = await res.json();
      if (Array.isArray(data.offers)) {
        setOffers(data.offers);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOffers();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      ...EMPTY_OFFER_FORM,
      effectiveFrom: new Date().toISOString().slice(0, 16),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (offer: OfferWithStatus) => {
    setModalMode('edit');
    setFormData({
      id: offer.id,
      name: offer.name,
      planCode: offer.planCode,
      months: offer.months,
      interestRateAnnual: offer.interestRateAnnual,
      isZeroPercent: offer.isZeroPercent,
      minPriceBaht: offer.minPriceBaht || 0,
      effectiveFrom: offer.effectiveFrom ? new Date(offer.effectiveFrom).toISOString().slice(0, 16) : '',
      effectiveUntil: offer.effectiveUntil ? new Date(offer.effectiveUntil).toISOString().slice(0, 16) : '',
      description: offer.description,
      badge: offer.badge || '',
      isActive: offer.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setStatusMsg({ text: 'กรุณากรอกชื่อโปรโมชั่น/ข้อเสนอ', type: 'error' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);

    try {
      const payload = {
        name: formData.name,
        planCode: formData.planCode || undefined,
        months: Number(formData.months),
        interestRateAnnual: formData.isZeroPercent ? 0 : Number(formData.interestRateAnnual),
        isZeroPercent: formData.isZeroPercent,
        minPriceBaht: Number(formData.minPriceBaht),
        effectiveFrom: formData.effectiveFrom ? new Date(formData.effectiveFrom).toISOString() : new Date().toISOString(),
        effectiveUntil: formData.effectiveUntil ? new Date(formData.effectiveUntil).toISOString() : null,
        description: formData.description,
        badge: formData.badge || undefined,
        isActive: formData.isActive,
      };

      if (modalMode === 'create') {
        const res = await fetch('/api/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMsg({ text: `✅ สร้างโปรโมชั่น "${formData.name}" เรียบร้อยแล้ว`, type: 'success' });
          setIsModalOpen(false);
          await loadOffers();
        } else {
          setStatusMsg({ text: `❌ บันทึกไม่สำเร็จ: ${data.error || 'Unknown error'}`, type: 'error' });
        }
      } else {
        const res = await fetch(`/api/offers/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMsg({ text: `✅ อัปเดตโปรโมชั่น "${formData.name}" เรียบร้อยแล้ว`, type: 'success' });
          setIsModalOpen(false);
          await loadOffers();
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

  const handleDelete = async (offer: OfferWithStatus) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบโปรโมชั่น "${offer.name}" (${offer.planCode})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/offers/${offer.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ text: `✅ ลบโปรโมชั่น "${offer.name}" เรียบร้อยแล้ว`, type: 'success' });
        await loadOffers();
      } else {
        setStatusMsg({ text: `❌ ลบไม่สำเร็จ: ${data.error || 'Unknown error'}`, type: 'error' });
      }
    } catch (err: any) {
      setStatusMsg({ text: `❌ เกิดข้อผิดพลาด: ${err.message}`, type: 'error' });
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (activeTab === 'all') return true;
    return o.status === activeTab;
  });

  const getStatusBadge = (offer: OfferWithStatus) => {
    switch (offer.status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            ใช้งานอยู่ (Active)
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            <Clock size={11} className="text-amber-700" />
            ตั้งเวลาล่วงหน้า (Pre-created)
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
            หมดอายุแล้ว (Expired)
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
            ปิดใช้งาน
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#142B4A]">
            ข้อเสนอผ่อนชำระ & โปรโมชั่น (Installment Offers)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            สร้าง ตั้งเวลาล่วงหน้า (Pre-create Start/Expire Date) จัดการระยะเวลาผ่อน และอัตราดอกเบี้ย 0%
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6E00] hover:bg-[#e56300] text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>สร้างโปรโมชั่นใหม่ (Pre-create)</span>
        </button>
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

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'all', label: 'ทั้งหมด', count: offers.length },
          { key: 'active', label: '🟢 ใช้งานอยู่ (Active)', count: offers.filter((o) => o.status === 'active').length },
          { key: 'scheduled', label: '⏳ ตั้งเวลาล่วงหน้า (Pre-created)', count: offers.filter((o) => o.status === 'scheduled').length },
          { key: 'expired', label: '⚪ หมดอายุแล้ว (Expired)', count: offers.filter((o) => o.status === 'expired').length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-[#142B4A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Grid of Offers */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div>
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF6E00] flex items-center justify-center font-bold shrink-0">
                      <Percent size={18} />
                    </span>
                    <div>
                      {getStatusBadge(offer)}
                      {offer.badge && (
                        <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#007ACC]">
                          {offer.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(offer)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                      title="แก้ไขโปรโมชั่น"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(offer)}
                      className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                      title="ลบโปรโมชั่น"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h2 className="text-base font-bold text-[#142B4A] mb-1">{offer.name}</h2>
                <div className="text-[11px] font-mono text-slate-400 mb-2">Code: {offer.planCode}</div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{offer.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-500">
                  <div>
                    <span>ระยะเวลาผ่อน:</span>{' '}
                    <span className="font-bold text-slate-900">{offer.months} เดือน</span>
                  </div>
                  <div>
                    <span>ดอกเบี้ย:</span>{' '}
                    <span className="font-bold text-[#FF6E00]">
                      {offer.isZeroPercent ? '0%' : `${offer.interestRateAnnual}% ต่อปี`}
                    </span>
                  </div>
                </div>

                {offer.minPriceBaht ? (
                  <div className="text-[11px] text-slate-500">
                    ยอดซื้อขั้นต่ำ: <span className="font-bold text-slate-800">฿{offer.minPriceBaht.toLocaleString()}</span>
                  </div>
                ) : null}

                {/* Campaign Schedule Dates */}
                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] space-y-1 text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-400 shrink-0" />
                    <span>เริ่ม: <strong>{new Date(offer.effectiveFrom).toLocaleDateString('th-TH')}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400 shrink-0" />
                    <span>
                      สิ้นสุด:{' '}
                      <strong>
                        {offer.effectiveUntil
                          ? new Date(offer.effectiveUntil).toLocaleDateString('th-TH')
                          : 'ไม่มีกำหนด (ตลอดไป)'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredOffers.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
              ไม่พบข้อเสนอผ่อนชำระในหมวดนี้
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog: Add / Edit / Pre-create Offer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6E00] flex items-center justify-center">
                  <Percent size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#142B4A]">
                    {modalMode === 'create' ? 'สร้างโปรโมชั่นผ่อนชำระ (Pre-create)' : 'แก้ไขโปรโมชั่น'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    กำหนดวันเริ่มต้นล่วงหน้าและวันหมดอายุของแคมเปญ
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
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ชื่อโปรโมชั่น / ข้อเสนอ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น ผ่อน 0% นาน 10 เดือน แคมเปญ PayDay"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    รหัสแผนผ่อน (Plan Code)
                  </label>
                  <input
                    type="text"
                    value={formData.planCode}
                    onChange={(e) => setFormData({ ...formData, planCode: e.target.value })}
                    placeholder="เช่น ZERO_10M_PAYDAY"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ป้ายกำกับ (Badge)</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="เช่น HOT, เรือธง 0%, แนะนำ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ระยะเวลาผ่อน (เดือน) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.months}
                    onChange={(e) => setFormData({ ...formData, months: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                  >
                    {[3, 4, 6, 9, 10, 12, 15, 18, 24, 36, 48].map((m) => (
                      <option key={m} value={m}>
                        {m} เดือน
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ประเภทดอกเบี้ย</label>
                  <select
                    value={formData.isZeroPercent ? 'zero' : 'interest'}
                    onChange={(e) => setFormData({ ...formData, isZeroPercent: e.target.value === 'zero' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                  >
                    <option value="zero">ดอกเบี้ย 0% (ไม่มีดอกเบี้ย)</option>
                    <option value="interest">มีอัตราดอกเบี้ยพิเศษ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ดอกเบี้ยต่อปี (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={formData.isZeroPercent}
                    value={formData.isZeroPercent ? 0 : formData.interestRateAnnual}
                    onChange={(e) => setFormData({ ...formData, interestRateAnnual: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ยอดสั่งซื้อขั้นต่ำ (บาท)</label>
                <input
                  type="number"
                  value={formData.minPriceBaht}
                  onChange={(e) => setFormData({ ...formData, minPriceBaht: Number(e.target.value) })}
                  placeholder="เช่น 3000 หรือ 0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                />
              </div>

              {/* Start Date and Expire Date Scheduling */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <div className="font-bold text-[#142B4A] flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#FF6E00]" />
                  <span>กำหนดวันเริ่มต้น (Pre-create) และวันหมดอายุ (Expire Date)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      วันและเวลาเริ่มใช้งาน (Start Date) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.effectiveFrom}
                      onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                    />
                    <span className="text-[10px] text-slate-500">
                      หากเลือกวันในอนาคต โปรโมชั่นจะอยู่ในสถานะ &quot;ตั้งเวลาล่วงหน้า&quot;
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      วันและเวลาสิ้นสุด (Expire Date)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.effectiveUntil}
                      onChange={(e) => setFormData({ ...formData, effectiveUntil: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                    />
                    <span className="text-[10px] text-slate-500">
                      เว้นว่างไว้หากไม่มีวันหมดอายุ
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  รายละเอียด / เงื่อนไขโปรโมชั่น
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="เช่น ข้อเสนอพิเศษสำหรับการผ่อนสมาร์ตโฟนรุ่นที่ร่วมรายการ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#FF6E00] outline-hidden text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded-md border-slate-300 text-[#FF6E00] focus:ring-[#FF6E00]"
                />
                <label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer">
                  เปิดใช้งานโปรโมชั่นนี้ในระบบ (Active)
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
                    ? 'บันทึกโปรโมชั่น'
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
