'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Shield, Globe, Phone, Palette } from 'lucide-react';

interface SiteSettings {
  brandName: string;
  logoUrl: string;
  hotline: string;
  lineOfficialId: string;
  facebookUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  primaryColor: string;
  secondaryColor: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'MeePro (มีโปรโฟน)',
  logoUrl: '/logo.jpg',
  hotline: '02-000-0000',
  lineOfficialId: '@meepro',
  facebookUrl: 'https://facebook.com/meeprooficial',
  defaultSeoTitle: 'MeePro — ผ่อนสมาร์ตโฟน 0% ดอกเบี้ยพิเศษ อนุมัติไวใน 3 นาที',
  defaultSeoDescription:
    'บริการผ่อนมือถือและแกดเจ็ตแท้ศูนย์ไทย ไม่ต้องมีบัตรเครดิต 45 สาขาทั่วประเทศ พร้อมบริการ Trade-in แลกเครื่องเก่าเป็นเงินสด',
  primaryColor: '#FF6E00',
  secondaryColor: '#142B4A',
};

const STORAGE_KEY = 'meepro_site_settings_v1';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      //
    }
  };

  const handleReset = () => {
    if (confirm('ต้องการรีเซ็ตการตั้งค่ากลับเป็นค่าตั้งต้น?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#142B4A]">ตั้งค่าเว็บไซต์ (Site Settings)</h1>
          <p className="text-sm text-slate-500 mt-1">
            ข้อมูลแบรนด์ โลโก้ ข้อมูลติดต่อ โทเค็นสี และค่า SEO เริ่มต้นตามข้อกำหนด Section 11
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          ✅ บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Identity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
            <Globe size={16} className="text-[#FF6E00]" />
            <span>ข้อมูลแบรนด์ & โลโก้ (Brand & Identity)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อแบรนด์ / ร้านค้า</label>
              <input
                type="text"
                value={settings.brandName}
                onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL โลโก้</label>
              <input
                type="text"
                value={settings.logoUrl}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
              />
            </div>
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
            <Phone size={16} className="text-[#FF6E00]" />
            <span>ช่องทางการติดต่อ (Contact & Support)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">เบอร์คอลเซ็นเตอร์ Hotline</label>
              <input
                type="text"
                value={settings.hotline}
                onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">LINE Official ID</label>
              <input
                type="text"
                value={settings.lineOfficialId}
                onChange={(e) => setSettings({ ...settings, lineOfficialId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Page URL</label>
              <input
                type="text"
                value={settings.facebookUrl}
                onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
              />
            </div>
          </div>
        </div>

        {/* SEO Defaults */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
            <Shield size={16} className="text-[#FF6E00]" />
            <span>ค่าเริ่มต้น SEO (Search Engine Optimization)</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Default Meta Title</label>
            <input
              type="text"
              value={settings.defaultSeoTitle}
              onChange={(e) => setSettings({ ...settings, defaultSeoTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Default Meta Description</label>
            <textarea
              rows={3}
              value={settings.defaultSeoDescription}
              onChange={(e) => setSettings({ ...settings, defaultSeoDescription: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#FF6E00]"
            />
          </div>
        </div>

        {/* Design System Tokens */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
            <Palette size={16} className="text-[#FF6E00]" />
            <span>โทเค็นสีประจำแบรนด์ (MeePro Palette)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
              />
              <div>
                <label className="block text-xs font-bold text-slate-700">สีหลัก MeePro Orange</label>
                <span className="text-xs font-mono text-slate-500">{settings.primaryColor}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
              />
              <div>
                <label className="block text-xs font-bold text-slate-700">สีกรมท่า MeePro Navy</label>
                <span className="text-xs font-mono text-slate-500">{settings.secondaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={14} />
            <span>คืนค่าตั้งต้น</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6E00] text-white font-bold text-xs hover:bg-[#e06100] transition-colors shadow-xs"
          >
            <Save size={15} />
            <span>บันทึกการตั้งค่า</span>
          </button>
        </div>
      </form>
    </div>
  );
}
