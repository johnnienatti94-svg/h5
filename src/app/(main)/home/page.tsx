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
    const load = () => {
      const loaded = getHomepageWidgets();
      setWidgets(loaded);
      setIsLoaded(true);
    };
    load();

    const handleUpdate = () => load();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('meepro_widgets_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('meepro_widgets_updated', handleUpdate);
    };
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
    <div className="page-enter w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24">
      {/* 1. Segmented Service Switch (สวิตช์เลือกบริการ - Stitch Screen 06 & 07) */}
      <section aria-label="สวิตช์เลือกบริการ" className="w-full max-w-2xl mx-auto mb-3">
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


