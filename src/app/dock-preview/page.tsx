'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Home,
  Flame,
  ShoppingBag,
  Store,
  User,
  Activity,
  Component,
  Mail,
  Package,
  ScrollText,
  SunMoon,
  Smartphone,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock';
import { GooeyDock, type GooeyDockItem } from '@/components/ui/gooey-dock';
import BottomNavDock, { DOCK_NAV_ITEMS } from '@/components/layout/BottomNavDock';
import BottomNav from '@/components/layout/BottomNav';
import { Volume2, VolumeX } from 'lucide-react';

export default function DockPreviewPage() {
  const [activeTab, setActiveTab] = useState('/home');
  const [previewMode, setPreviewMode] = useState<'comparison' | 'dock-only' | 'classic-only'>('comparison');
  const [dockStyle, setDockStyle] = useState<'gooey' | 'apple'>('gooey');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [magnification, setMagnification] = useState(70);
  const [distance, setDistance] = useState(120);
  const [panelHeight, setPanelHeight] = useState(60);
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-200 pb-28`}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6E00] to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Apple-Style Dock Integration Preview
                </h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-[#FF6E00] dark:bg-orange-950/60 dark:text-orange-400">
                  Ready to Replace
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluating dock.tsx in MeePro mobile e-commerce application
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <SunMoon className="w-4 h-4 text-[#FF6E00]" />
              <span>{themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
            <Link
              href="/home"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6E00] text-white text-xs font-medium hover:bg-[#E56200] transition shadow-sm"
            >
              <span>Go to App (/home)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">

        {/* Section 1: Interactive Control Panel */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#FF6E00]" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Live Dock Parameters Tuner
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setPreviewMode('comparison')}
                className={`px-3 py-1 rounded-lg font-medium transition ${previewMode === 'comparison' ? 'bg-white dark:bg-slate-700 text-[#FF6E00] shadow-sm' : 'text-slate-500'}`}
              >
                Comparison View
              </button>
              <button
                onClick={() => setPreviewMode('dock-only')}
                className={`px-3 py-1 rounded-lg font-medium transition ${previewMode === 'dock-only' ? 'bg-white dark:bg-slate-700 text-[#FF6E00] shadow-sm' : 'text-slate-500'}`}
              >
                New Dock Only
              </button>
              <button
                onClick={() => setPreviewMode('classic-only')}
                className={`px-3 py-1 rounded-lg font-medium transition ${previewMode === 'classic-only' ? 'bg-white dark:bg-slate-700 text-[#FF6E00] shadow-sm' : 'text-slate-500'}`}
              >
                Classic Bar Only
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="flex justify-between mb-1.5 font-medium">
                <span className="text-slate-700 dark:text-slate-300">Magnification</span>
                <span className="text-[#FF6E00] font-mono">{magnification}px</span>
              </div>
              <input
                type="range"
                min="48"
                max="100"
                value={magnification}
                onChange={(e) => setMagnification(Number(e.target.value))}
                className="w-full accent-[#FF6E00] cursor-pointer"
              />
              <p className="text-xs text-slate-400 mt-1">Recommended for mobile: 60-72px to prevent clipping</p>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 font-medium">
                <span className="text-slate-700 dark:text-slate-300">Influence Distance</span>
                <span className="text-[#FF6E00] font-mono">{distance}px</span>
              </div>
              <input
                type="range"
                min="60"
                max="200"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full accent-[#FF6E00] cursor-pointer"
              />
              <p className="text-xs text-slate-400 mt-1">Radius around cursor where icons scale</p>
            </div>

            <div>
              <div className="flex justify-between mb-1.5 font-medium">
                <span className="text-slate-700 dark:text-slate-300">Base Panel Height</span>
                <span className="text-[#FF6E00] font-mono">{panelHeight}px</span>
              </div>
              <input
                type="range"
                min="48"
                max="76"
                value={panelHeight}
                onChange={(e) => setPanelHeight(Number(e.target.value))}
                className="w-full accent-[#FF6E00] cursor-pointer"
              />
              <p className="text-xs text-slate-400 mt-1">Standard height before hover magnification</p>
            </div>
          </div>
        </section>

        {/* Section 2: Mobile Simulation View */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#FF6E00]" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Mobile Frame Preview (390px Device Simulation)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Phone Frame A: Current Classic Bottom Nav */}
            {(previewMode === 'comparison' || previewMode === 'classic-only') && (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Option A: Current Classic Bottom Navigation
                </span>
                <div className="w-[380px] h-[680px] bg-white dark:bg-slate-900 border-8 border-slate-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col relative">
                  {/* Phone notch */}
                  <div className="w-36 h-4 bg-slate-800 rounded-b-xl mx-auto z-30" />
                  
                  {/* Sample Mock App Content */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">MeePro Store</h3>
                        <p className="text-xs text-slate-500">สมาร์ทโฟน ผ่อน 0% ทุกรุ่น</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF6E00] flex items-center justify-center font-bold text-xs">
                        MP
                      </div>
                    </div>

                    <div className="h-28 rounded-2xl bg-gradient-to-r from-[#FF6E00] to-orange-400 p-4 text-white flex flex-col justify-end shadow-md">
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Hot Deal</span>
                      <h4 className="text-lg font-bold">iPhone 16 Pro Max</h4>
                      <p className="text-xs opacity-90">ผ่อน 0% นานสูงสุด 36 เดือน</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">
                            Product #{i}
                          </div>
                          <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-3 w-1/2 bg-orange-200 dark:bg-orange-950 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Classic Bottom Nav */}
                  <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <BottomNav />
                  </div>
                  {/* Phone Home Bar */}
                  <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-1.5" />
                </div>
              </div>
            )}

            {/* Phone Frame B: New Apple-Style Floating Dock */}
            {(previewMode === 'comparison' || previewMode === 'dock-only') && (
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-[#FF6E00] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Option B: Apple-Style Floating Dock Navigation
                </span>
                <div className="w-[380px] h-[680px] bg-white dark:bg-slate-900 border-8 border-slate-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col relative">
                  {/* Phone notch */}
                  <div className="w-36 h-4 bg-slate-800 rounded-b-xl mx-auto z-30" />

                  {/* Sample Mock App Content */}
                  <div className="flex-1 p-4 pb-24 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">MeePro Store</h3>
                        <p className="text-xs text-slate-500">สมาร์ทโฟน ผ่อน 0% ทุกรุ่น</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF6E00] flex items-center justify-center font-bold text-xs">
                        MP
                      </div>
                    </div>

                    <div className="h-28 rounded-2xl bg-gradient-to-r from-[#FF6E00] to-orange-400 p-4 text-white flex flex-col justify-end shadow-md">
                      <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Hot Deal</span>
                      <h4 className="text-lg font-bold">iPhone 16 Pro Max</h4>
                      <p className="text-xs opacity-90">ผ่อน 0% นานสูงสุด 36 เดือน</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">
                            Product #{i}
                          </div>
                          <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="h-3 w-1/2 bg-orange-200 dark:bg-orange-950 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating Dock inside phone frame - Powered by Ruixen UI GooeyDock */}
                  <div className="absolute bottom-3 left-2.5 right-2.5 z-30 flex justify-center pointer-events-auto">
                    {dockStyle === 'gooey' ? (
                      <GooeyDock
                        items={DOCK_NAV_ITEMS.map((item) => {
                          const Icon = item.icon;
                          const isCurrentActive = activeTab === item.href;
                          return {
                            id: item.id,
                            label: item.label,
                            active: isCurrentActive,
                            badge: item.badge,
                            onClick: () => setActiveTab(item.href),
                            icon: <Icon className="w-5 h-5" />,
                          };
                        })}
                        sound={soundEnabled}
                        fullWidth={true}
                        glowColor="lightblue"
                        className="w-full flex items-center justify-around px-2 rounded-2xl bg-[#E2E8F0]/95 backdrop-blur-xl border border-slate-300/90 shadow-[0_8px_30px_rgba(15,23,42,0.12)] dark:bg-[#CBD5E1]/95 dark:border-slate-400/80"
                      />
                    ) : (
                      <Dock
                        magnification={magnification}
                        distance={distance}
                        panelHeight={panelHeight}
                        className="w-full flex items-center justify-around px-2 rounded-2xl border transition-all bg-[#E2E8F0]/95 backdrop-blur-xl border-slate-300/90 shadow-[0_8px_30px_rgba(15,23,42,0.12)] dark:bg-[#CBD5E1]/95 dark:border-slate-400/80"
                      >
                        {DOCK_NAV_ITEMS.map((item) => {
                          const Icon = item.icon;
                          const isCurrentActive = activeTab === item.href;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setActiveTab(item.href)}
                              className="flex-1 flex justify-center items-center outline-none rounded-xl"
                              aria-label={item.label}
                            >
                              <DockItem
                                className={`aspect-square rounded-xl transition-all duration-200 relative flex items-center justify-center ${
                                  isCurrentActive
                                    ? 'bg-white/95 text-sky-500 font-semibold shadow-[0_0_16px_rgba(56,189,248,0.5)] border border-sky-300/80'
                                    : 'bg-white/50 hover:bg-white/80 text-slate-500 hover:text-sky-500 hover:shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                                }`}
                              >
                                <DockLabel className="bg-slate-900/95 text-sky-200 border-sky-400/30 font-medium text-[11px] shadow-[0_0_10px_rgba(56,189,248,0.25)] px-2 py-0.5">
                                  {item.label}
                                </DockLabel>

                                {item.badge && (
                                  <span className="absolute -top-1 -right-1 z-10 px-1.5 py-0.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white text-[9px] font-bold rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)] leading-tight animate-pulse">
                                    {item.badge}
                                  </span>
                                )}

                                <DockIcon className="flex items-center justify-center">
                                  <Icon
                                    className={`w-5 h-5 transition-all duration-200 ${
                                      isCurrentActive
                                        ? 'stroke-[2.5px] text-sky-500 [filter:drop-shadow(0_0_6px_#38BDF8)_drop-shadow(0_0_12px_rgba(56,189,248,0.75))]'
                                        : 'stroke-[1.8px] hover:[filter:drop-shadow(0_0_6px_#38BDF8)]'
                                    }`}
                                  />
                                </DockIcon>

                                {isCurrentActive && (
                                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38BDF8,0_0_14px_#0EA5E9]" />
                                )}
                              </DockItem>
                            </button>
                          );
                        })}
                      </Dock>
                    )}
                  </div>

                  {/* Phone Home Bar */}
                  <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-1.5 z-40" />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 2.5: Ruixen UI Gooey Dock Showcase */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                  21st.dev Component
                </span>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Ruixen UI: Gooey Dock (@ruixen.ui/gooey-dock)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Cosine falloff curve, Y-axis arch lifting, Web Audio proximity haptics, edge-to-edge light grey theme with lightblue neon glow.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                  soundEnabled
                    ? 'border-sky-300 bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => setDockStyle(dockStyle === 'gooey' ? 'apple' : 'gooey')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Switch Style: {dockStyle === 'gooey' ? 'Gooey Arch' : 'Apple Zoom'}</span>
              </button>
            </div>
          </div>

          <div className="py-12 bg-slate-100/70 dark:bg-slate-950 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[160px] px-4">
            <div className="w-full max-w-[480px]">
              <GooeyDock
                items={DOCK_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isCurrentActive = activeTab === item.href;
                  return {
                    id: item.id,
                    label: item.label,
                    active: isCurrentActive,
                    badge: item.badge,
                    onClick: () => setActiveTab(item.href),
                    icon: <Icon className="w-5 h-5" />,
                  };
                })}
                sound={soundEnabled}
                fullWidth={true}
                glowColor="lightblue"
                className="w-full bg-[#E2E8F0]/95 backdrop-blur-xl border border-slate-300/90 shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Original Demo Component Verification */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Original 7-Item Demo Dock (As Specified in Prompt)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hover over the dock below with your mouse to experience the full spring magnification effect:
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
              @/components/ui/dock-demo.tsx
            </span>
          </div>

          <div className="py-12 bg-slate-100 dark:bg-slate-950 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[160px]">
            <Dock
              magnification={magnification}
              distance={distance}
              panelHeight={panelHeight}
              className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2"
            >
              {[
                { title: 'Home', icon: Home, href: '#' },
                { title: 'Products', icon: Package, href: '#' },
                { title: 'Components', icon: Component, href: '#' },
                { title: 'Activity', icon: Activity, href: '#' },
                { title: 'Change Log', icon: ScrollText, href: '#' },
                { title: 'Email', icon: Mail, href: '#' },
                { title: 'Theme', icon: SunMoon, href: '#' },
              ].map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <DockItem
                    key={idx}
                    className="aspect-square rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 text-slate-700 dark:text-slate-200 hover:text-[#FF6E00] transition-colors"
                  >
                    <DockLabel className="bg-[#142B4A] text-white text-xs">{item.title}</DockLabel>
                    <DockIcon>
                      <ItemIcon className="w-5 h-5" />
                    </DockIcon>
                  </DockItem>
                );
              })}
            </Dock>
          </div>
        </section>

        {/* Section 4: Architecture & Prompt Inspection Report */}
        <section className="bg-slate-900 text-slate-100 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Prompt Inspection & Codebase Audit Findings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <h3 className="font-semibold text-amber-400">1. Codebase Structure & Conventions</h3>
              <ul className="space-y-2 text-slate-300 text-xs">
                <li>• <strong>shadcn Support:</strong> Initialized <code className="text-orange-300">components.json</code> with aliases mapped to <code className="text-orange-300">@/components/ui</code> and <code className="text-orange-300">@/lib/utils</code>.</li>
                <li>• <strong>Tailwind CSS:</strong> Active v4.3.3 using CSS-first <code className="text-orange-300">@theme</code> tokens in <code className="text-orange-300">globals.css</code>.</li>
                <li>• <strong>TypeScript:</strong> Fully configured with <code className="text-orange-300">@/*</code> path alias mapping to <code className="text-orange-300">./src/*</code>.</li>
                <li>• <strong>Default UI Path:</strong> UI primitives reside in <code className="text-orange-300">/src/components/ui</code>. This separates atomic un-opinionated primitives from domain pages.</li>
              </ul>
            </div>

            <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <h3 className="font-semibold text-emerald-400">2. Dependencies & React 19 Compatibility</h3>
              <ul className="space-y-2 text-slate-300 text-xs">
                <li>• <strong>framer-motion:</strong> Installed and active for spring physics & transforms.</li>
                <li>• <strong>lucide-react:</strong> Already present in the project (<code className="text-orange-300">^1.47.0</code>).</li>
                <li>• <strong>clsx + tailwind-merge:</strong> Installed; <code className="text-orange-300">cn()</code> updated in <code className="text-orange-300">src/lib/utils.ts</code>.</li>
                <li>• <strong>React 19 Note:</strong> Fixed <code className="text-orange-300">cloneElement</code> typing in <code className="text-orange-300">dock.tsx</code> where React 19 defaults element props to <code className="text-orange-300">unknown</code>.</li>
              </ul>
            </div>

            <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <h3 className="font-semibold text-sky-400">3. Mobile UX & Replacing BottomNav</h3>
              <ul className="space-y-2 text-slate-300 text-xs">
                <li>• <strong>Touch vs Hover:</strong> Apple Dock was conceived for macOS mouse hover. On mobile, we adapt dimensions (<code className="text-orange-300">magnification=66</code>, <code className="text-orange-300">distance=110</code>) so it fits without horizontal overflow.</li>
                <li>• <strong>Safe Area:</strong> Added <code className="text-orange-300">calc(10px + env(safe-area-inset-bottom))</code> to avoid colliding with iOS home indicator.</li>
                <li>• <strong>Active Route Dot:</strong> macOS-style illuminated dot underneath the active route (<code className="text-orange-300">/home</code>, <code className="text-orange-300">/promotions</code>, etc.).</li>
                <li>• <strong>Hot Promo Badge:</strong> Retained the animated HOT badge on the promotions tab.</li>
              </ul>
            </div>

            <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <h3 className="font-semibold text-purple-400">4. How to Activate in Production</h3>
              <p className="text-slate-300 text-xs">
                The replacement component has been created in <code className="text-orange-300">src/components/layout/BottomNavDock.tsx</code>.
                When ready to replace across the entire app, simply update one line in <code className="text-orange-300">src/app/(main)/layout.tsx</code>:
              </p>
              <pre className="bg-black/50 p-2.5 rounded-lg text-emerald-400 text-[11px] overflow-x-auto font-mono">
{`- import BottomNav from "@/components/layout/BottomNav";
+ import BottomNavDock from "@/components/layout/BottomNavDock";

- <BottomNav />
+ <BottomNavDock />`}
              </pre>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
