'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnyWidget } from '@/types/widget';
import {
  getHomepageWidgets,
  saveHomepageWidgets,
  resetHomepageWidgets,
} from '@/lib/homepageWidgets';
import styles from '../staff.module.css';

export default function StaffHomepageBuilderPage() {
  const [widgets, setWidgets] = useState<AnyWidget[]>([]);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setWidgets(getHomepageWidgets());
  }, []);

  const handleToggle = (id: string) => {
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, isActive: !w.isActive } : w
    );
    setWidgets(updated);
    saveHomepageWidgets(updated);
    notifySaved();
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= widgets.length) return;

    const copy = [...widgets];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;

    const reordered = copy.map((w, idx) => ({ ...w, sortOrder: idx + 1 }));
    setWidgets(reordered);
    saveHomepageWidgets(reordered);
    notifySaved();
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, title: newTitle } : w
    );
    setWidgets(updated);
    saveHomepageWidgets(updated);
    notifySaved();
  };

  const handleReset = () => {
    if (confirm('คุณต้องการรีเซ็ตลำดับ Widget ทั้งหมดกลับเป็นค่าเริ่มต้นหรือไม่?')) {
      const def = resetHomepageWidgets();
      setWidgets(def);
      notifySaved('รีเซ็ตการตั้งค่าเรียบร้อยแล้ว');
    }
  };

  const notifySaved = (msg = 'บันทึกการเปลี่ยนแปลงแล้ว (อัปเดตหน้าลูกค้าทันที)') => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 2500);
  };

  return (
    <div>
      <div className={styles.panelCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div>
            <div className={styles.panelTitle} style={{ marginBottom: '2px' }}>
              <span>🛠️</span>
              <span>ระบบจัดหน้าแรกลูกค้า (Homepage Builder — Spec Sec 14 & 22)</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B' }}>
              ปรับเปลี่ยนลำดับการแสดงผล เปิด/ปิดการทำงาน หรือเปลี่ยนชื่อหัวข้อ Widget มีผลต่อหน้าลูกค้าทันที
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleReset}
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              🔄 คืนค่าเริ่มต้น
            </button>
            <Link
              href="/home"
              target="_blank"
              style={{
                fontSize: '11px',
                padding: '6px 14px',
                borderRadius: '6px',
                background: '#2563EB',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              🌐 ดูตัวอย่างหน้าลูกค้า ›
            </Link>
          </div>
        </div>

        {saveMessage && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: '#DEF7EC',
              color: '#03543F',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>✓</span>
            <span>{saveMessage}</span>
          </div>
        )}

        {/* Widgets List Table */}
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>ลำดับ</th>
              <th>ประเภท Widget</th>
              <th>ชื่อหัวข้อ (สามารถแก้ไขได้)</th>
              <th style={{ width: '100px' }}>สถานะ</th>
              <th style={{ width: '140px', textAlign: 'center' }}>การควบคุม</th>
            </tr>
          </thead>
          <tbody>
            {widgets.map((w, idx) => (
              <tr key={w.id} style={{ opacity: w.isActive ? 1 : 0.6 }}>
                <td style={{ fontWeight: 800, color: '#2563EB', textAlign: 'center' }}>
                  #{w.sortOrder}
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{w.type}</div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>ID: {w.id}</div>
                </td>
                <td>
                  <input
                    type="text"
                    value={w.title}
                    onChange={(e) => handleTitleChange(w.id, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      width: '100%',
                      maxWidth: '220px',
                    }}
                    title="คลิกเพื่อแก้ไขชื่อหัวข้อ"
                  />
                </td>
                <td>
                  <button
                    onClick={() => handleToggle(w.id)}
                    className={w.isActive ? styles.statusActive : styles.statusInactive}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {w.isActive ? '● กำลังเปิด' : '○ ปิดการแสดง'}
                  </button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '4px' }}>
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #CBD5E1',
                        background: '#FFF',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '11px',
                      }}
                      title="เลื่อนขึ้น"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === widgets.length - 1}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #CBD5E1',
                        background: '#FFF',
                        cursor: idx === widgets.length - 1 ? 'not-allowed' : 'pointer',
                        fontSize: '11px',
                      }}
                      title="เลื่อนลง"
                    >
                      ▼
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
