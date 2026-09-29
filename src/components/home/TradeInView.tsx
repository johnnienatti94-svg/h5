'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Upload,
  FileCheck,
} from 'lucide-react';
import type {
  TradeInCategory,
  TradeInBrand,
  TradeInModel,
  TradeInStorageOption,
  TradeInColorOption,
  TradeInMarketVariantOption,
  TradeInDeviceConfiguration,
  AssessmentTopic,
  TradeInDeviceSelection,
  CustomerConditionAnswers,
  ValuationQuoteSnapshot,
} from '@/features/tradein/types';
import { calculateTradeInValuation } from '@/features/tradein/valuationEngine';
import { getAuthUser } from '@/lib/auth';

const STORAGE_DRAFT_KEY = 'meepro_tradein_customer_draft_v1';

export default function TradeInView() {
  const router = useRouter();

  // Catalog state
  const [categories, setCategories] = useState<TradeInCategory[]>([]);
  const [brands, setBrands] = useState<TradeInBrand[]>([]);
  const [models, setModels] = useState<TradeInModel[]>([]);
  const [storages, setStorages] = useState<TradeInStorageOption[]>([]);
  const [colors, setColors] = useState<TradeInColorOption[]>([]);
  const [marketVariants, setMarketVariants] = useState<TradeInMarketVariantOption[]>([]);
  const [configurations, setConfigurations] = useState<TradeInDeviceConfiguration[]>([]);
  const [assessmentTopics, setAssessmentTopics] = useState<AssessmentTopic[]>([]);
  const [payoutPercentage, setPayoutPercentage] = useState(75);
  const [roundingRule, setRoundingRule] = useState<'ROUND_DOWN_100' | 'ROUND_NEAREST_100' | 'EXACT'>('ROUND_DOWN_100');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Flow Step: 1 = 6-Field Selection, 2 = Condition Assessment, 3 = Quote Breakdown, 4 = Booking & Submit
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);

  // 1. Six Fields Selection (Storage Only for Step 4)
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');
  const [selectedStorageId, setSelectedStorageId] = useState('');
  const [selectedColorId, setSelectedColorId] = useState('');
  const [selectedMarketVariantId, setSelectedMarketVariantId] = useState('');

  // 2. Condition Assessment Answers
  const [conditionAnswers, setConditionAnswers] = useState<CustomerConditionAnswers>({
    battery: 'bat-90-100',
    accessories: 'acc-box-complete',
    warranty: 'war-over-4m',
    body_condition: 'body-none',
    screen_surface: 'screen-none',
    display: ['disp-normal'],
    functional_issues: ['func-none'],
    repair_history: 'rep-never',
    damage_history: ['dmg-neither'],
    account_lock: 'lock-removed',
    ownership: 'own-confirmed',
  });

  // 3. Calculated Quote Snapshot
  const [quote, setQuote] = useState<ValuationQuoteSnapshot | null>(null);

  // 4. Booking and Customer Information
  const [customerName, setCustomerName] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('00000000-0000-4000-8000-000000000001');
  const [appointmentSlot, setAppointmentSlot] = useState('');
  const [imeiOrSerial, setImeiOrSerial] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  // Evidence file upload simulation/tracking
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ type: string; fileName: string; storagePath: string }>>([]);

  // Fetch catalog & topics on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [catRes, topRes] = await Promise.all([
          fetch('/api/tradein/catalog'),
          fetch('/api/tradein/assessment-topics'),
        ]);

        const catData = await catRes.json();
        const topData = await topRes.json();

        if (mounted && catData.success) {
          setCategories(catData.categories || []);
          setBrands(catData.brands || []);
          setModels(catData.models || []);
          setStorages(catData.storages || []);
          setColors(catData.colors || []);
          setMarketVariants(catData.marketVariants || []);
          setConfigurations(catData.configurations || []);
          setPayoutPercentage(catData.payoutPercentage || 75);
          setRoundingRule(catData.roundingRule || 'ROUND_DOWN_100');

          if (topData.success && Array.isArray(topData.topics)) {
            setAssessmentTopics(topData.topics);
          }

          // Set default initial selections if not set
          const firstCat = catData.categories[0]?.id || '';
          setSelectedCategoryId(firstCat);
          const firstBrand = (catData.brands as TradeInBrand[]).find((b) => b.categoryIds.includes(firstCat))?.id || catData.brands[0]?.id || '';
          setSelectedBrandId(firstBrand);
          const firstModel = (catData.models as TradeInModel[]).find((m) => m.brandId === firstBrand)?.id || catData.models[0]?.id || '';
          setSelectedModelId(firstModel);
          const firstStorage = catData.storages[0]?.id || '';
          setSelectedStorageId(firstStorage);
          const firstColor = catData.colors[0]?.id || '';
          setSelectedColorId(firstColor);
          const firstMarket = catData.marketVariants[0]?.id || '';
          setSelectedMarketVariantId(firstMarket);
        }
      } catch (err) {
        console.error('Failed to load trade-in catalog:', err);
      } finally {
        if (mounted) setIsLoadingCatalog(false);
      }
    }
    void loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Pre-fill customer phone if logged in
  useEffect(() => {
    getAuthUser().then((auth) => {
      if (auth && auth.phone) {
        setVerifiedPhone(auth.phone);
        if (auth.contactName) setCustomerName(auth.contactName);
      }
    });
  }, []);

  // Filtered Options based on dependencies
  const availableBrands = useMemo(() => {
    if (!selectedCategoryId) return brands;
    return brands.filter((b) => b.categoryIds.includes(selectedCategoryId));
  }, [brands, selectedCategoryId]);

  const availableModels = useMemo(() => {
    if (!selectedBrandId) return models;
    return models.filter((m) => m.brandId === selectedBrandId && (selectedCategoryId ? m.categoryId === selectedCategoryId : true));
  }, [models, selectedBrandId, selectedCategoryId]);

  const currentModel = useMemo(() => {
    return models.find((m) => m.id === selectedModelId) || availableModels[0];
  }, [models, selectedModelId, availableModels]);

  // Current configuration
  const currentConfiguration = useMemo(() => {
    return configurations.find(
      (c) =>
        c.modelId === selectedModelId &&
        c.storageOptionId === selectedStorageId &&
        c.colorOptionId === selectedColorId &&
        c.marketVariantOptionId === selectedMarketVariantId
    ) || null;
  }, [configurations, selectedModelId, selectedStorageId, selectedColorId, selectedMarketVariantId]);

  // Cascade clear incompatible downstream selections
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const validBrands = brands.filter((b) => b.categoryIds.includes(catId));
    const nextBrand = validBrands[0]?.id || '';
    setSelectedBrandId(nextBrand);

    const validModels = models.filter((m) => m.brandId === nextBrand && m.categoryId === catId);
    const nextModel = validModels[0]?.id || '';
    setSelectedModelId(nextModel);
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    const validModels = models.filter((m) => m.brandId === brandId && (selectedCategoryId ? m.categoryId === selectedCategoryId : true));
    setSelectedModelId(validModels[0]?.id || '');
  };

  // Perform server-authoritative valuation whenever step 3 is reached
  const runValuationCalculation = useCallback(async () => {
    if (!selectedModelId || !selectedStorageId) return;

    const selection: TradeInDeviceSelection = {
      categoryId: selectedCategoryId,
      brandId: selectedBrandId,
      modelId: selectedModelId,
      storageOptionId: selectedStorageId,
      colorOptionId: selectedColorId,
      marketVariantOptionId: selectedMarketVariantId,
      condition: 'USED', // Mandatorily USED
    };

    try {
      const res = await fetch('/api/tradein/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceSelection: selection,
          answers: conditionAnswers,
        }),
      });
      const data = await res.json();
      if (data.success && data.quote) {
        setQuote(data.quote);
      } else {
        // Fallback local engine calculation
        const fallbackQuote = calculateTradeInValuation(selection, currentConfiguration, conditionAnswers, {
          payoutPercentage,
          roundingRule,
          topics: assessmentTopics,
        });
        setQuote(fallbackQuote);
      }
    } catch {
      const fallbackQuote = calculateTradeInValuation(selection, currentConfiguration, conditionAnswers, {
        payoutPercentage,
        roundingRule,
        topics: assessmentTopics,
      });
      setQuote(fallbackQuote);
    }
  }, [
    selectedCategoryId,
    selectedBrandId,
    selectedModelId,
    selectedStorageId,
    selectedColorId,
    selectedMarketVariantId,
    conditionAnswers,
    currentConfiguration,
    payoutPercentage,
    roundingRule,
    assessmentTopics,
  ]);

  // Handle Multi-select with Exclusive Options ("No problems" & "Neither")
  const handleToggleMultiOption = (
    topicKey: 'display' | 'functional_issues' | 'damage_history',
    optionId: string,
    isExclusive: boolean
  ) => {
    setConditionAnswers((prev) => {
      const currentList: string[] = (prev[topicKey] as string[]) || [];

      if (isExclusive) {
        // Selecting an exclusive option clears all specific faults
        return { ...prev, [topicKey]: [optionId] };
      }

      // Selecting a specific fault removes any exclusive option
      const withoutExclusive = currentList.filter((id) => id !== 'func-none' && id !== 'disp-normal' && id !== 'dmg-neither' && id !== 'dmg-unknown');

      if (withoutExclusive.includes(optionId)) {
        const nextList = withoutExclusive.filter((id) => id !== optionId);
        // If empty, revert to exclusive default
        if (nextList.length === 0) {
          const fallbackExclusive = topicKey === 'functional_issues' ? 'func-none' : topicKey === 'display' ? 'disp-normal' : 'dmg-neither';
          return { ...prev, [topicKey]: [fallbackExclusive] };
        }
        return { ...prev, [topicKey]: nextList };
      } else {
        return { ...prev, [topicKey]: [...withoutExclusive, optionId] };
      }
    });
  };

  // Submit Application
  const handleSubmitApplication = async () => {
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const auth = await getAuthUser();
      if (!auth) {
        // Save draft and prompt login
        localStorage.setItem(
          STORAGE_DRAFT_KEY,
          JSON.stringify({
            selectedCategoryId,
            selectedBrandId,
            selectedModelId,
            selectedStorageId,
            selectedColorId,
            selectedMarketVariantId,
            conditionAnswers,
            customerName,
          })
        );
        router.push(`/login?redirect=${encodeURIComponent('/home?tab=tradein')}`);
        return;
      }

      if (!customerName.trim()) {
        setSubmitError('กรุณาระบุชื่อ-นามสกุลผู้ติดต่อ');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        idempotencyKey: `idemp-trd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        contactName: customerName.trim(),
        verifiedPhone: auth.phone,
        deviceSelection: {
          categoryId: selectedCategoryId,
          brandId: selectedBrandId,
          modelId: selectedModelId,
          storageOptionId: selectedStorageId,
          colorOptionId: selectedColorId,
          marketVariantOptionId: selectedMarketVariantId,
          condition: 'USED' as const,
        },
        declaredAnswers: conditionAnswers,
        quoteSnapshot: quote,
        imeiOrSerial: imeiOrSerial.trim() || undefined,
        branchId: selectedBranchId,
        appointmentStartsAt: appointmentSlot || new Date(Date.now() + 86400000).toISOString(),
        customerNote: customerNote.trim() || undefined,
        evidenceFiles: uploadedFiles,
      };

      const res = await fetch('/api/tradein/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการส่งใบสมัคร');
      }

      setSubmittedAppId(data.application?.id || null);
    } catch (err: any) {
      setSubmitError(err.message || 'เกิดข้อผิดพลาดในการส่งใบสมัคร');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCatalog) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#007ACC] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">กำลังโหลดระบบประเมินราคามือถือแลกเงิน...</p>
      </div>
    );
  }

  // Success Confirmation State
  if (submittedAppId) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">จองคิวนำเครื่องมาแลกเงินสำเร็จ!</h2>
          <p className="text-sm text-slate-600 mt-1">
            นำอุปกรณ์ของคุณพร้อมบัตรประชาชนมาตรวจสภาพรับเงินสดที่สาขาที่เลือกได้เลย
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl text-left border border-slate-200 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">อุปกรณ์:</span>
            <span className="font-semibold text-slate-800">
              {currentModel?.name} ({storages.find((s) => s.id === selectedStorageId)?.label})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ราคาประเมินเบื้องต้น:</span>
            <span className="font-bold text-[#007ACC]">฿{quote?.finalCashOfferMinor.toLocaleString()} บาท</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">สถานะ:</span>
            <span className="font-semibold text-emerald-600">นัดหมายตรวจสภาพแล้ว</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            href={`/trade-in/${submittedAppId}`}
            className="w-full h-11 bg-[#007ACC] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#0061A3] transition-all"
          >
            <span>ติดตามสถานะ & ดูข้อเสนอใบสมัคร</span>
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmittedAppId(null);
              setWizardStep(1);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1"
          >
            ประเมินเครื่องอื่นเพิ่มเติม
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-white via-[#F8F9FF] to-[#D1E4FF]/40 border border-[#E2E8F0] p-4 shadow-xs">
        <div className="relative z-10 flex flex-col justify-between max-w-[260px]">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF6E00]/10 text-[#FF6E00] text-[11px] font-bold mb-1.5 border border-[#FF6E00]/20">
              <Sparkles size={12} />
              <span>การันตีราคารับซื้อสูงสุด</span>
            </div>
            <h1 className="text-[20px] leading-[26px] text-[#0F172A] font-bold tracking-tight">
              มือถือแลกเงิน (Trade-in)
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              เปลี่ยนเครื่องเก่าเป็นเงินสด หรือเป็นส่วนลดเครื่องใหม่ ตรวจเครื่อง 5 นาที รับเงินทันที
            </p>
          </div>
        </div>
        <div className="absolute right-3 top-3 w-24 h-24 flex items-center justify-center opacity-85 pointer-events-none">
          <Smartphone size={72} className="text-[#007ACC]/50" />
        </div>
      </section>

      {/* 2. Step Progress Indicator */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
        <div className={`flex items-center gap-1.5 ${wizardStep >= 1 ? 'text-[#007ACC]' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${wizardStep >= 1 ? 'bg-[#007ACC] text-white' : 'bg-slate-100'}`}>
            1
          </span>
          <span>เลือกรุ่น</span>
        </div>
        <ChevronRight size={14} className="text-slate-300" />
        <div className={`flex items-center gap-1.5 ${wizardStep >= 2 ? 'text-[#007ACC]' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${wizardStep >= 2 ? 'bg-[#007ACC] text-white' : 'bg-slate-100'}`}>
            2
          </span>
          <span>สภาพเครื่อง</span>
        </div>
        <ChevronRight size={14} className="text-slate-300" />
        <div className={`flex items-center gap-1.5 ${wizardStep >= 3 ? 'text-[#007ACC]' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${wizardStep >= 3 ? 'bg-[#007ACC] text-white' : 'bg-slate-100'}`}>
            3
          </span>
          <span>สรุปราคา</span>
        </div>
        <ChevronRight size={14} className="text-slate-300" />
        <div className={`flex items-center gap-1.5 ${wizardStep >= 4 ? 'text-[#007ACC]' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${wizardStep >= 4 ? 'bg-[#007ACC] text-white' : 'bg-slate-100'}`}>
            4
          </span>
          <span>นัดหมาย</span>
        </div>
      </div>

      {/* STEP 1: 6-Field Device Selection */}
      {wizardStep === 1 && (
        <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#007ACC]" />
              <span>ระบุข้อมูลอุปกรณ์ที่ต้องการแลกเงิน (6 ขั้นตอน)</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ระบบรับซื้อเฉพาะเครื่องที่ใช้งานแล้ว (USED) เท่านั้น
            </p>
          </div>

          {/* 1. Category */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">1. หมวดหมู่อุปกรณ์</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center gap-2 ${
                    selectedCategoryId === cat.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone size={16} />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Brand */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">2. แบรนด์ (ยี่ห้อ)</label>
            <div className="grid grid-cols-3 gap-2">
              {availableBrands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleBrandChange(b.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    selectedBrandId === b.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Model */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">3. เลือกรุ่นสมาร์ตโฟน</label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:border-[#007ACC] focus:outline-none"
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Storage ONLY (No RAM/CPU per mandatory scope) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">4. ความจุ (Storage Only)</label>
              <span className="text-[10px] text-slate-400 font-medium">ความจุภายในเครื่อง</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {storages.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStorageId(s.id)}
                  className={`py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    selectedStorageId === s.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Color */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">5. สีตัวเครื่อง</label>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColorId(c.id)}
                  className={`p-2 rounded-xl text-xs font-semibold border text-left flex items-center gap-1.5 transition-all ${
                    selectedColorId === c.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: c.hexCode || '#ccc' }}
                  />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 6. Market Variant */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">6. โมเดลเครื่อง (Market Variant)</label>
            <div className="grid grid-cols-2 gap-2">
              {marketVariants.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMarketVariantId(m.id)}
                  className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                    selectedMarketVariantId === m.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold">{m.label}</p>
                  <p className="text-[10px] text-slate-500">{m.code === 'TH' ? 'ศูนย์ไทย ไม่หักราคา' : 'เครื่องนอก'}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Device Preview Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img
                src={currentModel?.imageUrl || '/placeholder.png'}
                alt={currentModel?.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-xs space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                สภาพมือสอง (USED)
              </span>
              <p className="font-bold text-slate-900 mt-1">{currentModel?.name}</p>
              <p className="text-slate-500 text-[11px]">
                {storages.find((s) => s.id === selectedStorageId)?.label} •{' '}
                {colors.find((c) => c.id === selectedColorId)?.name} •{' '}
                {marketVariants.find((m) => m.id === selectedMarketVariantId)?.code}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWizardStep(2)}
            className="w-full h-11 bg-[#007ACC] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0061A3] transition-all shadow-xs"
          >
            <span>ดำเนินการต่อ: ตรวจสอบสภาพเครื่อง</span>
            <ArrowRight size={14} />
          </button>
        </section>
      )}

      {/* STEP 2: Condition Assessment Questionnaire */}
      {wizardStep === 2 && (
        <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">ระบุสภาพเครื่องจริงของคุณ</h2>
              <p className="text-[11px] text-slate-500">ตอบตามสภาพจริงเพื่อรับราคาที่แม่นยำที่สุด</p>
            </div>
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="text-xs text-[#007ACC] flex items-center gap-0.5 font-semibold"
            >
              <ArrowLeft size={12} />
              <span>เปลี่ยนรุ่น</span>
            </button>
          </div>

          {/* 1. Battery */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">1. สุขภาพแบตเตอรี่ (Battery Health)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'bat-90-100', label: '90–100%' },
                { id: 'bat-80-89', label: '80–89%' },
                { id: 'bat-75-79', label: '75–79%' },
                { id: 'bat-below-75', label: 'ต่ำกว่า 75%' },
                { id: 'bat-unknown', label: 'ไม่ทราบ / ดูไม่ได้' },
                { id: 'bat-swollen', label: 'แบตเตอรี่บวม' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setConditionAnswers((prev) => ({ ...prev, battery: b.id }))}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    conditionAnswers.battery === b.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Accessories */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">2. กล่องและอุปกรณ์เสริม</label>
            <div className="space-y-1.5">
              {[
                { id: 'acc-box-complete', label: 'มีกล่อง และอุปกรณ์ครบชุด' },
                { id: 'acc-box-incomplete', label: 'มีกล่อง แต่อุปกรณ์ไม่ครบ' },
                { id: 'acc-nobox-complete', label: 'ไม่มีกล่อง แต่อุปกรณ์ครบ' },
                { id: 'acc-nobox-incomplete', label: 'ไม่มีกล่อง และอุปกรณ์ไม่ครบ (มีเฉพาะตัวเครื่อง)' },
              ].map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setConditionAnswers((prev) => ({ ...prev, accessories: a.id }))}
                  className={`w-full p-2.5 rounded-xl text-xs text-left border flex items-center justify-between transition-all ${
                    conditionAnswers.accessories === a.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{a.label}</span>
                  {conditionAnswers.accessories === a.id && <CheckCircle2 size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Warranty */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">3. ประกันศูนย์คงเหลือ</label>
            <div className="space-y-1.5">
              {[
                { id: 'war-over-4m', label: 'ประกันศูนย์คงเหลือมากกว่า 4 เดือน' },
                { id: 'war-under-4m', label: 'ประกันเหลือน้อยกว่า 4 เดือน หรือหมดประกันแล้ว' },
                { id: 'war-unknown', label: 'ไม่ทราบระยะเวลาประกัน' },
              ].map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setConditionAnswers((prev) => ({ ...prev, warranty: w.id }))}
                  className={`w-full p-2.5 rounded-xl text-xs text-left border flex items-center justify-between transition-all ${
                    conditionAnswers.warranty === w.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{w.label}</span>
                  {conditionAnswers.warranty === w.id && <CheckCircle2 size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Body Condition (Do not duplicate) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">4. สภาพตัวเครื่องและขอบข้าง</label>
            <div className="space-y-1.5">
              {[
                { id: 'body-none', label: 'ไม่มีรอยขีดข่วน (สวยเหมือนใหม่)' },
                { id: 'body-light', label: 'รอยขนแมวเล็กน้อยตามการใช้งาน' },
                { id: 'body-heavy', label: 'รอยถลอกลึก / สีลอก' },
                { id: 'body-dented', label: 'มีรอยตก / ขอบบุบ' },
                { id: 'body-cracked-bent', label: 'ตัวเครื่องแตก / ฝาหลังแตกร้าว / ตัวเครื่องงอ' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setConditionAnswers((prev) => ({ ...prev, body_condition: b.id }))}
                  className={`w-full p-2.5 rounded-xl text-xs text-left border flex items-center justify-between transition-all ${
                    conditionAnswers.body_condition === b.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{b.label}</span>
                  {conditionAnswers.body_condition === b.id && <CheckCircle2 size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Screen Surface */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">5. ผิวกระจกหน้าจอ</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'screen-none', label: 'ไม่มีรอยขีดข่วน' },
                { id: 'screen-light', label: 'รอยขนแมวบางๆ' },
                { id: 'screen-deep', label: 'รอยขูดลึก' },
                { id: 'screen-cracked', label: 'กระจกหน้าจอแตกร้าว' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setConditionAnswers((prev) => ({ ...prev, screen_surface: s.id }))}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    conditionAnswers.screen_surface === s.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Display Panel */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">6. การแสดงผลของหน้าจอ (เลือกได้หลายข้อ)</label>
            <div className="space-y-1.5">
              {[
                { id: 'disp-normal', label: 'แสดงผลปกติ ไม่มีจุดหรือเส้นผิดปกติ', isExclusive: true },
                { id: 'disp-lines', label: 'มีเส้นบนหน้าจอ (Line on display)', isExclusive: false },
                { id: 'disp-black-spots', label: 'มีจุดดำ / จอเบิร์น (Black spots)', isExclusive: false },
                { id: 'disp-failure', label: 'จอแสดงผลดับ / ภาพล้ม / สีกระพริบ', isExclusive: false },
              ].map((d) => {
                const isSelected = (conditionAnswers.display || []).includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleToggleMultiOption('display', d.id, d.isExclusive)}
                    className={`w-full p-2.5 rounded-xl text-xs text-left border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{d.label}</span>
                    {isSelected && <CheckCircle2 size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Functional Issues (Exclusive 'No problems') */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">7. การทำงานของฟังก์ชันภายในเครื่อง</label>
              <span className="text-[10px] text-slate-400">เลือกปัญหาที่พบ</span>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {[
                { id: 'func-none', label: 'ทำงานได้ปกติทุกฟังก์ชัน ไม่มีปัญหา', isExclusive: true },
                { id: 'func-touchscreen', label: 'ระบบสัมผัส (Touchscreen มีจุดทัชไม่ติด)', isExclusive: false },
                { id: 'func-wifi-bt-gps', label: 'Wi-Fi / Bluetooth / GPS ใช้งานไม่ได้', isExclusive: false },
                { id: 'func-cellular', label: 'สัญญาณโทรศัพท์ / สัญญาณเน็ตไม่เสถียร', isExclusive: false },
                { id: 'func-vibration', label: 'ระบบสั่นไม่ทำงาน', isExclusive: false },
                { id: 'func-biometric', label: 'สแกนใบหน้า (Face ID) หรือสแกนนิ้วมือไม่ได้', isExclusive: false },
                { id: 'func-buttons', label: 'ปุ่มกด (Power / เสียง) กดยากหรือไม่ติด', isExclusive: false },
                { id: 'func-audio', label: 'ลำโพง หรือไมโครโฟน เสียงแตก / ไม่ได้ยิน', isExclusive: false },
                { id: 'func-front-camera', label: 'กล้องหน้า ภาพมัว / สั่น', isExclusive: false },
                { id: 'func-rear-camera', label: 'กล้องหลัง ภาพมัว / เลนส์แตก', isExclusive: false },
                { id: 'func-charging-port', label: 'พอร์ตชาร์จหลวม / ชาร์จไม่เข้า', isExclusive: false },
              ].map((f) => {
                const isSelected = (conditionAnswers.functional_issues || []).includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleToggleMultiOption('functional_issues', f.id, f.isExclusive)}
                    className={`w-full p-2 rounded-xl text-xs text-left border flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{f.label}</span>
                    {isSelected && <CheckCircle2 size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8. Repair History */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">8. ประวัติการแกะซ่อมเครื่อง</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'rep-never', label: 'ไม่เคยซ่อม' },
                { id: 'rep-authorized', label: 'เคยซ่อมศูนย์ทางการ' },
                { id: 'rep-third-party', label: 'เคยซ่อมร้านนอก' },
                { id: 'rep-unknown', label: 'ไม่ทราบประวัติ' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setConditionAnswers((prev) => ({ ...prev, repair_history: r.id }))}
                  className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    conditionAnswers.repair_history === r.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* 9. Damage History (Exclusive 'Neither' & 'Unknown') */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">9. ประวัติความเสียหายหนัก</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'dmg-neither', label: 'ไม่เคยตกน้ำ / ไม่เคยซ่อมบอร์ด', isExclusive: true },
                { id: 'dmg-water', label: 'เคยตกน้ำ / มีความชื้น', isExclusive: false },
                { id: 'dmg-motherboard', label: 'เคยซ่อมเมนบอร์ด', isExclusive: false },
                { id: 'dmg-unknown', label: 'ไม่ทราบประวัติ', isExclusive: true },
              ].map((d) => {
                const isSelected = (conditionAnswers.damage_history || []).includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleToggleMultiOption('damage_history', d.id, d.isExclusive)}
                    className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                      isSelected
                        ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 10. Account Lock */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">10. บัญชี iCloud / Google Account</label>
            <div className="space-y-1.5">
              {[
                { id: 'lock-removed', label: 'ลงชื่อออก (Sign out) เรียบร้อยแล้ว' },
                { id: 'lock-can-remove', label: 'สามารถลงชื่อออกได้ก่อนส่งมอบเครื่อง' },
                { id: 'lock-cannot-remove', label: 'ไม่สามารถลงชื่อออกได้ (ติดล็อก iCloud/Google)' },
                { id: 'lock-unknown', label: 'ไม่แน่ใจสถานะบัญชี' },
              ].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setConditionAnswers((prev) => ({ ...prev, account_lock: l.id }))}
                  className={`w-full p-2.5 rounded-xl text-xs text-left border flex items-center justify-between transition-all ${
                    conditionAnswers.account_lock === l.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{l.label}</span>
                  {conditionAnswers.account_lock === l.id && <CheckCircle2 size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* 11. Ownership */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 block">11. การยืนยันความเป็นเจ้าของเครื่อง</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'own-confirmed', label: 'ข้าพเจ้ายืนยันว่าเป็นเจ้าของเครื่องอย่างถูกต้อง' },
                { id: 'own-needs-verification', label: 'จำเป็นต้องใช้เอกสารยืนยันสิทธิ์เพิ่มเติม' },
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setConditionAnswers((prev) => ({ ...prev, ownership: o.id }))}
                  className={`p-2.5 rounded-xl text-xs text-left border flex items-center justify-between transition-all ${
                    conditionAnswers.ownership === o.id
                      ? 'border-[#007ACC] bg-blue-50/70 text-[#007ACC] font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{o.label}</span>
                  {conditionAnswers.ownership === o.id && <CheckCircle2 size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="flex-1 h-11 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={async () => {
                await runValuationCalculation();
                setWizardStep(3);
              }}
              className="flex-2 h-11 bg-[#007ACC] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0061A3] transition-all shadow-xs"
            >
              <span>คำนวณราคาประเมิน</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: Quote Summary & Deduction Breakdown */}
      {wizardStep === 3 && quote && (
        <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-[15px] font-bold text-slate-900">สรุปราคาประเมินและค่าลดหย่อน</h2>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {quote.isManualAssessmentRequired ? 'ต้องตรวจสภาพเพิ่มเติม' : 'รับเงินสดทันที'}
            </span>
          </div>

          {/* Selected Device Banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center shrink-0">
              <img src={currentModel?.imageUrl || '/placeholder.png'} alt={currentModel?.name} className="w-full h-full object-contain" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-900">{currentModel?.name}</p>
              <p className="text-slate-500 text-[11px]">
                {storages.find((s) => s.id === selectedStorageId)?.label} •{' '}
                {colors.find((c) => c.id === selectedColorId)?.name} •{' '}
                {marketVariants.find((m) => m.id === selectedMarketVariantId)?.name}
              </p>
            </div>
          </div>

          {/* Calculation Breakdown Table */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">ราคาตั้งต้นรับซื้อคืน (Base Buyback):</span>
              <span className="font-bold text-slate-900">฿{quote.baseBuybackPriceMinor.toLocaleString()}</span>
            </div>

            {/* Deductions list */}
            {quote.deductions.length > 0 ? (
              <div className="space-y-1.5 py-1">
                <p className="font-semibold text-slate-700 text-[11px]">รายการลดหย่อนตามสภาพเครื่อง:</p>
                {quote.deductions.map((d, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-slate-600 pl-2">
                    <span className="truncate max-w-[220px]">
                      • {d.topicTitle}: {d.selectedOptionLabel}
                    </span>
                    <span className={d.isOverlapped ? 'text-slate-400 line-through' : 'font-semibold text-rose-600'}>
                      {d.isOverlapped ? '฿0 (รวมชุดซ่อม)' : `-฿${d.amountMinor.toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-1 text-[11px] text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>ตัวเครื่องอยู่ในสภาพสมบูรณ์ ไม่มีรายการหักลดหย่อน</span>
              </div>
            )}

            <div className="flex justify-between py-1.5 border-t border-slate-200 font-semibold text-slate-700">
              <span>มูลค่าประเมินตัวเครื่อง (Estimated Device Value):</span>
              <span>฿{quote.estimatedDeviceValueMinor.toLocaleString()}</span>
            </div>

            {/* Payout Policy */}
            <div className="flex justify-between py-1 text-[11px] text-slate-500">
              <span>นโยบายรับซื้อคืน ({quote.payoutPercentage}%):</span>
              <span>฿{Math.round(quote.unroundedCashOfferMinor).toLocaleString()}</span>
            </div>

            {quote.roundingAdjustmentMinor !== 0 && (
              <div className="flex justify-between py-1 text-[11px] text-slate-500">
                <span>การปัดเศษ (ปัดเศษลงหลักร้อย):</span>
                <span>฿{quote.roundingAdjustmentMinor.toLocaleString()}</span>
              </div>
            )}

            {/* Final Cash Offer */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-600 font-semibold">ยอดเงินสดที่ได้รับโดยประมาณ</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold text-[#007ACC]">
                    ฿{quote.finalCashOfferMinor.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-600 font-semibold">บาท</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-1 rounded-md">
                โอนเข้าบัญชีทันใจ
              </span>
            </div>
          </div>

          {/* Thai Disclaimer */}
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">“ราคาเบื้องต้น ขึ้นอยู่กับผลตรวจสภาพเครื่องจริง”</p>
              <p className="mt-0.5 text-[10px] text-amber-700">
                ราคาเสนอจริงอาจมีการปรับปรุงตามการตรวจสอบทางเทคนิคที่สาขา MeePro ใบเสนอราคานี้มีอายุ 7 วัน
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="flex-1 h-11 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              แก้ไขสภาพเครื่อง
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(4)}
              className="flex-2 h-11 bg-[#007ACC] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0061A3] transition-all shadow-xs"
            >
              <span>จองคิวนำเครื่องมาแลกเงิน</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}

      {/* STEP 4: Personal Info, Appointment, & Idempotent Submission */}
      {wizardStep === 4 && (
        <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">ข้อมูลการนัดหมายและส่งคำขอ</h2>
              <p className="text-[11px] text-slate-500">ขั้นตอนสุดท้ายเพื่อยืนยันคิวรับเงินสดที่สาขา</p>
            </div>
            <button
              type="button"
              onClick={() => setWizardStep(3)}
              className="text-xs text-[#007ACC] font-semibold"
            >
              ดูสรุปราคา
            </button>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">ชื่อ-นามสกุล (ตรงตามบัตรประชาชน)</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:border-[#007ACC] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">เบอร์โทรศัพท์ที่ติดต่อได้ (รับ OTP)</label>
              <input
                type="tel"
                value={verifiedPhone}
                onChange={(e) => setVerifiedPhone(e.target.value)}
                placeholder="เช่น 0812345678"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:border-[#007ACC] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">หมายเลขประจำเครื่อง (IMEI หรือ Serial No.) (ถ้ามี)</label>
              <input
                type="text"
                value={imeiOrSerial}
                onChange={(e) => setImeiOrSerial(e.target.value)}
                placeholder="กด *#06# เพื่อตรวจสอบเลข IMEI 15 หลัก"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:border-[#007ACC] focus:outline-none"
              />
            </div>

            {/* Branch Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">เลือกสาขา MeePro ที่สะดวกนำเครื่องเข้าตรวจ</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:border-[#007ACC] focus:outline-none"
              >
                <option value="00000000-0000-4000-8000-000000000001">MeePro Flagship Store CentralWorld</option>
                <option value="00000000-0000-4000-8000-000000000002">MeePro Experience Store Siam Paragon</option>
                <option value="00000000-0000-4000-8000-000000000003">MeePro Store Mega Bangna</option>
              </select>
            </div>

            {/* Appointment Slot */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">วันและเวลาที่สะดวกนำเครื่องเข้าตรวจ</label>
              <input
                type="datetime-local"
                value={appointmentSlot}
                onChange={(e) => setAppointmentSlot(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:border-[#007ACC] focus:outline-none"
              />
            </div>

            {/* Note */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">หมายเหตุเพิ่มเติมถึงเจ้าหน้าที่ (ถ้ามี)</label>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                rows={2}
                placeholder="ระบุข้อความเพิ่มเติมหรือช่วงเวลาที่สะดวก"
                className="w-full p-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:border-[#007ACC] focus:outline-none"
              />
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600">
              <input
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 rounded text-[#007ACC] focus:ring-0"
              />
              <span>
                ข้าพเจ้ายืนยันว่าเป็นเจ้าของเครื่องโดยชอบด้วยกฎหมาย และยอมรับข้อตกลงการประเมินราคาและนโยบายความเป็นส่วนตัวของ MeePro
              </span>
            </label>
          </div>

          {submitError && (
            <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {submitError}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setWizardStep(3)}
              className="flex-1 h-11 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              disabled={isSubmitting || !termsAgreed}
              onClick={handleSubmitApplication}
              className="flex-2 h-11 bg-[#007ACC] hover:bg-[#0061A3] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              {isSubmitting ? (
                <span>กำลังบันทึกข้อมูล...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>ยืนยันการจองคิวแลกเงิน</span>
                </>
              )}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
