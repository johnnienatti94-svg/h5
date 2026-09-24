'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Tablet,
  Monitor,
  Plus,
  Save,
  Send,
  History,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  X,
  ExternalLink,
  RotateCcw,
  Sliders,
  Code2,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Layers,
  Tag,
} from 'lucide-react';
import { AnyWidget } from '@/types/widget';
import {
  getHomepageWidgets,
  saveHomepageWidgets,
  resetHomepageWidgets,
} from '@/lib/homepageWidgets';
import { WIDGET_CATALOG, WidgetCatalogItem } from '@/lib/widgetCatalogPresets';
import { validateWidgetConfig } from '@/lib/widgetSchemas';
import { ALL_PRODUCTS } from '@/lib/productsData';
import { supabase } from '@/lib/supabase';
import WidgetRenderer from '@/components/home/WidgetRenderer';
import styles from './VisualPageBuilder.module.css';

export const BANNER_IMAGE_PRESETS = [
  {
    name: '📱 iPhone 16 Pro',
    url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
    title: 'iPhone 16 Pro Max เปิดตัวแล้ววันนี้',
    tag: 'โปรเปิดตัวสุดเอ็กซ์คลูซีฟ',
    bgColor: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)',
  },
  {
    name: '⚡ Galaxy S25',
    url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80',
    title: 'Galaxy S25 Ultra รับส่วนลดสูงสุด ฿8,000',
    tag: 'Flash Deal ประจำสัปดาห์',
    bgColor: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #6366F1 100%)',
  },
  {
    name: '💻 MacBook Pro',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    title: 'แล็ปท็อป & แท็บเล็ต ผ่อน 0% ทุกรุ่น',
    tag: 'Back to School & Work',
    bgColor: 'linear-gradient(135deg, #064E3B 0%, #059669 50%, #10B981 100%)',
  },
  {
    name: '📲 iPad Air M2',
    url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80',
    title: 'iPad สำหรับการเรียนรู้และทำงาน',
    tag: 'ผ่อน 0% นาน 10 เดือน',
    bgColor: 'linear-gradient(135deg, #312E81 0%, #4F46E5 100%)',
  },
  {
    name: '⌚ Apple Watch',
    url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80',
    title: 'สมาร์ตวอทช์สายสุขภาพและกีฬา',
    tag: 'ลดสูงสุด 20%',
    bgColor: 'linear-gradient(135deg, #7C2D12 0%, #EA580C 100%)',
  },
  {
    name: '🎧 AirPods Pro',
    url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=80',
    title: 'หูฟังตัดเสียงระดับพรีเมียม',
    tag: 'พร้อมโค้ดลดเพิ่ม',
    bgColor: 'linear-gradient(135deg, #134E4A 0%, #0D9488 100%)',
  },
  {
    name: '🎮 Gaming Setup',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    title: 'สมรภูมิเกมมิ่ง ลดเดือดสะเทือนวงการ',
    tag: 'Gaming Gear Sale',
    bgColor: 'linear-gradient(135deg, #4C0519 0%, #BE123C 100%)',
  },
];

export const CATEGORY_ICON_OPTIONS = [
  { value: 'smartphone', label: '📱 สมาร์ทโฟน' },
  { value: 'tablet', label: '📲 แท็บเล็ต' },
  { value: 'laptop', label: '💻 แล็ปท็อป' },
  { value: 'watch', label: '⌚ สมาร์ทวอทช์' },
  { value: 'audio', label: '🎧 หูฟัง & ลำโพง' },
  { value: 'accessory', label: '🔌 อุปกรณ์เสริม' },
  { value: 'gamepad', label: '🎮 เกมมิ่ง' },
  { value: 'camera', label: '📷 กล้องถ่ายภาพ' },
];

interface Props {
  role?: 'ADMIN' | 'HQ';
  pageId: string;
  pageTitle?: string;
}

async function authenticatedCmsFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {});

  // 1. Try to get Supabase session token if present
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers.set('Authorization', `Bearer ${data.session.access_token}`);
    }
  } catch {
    // Ignore and proceed with session cookie or dev token
  }

  // 2. In non-production environments, supply dev-admin-token if no Bearer token is attached
  if (process.env.NODE_ENV !== 'production' && !headers.has('Authorization')) {
    headers.set('Authorization', 'Bearer dev-admin-token');
  }

  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers,
  });

  const payload = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(payload.error || `คำขอล้มเหลว (${response.status})`);
  }
  return payload;
}

interface RevisionItem {
  id: string;
  revision_number: number;
  created_at: string;
  created_by: string;
  note?: string;
  snapshot: {
    widgets: AnyWidget[];
  };
}

/**
 * Normalizes widget config by pulling legacy root-level properties into config
 */
function normalizeWidget(w: AnyWidget): AnyWidget {
  const existingConfig = w.config || {};
  if (Object.keys(existingConfig).length === 0) {
    const { id, type, title, subtitle, sortOrder, isActive, ...rest } = w as any;
    if (Object.keys(rest).length > 0) {
      return { ...w, config: rest };
    }
    const preset = WIDGET_CATALOG.find((c) => c.type.toUpperCase() === type.toUpperCase());
    if (preset) {
      return { ...w, config: JSON.parse(JSON.stringify(preset.defaultConfig)) };
    }
  }
  return w;
}

export default function VisualPageBuilder({
  role = 'HQ',
  pageId,
  pageTitle = 'หน้าแรก MeePro (Homepage)',
}: Props) {
  // 1. Core State
  const [widgets, setWidgets] = useState<AnyWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [pageStatus, setPageStatus] = useState<'draft' | 'published'>('published');
  const [lastSavedAt, setLastSavedAt] = useState<string>('เพิ่งบันทึก');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals & Panels
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [editorTab, setEditorTab] = useState<'visual' | 'json'>('visual');

  // Selected widget inspector state
  const selectedWidget = useMemo(
    () => widgets.find((w) => w.id === selectedWidgetId) || null,
    [widgets, selectedWidgetId]
  );
  const [inspectorTitle, setInspectorTitle] = useState('');
  const [inspectorConfigJson, setInspectorConfigJson] = useState('{}');
  const [inspectorValidation, setInspectorValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });

  // 2. Load and Normalize Widgets on Mount
  useEffect(() => {
    const rawLoaded = getHomepageWidgets();
    const normalized = rawLoaded.map(normalizeWidget);
    setWidgets(normalized);
  }, []);

  // Sync inspector when selected widget changes
  useEffect(() => {
    if (selectedWidget) {
      setInspectorTitle(selectedWidget.title || '');
      const cfg = selectedWidget.config || {};
      setInspectorConfigJson(JSON.stringify(cfg, null, 2));
      validateInspectorConfig(selectedWidget.type, cfg);
    }
  }, [selectedWidgetId]);

  const validateInspectorConfig = (widgetType: string, configObj: any) => {
    const result = validateWidgetConfig(widgetType, configObj);
    if (result.isValid) {
      setInspectorValidation({ valid: true });
    } else {
      setInspectorValidation({ valid: false, error: result.error || 'ข้อมูลไม่ตรงตาม Schema' });
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // 3. Widget Reordering & CRUD
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= widgets.length) return;

    const copy = [...widgets];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    const reordered = copy.map((w, idx) => ({ ...w, sortOrder: idx + 1 }));
    setWidgets(reordered);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
  };

  const handleToggleActive = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, isActive: !w.isActive } : w
    );
    setWidgets(updated);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
  };

  const handleDuplicate = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = widgets.find((w) => w.id === id);
    if (!target) return;

    const newId = `HOME-${Math.floor(1000 + Math.random() * 9000)}`;
    const duplicated: AnyWidget = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      title: `${target.title || target.type} (สำเนา)`,
      sortOrder: (target.sortOrder || widgets.length) + 1,
    };

    const updated = [...widgets, duplicated].map((w, idx) => ({ ...w, sortOrder: idx + 1 }));
    setWidgets(updated);
    setSelectedWidgetId(newId);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
    showToast(`คัดลอก Widget "${duplicated.title}" สำเร็จ`);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = widgets.find((w) => w.id === id);
    if (!target) return;

    if (confirm(`คุณต้องการลบ Widget "${target.title || target.type}" หรือไม่?`)) {
      const filtered = widgets.filter((w) => w.id !== id).map((w, idx) => ({ ...w, sortOrder: idx + 1 }));
      setWidgets(filtered);
      if (selectedWidgetId === id) {
        setSelectedWidgetId(null);
      }
      setHasUnsavedChanges(true);
      setPageStatus('draft');
      showToast(`ลบ Widget เรียบร้อยแล้ว`);
    }
  };

  const handleAddWidgetFromCatalog = (item: WidgetCatalogItem) => {
    const newId = `HOME-${Math.floor(1000 + Math.random() * 9000)}`;
    const newWidget: AnyWidget = {
      id: newId,
      type: item.type as any,
      title: item.defaultTitle,
      sortOrder: widgets.length + 1,
      isActive: true,
      config: JSON.parse(JSON.stringify(item.defaultConfig)),
    };

    const updated = [...widgets, newWidget];
    setWidgets(updated);
    setSelectedWidgetId(newId);
    setShowCatalogModal(false);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
    showToast(`เพิ่ม "${item.name}" ลงในหน้าเว็บแล้ว`);
  };

  // 4. Save Inspector Changes
  const handleApplyInspector = () => {
    if (!selectedWidget) return;

    try {
      const parsedConfig = JSON.parse(inspectorConfigJson);
      const validation = validateWidgetConfig(selectedWidget.type, parsedConfig);

      if (!validation.isValid) {
        setInspectorValidation({ valid: false, error: validation.error || 'การตั้งค่าไม่ตรงตาม Schema' });
        showToast('การตั้งค่าไม่ผ่านการตรวจสอบ Zod Schema', 'error');
        return;
      }

      setInspectorValidation({ valid: true });
      const updated = widgets.map((w) =>
        w.id === selectedWidget.id
          ? { ...w, title: inspectorTitle, config: parsedConfig }
          : w
      );
      setWidgets(updated);
      setHasUnsavedChanges(true);
      setPageStatus('draft');
      showToast('อัปเดต Widget และแสดงตัวอย่างเรียบร้อย');
    } catch {
      setInspectorValidation({ valid: false, error: 'JSON Syntax Error: รูปแบบ JSON ไม่ถูกต้อง' });
      showToast('รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบ', 'error');
    }
  };

  // --- Visual Banner Handlers ---
  const handleUpdateBannerSlide = (slideIdx: number, field: string, value: any) => {
    if (!selectedWidget) return;
    const currentConfig = { ...(selectedWidget.config || {}) };
    const currentBanners = [
      ...((selectedWidget as any).banners || currentConfig.banners || []),
    ];
    if (!currentBanners[slideIdx]) return;
    currentBanners[slideIdx] = {
      ...currentBanners[slideIdx],
      [field]: value,
    };
    const newConfig = { ...currentConfig, banners: currentBanners };
    setInspectorConfigJson(JSON.stringify(newConfig, null, 2));
    validateInspectorConfig(selectedWidget.type, newConfig);
    const updated = widgets.map((w) =>
      w.id === selectedWidget.id
        ? { ...w, config: newConfig, banners: currentBanners }
        : w
    );
    setWidgets(updated as any);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
  };

  const handleAddBannerSlide = () => {
    if (!selectedWidget) return;
    const currentConfig = { ...(selectedWidget.config || {}) };
    const currentBanners = [
      ...((selectedWidget as any).banners || currentConfig.banners || []),
    ];
    const newSlide = {
      id: `b-${Date.now()}`,
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
      title: 'แคมเปญใหม่สุดพิเศษ MeePro',
      tag: 'โปรโมชั่นพิเศษ',
      linkUrl: '/catalog',
      bgColor: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)',
      textColor: '#FFFFFF',
    };
    const newBanners = [...currentBanners, newSlide];
    const newConfig = { ...currentConfig, banners: newBanners };
    setInspectorConfigJson(JSON.stringify(newConfig, null, 2));
    validateInspectorConfig(selectedWidget.type, newConfig);
    const updated = widgets.map((w) =>
      w.id === selectedWidget.id
        ? { ...w, config: newConfig, banners: newBanners }
        : w
    );
    setWidgets(updated as any);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
    showToast('เพิ่มสไลด์แบนเนอร์ใหม่เรียบร้อย');
  };

  const handleRemoveBannerSlide = (slideIdx: number) => {
    if (!selectedWidget) return;
    const currentConfig = { ...(selectedWidget.config || {}) };
    const currentBanners = [
      ...((selectedWidget as any).banners || currentConfig.banners || []),
    ];
    if (currentBanners.length <= 1) {
      showToast('ต้องมีแบนเนอร์อย่างน้อย 1 สไลด์', 'error');
      return;
    }
    const newBanners = currentBanners.filter((_, idx) => idx !== slideIdx);
    const newConfig = { ...currentConfig, banners: newBanners };
    setInspectorConfigJson(JSON.stringify(newConfig, null, 2));
    validateInspectorConfig(selectedWidget.type, newConfig);
    const updated = widgets.map((w) =>
      w.id === selectedWidget.id
        ? { ...w, config: newConfig, banners: newBanners }
        : w
    );
    setWidgets(updated as any);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
  };

  const handleSelectPresetBanner = (slideIdx: number, preset: (typeof BANNER_IMAGE_PRESETS)[0]) => {
    if (!selectedWidget) return;
    const currentConfig = { ...(selectedWidget.config || {}) };
    const currentBanners = [
      ...((selectedWidget as any).banners || currentConfig.banners || []),
    ];
    if (!currentBanners[slideIdx]) return;
    currentBanners[slideIdx] = {
      ...currentBanners[slideIdx],
      imageUrl: preset.url,
      title: preset.title,
      tag: preset.tag,
      bgColor: preset.bgColor,
    };
    const newConfig = { ...currentConfig, banners: currentBanners };
    setInspectorConfigJson(JSON.stringify(newConfig, null, 2));
    validateInspectorConfig(selectedWidget.type, newConfig);
    const updated = widgets.map((w) =>
      w.id === selectedWidget.id
        ? { ...w, config: newConfig, banners: currentBanners }
        : w
    );
    setWidgets(updated as any);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
    showToast(`นำเข้าภาพ "${preset.name}" สำเร็จ`);
  };

  // --- Visual Category Handlers ---
  const handleUpdateCategory = (catIdx: number, field: string, value: any) => {
    if (!selectedWidget) return;
    const currentConfig = { ...(selectedWidget.config || {}) };
    const currentCategories = [
      ...((selectedWidget as any).categories || currentConfig.categories || []),
    ];
    if (!currentCategories[catIdx]) return;
    currentCategories[catIdx] = {
      ...currentCategories[catIdx],
      [field]: value,
    };
    const newConfig = { ...currentConfig, categories: currentCategories };
    setInspectorConfigJson(JSON.stringify(newConfig, null, 2));
    validateInspectorConfig(selectedWidget.type, newConfig);
    const updated = widgets.map((w) =>
      w.id === selectedWidget.id
        ? { ...w, config: newConfig, categories: currentCategories }
        : w
    );
    setWidgets(updated as any);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
  };

  const handleAddCategory = () => {
    if (!selectedWidget) return;
    const currentConfig = { ...(selectedWidget.config || {}) };
    const currentCategories = [
      ...((selectedWidget as any).categories || currentConfig.categories || []),
    ];
    const newCat = {
      id: `c-${Date.now()}`,
      name: 'หมวดหมู่ใหม่',
      icon: 'smartphone',
      iconBg: 'rgba(37, 99, 235, 0.12)',
      linkUrl: '/catalog',
      badge: '',
    };
    const newCategories = [...currentCategories, newCat];
    const newConfig = { ...currentConfig, categories: newCategories };
    setInspectorConfigJson(JSON.stringify(newConfig, null, 2));
    validateInspectorConfig(selectedWidget.type, newConfig);
    const updated = widgets.map((w) =>
      w.id === selectedWidget.id
        ? { ...w, config: newConfig, categories: newCategories }
        : w
    );
    setWidgets(updated as any);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
    showToast('เพิ่มหมวดหมู่ใหม่เรียบร้อย');
  };

  const handleRemoveCategory = (catIdx: number) => {
    if (!selectedWidget) return;
    const currentConfig = { ...(selectedWidget.config || {}) };
    const currentCategories = [
      ...((selectedWidget as any).categories || currentConfig.categories || []),
    ];
    if (currentCategories.length <= 1) {
      showToast('ต้องมีหมวดหมู่อย่างน้อย 1 รายการ', 'error');
      return;
    }
    const newCategories = currentCategories.filter((_, idx) => idx !== catIdx);
    const newConfig = { ...currentConfig, categories: newCategories };
    setInspectorConfigJson(JSON.stringify(newConfig, null, 2));
    validateInspectorConfig(selectedWidget.type, newConfig);
    const updated = widgets.map((w) =>
      w.id === selectedWidget.id
        ? { ...w, config: newConfig, categories: newCategories }
        : w
    );
    setWidgets(updated as any);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
  };

  // --- Visual Product Showcase Handlers ---
  const handleSyncCatalogProducts = () => {
    if (!selectedWidget) return;
    const currentConfig = { ...(selectedWidget.config || {}) };
    const syncedProducts = ALL_PRODUCTS.slice(0, 6).map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      originalPrice: p.originalPrice,
      promoPrice: p.promoPrice,
      discountPercent: p.discountPercent,
      installmentMonths: p.installmentMonths,
      badge: p.badge || `ลด ${p.discountPercent}%`,
      inStock: p.inStock,
    }));
    const newConfig = { ...currentConfig, products: syncedProducts };
    setInspectorConfigJson(JSON.stringify(newConfig, null, 2));
    validateInspectorConfig(selectedWidget.type, newConfig);
    const updated = widgets.map((w) =>
      w.id === selectedWidget.id
        ? { ...w, config: newConfig, products: syncedProducts }
        : w
    );
    setWidgets(updated as any);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
    showToast('⚡ ซิงค์สินค้าจากฐานข้อมูล Catalog สำเร็จ (6 รายการ)');
  };

  const handleUpdateProduct = (prodIdx: number, field: string, value: any) => {
    if (!selectedWidget) return;
    const currentConfig = { ...(selectedWidget.config || {}) };
    const currentProducts = [
      ...((selectedWidget as any).products || currentConfig.products || []),
    ];
    if (!currentProducts[prodIdx]) return;
    currentProducts[prodIdx] = {
      ...currentProducts[prodIdx],
      [field]: value,
    };
    const newConfig = { ...currentConfig, products: currentProducts };
    setInspectorConfigJson(JSON.stringify(newConfig, null, 2));
    validateInspectorConfig(selectedWidget.type, newConfig);
    const updated = widgets.map((w) =>
      w.id === selectedWidget.id
        ? { ...w, config: newConfig, products: currentProducts }
        : w
    );
    setWidgets(updated as any);
    setHasUnsavedChanges(true);
    setPageStatus('draft');
  };

  // 5. Draft & Publish Workflow (Spec Sec 9)
  const handleSaveDraft = async () => {
    try {
      await authenticatedCmsFetch(`/api/cms/pages/${pageId}/widgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets }),
      });
      saveHomepageWidgets(widgets);
      window.dispatchEvent(new Event('meepro_widgets_updated'));
      setHasUnsavedChanges(false);
      setLastSavedAt(new Date().toLocaleTimeString('th-TH'));
      showToast('บันทึกแบบร่างลงฐานข้อมูลเรียบร้อยแล้ว');
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'ไม่สามารถบันทึกแบบร่างได้', 'error');
    }
  };

  const handlePublishNow = async () => {
    if (role !== 'ADMIN' && role !== 'HQ') {
      showToast('เฉพาะบทบาท Admin เท่านั้นที่มีสิทธิ์เผยแพร่หน้าสู่ Production (Spec Sec 8)', 'error');
      return;
    }

    if (confirm('คุณต้องการเผยแพร่ (Publish) หน้าแรกสู่ระบบ Live ให้ลูกค้าเห็นทันทีหรือไม่? ระบบจะสร้าง Snapshot Revision โดยอัตโนมัติ')) {
      try {
        await authenticatedCmsFetch(`/api/cms/pages/${pageId}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ widgets }),
        });
        saveHomepageWidgets(widgets);
        window.dispatchEvent(new Event('meepro_widgets_updated'));
      } catch (cause) {
        showToast(cause instanceof Error ? cause.message : 'ไม่สามารถเผยแพร่หน้าได้', 'error');
        return;
      }

      const newRev: RevisionItem = {
        id: `rev-${Date.now()}`,
        revision_number: (revisions.length || 0) + 1,
        created_at: new Date().toISOString(),
        created_by: 'admin@meepro.com',
        note: `เผยแพร่เวอร์ชันใหม่ (${widgets.length} Widgets)`,
        snapshot: {
          widgets: JSON.parse(JSON.stringify(widgets)),
        },
      };

      setRevisions([newRev, ...revisions]);
      setHasUnsavedChanges(false);
      setPageStatus('published');
      setLastSavedAt(new Date().toLocaleTimeString('th-TH'));
      showToast('🚀 เผยแพร่หน้าแรก (Publish Live) สำเร็จสู่หน้าร้านเรียบร้อย!');
    }
  };

  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    setLoadingRevisions(true);
    try {
      const data = await authenticatedCmsFetch<{ revisions?: RevisionItem[] }>(`/api/cms/pages/${pageId}/revisions`);
      if (data.revisions && data.revisions.length > 0) {
        setRevisions(data.revisions);
      }
    } catch (cause) {
      showToast(cause instanceof Error ? cause.message : 'ไม่สามารถโหลดประวัติเวอร์ชันได้', 'error');
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleRestoreRevision = (rev: RevisionItem) => {
    if (confirm(`คุณต้องการย้อนกลับ (Rollback) หน้านี้ไปยัง Revision #${rev.revision_number} (${new Date(rev.created_at).toLocaleString('th-TH')}) หรือไม่?`)) {
      if (rev.snapshot?.widgets && Array.isArray(rev.snapshot.widgets)) {
        setWidgets(rev.snapshot.widgets);
        saveHomepageWidgets(rev.snapshot.widgets);
        setShowHistoryModal(false);
        setHasUnsavedChanges(false);
        setPageStatus('published');
        showToast(`ย้อนกลับไปยัง Revision #${rev.revision_number} สำเร็จ`);
      }
    }
  };

  const handleResetDefaults = () => {
    if (confirm('คุณต้องการรีเซ็ตลำดับและ Widget ทั้งหมดกลับเป็นค่าเริ่มต้นตามระบบ MeePro หรือไม่?')) {
      const def = resetHomepageWidgets();
      const normalized = def.map(normalizeWidget);
      setWidgets(normalized);
      setSelectedWidgetId(null);
      setHasUnsavedChanges(false);
      setPageStatus('published');
      showToast('คืนค่า Widget เริ่มต้นเรียบร้อยแล้ว');
    }
  };

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    return WIDGET_CATALOG.filter((item) => {
      const matchesCategory = catalogCategory === 'all' || item.category === catalogCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.type.toLowerCase().includes(catalogSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [catalogSearch, catalogCategory]);

  return (
    <div className={styles.builderContainer}>
      {/* 1. Header Toolbar */}
      <header className={styles.topBar}>
        <div className={styles.pageInfo}>
          <div className={styles.brandIcon}>🎨</div>
          <div>
            <h2 className={styles.pageTitle}>{pageTitle}</h2>
          </div>
          <span className={pageStatus === 'published' ? styles.statusBadgePublished : styles.statusBadgeDraft}>
            ● {pageStatus === 'published' ? 'PUBLISHED' : 'DRAFT'}
          </span>
          {hasUnsavedChanges && (
            <span className={styles.unsavedText}>* มีการแก้ไขที่ยังไม่ได้บันทึก</span>
          )}
        </div>

        {/* Device Switcher (Mobile / Tablet / Desktop) */}
        <div className={styles.deviceSwitcher}>
          <button
            type="button"
            className={`${styles.deviceBtn} ${deviceMode === 'mobile' ? styles.deviceBtnActive : ''}`}
            onClick={() => setDeviceMode('mobile')}
            title="มุมมองมือถือ (Mobile — 390px)"
          >
            <Smartphone size={14} />
            <span>Mobile (390px)</span>
          </button>
          <button
            type="button"
            className={`${styles.deviceBtn} ${deviceMode === 'tablet' ? styles.deviceBtnActive : ''}`}
            onClick={() => setDeviceMode('tablet')}
            title="มุมมองแท็บเล็ต (Tablet — 768px)"
          >
            <Tablet size={14} />
            <span>Tablet (768px)</span>
          </button>
          <button
            type="button"
            className={`${styles.deviceBtn} ${deviceMode === 'desktop' ? styles.deviceBtnActive : ''}`}
            onClick={() => setDeviceMode('desktop')}
            title="มุมมองเดสก์ท็อป (Desktop Full Width)"
          >
            <Monitor size={14} />
            <span>Desktop (Full)</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className={styles.actionGroup}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleResetDefaults}
            title="คืนค่าเริ่มต้น"
          >
            <RotateCcw size={13} />
            <span>รีเซ็ต</span>
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleOpenHistory}
            title="ประวัติการแก้ไขและ Rollback"
          >
            <History size={13} />
            <span>ประวัติ ({revisions.length})</span>
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSaveDraft}
          >
            <Save size={13} />
            <span>บันทึกแบบร่าง</span>
          </button>
          <button
            type="button"
            className={styles.btnPublish}
            onClick={handlePublishNow}
            title={role === 'ADMIN' || role === 'HQ' ? 'เผยแพร่สู่ Production' : 'ต้องใช้สิทธิ์ Admin หรือ HQ เพื่อ Publish'}
          >
            <Send size={13} />
            <span>เผยแพร่ Live</span>
          </button>
          <Link
            href="/home"
            target="_blank"
            className={styles.btnSecondary}
          >
            <ExternalLink size={13} />
            <span>ดูหน้าจริง</span>
          </Link>
        </div>
      </header>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: feedbackMessage.type === 'success' ? '#065F46' : '#991B1B',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s',
          }}
        >
          {feedbackMessage.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* 2. Workspace: Sidebar (Left) + Spacious Canvas (Center) */}
      <div className={styles.workspace}>
        {/* Left Sidebar: Widget Hierarchy Tree */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>เลเยอร์ WIDGETS ({widgets.length})</h3>
            <button
              type="button"
              className={styles.btnPrimary}
              style={{ padding: '5px 10px', fontSize: '11px' }}
              onClick={() => setShowCatalogModal(true)}
            >
              <Plus size={13} />
              <span>เพิ่ม</span>
            </button>
          </div>

          <div className={styles.widgetList}>
            {widgets.map((widget, idx) => {
              const isSelected = widget.id === selectedWidgetId;
              return (
                <div
                  key={widget.id}
                  className={`${styles.widgetItem} ${isSelected ? styles.widgetItemSelected : ''} ${
                    !widget.isActive ? styles.widgetItemDisabled : ''
                  }`}
                  onClick={() => setSelectedWidgetId(isSelected ? null : widget.id)}
                  title="คลิกเพื่อเปิดกล่องตั้งค่า Widget"
                >
                  <div className={styles.widgetItemLeft}>
                    <span className={styles.sortIndex}>#{widget.sortOrder}</span>
                    <span className={styles.widgetIcon}>🧩</span>
                    <div className={styles.widgetInfo}>
                      <span className={styles.widgetName}>{widget.title || widget.type}</span>
                      <span className={styles.widgetType}>{widget.type}</span>
                    </div>
                  </div>

                  <div className={styles.widgetItemActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={(e) => handleToggleActive(widget.id, e)}
                      title={widget.isActive ? 'ปิดการแสดงผล' : 'เปิดการแสดงผล'}
                    >
                      {widget.isActive ? <Eye size={13} color="#10B981" /> : <EyeOff size={13} color="#64748B" />}
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(idx, 'up');
                      }}
                      disabled={idx === 0}
                      title="เลื่อนขึ้น"
                      style={{ opacity: idx === 0 ? 0.3 : 1 }}
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(idx, 'down');
                      }}
                      disabled={idx === widgets.length - 1}
                      title="เลื่อนลง"
                      style={{ opacity: idx === widgets.length - 1 ? 0.3 : 1 }}
                    >
                      <ChevronDown size={13} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={(e) => handleDuplicate(widget.id, e)}
                      title="คัดลอก Widget"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={(e) => handleDelete(widget.id, e)}
                      title="ลบ Widget"
                    >
                      <Trash2 size={13} color="#EF4444" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center: Full-Breathing Interactive Preview Canvas */}
        <main className={styles.canvasArea}>
          {deviceMode === 'mobile' && (
            <div className={styles.mobileFrame}>
              <div className={styles.mobileBezelTop}>
                <span>9:41</span>
                <div className={styles.mobileIsland} />
                <span>5G 100%</span>
              </div>
              <div className={styles.frameContent}>
                <WidgetRenderer widgets={widgets} />
              </div>
            </div>
          )}

          {deviceMode === 'tablet' && (
            <div className={styles.tabletFrame}>
              <div className={styles.tabletBezelTop}>
                <span>iPad Preview (768px)</span>
              </div>
              <div className={styles.frameContent}>
                <WidgetRenderer widgets={widgets} />
              </div>
            </div>
          )}

          {deviceMode === 'desktop' && (
            <div className={styles.desktopFrame}>
              <div className={styles.browserHeader}>
                <div className={styles.trafficLights}>
                  <div className={styles.dotRed} />
                  <div className={styles.dotYellow} />
                  <div className={styles.dotGreen} />
                </div>
                <div className={styles.addressBar}>
                  🔒 https://meepro.co.th/home
                </div>
              </div>
              <div className={styles.frameContent}>
                <WidgetRenderer widgets={widgets} />
              </div>
            </div>
          )}
        </main>

        {/* 3. Slide-Over Inspector Drawer (Overlays smoothly without shrinking the canvas!) */}
        {selectedWidget && (
          <aside className={styles.inspectorDrawer}>
            <div className={styles.inspectorHeader}>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#F8FAFC' }}>
                  ⚙️ ตั้งค่า Widget
                </h4>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  {selectedWidget.type} • ID: {selectedWidget.id}
                </span>
              </div>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setSelectedWidgetId(null)}
                title="ปิดแถบตั้งค่า"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.inspectorBody}>
              {/* Tab Switcher: Visual vs JSON */}
              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#0B0F19', padding: '3px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditorTab('visual')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    border: 'none',
                    background: editorTab === 'visual' ? '#2563EB' : 'transparent',
                    color: editorTab === 'visual' ? '#FFFFFF' : '#94A3B8',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Sliders size={13} />
                  <span>ตั้งค่าทั่วไป</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab('json')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    border: 'none',
                    background: editorTab === 'json' ? '#2563EB' : 'transparent',
                    color: editorTab === 'json' ? '#FFFFFF' : '#94A3B8',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Code2 size={13} />
                  <span>Config JSON</span>
                </button>
              </div>

              {/* Title Input */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>ชื่อหัวข้อ Widget</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={inspectorTitle}
                  onChange={(e) => setInspectorTitle(e.target.value)}
                  placeholder="ระบุชื่อหัวข้อ..."
                />
              </div>

              {/* Status Toggle */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>สถานะการแสดงผล</label>
                <button
                  type="button"
                  onClick={() => handleToggleActive(selectedWidget.id)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedWidget.isActive ? '#0D9488' : '#334155',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {selectedWidget.isActive ? <Check size={16} /> : <EyeOff size={16} />}
                  <span>{selectedWidget.isActive ? 'เปิดใช้งานบนหน้าเว็บ (Active)' : 'ปิดการแสดงผลชั่วคราว (Inactive)'}</span>
                </button>
              </div>

              {/* Validation Status */}
              <div>
                <label className={styles.formLabel} style={{ marginBottom: '6px', display: 'block' }}>
                  สถานะการตรวจสอบ Runtime Zod Schema
                </label>
                {inspectorValidation.valid ? (
                  <div className={styles.validationAlertValid}>
                    <Check size={14} />
                    <span>Config ถูกต้องตามระบบ Zod Runtime Schema</span>
                  </div>
                ) : (
                  <div className={styles.validationAlertInvalid}>
                    <AlertCircle size={14} />
                    <span>{inspectorValidation.error}</span>
                  </div>
                )}
              </div>

              {/* Visual Fields or JSON Mode */}
              {editorTab === 'json' ? (
                <div className={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className={styles.formLabel}>พารามิเตอร์ Config (JSON)</label>
                    <span style={{ fontSize: '10px', color: '#94A3B8' }}>Real-time update</span>
                  </div>
                  <textarea
                    className={styles.jsonEditor}
                    value={inspectorConfigJson}
                    onChange={(e) => {
                      setInspectorConfigJson(e.target.value);
                      try {
                        const parsed = JSON.parse(e.target.value);
                        validateInspectorConfig(selectedWidget.type, parsed);
                      } catch {
                        setInspectorValidation({ valid: false, error: 'JSON Syntax Error: รูปแบบไม่ถูกต้อง' });
                      }
                    }}
                    rows={12}
                  />
                </div>
              ) : selectedWidget.type === 'HERO_BANNER' || selectedWidget.type === 'BANNER_CAROUSEL' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className={styles.formLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <ImageIcon size={14} color="#38BDF8" />
                      <span>ภาพแบนเนอร์ & สไลด์โชว์</span>
                    </label>
                    <button
                      type="button"
                      className={styles.subtleBtn}
                      onClick={handleAddBannerSlide}
                    >
                      <Plus size={12} />
                      <span>เพิ่มภาพสไลด์</span>
                    </button>
                  </div>

                  {/* List of Banner Slides */}
                  {(((selectedWidget as any).banners || selectedWidget.config?.banners || []) as any[]).map((slide: any, sIdx: number) => (
                    <div key={slide.id || sIdx} className={styles.customizerCard}>
                      <div className={styles.slideHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', background: '#0F172A', padding: '2px 8px', borderRadius: '4px' }}>
                            #{sIdx + 1}
                          </span>
                          {slide.imageUrl && (
                            <img
                              src={slide.imageUrl}
                              alt="thumb"
                              className={styles.thumbnailPreview}
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          className={styles.dangerBtn}
                          onClick={() => handleRemoveBannerSlide(sIdx)}
                          title="ลบสไลด์นี้"
                        >
                          <Trash2 size={12} />
                          <span>ลบ</span>
                        </button>
                      </div>

                      {/* Image URL input */}
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '10px' }}>URL รูปภาพแบนเนอร์ (Picture URL)</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={slide.imageUrl || ''}
                          onChange={(e) => handleUpdateBannerSlide(sIdx, 'imageUrl', e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          style={{ fontSize: '11px' }}
                        />
                      </div>

                      {/* Quick Presets for Picture */}
                      <div>
                        <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>🖼️ เลือกรูปภาพตัวอย่างยอดนิยม:</span>
                        <div className={styles.presetChips}>
                          {BANNER_IMAGE_PRESETS.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              className={styles.presetChip}
                              onClick={() => handleSelectPresetBanner(sIdx, preset)}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Slide Title */}
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '10px' }}>ข้อความหัวข้อสไลด์ (Headline)</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={slide.title || ''}
                          onChange={(e) => handleUpdateBannerSlide(sIdx, 'title', e.target.value)}
                          placeholder="ระบุข้อความโปรโมชั่น..."
                          style={{ fontSize: '11px' }}
                        />
                      </div>

                      {/* Slide Tag / Subtitle */}
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '10px' }}>แท็กข้อความเด่น (Tag Pill)</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={slide.tag || ''}
                          onChange={(e) => handleUpdateBannerSlide(sIdx, 'tag', e.target.value)}
                          placeholder="เช่น โปรเปิดตัว, Flash Deal..."
                          style={{ fontSize: '11px' }}
                        />
                      </div>

                      {/* Link URL */}
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '10px' }}>ลิงก์ปลายทาง (Action Link)</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={slide.linkUrl || ''}
                          onChange={(e) => handleUpdateBannerSlide(sIdx, 'linkUrl', e.target.value)}
                          placeholder="/catalog หรือ /promotion"
                          style={{ fontSize: '11px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedWidget.type === 'CATEGORY_GRID' || selectedWidget.type === 'CATEGORY_NAV' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className={styles.formLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <Layers size={14} color="#A855F7" />
                      <span>รายการหมวดหมู่สินค้า</span>
                    </label>
                    <button
                      type="button"
                      className={styles.subtleBtn}
                      onClick={handleAddCategory}
                    >
                      <Plus size={12} />
                      <span>เพิ่มหมวดหมู่</span>
                    </button>
                  </div>

                  {(((selectedWidget as any).categories || selectedWidget.config?.categories || []) as any[]).map((cat: any, cIdx: number) => (
                    <div key={cat.id || cIdx} className={styles.customizerCard}>
                      <div className={styles.slideHeader}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#A855F7', background: '#0F172A', padding: '2px 8px', borderRadius: '4px' }}>
                          #{cIdx + 1} {cat.name}
                        </span>
                        <button
                          type="button"
                          className={styles.dangerBtn}
                          onClick={() => handleRemoveCategory(cIdx)}
                          title="ลบหมวดหมู่นี้"
                        >
                          <Trash2 size={12} />
                          <span>ลบ</span>
                        </button>
                      </div>

                      {/* Category Name */}
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '10px' }}>ชื่อหมวดหมู่ (Category Name)</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={cat.name || ''}
                          onChange={(e) => handleUpdateCategory(cIdx, 'name', e.target.value)}
                          placeholder="เช่น สมาร์ทโฟน, แท็บเล็ต"
                          style={{ fontSize: '11px' }}
                        />
                      </div>

                      {/* Icon Picker */}
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '10px' }}>ไอคอนหมวดหมู่ (Modern Vector Icon)</label>
                        <select
                          className={styles.formInput}
                          value={cat.icon || 'smartphone'}
                          onChange={(e) => handleUpdateCategory(cIdx, 'icon', e.target.value)}
                          style={{ fontSize: '11px' }}
                        >
                          {CATEGORY_ICON_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Badge Pill & Link */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label className={styles.formLabel} style={{ fontSize: '10px' }}>ป้ายกำกับ (Badge)</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={cat.badge || ''}
                            onChange={(e) => handleUpdateCategory(cIdx, 'badge', e.target.value)}
                            placeholder="HOT, NEW, 0%..."
                            style={{ fontSize: '11px' }}
                          />
                        </div>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label className={styles.formLabel} style={{ fontSize: '10px' }}>ลิงก์ Action (Link URL)</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={cat.linkUrl || ''}
                            onChange={(e) => handleUpdateCategory(cIdx, 'linkUrl', e.target.value)}
                            placeholder="/catalog?category=..."
                            style={{ fontSize: '11px' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedWidget.type === 'PRODUCT_SHOWCASE' || selectedWidget.type === 'PRODUCT_GRID' || selectedWidget.type === 'FLASH_SALE_GRID' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className={styles.formLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                      <Tag size={14} color="#10B981" />
                      <span>รายการสินค้าใน Showcase</span>
                    </label>
                  </div>

                  {/* One-click Catalog Sync Button */}
                  <button
                    type="button"
                    className={styles.syncBtn}
                    onClick={handleSyncCatalogProducts}
                  >
                    <RefreshCw size={14} />
                    <span>ซิงค์สินค้าจากฐานข้อมูลแคตตาล็อก Live</span>
                  </button>

                  {/* Product list */}
                  {(((selectedWidget as any).products || selectedWidget.config?.products || []) as any[]).map((prod: any, pIdx: number) => (
                    <div key={prod.id || pIdx} className={styles.customizerCard}>
                      <div className={styles.slideHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', background: '#0F172A', padding: '2px 8px', borderRadius: '4px' }}>
                            #{pIdx + 1}
                          </span>
                          {prod.imageUrl && prod.imageUrl.startsWith('http') && (
                            <img
                              src={prod.imageUrl}
                              alt="thumb"
                              className={styles.thumbnailPreview}
                            />
                          )}
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#F8FAFC' }}>
                            {prod.name}
                          </span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '10px' }}>ชื่อสินค้า (Product Name)</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={prod.name || ''}
                          onChange={(e) => handleUpdateProduct(pIdx, 'name', e.target.value)}
                          style={{ fontSize: '11px' }}
                        />
                      </div>

                      {/* Product Image URL */}
                      <div className={styles.formGroup} style={{ margin: 0 }}>
                        <label className={styles.formLabel} style={{ fontSize: '10px' }}>URL รูปภาพสินค้า (Product Picture)</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={prod.imageUrl || ''}
                          onChange={(e) => handleUpdateProduct(pIdx, 'imageUrl', e.target.value)}
                          placeholder="https://..."
                          style={{ fontSize: '11px' }}
                        />
                      </div>

                      {/* Pricing */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label className={styles.formLabel} style={{ fontSize: '10px' }}>ราคาโปร (฿)</label>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={prod.promoPrice || 0}
                            onChange={(e) => handleUpdateProduct(pIdx, 'promoPrice', Number(e.target.value))}
                            style={{ fontSize: '11px' }}
                          />
                        </div>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label className={styles.formLabel} style={{ fontSize: '10px' }}>ราคาเต็ม (฿)</label>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={prod.originalPrice || 0}
                            onChange={(e) => handleUpdateProduct(pIdx, 'originalPrice', Number(e.target.value))}
                            style={{ fontSize: '11px' }}
                          />
                        </div>
                      </div>

                      {/* Badge & Installment */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label className={styles.formLabel} style={{ fontSize: '10px' }}>ป้ายโปรโมชั่น (Badge)</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={prod.badge || ''}
                            onChange={(e) => handleUpdateProduct(pIdx, 'badge', e.target.value)}
                            placeholder="ลด ฿3,000..."
                            style={{ fontSize: '11px' }}
                          />
                        </div>
                        <div className={styles.formGroup} style={{ margin: 0 }}>
                          <label className={styles.formLabel} style={{ fontSize: '10px' }}>ผ่อน 0% (เดือน)</label>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={prod.installmentMonths || 10}
                            onChange={(e) => handleUpdateProduct(pIdx, 'installmentMonths', Number(e.target.value))}
                            style={{ fontSize: '11px' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedWidget.type === 'CUSTOMER_GREETING' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className={styles.customizerCard}>
                    <div className={styles.slideHeader}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', background: '#0F172A', padding: '2px 8px', borderRadius: '4px' }}>
                        ⭐ ตั้งค่าระบบสมาชิก & คะแนนสะสม (Membership & Rewards)
                      </span>
                    </div>

                    {/* Show Membership Toggle */}
                    <div className={styles.formGroup} style={{ margin: '8px 0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedWidget.config?.showMembership !== false && (selectedWidget as any).showMembership !== false}
                          onChange={(e) => {
                            const newCfg = { ...(selectedWidget.config || {}), showMembership: e.target.checked };
                            setInspectorConfigJson(JSON.stringify(newCfg, null, 2));
                            validateInspectorConfig(selectedWidget.type, newCfg);
                            const updated = widgets.map((w) =>
                              w.id === selectedWidget.id
                                ? { ...w, config: newCfg, showMembership: e.target.checked }
                                : w
                            );
                            setWidgets(updated as any);
                            setHasUnsavedChanges(true);
                          }}
                          style={{ width: '16px', height: '16px', accentColor: '#2563EB' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#F8FAFC' }}>
                          แสดงระดับสมาชิก (Show Membership Tier Badge)
                        </span>
                      </label>
                    </div>

                    {/* Show Points Toggle */}
                    <div className={styles.formGroup} style={{ margin: '8px 0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedWidget.config?.showPoints !== false && (selectedWidget as any).showPoints !== false}
                          onChange={(e) => {
                            const newCfg = { ...(selectedWidget.config || {}), showPoints: e.target.checked };
                            setInspectorConfigJson(JSON.stringify(newCfg, null, 2));
                            validateInspectorConfig(selectedWidget.type, newCfg);
                            const updated = widgets.map((w) =>
                              w.id === selectedWidget.id
                                ? { ...w, config: newCfg, showPoints: e.target.checked }
                                : w
                            );
                            setWidgets(updated as any);
                            setHasUnsavedChanges(true);
                          }}
                          style={{ width: '16px', height: '16px', accentColor: '#10B981' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#F8FAFC' }}>
                          แสดงกล่องคะแนนสะสม & ของรางวัล (Show Rewards Points Box)
                        </span>
                      </label>
                    </div>

                    {/* Membership Tier Select */}
                    <div className={styles.formGroup} style={{ marginTop: '10px' }}>
                      <label className={styles.formLabel} style={{ fontSize: '10px' }}>ระดับสมาชิกตั้งต้น (Default Tier)</label>
                      <select
                        className={styles.formInput}
                        value={(selectedWidget.config?.membershipTier || (selectedWidget as any).membershipTier || 'Gold')}
                        onChange={(e) => {
                          const newCfg = { ...(selectedWidget.config || {}), membershipTier: e.target.value };
                          setInspectorConfigJson(JSON.stringify(newCfg, null, 2));
                          validateInspectorConfig(selectedWidget.type, newCfg);
                          const updated = widgets.map((w) =>
                            w.id === selectedWidget.id
                              ? { ...w, config: newCfg, membershipTier: e.target.value }
                              : w
                          );
                          setWidgets(updated as any);
                          setHasUnsavedChanges(true);
                        }}
                        style={{ fontSize: '11px' }}
                      >
                        <option value="Member">Member (สมาชิกทั่วไป)</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                        <option value="Platinum">Platinum</option>
                      </select>
                    </div>

                    {/* Default Points */}
                    <div className={styles.formGroup} style={{ marginTop: '8px' }}>
                      <label className={styles.formLabel} style={{ fontSize: '10px' }}>คะแนนสะสมตั้งต้น (Default Points)</label>
                      <input
                        type="number"
                        className={styles.formInput}
                        value={(selectedWidget.config?.defaultPoints ?? (selectedWidget as any).defaultPoints ?? 450)}
                        onChange={(e) => {
                          const newCfg = { ...(selectedWidget.config || {}), defaultPoints: Number(e.target.value) };
                          setInspectorConfigJson(JSON.stringify(newCfg, null, 2));
                          validateInspectorConfig(selectedWidget.type, newCfg);
                          const updated = widgets.map((w) =>
                            w.id === selectedWidget.id
                              ? { ...w, config: newCfg, defaultPoints: Number(e.target.value) }
                              : w
                          );
                          setWidgets(updated as any);
                          setHasUnsavedChanges(true);
                        }}
                        style={{ fontSize: '11px' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>ID ประจำ Widget</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={selectedWidget.id}
                      disabled
                      style={{ opacity: 0.6 }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>ลำดับการแสดงผล (Sort Order)</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={selectedWidget.sortOrder}
                      disabled
                      style={{ opacity: 0.6 }}
                    />
                  </div>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                    💡 สลับไปที่แท็บ <strong>"Config JSON"</strong> เพื่อแก้ไขพารามิเตอร์เชิงลึก (รูปภาพ, คูปองโค้ด, ลิงก์ Action, ข้อความแคมเปญ)
                  </p>
                </div>
              )}

              {/* Apply Button */}
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleApplyInspector}
                style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 'auto' }}
              >
                <span>บันทึกการตั้งค่า Widget</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* 4. Catalog Modal: Add New Widget */}
      {showCatalogModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowCatalogModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#F8FAFC' }}>
                  ✨ คลัง Widget (Widget Catalog — Spec Sec 6 & 14)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94A3B8' }}>
                  เลือกประเภท Widget เพื่อเพิ่มลงในหน้าแรกลูกค้า
                </p>
              </div>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setShowCatalogModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Bar */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #1F2937', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                className={styles.formInput}
                placeholder="ค้นหาชื่อ Widget..."
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                style={{ flex: 1, minWidth: '200px' }}
              />
              <select
                className={styles.formInput}
                value={catalogCategory}
                onChange={(e) => setCatalogCategory(e.target.value)}
                style={{ minWidth: '150px' }}
              >
                <option value="all">ทุกหมวดหมู่ ({WIDGET_CATALOG.length})</option>
                <option value="navigation">Navigation & Headers</option>
                <option value="banners">Banners & Content</option>
                <option value="products">Product Browsing</option>
                <option value="promotions">Promotions & Urgency</option>
                <option value="trust">Trust & Information</option>
                <option value="engagement">Engagement & Action</option>
                <option value="layout">Layout & Embed</option>
              </select>
            </div>

            {/* Catalog Grid */}
            <div className={styles.modalBody} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {filteredCatalog.map((item) => (
                <div
                  key={item.type}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid #1F2937',
                    backgroundColor: '#1E293B',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => handleAddWidgetFromCatalog(item)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1F2937';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '20px' }}>{item.icon}</span>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#F8FAFC' }}>
                        {item.name}
                      </h4>
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#60A5FA',
                        backgroundColor: 'rgba(37, 99, 235, 0.15)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.type}
                    </span>
                    <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.btnPrimary}
                    style={{ width: '100%', justifyContent: 'center', padding: '8px' }}
                  >
                    <Plus size={14} />
                    <span>เพิ่ม Widget นี้</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. History & Rollback Modal */}
      {showHistoryModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowHistoryModal(false)}>
          <div className={styles.modalCard} style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#F8FAFC' }}>
                  ⏱️ ประวัติการเผยแพร่ & การย้อนกลับ (Revisions & Rollback)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94A3B8' }}>
                  เลือกเวอร์ชัน Snapshot ย้อนหลังเพื่อกู้คืนหน้าเว็บกลับสู่สถานะนั้นทันที
                </p>
              </div>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setShowHistoryModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {loadingRevisions ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                  กำลังโหลดข้อมูลประวัติ Revisions...
                </div>
              ) : revisions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                  <History size={36} color="#475569" style={{ margin: '0 auto 10px' }} />
                  <p>ยังไม่มีประวัติการเผยแพร่ Snapshot ในระบบ</p>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>เมื่อกด "เผยแพร่ (Publish)" ระบบจะบันทึก Snapshot อัตโนมัติ</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {revisions.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #1F2937',
                        backgroundColor: '#1E293B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              backgroundColor: '#0F172A',
                              color: '#60A5FA',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            REV #{rev.revision_number}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
                            {rev.note || 'Snapshot ประจำเวอร์ชัน'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          บันทึกเมื่อ: {new Date(rev.created_at).toLocaleString('th-TH')} • โดย: {rev.created_by}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => handleRestoreRevision(rev)}
                        style={{ borderColor: '#0D9488', color: '#2DD4BF', fontWeight: 700 }}
                      >
                        <RotateCcw size={14} />
                        <span>ย้อนกลับ (Restore)</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
