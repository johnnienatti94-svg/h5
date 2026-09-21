'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminGuard, getSystemConfig, saveSystemConfig } from '@/lib/adminSystem';
import styles from '../admin.module.css';

export default function AdminDashboardPage() {
  const { admin } = useAdminGuard();
  const [config, setConfig] = useState(getSystemConfig());
  const [toggleNotice, setToggleNotice] = useState('');

  useEffect(() => {
    setConfig(getSystemConfig());
  }, []);

  const handleToggleMaintenance = () => {
    const updated = { ...config, maintenanceMode: !config.maintenanceMode };
    setConfig(updated);
    saveSystemConfig(updated);
    setToggleNotice(
      updated.maintenanceMode
        ? '⚠️ เปิดโหมดปิดปรับปรุงระบบแล้ว (Customer Frontend จะแสดงแถบแจ้งเตือน)'
        : '✓ ปิดโหมดปิดปรับปรุงแล้ว (ระบบกลับสู่สถานะปกติ)'
    );
    setTimeout(() => setToggleNotice(''), 3000);
  };

  return (
    <div>
      {/* Telemetry Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC' }}>
          SYSTEM OVERVIEW & TELEMETRY
        </h1>
        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
          สถานะการทำงานของระบบ MeePro Platform แบบ Real-time
        </p>
      </div>

      {/* Maintenance Mode Alert Banner if active */}
      {config.maintenanceMode && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #7F1D1D',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F87171' }}>
              ⚠️ โหมดปิดปรับปรุงระบบกำลังเปิดใช้งาน (Maintenance Mode: ACTIVE)
            </div>
            <div style={{ fontSize: '11px', color: '#E2E8F0', marginTop: '2px' }}>
              ข้อความแจ้งเตือน: "{config.maintenanceMessage}"
            </div>
          </div>
          <button
            onClick={handleToggleMaintenance}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: '#EF4444',
              color: '#FFF',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ปิดโหมดปรับปรุง
          </button>
        </div>
      )}

      {toggleNotice && (
        <div
          style={{
            background: '#064E3B',
            color: '#6EE7B7',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            marginBottom: '16px',
          }}
        >
          {toggleNotice}
        </div>
      )}

      {/* Telemetry Metrics */}
      <div className={styles.telemetryGrid}>
        <div className={styles.telemetryCard}>
          <div className={styles.telemetryLabel}>SYSTEM UPTIME</div>
          <div className={styles.telemetryValue}>99.99%</div>
          <div className={styles.telemetryStatus}>● 0 Unplanned Outages</div>
        </div>

        <div className={styles.telemetryCard}>
          <div className={styles.telemetryLabel}>API P95 LATENCY</div>
          <div className={styles.telemetryValue}>42 ms</div>
          <div className={styles.telemetryStatus}>● Edge Cache Hit: 88%</div>
        </div>

        <div className={styles.telemetryCard}>
          <div className={styles.telemetryLabel}>OTP GATEWAY SUCCESS</div>
          <div className={styles.telemetryValue}>99.8%</div>
          <div className={styles.telemetryStatus}>● Provider: {config.otpProvider}</div>
        </div>

        <div className={styles.telemetryCard}>
          <div className={styles.telemetryLabel}>ACTIVE SESSIONS</div>
          <div className={styles.telemetryValue}>1,420</div>
          <div className={styles.telemetryStatus}>● Authenticated via OTP</div>
        </div>
      </div>

      {/* Quick Controls Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className={styles.consoleCard}>
          <div className={styles.consoleTitle}>
            <span>⚙️</span>
            <span>การควบคุมระบบด่วน (Quick Switch)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>โหมดปิดปรับปรุงระบบ (Maintenance Mode)</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>แสดงแบนเนอร์แจ้งเตือนและระงับการสั่งซื้อ</div>
              </div>
              <button
                onClick={handleToggleMaintenance}
                className={config.maintenanceMode ? styles.badgeDanger : styles.badgeSuccess}
                style={{ border: 'none', cursor: 'pointer', padding: '6px 12px' }}
              >
                {config.maintenanceMode ? 'เปิดอยู่ (ON)' : 'ปิดอยู่ (OFF)'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>เกตเวย์ OTP ปัจจุบัน</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>ผู้ให้บริการส่งข้อความยืนยัน 6 หลัก</div>
              </div>
              <span className={styles.badgeSuccess}>{config.otpProvider} Mode</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>ระบบป้องกันบอท (Turnstile)</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>ความเข้มงวดในการตรวจสอบอัตโนมัติ</div>
              </div>
              <span className={styles.badgeWarning}>{config.botProtectionSensitivity}</span>
            </div>
          </div>
        </div>

        <div className={styles.consoleCard}>
          <div className={styles.consoleTitle}>
            <span>🛡️</span>
            <span>การจัดการความปลอดภัย & สิทธิ์</span>
          </div>
          <p style={{ fontSize: '12px', color: '#9CA3AF', lineHeight: '1.5', marginBottom: '16px' }}>
            ตรวจสอบตารางสิทธิ์การเข้าถึงแบบ Role-Based Access Control (RBAC) ทั้ง 5 บทบาทตามสเปกข้อ 24
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href="/admin/roles"
              style={{
                fontSize: '11px',
                padding: '8px 14px',
                background: '#2563EB',
                color: '#FFF',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 700,
              }}
            >
              ตารางสิทธิ์ RBAC ›
            </Link>
            <Link
              href="/admin/logs"
              style={{
                fontSize: '11px',
                padding: '8px 14px',
                background: '#1F2937',
                border: '1px solid #374151',
                color: '#E2E8F0',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              ดูบันทึกเหตุการณ์ (Logs) ›
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
