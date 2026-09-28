'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, Shield, Globe, Phone, Palette } from 'lucide-react';
import {
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
  SITE_SETTINGS_STORAGE_KEY,
} from '@/lib/siteSettings';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SITE_SETTINGS, ...JSON.parse(stored) });
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(new Event('meepro_site_settings_updated'));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      //
    }
  };

  const handleReset = () => {
    if (confirm('ต้องการรีเซ็ตการตั้งค่ากลับเป็นค่าตั้งต้น?')) {
      setSettings(DEFAULT_SITE_SETTINGS);
      localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_SETTINGS));
      window.dispatchEvent(new Event('meepro_site_settings_updated'));
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

        {/* Login Page Customization */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#142B4A] flex items-center gap-2">
              <Palette size={16} className="text-[#007ACC]" />
              <span>ปรับแต่งสีหน้าเข้าสู่ระบบ (Login Page Colors & Theme)</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">แสดงผลแบบเรียลไทม์ที่หน้า /login</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="color"
                value={settings.loginPrimaryColor || settings.primaryColor || '#FF6E00'}
                onChange={(e) => setSettings({ ...settings, loginPrimaryColor: e.target.value })}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
              />
              <div>
                <label className="block text-xs font-bold text-slate-700">สีปุ่มขอรับรหัส OTP & MALL</label>
                <span className="text-xs font-mono text-slate-500">{settings.loginPrimaryColor || settings.primaryColor}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="color"
                value={settings.loginSecondaryColor || settings.secondaryColor || '#007ACC'}
                onChange={(e) => setSettings({ ...settings, loginSecondaryColor: e.target.value })}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
              />
              <div>
                <label className="block text-xs font-bold text-slate-700">สีปุ่มยืนยัน OTP & ลิงก์</label>
                <span className="text-xs font-mono text-slate-500">{settings.loginSecondaryColor || settings.secondaryColor}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="color"
                value={settings.loginBgColor || '#F8FAFC'}
                onChange={(e) => setSettings({ ...settings, loginBgColor: e.target.value })}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300"
              />
              <div>
                <label className="block text-xs font-bold text-slate-700">สีพื้นหลังหน้า Login</label>
                <span className="text-xs font-mono text-slate-500">{settings.loginBgColor || '#F8FAFC'}</span>
              </div>
            </div>
          </div>

          {/* Quick Color Presets */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-600 block mb-2">ชุดสีแนะนำ (Quick Presets):</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    loginPrimaryColor: '#FF6E00',
                    loginSecondaryColor: '#007ACC',
                    loginBgColor: '#F8FAFC',
                  })
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-[#FF6E00] border border-orange-200 hover:bg-orange-100 flex items-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6E00]" />
                <span>MeePro Classic</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    loginPrimaryColor: '#4F46E5',
                    loginSecondaryColor: '#0284C7',
                    loginBgColor: '#F8FAFC',
                  })
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
                <span>Royal Indigo</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    loginPrimaryColor: '#059669',
                    loginSecondaryColor: '#0F172A',
                    loginBgColor: '#F0FDF4',
                  })
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                <span>Emerald Forest</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setSettings({
                    ...settings,
                    loginPrimaryColor: '#E11D48',
                    loginSecondaryColor: '#FF6E00',
                    loginBgColor: '#FFF1F2',
                  })
                }
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
                <span>Sunset Ruby</span>
              </button>
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
