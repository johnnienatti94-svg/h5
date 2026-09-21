'use client';

import React, { useState } from 'react';
import styles from '../staff.module.css';

interface BannerItem {
  id: string;
  title: string;
  tag: string;
  linkUrl: string;
  publishStart: string;
  publishEnd: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED';
  clicks: number;
}

const INITIAL_BANNERS: BannerItem[] = [
  {
    id: "BAN-001",
    title: "iPhone 16 Pro Max เปิดตัวแล้ววันนี้",
    tag: "โปรเปิดตัวสุดเอ็กซ์คลูซีฟ",
    linkUrl: "/catalog",
    publishStart: "2026-09-01",
    publishEnd: "2026-09-30",
    status: "ACTIVE",
    clicks: 1420,
  },
  {
    id: "BAN-002",
    title: "Galaxy S25 Ultra รับส่วนลดสูงสุด ฿8,000",
    tag: "Flash Deal ประจำสัปดาห์",
    linkUrl: "/promotion",
    publishStart: "2026-09-15",
    publishEnd: "2026-10-15",
    status: "ACTIVE",
    clicks: 980,
  },
  {
    id: "BAN-003",
    title: "แล็ปท็อป & แท็บเล็ต ผ่อน 0% ทุกรุ่น",
    tag: "Back to School & Work",
    linkUrl: "/promotion",
    publishStart: "2026-09-10",
    publishEnd: "2026-10-31",
    status: "ACTIVE",
    clicks: 654,
  },
  {
    id: "BAN-004",
    title: "MeePro 10.10 Super Shopping Day",
    tag: "แคมเปญใหญ่ประจำเดือน",
    linkUrl: "/promotion",
    publishStart: "2026-10-01",
    publishEnd: "2026-10-12",
    status: "SCHEDULED",
    clicks: 0,
  },
];

export default function StaffBannersPage() {
  const [banners, setBanners] = useState(INITIAL_BANNERS);

  const toggleStatus = (id: string) => {
    setBanners((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: b.status === 'ACTIVE' ? 'EXPIRED' : 'ACTIVE' }
          : b
      )
    );
  };

  return (
    <div>
      <div className={styles.panelCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div className={styles.panelTitle}>
              <span>🖼️</span>
              <span>จัดการแบนเนอร์และแคมเปญ (Banner Management — Spec Sec 11 & 22)</span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B' }}>
              ควบคุมการแสดงผลของแบนเนอร์หลักสัดส่วน 3:1 กำหนดวันเริ่มต้น-สิ้นสุด และสถิติการคลิก
            </p>
          </div>

          <button
            onClick={() => alert('เปิดฟอร์มสร้างแบนเนอร์ใหม่')}
            className={styles.actionButton}
            style={{ fontSize: '11px', height: '36px' }}
          >
            + สร้างแบนเนอร์ใหม่
          </button>
        </div>

        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>รหัสแบนเนอร์</th>
              <th>ชื่อแบนเนอร์ / ป้ายกำกับ</th>
              <th>ช่วงเวลาที่แสดง (Publish Schedule)</th>
              <th>ลิงก์ปลายทาง</th>
              <th>จำนวนคลิก</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 700 }}>{b.id}</td>
                <td>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{b.title}</div>
                  <div style={{ fontSize: '10px', color: '#2563EB' }}>🏷️ {b.tag}</div>
                </td>
                <td>
                  <div style={{ fontSize: '11px', color: '#334155' }}>
                    {b.publishStart} ถึง {b.publishEnd}
                  </div>
                </td>
                <td>
                  <code style={{ fontSize: '11px', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                    {b.linkUrl}
                  </code>
                </td>
                <td style={{ fontWeight: 700, color: '#059669' }}>
                  {b.clicks.toLocaleString()} ครั้ง
                </td>
                <td>
                  <button
                    onClick={() => toggleStatus(b.id)}
                    className={
                      b.status === 'ACTIVE'
                        ? styles.statusActive
                        : b.status === 'SCHEDULED'
                        ? styles.metricNote
                        : styles.statusInactive
                    }
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    {b.status === 'ACTIVE' ? '● กำลังแสดง' : b.status === 'SCHEDULED' ? '⏱️ รอเปิด' : '○ หมดอายุ'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
