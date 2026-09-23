'use client';

import React, { useState } from 'react';

interface Props {
  widget: {
    id: string;
    title?: string;
    subtitle?: string;
    config?: {
      videoUrl?: string;
      thumbnailUrl?: string;
      caption?: string;
    };
  };
}

export default function VideoPlayerWidget({ widget }: Props) {
  const cfg = widget.config || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const videoUrl = cfg.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  const thumbnailUrl =
    cfg.thumbnailUrl ||
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000&auto=format&fit=crop&q=80';
  const caption = cfg.caption || 'รีวิวแกะกล่องสมาร์ตโฟนรุ่นใหม่ล่าสุดจากทีมงาน MeePro';

  return (
    <div className="w-full my-4">
      {widget.title && (
        <div className="mb-2 px-1">
          <h2 className="text-base font-bold text-[#0F172A]">{widget.title}</h2>
          {widget.subtitle && <p className="text-xs text-[#64748B] mt-0.5">{widget.subtitle}</p>}
        </div>
      )}

      <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0] bg-slate-950">
        {!isPlaying ? (
          <div
            className="absolute inset-0 bg-cover bg-center cursor-pointer flex items-center justify-center group"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
            onClick={() => setIsPlaying(true)}
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-[#007ACC] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[36px] ml-1">play_arrow</span>
            </div>
          </div>
        ) : (
          <iframe
            src={`${videoUrl}?autoplay=1`}
            title="Video player"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {caption && (
        <p className="text-xs text-[#64748B] mt-2 px-1 italic">
          {caption}
        </p>
      )}
    </div>
  );
}
