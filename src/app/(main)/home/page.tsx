'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnyWidget } from '@/types/widget';
import { getHomepageWidgets } from '@/lib/homepageWidgets';
import WidgetRenderer from '@/components/home/WidgetRenderer';
import UsedPhonesView from '@/components/home/UsedPhonesView';
import TradeInView from '@/components/home/TradeInView';

type HomeTab = 'new' | 'used' | 'tradein';

function HomeContent() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab');
  const initialTab: HomeTab =
    rawTab === 'tradein'
      ? 'tradein'
      : rawTab === 'used' || rawTab === 'hand2'
      ? 'used'
      : 'new';

  const [activeTab, setActiveTab] = useState<HomeTab>(initialTab);
  const [widgets, setWidgets] = useState<AnyWidget[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentRawTab = searchParams.get('tab');
    if (currentRawTab === 'tradein') {
      setActiveTab('tradein');
    } else if (currentRawTab === 'used' || currentRawTab === 'hand2') {
      setActiveTab('used');
    } else if (currentRawTab === 'new' || currentRawTab === 'installment') {
      setActiveTab('new');
    }
  }, [searchParams]);

  const handleTabChange = (tab: HomeTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadWidgetsFromBackend = async () => {
      try {
        const res = await fetch('/api/cms/pages/home/widgets');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.widgets) && data.widgets.length > 0) {
            const mapped: AnyWidget[] = data.widgets.map((w: any) => ({
              id: w.id,
              type: (w.widget_type || w.type || '').toUpperCase() as any,
              title: w.title,
              subtitle: w.subtitle,
              sortOrder: w.sort_order ?? w.sortOrder,
              isActive: w.is_active ?? w.isActive ?? true,
              config: w.config || {},
              ...(w.config || {}),
            }));
            if (isMounted) {
              setWidgets(mapped);
              setIsLoaded(true);
              return;
            }
          }
        }
      } catch {
        // Fall back to default widgets
      }

      if (isMounted) {
        setWidgets(getHomepageWidgets());
        setIsLoaded(true);
      }
    };

    loadWidgetsFromBackend();

    const handleUpdate = () => loadWidgetsFromBackend();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('meepro_widgets_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('meepro_widgets_updated', handleUpdate);
    };
  }, []);

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
      {/* 1. Segmented Service Switch (สวิตช์เลือกบริการ 3 ตัวเลือก: 1.มือถือ มือ1  2.มือถือ มือ2  3.มือถือแลกเงิน) */}
      <section aria-label="สวิตช์เลือกบริการ" className="w-full max-w-2xl mx-auto mb-3">
        <div className="w-full h-12 bg-white rounded-xl border border-[#E2E8F0] p-1 flex items-center shadow-xs">
          <button
            type="button"
            id="tab-btn-new-phone"
            onClick={() => handleTabChange('new')}
            className={`flex-1 h-full rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center transition-all ${
              activeTab === 'new'
                ? 'bg-[#007ACC] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            มือถือ มือ1
          </button>
          <button
            type="button"
            id="tab-btn-used-phone"
            onClick={() => handleTabChange('used')}
            className={`flex-1 h-full rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center transition-all ${
              activeTab === 'used'
                ? 'bg-[#007ACC] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            มือถือ มือ2
          </button>
          <button
            type="button"
            id="tab-btn-tradein"
            onClick={() => handleTabChange('tradein')}
            className={`flex-1 h-full rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center transition-all ${
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
      {activeTab === 'new' ? (
        <WidgetRenderer widgets={widgets} />
      ) : activeTab === 'used' ? (
        <UsedPhonesView onSwitchToTradeIn={() => handleTabChange('tradein')} />
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
