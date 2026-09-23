'use client';

import React from 'react';

interface Props {
  widget: {
    id: string;
    config?: {
      heightPx?: number;
      showDividerLine?: boolean;
    };
  };
}

export default function SpacerDividerWidget({ widget }: Props) {
  const cfg = widget.config || {};
  const height = cfg.heightPx || 24;
  const showLine = cfg.showDividerLine ?? false;

  return (
    <div
      style={{ height: `${height}px` }}
      className="w-full flex items-center justify-center"
      aria-hidden="true"
    >
      {showLine && <div className="w-full border-t border-[#E2E8F0]" />}
    </div>
  );
}
