'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnyWidget } from '@/types/widget';
import {
  getHomepageWidgets,
  saveHomepageWidgets,
  resetHomepageWidgets,
} from '@/lib/homepageWidgets';
import WidgetRenderer from '@/components/home/WidgetRenderer';
import WidgetQuickManagerModal from '@/components/home/WidgetQuickManagerModal';
import TradeInView from '@/components/home/TradeInView';

function HomeContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'tradein' ? 'tradein' : 'installment';
  const [activeTab, setActiveTab] = useState<'installment' | 'tradein'>(initialTab);
  const [widgets, setWidgets] = useState<AnyWidget[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = getHomepageWidgets();
    setWidgets(loaded);
    setIsLoaded(true);
  }, []);

  const handleUpdateWidgets = (updated: AnyWidget[]) => {
    setWidgets(updated);
    saveHomepageWidgets(updated);
  };

  const handleResetWidgets = () => {
    const defaultWidgets = resetHomepageWidgets();
    setWidgets(defaultWidgets);
  };

  if (!isLoaded) {
    return (
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="skeleton" style={{ height: '50px', width: '100%', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '140px', width: '100%', borderRadius: '16px' }} />
        <div className="skeleton" style={{ height: '100px', width: '100%', borderRadius: '16px' }} />
        <div className="skeleton" style={{ height: '220px', width: '100%', borderRadius: '16px' }} />
      </div>
    );
  }

  return (
    <div className="page-enter w-full max-w-[390px] mx-auto px-4 pt-3 pb-24">
      {/* 1. Segmented Service Switch (สวิตช์เลือกบริการ - Stitch Screen 06 & 07) */}
      <section aria-label="สวิตช์เลือกบริการ" className="w-full mb-3">
        <div className="w-full h-12 bg-white rounded-xl border border-[#E2E8F0] p-1 flex items-center shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('installment')}
            className={`flex-1 h-full rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
              activeTab === 'installment'
                ? 'bg-[#007ACC] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            ผ่อนมือถือ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tradein')}
            className={`flex-1 h-full rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
              activeTab === 'tradein'
                ? 'bg-[#007ACC] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            มือถือแลกเงิน
          </button>
        </div>
      </section>

      {/* 2. Tab Content */}
      {activeTab === 'installment' ? (
        <>
          {/* Quick Trust Banner from Stitch Screen 06 */}
          <section className="w-full bg-white rounded-xl border border-[#E2E8F0] p-3 flex items-center space-x-3 shadow-xs mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#007ACC] shrink-0">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#0F172A] leading-snug">
                ผ่อนสมาร์ตโฟนเครื่องใหม่ ดอกเบี้ยพิเศษ
              </p>
              <p className="text-[11px] text-[#16A365] font-medium flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                อนุมัติไวใน 3 นาที รู้ผลทันที
              </p>
            </div>
          </section>

          {/* Dynamic Widget Engine Renderer (Spec Sec 9, 11, 12, 13) */}
          <WidgetRenderer widgets={widgets} />

          {/* Floating Widget Quick Manager / Homepage Builder Preview */}
          <WidgetQuickManagerModal
            widgets={widgets}
            onUpdateWidgets={handleUpdateWidgets}
            onResetWidgets={handleResetWidgets}
          />
        </>
      ) : (
        <TradeInView />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="skeleton" style={{ height: '50px', width: '100%', borderRadius: '12px' }} />
          <div className="skeleton" style={{ height: '140px', width: '100%', borderRadius: '16px' }} />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}


