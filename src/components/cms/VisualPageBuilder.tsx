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
  Sparkles,
} from 'lucide-react';
import { AnyWidget } from '@/types/widget';
import {
  getHomepageWidgets,
  saveHomepageWidgets,
  resetHomepageWidgets,
} from '@/lib/homepageWidgets';
import { WIDGET_CATALOG, WidgetCatalogItem } from '@/lib/widgetCatalogPresets';
import { validateWidgetConfig } from '@/lib/widgetSchemas';
import WidgetRenderer from '@/components/home/WidgetRenderer';
import styles from './VisualPageBuilder.module.css';

interface Props {
  role?: 'admin' | 'staff';
  pageId?: string;
  pageTitle?: string;
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

export default function VisualPageBuilder({
  role = 'staff',
  pageId = 'p-home-001',
  pageTitle = 'MeePro Mobile Homepage',
}: Props) {
  // 1. Core State
  const [widgets, setWidgets] = useState<AnyWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [pageStatus, setPageStatus] = useState<'draft' | 'published'>('published');
  const [lastSavedAt, setLastSavedAt] = useState<string>('เพิ่งบันทึก');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  // Selected widget inspector state
  const selectedWidget = useMemo(
    () => widgets.find((w) => w.id === selectedWidgetId) || null,
    [widgets, selectedWidgetId]
  );
  const [inspectorTitle, setInspectorTitle] = useState('');
  const [inspectorConfigJson, setInspectorConfigJson] = useState('');
  const [inspectorValidation, setInspectorValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });

  // 2. Load Widgets on Mount
  useEffect(() => {
    const loaded = getHomepageWidgets();
    setWidgets(loaded);
    if (loaded.length > 0) {
      setSelectedWidgetId(loaded[0].id);
    }
  }, []);

  // Sync inspector when selected widget changes
  useEffect(() => {
    if (selectedWidget) {
      setInspectorTitle(selectedWidget.title || '');
      const configStr = JSON.stringify(selectedWidget.config || {}, null, 2);
      setInspectorConfigJson(configStr);
      validateInspectorConfig(selectedWidget.type, selectedWidget.config || {});
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
        setSelectedWidgetId(filtered[0]?.id || null);
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
      config: item.defaultConfig,
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
    } catch (err: any) {
      setInspectorValidation({ valid: false, error: 'JSON Syntax Error: รูปแบบ JSON ไม่ถูกต้อง' });
      showToast('รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบ', 'error');
    }
  };

  // 5. Draft & Publish Workflow (Spec Sec 9)
  const handleSaveDraft = async () => {
    saveHomepageWidgets(widgets);
    setHasUnsavedChanges(false);
    setLastSavedAt(new Date().toLocaleTimeString('th-TH'));
    showToast('บันทึกแบบร่าง (Draft) เรียบร้อย');
  };

  const handlePublishNow = async () => {
    if (role !== 'admin') {
      showToast('เฉพาะบทบาท Admin เท่านั้นที่มีสิทธิ์เผยแพร่หน้าสู่ Production (Spec Sec 8)', 'error');
      return;
    }

    if (confirm('คุณต้องการเผยแพร่ (Publish) หน้าแรกสู่ระบบ Live ให้ลูกค้าเห็นทันทีหรือไม่? ระบบจะสร้าง Snapshot Revision โดยอัตโนมัติ')) {
      saveHomepageWidgets(widgets);

      // Create snapshot revision
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
      showToast('🚀 เผยแพร่หน้าแรก (Publish Live) สำเร็จเรียบร้อย!');
    }
  };

  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    setLoadingRevisions(true);
    try {
      const res = await fetch(`/api/cms/pages/${pageId}/revisions`);
      if (res.ok) {
        const data = await res.json();
        if (data.revisions && data.revisions.length > 0) {
          setRevisions(data.revisions);
        }
      }
    } catch {
      // Fallback to local memory revisions
    } finally {
      setLoadingRevisions(false);
    }
  };

  const handleRestoreRevision = (rev: RevisionItem) => {
    if (confirm(`คุณต้องการย้อนกลับ (Rollback) หน้านี้ไปยัง Revision #${rev.revision_number} (${new Date(rev.created_at).toLocaleString('th-TH')}) หรือไม่?`)) {
      if (rev.snapshot?.widgets && Array.isArray(rev.snapshot.widgets)) {
        setWidgets(rev.snapshot.widgets);
        saveHomepageWidgets(rev.snapshot.widgets);
        if (rev.snapshot.widgets.length > 0) {
          setSelectedWidgetId(rev.snapshot.widgets[0].id);
        }
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
      setWidgets(def);
      setSelectedWidgetId(def[0]?.id || null);
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
      {/* 1. Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.pageInfo}>
          <h2 className={styles.pageTitle}>🎨 {pageTitle}</h2>
          <span className={pageStatus === 'published' ? styles.statusBadgePublished : styles.statusBadgeDraft}>
            ● {pageStatus === 'published' ? 'PUBLISHED' : 'DRAFT'}
          </span>
          {hasUnsavedChanges && (
            <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 700 }}>
              * มีการแก้ไขที่ยังไม่ได้บันทึก
            </span>
          )}
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
            บันทึกล่าสุด: {lastSavedAt}
          </span>
        </div>

        {/* Device Switcher */}
        <div className={styles.deviceSwitcher}>
          <button
            type="button"
            className={`${styles.deviceBtn} ${deviceMode === 'mobile' ? styles.deviceBtnActive : ''}`}
            onClick={() => setDeviceMode('mobile')}
            title="มุมมองมือถือ (Mobile View - 390px)"
          >
            <Smartphone size={15} />
            <span>Mobile</span>
          </button>
          <button
            type="button"
            className={`${styles.deviceBtn} ${deviceMode === 'tablet' ? styles.deviceBtnActive : ''}`}
            onClick={() => setDeviceMode('tablet')}
            title="มุมมองแท็บเล็ต (Tablet View - 768px)"
          >
            <Tablet size={15} />
            <span>Tablet</span>
          </button>
          <button
            type="button"
            className={`${styles.deviceBtn} ${deviceMode === 'desktop' ? styles.deviceBtnActive : ''}`}
            onClick={() => setDeviceMode('desktop')}
            title="มุมมองเดสก์ท็อป (Desktop View - 100%)"
          >
            <Monitor size={15} />
            <span>Desktop</span>
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
            <RotateCcw size={14} />
            <span>รีเซ็ต</span>
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleOpenHistory}
            title="ประวัติการแก้ไขและ Rollback"
          >
            <History size={14} />
            <span>ประวัติแก้ไข ({revisions.length})</span>
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSaveDraft}
          >
            <Save size={14} />
            <span>บันทึกแบบร่าง</span>
          </button>
          <button
            type="button"
            className={styles.btnPublish}
            onClick={handlePublishNow}
            title={role === 'admin' ? 'เผยแพร่สู่ Production' : 'ต้องใช้สิทธิ์ Admin เพื่อ Publish'}
          >
            <Send size={14} />
            <span>เผยแพร่ (Publish)</span>
          </button>
          <Link
            href="/home"
            target="_blank"
            className={styles.btnSecondary}
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
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
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
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

      {/* 2. Workspace: Left Sidebar + Center Canvas Preview + Right Inspector */}
      <div className={styles.workspace}>
        {/* Left Sidebar: Widget Tree & Controls */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>โครงสร้าง Widgets ({widgets.length})</h3>
            <button
              type="button"
              className={styles.btnPrimary}
              style={{ padding: '6px 12px', fontSize: '11px' }}
              onClick={() => setShowCatalogModal(true)}
            >
              <Plus size={14} />
              <span>เพิ่ม Widget</span>
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
                  onClick={() => setSelectedWidgetId(widget.id)}
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
                      {widget.isActive ? <Eye size={14} color="#0D9488" /> : <EyeOff size={14} color="#94A3B8" />}
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
                      <ChevronUp size={14} />
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
                      <ChevronDown size={14} />
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

        {/* Center: Live Device Canvas Preview */}
        <main className={styles.canvasArea}>
          <div
            className={styles.deviceFrame}
            style={{
              width:
                deviceMode === 'mobile'
                  ? '390px'
                  : deviceMode === 'tablet'
                  ? '768px'
                  : '100%',
              maxWidth: deviceMode === 'desktop' ? '1200px' : undefined,
            }}
          >
            {/* Bezel */}
            {deviceMode !== 'desktop' && (
              <div className={styles.deviceBezelTop}>
                <span>9:41</span>
                <div className={styles.deviceNotch} />
                <span>5G 100%</span>
              </div>
            )}

            <div className={styles.deviceContent}>
              <WidgetRenderer widgets={widgets} />
            </div>
          </div>
        </main>

        {/* Right Sidebar: Widget Inspector */}
        {selectedWidget && (
          <aside className={styles.inspector}>
            <div className={styles.inspectorHeader}>
              <div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  ⚙️ ตั้งค่า Widget
                </h4>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  {selectedWidget.type} • ID: {selectedWidget.id}
                </span>
              </div>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setSelectedWidgetId(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.inspectorBody}>
              {/* Title Field */}
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(selectedWidget.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: selectedWidget.isActive ? '#0D9488' : '#F1F5F9',
                      color: selectedWidget.isActive ? '#FFFFFF' : '#475569',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {selectedWidget.isActive ? '✓ กำลังเปิดใช้งาน' : '○ ปิดการแสดงผล'}
                  </button>
                </div>
              </div>

              {/* Zod Validation Status */}
              <div>
                <label className={styles.formLabel} style={{ marginBottom: '6px', display: 'block' }}>
                  การตรวจสอบ Zod Schema (Runtime Validation)
                </label>
                {inspectorValidation.valid ? (
                  <div className={styles.validationAlertValid}>
                    <Check size={14} />
                    <span>Config ผ่านการตรวจสอบ Zod Runtime Schema แล้ว</span>
                  </div>
                ) : (
                  <div className={styles.validationAlertInvalid}>
                    <AlertCircle size={14} />
                    <span>{inspectorValidation.error}</span>
                  </div>
                )}
              </div>

              {/* JSON Config Editor */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.formLabel}>พารามิเตอร์ Config (JSON)</label>
                  <span style={{ fontSize: '10px', color: '#64748B' }}>Real-time update</span>
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

              {/* Apply Button */}
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleApplyInspector}
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
              >
                <span>บันทึกการตั้งค่า Widget</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* 3. Catalog Modal: Add New Widget */}
      {showCatalogModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowCatalogModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  ✨ คลัง Widget (Widget Catalog — Spec Sec 6 & 14)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
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
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => handleAddWidgetFromCatalog(item)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0D9488';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 148, 136, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '20px' }}>{item.icon}</span>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                        {item.name}
                      </h4>
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#0D9488',
                        backgroundColor: '#F0FDFA',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.type}
                    </span>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={styles.btnPrimary}
                    style={{ width: '100%', justifyContent: 'center', padding: '6px' }}
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

      {/* 4. History & Rollback Modal (Spec Sec 9 & 14) */}
      {showHistoryModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowHistoryModal(false)}>
          <div className={styles.modalCard} style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                  ⏱️ ประวัติการเผยแพร่ & การย้อนกลับ (Revisions & Rollback)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
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
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  กำลังโหลดข้อมูลประวัติ Revisions...
                </div>
              ) : revisions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  <History size={36} color="#CBD5E1" style={{ margin: '0 auto 10px' }} />
                  <p>ยังไม่มีประวัติการเผยแพร่ Snapshot ในระบบ</p>
                  <p style={{ fontSize: '12px' }}>เมื่อกด "เผยแพร่ (Publish)" ระบบจะบันทึก Snapshot อัตโนมัติ</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {revisions.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
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
                              color: '#FFFFFF',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            REV #{rev.revision_number}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            {rev.note || 'Snapshot ประจำเวอร์ชัน'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          บันทึกเมื่อ: {new Date(rev.created_at).toLocaleString('th-TH')} • โดย: {rev.created_by}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={styles.btnSecondary}
                        onClick={() => handleRestoreRevision(rev)}
                        style={{ borderColor: '#0D9488', color: '#0D9488', fontWeight: 700 }}
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
