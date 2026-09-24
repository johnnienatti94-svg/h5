'use client';

import React from 'react';
import { AnyWidget } from '@/types/widget';
import PageBlockRenderer from '@/components/cms/PageBlockRenderer';

interface Props {
  widgets: AnyWidget[];
  selectedWidgetId?: string | null;
  onSelectWidget?: (widgetId: string) => void;
  filterInactive?: boolean;
}

/**
 * Unified WidgetRenderer delegating directly to PageBlockRenderer
 * satisfying Section 11 requirement:
 * "Reuse the exact public section renderer in the editor; do not implement a separate lookalike preview that can diverge."
 */
export default function WidgetRenderer({
  widgets,
  selectedWidgetId,
  onSelectWidget,
  filterInactive = true,
}: Props) {
  return (
    <PageBlockRenderer
      widgets={widgets}
      selectedWidgetId={selectedWidgetId}
      onSelectWidget={onSelectWidget}
      filterInactive={filterInactive}
    />
  );
}
