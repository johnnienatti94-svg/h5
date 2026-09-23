'use client';

import React from 'react';

interface Post {
  imageUrl: string;
  caption?: string;
  postUrl?: string;
}

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      platform?: 'instagram' | 'tiktok' | 'facebook';
      posts?: Post[];
    };
  };
}

const DEFAULT_POSTS: Post[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500&auto=format&fit=crop&q=80',
    caption: 'แกะกล่อง iPhone 16 Pro Desert Titanium สีจริงสวยพรีเมียมมาก! #MeeProUnbox',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=80',
    caption: 'รับเครื่อง iPad Air ที่สาขาสยามพารากอน สะดวกและรวดเร็วสุดๆ #MeeProReview',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80',
    caption: 'Smartwatch คู่ใจสำหรับสายสุขภาพ ผ่อน 0% เบาๆ ทุกเดือน #MeeProLifestyle',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=80',
    caption: 'นำเครื่องเก่ามาเทรดได้ส่วนลดเพิ่ม คุ้มจริงไม่จกตา #MeeProTradeIn',
  },
];

export default function SocialMediaFeedWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const posts = cfg.posts && cfg.posts.length > 0 ? cfg.posts : DEFAULT_POSTS;

  return (
    <div className="w-full my-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
            {widget?.title || 'รีวิวภาพถ่ายจริงจากลูกค้า #MeePro'}
          </h2>
          <p className="text-xs text-[#64748B]">ร่วมแชร์โมเมนต์ความสุขพร้อมแท็ก @meepro.th</p>
        </div>
        <span className="text-xs font-bold text-[#007ACC]">@meepro.th</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {posts.map((post, idx) => (
          <div
            key={idx}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-[#E2E8F0] shadow-xs"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${post.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white text-[11px] leading-tight">
              {post.caption}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
