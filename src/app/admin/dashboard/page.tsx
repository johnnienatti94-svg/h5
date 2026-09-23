'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Zap,
  ShieldCheck,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Server,
  Database,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useAdminGuard, getSystemConfig, saveSystemConfig } from '@/lib/adminSystem';
import styles from '../admincn.module.css';

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
    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 4px' }}>
          📊 ภาพรวมระบบ & เทเลเมทรี (System Overview & Telemetry)
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
          การตรวจสอบสถานะสถาปัตยกรรม MeePro Mobile Platform แบบ Real-time ตามมาตรฐาน AdminCN
        </p>
      </div>

      {/* Maintenance Mode Alert Banner if active */}
      {config.maintenanceMode && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#F87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              <span>โหมดปิดปรับปรุงระบบกำลังเปิดใช้งาน (Maintenance Mode: ACTIVE)</span>
            </div>
            <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '4px' }}>
              ข้อความแจ้งเตือนลูกค้า: "{config.maintenanceMessage}"
            </div>
          </div>
          <button
            onClick={handleToggleMaintenance}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
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
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34D399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            marginBottom: '20px',
          }}
        >
          {toggleNotice}
        </div>
      )}

      {/* 1. Statistics Cards (AdminCN Pattern) */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statTitle}>SYSTEM UPTIME</span>
            <div className={styles.statIcon} style={{ color: '#34D399' }}>
              <Activity size={16} />
            </div>
          </div>
          <div className={styles.statValue}>99.99%</div>
          <div className={`${styles.statDelta} ${styles.deltaUp}`}>
            <span>● 0 Unplanned Outages</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>30 วันล่าสุด</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statTitle}>API P95 LATENCY</span>
            <div className={styles.statIcon} style={{ color: '#60A5FA' }}>
              <Zap size={16} />
            </div>
          </div>
          <div className={styles.statValue}>38 ms</div>
          <div className={`${styles.statDelta} ${styles.deltaUp}`}>
            <span>↑ Edge Cache Hit: 88%</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>Turbopack Ready</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statTitle}>OTP GATEWAY SUCCESS</span>
            <div className={styles.statIcon} style={{ color: '#FBBF24' }}>
              <Radio size={16} />
            </div>
          </div>
          <div className={styles.statValue}>99.8%</div>
          <div className={`${styles.statDelta} ${styles.deltaUp}`}>
            <span>✓ Provider: {config.otpProvider}</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>ThaiBulkSMS</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statCardHeader}>
            <span className={styles.statTitle}>ACTIVE SESSIONS</span>
            <div className={styles.statIcon} style={{ color: '#A78BFA' }}>
              <Users size={16} />
            </div>
          </div>
          <div className={styles.statValue}>1,420</div>
          <div className={`${styles.statDelta} ${styles.deltaUp}`}>
            <span>● Authenticated Users</span>
            <span style={{ color: '#64748B', fontWeight: 500 }}>Mobile Web</span>
          </div>
        </div>
      </div>

      {/* 2. AdminCN Quick Switches & Infrastructure Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Quick System Controls */}
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1F2937',
            borderRadius: '14px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1F2937', paddingBottom: '12px' }}>
            <Settings size={18} color="#60A5FA" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#F8FAFC' }}>
              การควบคุมระบบด่วน (Quick Switch)
            </h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>โหมดปิดปรับปรุงระบบ (Maintenance Mode)</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>แสดงแบนเนอร์แจ้งเตือนและระงับการสั่งซื้อชั่วคราว</div>
            </div>
            <button
              onClick={handleToggleMaintenance}
              style={{
                border: 'none',
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                backgroundColor: config.maintenanceMode ? '#EF4444' : '#10B981',
                color: '#FFFFFF',
              }}
            >
              {config.maintenanceMode ? 'เปิดอยู่ (ON)' : 'ปิดอยู่ (OFF)'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #1F2937' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>เกตเวย์ OTP ปัจจุบัน</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>ผู้ให้บริการส่งข้อความยืนยัน 6 หลัก</div>
            </div>
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {config.otpProvider} Mode
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #1F2937' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>การป้องกัน Bot / Rate Limit</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>จำกัด {config.apiRateLimitPerMin} requests/min ต่อ IP</div>
            </div>
            <span
              style={{
                backgroundColor: config.botProtectionEnabled ? 'rgba(37, 99, 235, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: config.botProtectionEnabled ? '#60A5FA' : '#F87171',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {config.botProtectionEnabled ? 'Active (ระดับ Medium)' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Infrastructure & Security Health */}
        <div
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1F2937',
            borderRadius: '14px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #1F2937', paddingBottom: '12px' }}>
            <Server size={18} color="#10B981" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#F8FAFC' }}>
              ความปลอดภัยและฐานข้อมูล (Infrastructure)
            </h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>PostgreSQL & Row Level Security (RLS)</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Supabase v2.1 Database Schema Locked</div>
            </div>
            <span style={{ color: '#34D399', fontSize: '12px', fontWeight: 700 }}>
              ✓ Enforced
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #1F2937' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Zod Runtime Schema Validation</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>38 Supported Component Types Protected</div>
            </div>
            <span style={{ color: '#34D399', fontSize: '12px', fontWeight: 700 }}>
              ✓ Active
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #1F2937' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Server-Authoritative Commerce Engine</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Idempotent Checkout with HMAC Tokens</div>
            </div>
            <span style={{ color: '#34D399', fontSize: '12px', fontWeight: 700 }}>
              ✓ Certified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
