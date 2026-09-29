'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Layers,
  Sliders,
  DollarSign,
  Settings,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type {
  TradeInDeviceConfiguration,
  TradeInModel,
  AssessmentTopic,
} from '@/features/tradein/types';

export default function AdminTradeInManagementPage() {
  const [activeTab, setActiveTab] = useState<'BASE_PRICES' | 'RULES' | 'SETTINGS'>('BASE_PRICES');
  const [configurations, setConfigurations] = useState<TradeInDeviceConfiguration[]>([]);
  const [topics, setTopics] = useState<AssessmentTopic[]>([]);
  const [models, setModels] = useState<TradeInModel[]>([]);
  const [payoutPercentage, setPayoutPercentage] = useState(75);
  const [roundingRule, setRoundingRule] = useState<'ROUND_DOWN_100' | 'ROUND_NEAREST_100' | 'EXACT'>('ROUND_DOWN_100');
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catRes, ruleRes] = await Promise.all([
        fetch('/api/admin/tradein/catalog'),
        fetch('/api/admin/tradein/rules'),
      ]);

      const catData = await catRes.json();
      const ruleData = await ruleRes.json();

      if (catData.success) {
        setConfigurations(catData.configurations || []);
        setModels(catData.models || []);
        setPayoutPercentage(catData.payoutPercentage || 75);
        setRoundingRule(catData.roundingRule || 'ROUND_DOWN_100');
      }

      if (ruleData.success && Array.isArray(ruleData.topics)) {
        setTopics(ruleData.topics);
      }
    } catch (err) {
      console.error('Failed to load admin trade-in config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleUpdatePrice = async (configId: string, newPrice: number) => {
    try {
      const res = await fetch('/api/admin/tradein/catalog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configurationId: configId, basePriceMinor: newPrice }),
      });
      const data = await res.json();
      if (data.success) {
        setConfigurations((prev) =>
          prev.map((c) => (c.id === configId ? { ...c, baseBuybackPriceMinor: newPrice } : c))
        );
        triggerSuccess();
      }
    } catch {
      alert('บันทึกราคาไม่สำเร็จ');
    }
  };

  const handleSavePolicy = async () => {
    try {
      const res = await fetch('/api/admin/tradein/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutPercentage, roundingRule }),
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess();
      }
    } catch {
      alert('บันทึกการตั้งค่าไม่สำเร็จ');
    }
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs text-slate-500">กำลังโหลดระบบจัดการ Trade-in...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Smartphone size={20} className="text-[#007ACC]" />
            <span>จัดการระบบมือถือแลกเงิน (Trade-in & Valuation Engine)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดราคาตั้งต้นรับซื้อคืน กฎการลดหย่อนสภาพเครื่อง กลุ่มการซ่อมทับซ้อน และนโยบายการจ่ายเงิน
          </p>
        </div>

        {saveSuccess && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 size={14} />
            <span>บันทึกการเปลี่ยนแปลงแล้ว</span>
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('BASE_PRICES')}
          className={`pb-2 transition-all ${activeTab === 'BASE_PRICES' ? 'border-b-2 border-[#007ACC] text-[#007ACC]' : 'text-slate-500'}`}
        >
          1. ราคาตั้งต้น (Base Buyback Prices)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('RULES')}
          className={`pb-2 transition-all ${activeTab === 'RULES' ? 'border-b-2 border-[#007ACC] text-[#007ACC]' : 'text-slate-500'}`}
        >
          2. หัวข้อประเมิน & กลุ่มการซ่อม (Deductions & Overlaps)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SETTINGS')}
          className={`pb-2 transition-all ${activeTab === 'SETTINGS' ? 'border-b-2 border-[#007ACC] text-[#007ACC]' : 'text-slate-500'}`}
        >
          3. นโยบายจ่ายเงิน & การปัดเศษ (Payout & Rounding)
        </button>
      </div>

      {/* TAB 1: Base Buyback Prices */}
      {activeTab === 'BASE_PRICES' && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-800">
              กำหนดราคาตั้งต้นตามรุ่นและความจุ (Base Buyback Configurations)
            </h2>
            <span className="text-[11px] text-slate-500">ทั้งหมด {configurations.length} รายการ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="p-2.5">รหัสคอนฟิก</th>
                  <th className="p-2.5">รุ่นสมาร์ตโฟน</th>
                  <th className="p-2.5">ความจุ</th>
                  <th className="p-2.5">สี</th>
                  <th className="p-2.5">โมเดล</th>
                  <th className="p-2.5">ราคาตั้งต้นรับซื้อ (บาท)</th>
                  <th className="p-2.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {configurations.map((cfg) => {
                  const model = models.find((m) => m.id === cfg.modelId);
                  return (
                    <tr key={cfg.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">{cfg.id}</td>
                      <td className="p-2.5 font-bold text-slate-800">{model?.name || cfg.modelId}</td>
                      <td className="p-2.5 font-semibold text-slate-700">{cfg.storageOptionId.replace('storage-', '')}</td>
                      <td className="p-2.5 text-slate-600">{cfg.colorOptionId.replace('color-', '')}</td>
                      <td className="p-2.5 font-semibold text-slate-700">{cfg.marketVariantOptionId.replace('mkt-', '').toUpperCase()}</td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          defaultValue={cfg.baseBuybackPriceMinor}
                          onBlur={(e) => handleUpdatePrice(cfg.id, Number(e.target.value))}
                          className="w-28 p-1.5 rounded border border-slate-200 font-bold text-[#007ACC]"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Topics & Deductions */}
      {activeTab === 'RULES' && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-xs font-bold text-slate-800">หัวข้อการประเมินสภาพและกลุ่มลดหย่อนการซ่อม</h2>
            <p className="text-[11px] text-slate-500">
              ทุกหัวข้อรองรับการกำหนดประเภทการหัก (เปอร์เซ็นต์, จำนวนเงินคงที่, ค่าเปลี่ยนอะไหล่) และกลุ่ม Overlap เพื่อป้องกันการหักราคาซ้ำซ้อน
            </p>
          </div>

          <div className="space-y-3">
            {topics.map((t) => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{t.title}</span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {t.isMultiSelect ? 'เลือกได้หลายข้อ' : 'เลือกได้ข้อเดียว'}
                  </span>
                </div>

                <div className="space-y-1 pl-2">
                  {t.options.map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between text-[11px] text-slate-700">
                      <span>• {opt.label}</span>
                      <div className="flex items-center gap-2">
                        {opt.overlapGroup && (
                          <span className="text-[9px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {opt.overlapGroup}
                          </span>
                        )}
                        <span className="font-semibold text-rose-600">
                          {opt.adjustmentType === 'PERCENTAGE'
                            ? `หัก ${opt.adjustmentValue}% (ราคาตั้งต้น)`
                            : opt.adjustmentType === 'NO_DEDUCTION'
                            ? 'ไม่หัก'
                            : opt.adjustmentType === 'MANUAL_ASSESSMENT'
                            ? 'ตรวจสภาพพิเศษ'
                            : `-฿${opt.adjustmentValue.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Payout Policy & Rounding */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4 max-w-lg text-xs">
          <div>
            <h2 className="text-xs font-bold text-slate-800">การตั้งค่านโยบายการจ่ายเงินและปัดเศษ</h2>
            <p className="text-[11px] text-slate-500">
              กำหนดสัดส่วนการจ่ายเงินสดจากมูลค่าประเมิน และกฎการปัดเศษครั้งสุดท้าย
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                สัดส่วนการจ่ายเงินสด (Payout Percentage %)
              </label>
              <input
                type="number"
                value={payoutPercentage}
                onChange={(e) => setPayoutPercentage(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-slate-200 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                เช่น 75 หมายถึงจ่าย 75% ของมูลค่าประเมินเครื่อง (Estimated Device Value)
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">กฎการปัดเศษครั้งสุดท้าย (Rounding Rule)</label>
              <select
                value={roundingRule}
                onChange={(e) => setRoundingRule(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="ROUND_DOWN_100">ปัดเศษลงเป็นหลักร้อย (Round Down to Nearest 100)</option>
                <option value="ROUND_NEAREST_100">ปัดเศษใกล้เคียงหลักร้อย (Round to Nearest 100)</option>
                <option value="EXACT">ราคาจริงตามคำนวณ (Exact)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSavePolicy}
              className="w-full h-10 bg-[#007ACC] hover:bg-[#0061A3] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Save size={14} />
              <span>บันทึกการตั้งค่าระบบ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
