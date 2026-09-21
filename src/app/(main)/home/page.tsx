'use client';

import React, { useState, useEffect } from 'react';
import { AnyWidget } from '@/types/widget';
import {
  getHomepageWidgets,
  saveHomepageWidgets,
  resetHomepageWidgets,
} from '@/lib/homepageWidgets';
import WidgetRenderer from '@/components/home/WidgetRenderer';
import WidgetQuickManagerModal from '@/components/home/WidgetQuickManagerModal';

export default function HomePage() {
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
        <div className="skeleton" style={{ height: '70px', width: '100%' }} />
        <div className="skeleton" style={{ height: '140px', width: '100%' }} />
        <div className="skeleton" style={{ height: '100px', width: '100%' }} />
        <div className="skeleton" style={{ height: '220px', width: '100%' }} />
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ paddingTop: 'var(--space-3)' }}>
      {/* Dynamic Widget Engine Renderer (Spec Sec 9, 11, 12, 13) */}
      <WidgetRenderer widgets={widgets} />

      {/* Floating Widget Quick Manager / Homepage Builder Preview (Spec Sec 14) */}
      <WidgetQuickManagerModal
        widgets={widgets}
        onUpdateWidgets={handleUpdateWidgets}
        onResetWidgets={handleResetWidgets}
      />
    </div>
  );
}
