'use client';

import React from 'react';
import Link from 'next/link';

interface Props {
  widget: {
    id: string;
    config?: {
      label?: string;
      href?: string;
      variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
      size?: 'sm' | 'md' | 'lg';
    };
  };
}

export default function CtaButtonWidget({ widget }: Props) {
  const cfg = widget.config || {};
  const label = cfg.label || 'ดูสินค้าโปรโมชั่นทั้งหมด';
  const href = cfg.href || '/catalog';
  const variant = cfg.variant || 'primary';
  const size = cfg.size || 'md';

  const variantStyles = {
    primary: 'bg-[#007ACC] hover:bg-[#0061A3] text-white shadow-sm',
    secondary: 'bg-[#FF6E00] hover:bg-[#E05F00] text-white shadow-sm',
    outline: 'bg-white hover:bg-slate-50 text-[#0F172A] border border-[#CBD5E1]',
    destructive: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
  }[variant];

  const sizeStyles = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 px-6 text-sm',
    lg: 'h-13 px-8 text-base',
  }[size];

  return (
    <div className="w-full my-3 px-1 flex justify-center">
      <Link
        href={href}
        className={`w-full max-w-md inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-98 ${variantStyles} ${sizeStyles}`}
      >
        <span>{label}</span>
        <span className="material-symbols-outlined text-[18px] ml-2">arrow_forward</span>
      </Link>
    </div>
  );
}
