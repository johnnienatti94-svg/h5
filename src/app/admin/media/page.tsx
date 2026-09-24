'use client';

import React, { useEffect, useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Maximize2,
} from 'lucide-react';
import type { MediaAssetRecord } from '@/lib/cmsDb';

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New media upload form state
  const [storagePath, setStoragePath] = useState('');
  const [altText, setAltText] = useState('');
  const [width, setWidth] = useState('1200');
  const [height, setHeight] = useState('800');
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [uploading, setUploading] = useState(false);

  const loadMedia = async () => {
    try {
      const res = await fetch('/api/cms/media');
      const data = await res.json();
      if (Array.isArray(data.assets)) {
        setAssets(data.assets);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMedia();
  }, []);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storagePath) return;

    setUploading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/cms/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storage_path: storagePath,
          public_url: storagePath,
          alt_text: altText,
          width: parseInt(width, 10) || undefined,
          height: parseInt(height, 10) || undefined,
          mime_type: mimeType,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ text: '✅ อัปโหลดและลงทะเบียนสื่อเรียบร้อยแล้ว', type: 'success' });
        setStoragePath('');
        setAltText('');
        void loadMedia();
      } else {
        setStatusMessage({ text: `❌ อัปโหลดไม่สำเร็จ: ${data.error}`, type: 'error' });
      }
    } catch (e: any) {
      setStatusMessage({ text: `❌ เกิดข้อผิดพลาด: ${e.message}`, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (assetId: string) => {
    if (!confirm('ยืนยันที่จะลบไฟล์สื่อนี้? หากไฟล์นี้ถูกใช้งานในหน้าเว็บที่เผยแพร่แล้ว ระบบจะปฏิเสธการลบ')) {
      return;
    }

    try {
      const res = await fetch(`/api/cms/media/${assetId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.status === 409 && data.error === 'MEDIA_IN_USE') {
        setStatusMessage({
          text: `⚠️ ไม่สามารถลบได้: ไฟล์สื่อนี้กำลังถูกใช้งานอยู่ในหน้าเว็บที่เผยแพร่ (${data.references?.join(', ') || 'Published pages'})`,
          type: 'error',
        });
      } else if (res.ok) {
        setStatusMessage({ text: '✅ ลบไฟล์สื่อเรียบร้อยแล้ว', type: 'success' });
        void loadMedia();
      } else {
        setStatusMessage({ text: `❌ ไม่สามารถลบได้: ${data.error}`, type: 'error' });
      }
    } catch (e: any) {
      setStatusMessage({ text: `❌ เกิดข้อผิดพลาด: ${e.message}`, type: 'error' });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#142B4A]">คลังสื่อ (Media Library)</h1>
          <p className="text-sm text-slate-500 mt-1">
            จัดการรูปภาพ แบนเนอร์ วิดีโอ พร้อมระบบป้องกันการลบไฟล์ที่ใช้งานอยู่ (Reference Protection)
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'error' && <AlertTriangle size={16} className="text-amber-600 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-500 hover:underline font-bold"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Upload Form Box */}
      <form
        onSubmit={handleUpload}
        className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4"
      >
        <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
          <Upload size={16} className="text-[#FF6E00]" />
          <span>ลงทะเบียน / อัปโหลดไฟล์สื่อใหม่</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">URL / ที่อยู่จัดเก็บไฟล์</label>
            <input
              type="text"
              value={storagePath}
              onChange={(e) => setStoragePath(e.target.value)}
              placeholder="https://images.unsplash.com/... หรือ /banners/deal.jpg"
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ข้อความ Alt Text</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="คำอธิบายรูปสำหรับผู้พิการและ SEO"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ประเภท MIME</label>
            <select
              value={mimeType}
              onChange={(e) => setMimeType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#FF6E00]"
            >
              <option value="image/jpeg">image/jpeg</option>
              <option value="image/png">image/png</option>
              <option value="image/webp">image/webp</option>
              <option value="video/mp4">video/mp4</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ความกว้าง (Width px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ความสูง (Height px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2 px-4 rounded-xl bg-[#142B4A] hover:bg-[#1E3A8A] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={14} />
              <span>{uploading ? 'กำลังบันทึก...' : 'บันทึกเข้าคลังสื่อ'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Grid of media assets */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
          ยังไม่มีไฟล์สื่อในคลัง
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="w-full h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {asset.mime_type?.startsWith('image') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.public_url || asset.storage_path}
                    alt={asset.alt_text || 'Media'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-1">
                    <ImageIcon size={32} />
                    <span className="text-[11px] font-mono">{asset.mime_type}</span>
                  </div>
                )}
                {asset.width && asset.height && (
                  <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                    {asset.width} × {asset.height}
                  </span>
                )}
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#142B4A] truncate" title={asset.alt_text || asset.id}>
                    {asset.alt_text || asset.id}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5" title={asset.storage_path}>
                    {asset.storage_path}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleCopy(asset.public_url || asset.storage_path, asset.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#007ACC] hover:underline"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check size={12} className="text-emerald-500" />
                        <span>คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>คัดลอก URL</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="ลบไฟล์สื่อ"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
