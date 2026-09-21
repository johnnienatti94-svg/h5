'use client';

import React, { useState } from 'react';
import { AnyWidget } from '@/types/widget';
import styles from './homeWidgets.module.css';

interface Props {
  widgets: AnyWidget[];
  onUpdateWidgets: (widgets: AnyWidget[]) => void;
  onResetWidgets: () => void;
}

export default function WidgetQuickManagerModal({
  widgets,
  onUpdateWidgets,
  onResetWidgets,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleWidget = (id: string) => {
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, isActive: !w.isActive } : w
    );
    onUpdateWidgets(updated);
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= widgets.length) return;

    const copy = [...widgets];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    // Recalculate sortOrder
    const reordered = copy.map((w, idx) => ({ ...w, sortOrder: idx + 1 }));
    onUpdateWidgets(reordered);
  };

  const updateTitle = (id: string, newTitle: string) => {
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, title: newTitle } : w
    );
    onUpdateWidgets(updated);
  };

  return (
    <>
      {/* Floating Action Button (Admin / Demo Tool) */}
      <button
        className={styles.builderFab}
        onClick={() => setIsOpen(true)}
        aria-label="จัดการ Widget หน้าแรก"
        title="Homepage Widget Builder Preview (Spec Section 14)"
      >
        <span>⚙️</span>
        <span>ปรับแต่ง Widget</span>
      </button>

      {/* Builder Modal Sheet */}
      {isOpen && (
        <div className={styles.builderModalOverlay} onClick={() => setIsOpen(false)}>
          <div
            className={styles.builderModalSheet}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.builderHeader}>
              <div>
                <h3 className={styles.builderTitle}>🛠 ปรับแต่งหน้าแรก (Homepage Builder)</h3>
                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                  ทดสอบระบบ Widget Dynamic (สเปกข้อ 9, 13, 14)
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.builderList}>
              {widgets.map((widget, idx) => (
                <div key={widget.id} className={styles.builderItem}>
                  <div className={styles.builderItemInfo}>
                    <input
                      type="text"
                      value={widget.title}
                      onChange={(e) => updateTitle(widget.id, e.target.value)}
                      className={styles.builderItemTitle}
                      style={{
                        background: 'transparent',
                        border: '1px dashed var(--color-border)',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        width: '180px',
                      }}
                      title="คลิกเพื่อแก้ไขชื่อ Widget"
                    />
                    <span className={styles.builderItemType}>
                      {widget.type} • ลำดับ #{widget.sortOrder}
                    </span>
                  </div>

                  <div className={styles.builderControls}>
                    <button
                      className={styles.moveBtn}
                      onClick={() => moveWidget(idx, 'up')}
                      disabled={idx === 0}
                      title="เลื่อนขึ้น"
                    >
                      ▲
                    </button>
                    <button
                      className={styles.moveBtn}
                      onClick={() => moveWidget(idx, 'down')}
                      disabled={idx === widgets.length - 1}
                      title="เลื่อนลง"
                    >
                      ▼
                    </button>
                    <button
                      className={`${styles.toggleBtn} ${widget.isActive ? styles.toggleBtnActive : styles.toggleBtnInactive}`}
                      onClick={() => toggleWidget(widget.id)}
                    >
                      {widget.isActive ? 'เปิดอยู่' : 'ปิด'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <button
                onClick={onResetWidgets}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                คืนค่าเริ่มต้น
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'var(--color-primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                บันทึก & ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
