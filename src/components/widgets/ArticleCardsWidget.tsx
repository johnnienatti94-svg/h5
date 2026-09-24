'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

interface ArticleItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  readTimeMinutes: number;
  publishedDate: string;
  imageUrl?: string;
  slug: string;
}

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      title?: string;
      subtitle?: string;
      articles?: ArticleItem[];
      viewAllHref?: string;
    };
  };
}

const DEFAULT_ARTICLES: ArticleItem[] = [
  {
    id: 'art-1',
    title: 'เทคนิคคำนวณค่างวดผ่อนมือถือ 0% ให้เหมาะกับเงินเดือน',
    summary: 'วางแผนการผ่อนชำระแบบชาญฉลาด ไม่ให้กระทบสภาพคล่อง พร้อมวิธีเลือกแพ็กเกจดอกเบี้ยต่ำสุด',
    category: 'การเงิน & ผ่อนชำระ',
    readTimeMinutes: 4,
    publishedDate: '24 ก.ย. 2026',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e55722c0?auto=format&fit=crop&w=600&q=80',
    slug: 'installment-tips-2026',
  },
  {
    id: 'art-2',
    title: 'เปรียบเทียบ iPhone 16 Pro vs Galaxy S25 รุ่นไหนคุ้มกว่ากัน',
    summary: 'เจาะลึกฟีเจอร์เด่น แบตเตอรี่ กล้องถ่ายรูป และข้อเสนอพิเศษจาก MeePro ผ่อน 0% นาน 10 เดือน',
    category: 'รีวิว & ข่าวสาร',
    readTimeMinutes: 5,
    publishedDate: '22 ก.ย. 2026',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    slug: 'compare-iphone16-galaxys25',
  },
  {
    id: 'art-3',
    title: 'เอกสารที่ต้องเตรียมและข้อควรรู้ก่อนสมัครผ่อนเครื่องผ่าน MeePro',
    summary: 'ใช้เพียงบัตรประชาชน เบอร์โทรศัพท์ และยืนยันรหัส OTP ก็สามารถรับเครื่องที่สาขาได้ทันที',
    category: 'คู่มือการใช้งาน',
    readTimeMinutes: 3,
    publishedDate: '20 ก.ย. 2026',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    slug: 'how-to-apply-guide',
  },
];

export default function ArticleCardsWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const title = cfg.title || widget?.title || 'บทความและเคล็ดลับการผ่อนสมาร์ตโฟน';
  const subtitle = cfg.subtitle || 'สาระน่ารู้เกี่ยวกับสเปกมือถือและการบริหารการเงิน';
  const articles = cfg.articles && cfg.articles.length > 0 ? cfg.articles : DEFAULT_ARTICLES;
  const viewAllHref = cfg.viewAllHref || '/services';

  return (
    <section aria-label={title} className="w-full my-6 p-4 sm:p-6 bg-white rounded-3xl border border-[#E2E8F0] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6E00] uppercase tracking-wider mb-1">
            <BookOpen size={16} />
            <span>MeePro Knowledge</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#142B4A]">{title}</h2>
          <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>
        </div>
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6E00] hover:text-[#e06100] transition-colors"
        >
          <span>ดูบทความทั้งหมด</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {articles.map((art) => (
          <article
            key={art.id}
            className="flex flex-col bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow group"
          >
            {art.imageUrl && (
              <div className="w-full h-44 overflow-hidden bg-slate-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-[#142B4A]/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                  {art.category}
                </span>
              </div>
            )}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-[#94A3B8] mb-2">
                  <Calendar size={13} />
                  <span>{art.publishedDate}</span>
                  <span>•</span>
                  <span>อ่าน {art.readTimeMinutes} นาที</span>
                </div>
                <h3 className="text-base font-bold text-[#142B4A] group-hover:text-[#FF6E00] transition-colors line-clamp-2 mb-2">
                  {art.title}
                </h3>
                <p className="text-xs text-[#64748B] line-clamp-3 leading-relaxed mb-4">
                  {art.summary}
                </p>
              </div>

              <Link
                href={`/services?article=${art.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142B4A] group-hover:text-[#FF6E00] transition-colors"
              >
                <span>อ่านต่อ</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
