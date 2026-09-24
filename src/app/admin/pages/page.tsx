'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  ExternalLink,
  History,
  Send,
  Calendar,
  CheckCircle,
  Clock,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import type { PageRecord, PageRevisionRecord } from '@/lib/cmsDb';

interface ExtendedPage extends PageRecord {
  current_revision?: number;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<ExtendedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<PageRevisionRecord[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [newPageModalOpen, setNewPageModalOpen] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState('');
  const [newPageName, setNewPageName] = useState('');

  const loadPages = async () => {
    try {
      const res = await fetch('/api/cms/pages');
      const data = await res.json();
      if (Array.isArray(data.pages)) {
        setPages(data.pages);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPages();
  }, []);

  const handlePublishNow = async (pageId: string) => {
    try {
      setStatusMessage('กำลังเผยแพร่หน้าเว็บ...');
      const res = await fetch(`/api/cms/pages/${pageId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Manual publish from Admin Pages manager' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`✅ เผยแพร่สำเร็จ (Revision #${data.revision?.revision_number || 'OK'})`);
        void loadPages();
      } else {
        setStatusMessage(`❌ ไม่สามารถเผยแพร่ได้: ${data.message || data.error}`);
      }
    } catch (e: any) {
      setStatusMessage(`❌ เกิดข้อผิดพลาด: ${e.message}`);
    }
  };

  const handleOpenRevisions = async (pageId: string) => {
    setSelectedPageId(pageId);
    setLoadingRevisions(true);
    try {
      const res = await fetch(`/api/cms/pages/${pageId}/revisions`);
      const data = await res.json();
      setRevisions(data.revisions || []);
    } catch {
      setRevisions([]);
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleRestore = async (pageId: string, revisionId: string) => {
    try {
      setStatusMessage('กำลังกู้คืนเวอร์ชัน...');
      const res = await fetch(`/api/cms/pages/${pageId}/revisions/${revisionId}/restore`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`✅ กู้คืนเป็นแบบร่างใหม่สำเร็จ (Draft Revision #${data.newRevisionNumber})`);
        void loadPages();
        setSelectedPageId(null);
      } else {
        setStatusMessage(`❌ ไม่สามารถกู้คืนได้: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMessage(`❌ เกิดข้อผิดพลาด: ${e.message}`);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPageId || !scheduledTime) return;

    try {
      const res = await fetch(`/api/cms/pages/${selectedPageId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAtUtc: new Date(scheduledTime).toISOString() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`✅ บันทึกการตั้งเวลาสำเร็จ (Job ID: ${data.job.id})`);
        setScheduleModalOpen(false);
      } else {
        setStatusMessage(`❌ ไม่สามารถตั้งเวลาได้: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMessage(`❌ เกิดข้อผิดพลาด: ${e.message}`);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageSlug || !newPageName) return;

    try {
      const res = await fetch('/api/cms/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: newPageSlug, name: newPageName }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage('✅ สร้างหน้าเว็บใหม่สำเร็จ');
        setNewPageModalOpen(false);
        setNewPageSlug('');
        setNewPageName('');
        void loadPages();
      } else {
        setStatusMessage(`❌ ไม่สามารถสร้างหน้าเว็บได้: ${data.error}`);
      }
    } catch (e: any) {
      setStatusMessage(`❌ เกิดข้อผิดพลาด: ${e.message}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#142B4A]">จัดการหน้าเว็บ (CMS Pages)</h1>
          <p className="text-sm text-slate-500 mt-1">
            ควบคุมสถานะหน้าเว็บ แบบร่าง (Draft), การเผยแพร่ (Publish), การตั้งเวลา และประวัติเวอร์ชัน
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNewPageModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6E00] text-white font-bold text-sm hover:bg-[#e06100] transition-colors shadow-xs"
        >
          <Plus size={18} />
          <span>สร้างหน้าเว็บใหม่</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-blue-500 font-bold hover:underline"
          >
            ปิด
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">ชื่อหน้าเว็บ</th>
                <th className="py-3.5 px-4">Slug เส้นทาง</th>
                <th className="py-3.5 px-4">สถานะ</th>
                <th className="py-3.5 px-4">เวอร์ชัน / แก้ไขล่าสุด</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 font-bold text-[#142B4A] flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6E00] flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <span>{p.name}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-slate-500">/{p.slug}</td>
                  <td className="py-4 px-4">
                    {p.status === 'published' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle size={13} />
                        เผยแพร่แล้ว
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <Clock size={13} />
                        ฉบับร่าง (Draft)
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500">
                    <div>Revision #{p.current_revision || 1}</div>
                    <div className="text-[11px] text-slate-400">
                      {p.updated_at ? new Date(p.updated_at).toLocaleString('th-TH') : '-'}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/page-builder?slug=${p.slug}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                      >
                        แก้ไขใน Builder
                      </Link>
                      <button
                        type="button"
                        onClick={() => handlePublishNow(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                      >
                        เผยแพร่
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPageId(p.id);
                          setScheduleModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                        title="ตั้งเวลาเผยแพร่"
                      >
                        <Calendar size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenRevisions(p.id)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                        title="ประวัติเวอร์ชัน"
                      >
                        <History size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Revisions History Drawer / Modal */}
      {selectedPageId && !scheduleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-[#142B4A] flex items-center gap-2">
                <History size={18} className="text-[#FF6E00]" />
                ประวัติเวอร์ชันและการย้อนกลับ (Revisions)
              </h2>
              <button
                type="button"
                onClick={() => setSelectedPageId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              {loadingRevisions ? (
                <div className="text-center py-8 text-xs text-slate-400">กำลังโหลดเวอร์ชัน...</div>
              ) : revisions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">ยังไม่มีบันทึกเวอร์ชันย้อนหลัง</div>
              ) : (
                revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#142B4A]">
                          เวอร์ชัน #{rev.revision_number}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(rev.created_at).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{rev.note || 'ไม่มีบันทึกข้อความ'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestore(selectedPageId, rev.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-[#142B4A] hover:bg-slate-100 transition-colors shadow-xs"
                    >
                      <RotateCcw size={13} />
                      กู้คืนแบบร่าง
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleScheduleSubmit}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-[#142B4A] flex items-center gap-2">
                <Calendar size={18} className="text-[#FF6E00]" />
                ตั้งเวลาเผยแพร่อัตโนมัติ
              </h2>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              ระบบจะทำการ Snapshot แบบร่างปัจจุบันไว้ และนำขึ้นแสดงผลในเวลาที่กำหนดโดยอัตโนมัติ
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                วันและเวลาที่ต้องการเผยแพร่ (เวลาท้องถิ่น)
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF6E00]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#FF6E00] text-white text-xs font-bold hover:bg-[#e06100]"
              >
                ยืนยันการตั้งเวลา
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Page Modal */}
      {newPageModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreatePage}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-[#142B4A] flex items-center gap-2">
                <Plus size={18} className="text-[#FF6E00]" />
                สร้างหน้าเว็บใหม่
              </h2>
              <button
                type="button"
                onClick={() => setNewPageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อหน้าเว็บ</label>
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                placeholder="เช่น แคมเปญ 10.10"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF6E00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Slug เส้นทาง URL</label>
              <input
                type="text"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder="เช่น campaign-10-10"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#FF6E00]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewPageModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#FF6E00] text-white text-xs font-bold hover:bg-[#e06100]"
              >
                สร้างหน้าเว็บ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
