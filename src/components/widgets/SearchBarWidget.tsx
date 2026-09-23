'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  widget: {
    id: string;
    config?: {
      placeholder?: string;
      popularKeywords?: string[];
    };
  };
}

export default function SearchBarWidget({ widget }: Props) {
  const router = useRouter();
  const cfg = widget.config || {};
  const placeholder = cfg.placeholder || 'ค้นหาสมาร์ตโฟน, แท็บเล็ต, แกดเจ็ต...';
  const popularKeywords = cfg.popularKeywords || ['iPhone 16', 'iPad Pro', 'Galaxy S25', 'Xiaomi 15'];
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/catalog');
    }
  };

  const handleKeywordClick = (kw: string) => {
    setQuery(kw);
    router.push(`/catalog?q=${encodeURIComponent(kw)}`);
  };

  return (
    <div className="w-full my-3 px-1">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3 text-[#94A3B8] text-[20px] pointer-events-none">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-24 rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#0F172A] focus:outline-none focus:border-[#007ACC] focus:ring-2 focus:ring-[#007ACC]/15 shadow-xs transition-all"
        />
        <button
          type="submit"
          className="absolute right-1.5 h-8 px-4 bg-[#007ACC] hover:bg-[#0061A3] text-white rounded-lg text-xs font-bold transition-all shadow-xs"
        >
          ค้นหา
        </button>
      </form>

      {/* Popular Keyword Suggestions */}
      {popularKeywords.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider shrink-0">
            ยอดนิยม:
          </span>
          {popularKeywords.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => handleKeywordClick(kw)}
              className="text-[11px] font-semibold text-[#64748B] hover:text-[#007ACC] bg-[#F1F5F9] hover:bg-[#EFF6FF] px-2.5 py-0.5 rounded-full shrink-0 transition-all border border-[#E2E8F0]"
            >
              {kw}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
