'use client';

import React from 'react';
import Link from 'next/link';
import { useStaffGuard } from '@/lib/staffAuth';
import styles from '../staff.module.css';

export default function StaffDashboardPage() {
  const { staff } = useStaffGuard();

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
        }}
      >
        <div style={{ fontSize: '13px', opacity: 0.9 }}>ยินดีต้อนรับสู่ระบบงานสาขา</div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>
          สวัสดี, {staff?.name || 'เจ้าหน้าที่ MeePro'}
        </h1>
        <p style={{ fontSize: '12px', opacity: 0.85, marginTop: '6px' }}>
          สาขาประจำการ: {staff?.branch || 'MeePro Flagship CentralWorld'} • สิทธิ์การใช้งาน: {staff?.role || 'STAFF'}
        </p>
      </div>

      {/* KPI Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>ลูกค้าลงทะเบียนวันนี้</div>
          <div className={styles.metricValue}>128 คน</div>
          <div className={styles.metricNote}>↑ +14% เทียบกับสัปดาห์ก่อน</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>สัญญาผ่อนชำระ 0% หน้าร้าน</div>
          <div className={styles.metricValue}>42 สัญญา</div>
          <div className={styles.metricNote}>ยอดผ่อนรวม ฿1,420,000</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Widget หน้าแรกที่เปิดใช้</div>
          <div className={styles.metricValue}>6 / 7 รายการ</div>
          <div className={styles.metricNote} style={{ color: '#6366F1' }}>
            พร้อมระบบแสดงผล Dynamic
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>แคมเปญโปรโมชั่นที่ Active</div>
          <div className={styles.metricValue}>3 แคมเปญ</div>
          <div className={styles.metricNote}>Flash Sale สิ้นสุดใน 6 ชม.</div>
        </div>
      </div>

      {/* Quick Action Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Customer Lookup Card */}
        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <span>🔍</span>
            <span>ค้นหาข้อมูลลูกค้า (Customer CRM)</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', marginBottom: '16px' }}>
            ค้นหาข้อมูลสิทธิ์สมาชิก ตรวจสอบการยืนยันเบอร์ OTP ยอดพอยท์สะสม และสัญญาผ่อนชำระ 0% ของลูกค้า
          </p>
          <Link href="/staff/customer-lookup" className={styles.actionButton} style={{ display: 'inline-flex', alignItems: 'center' }}>
            ไปยังระบบค้นหาลูกค้า ›
          </Link>
        </div>

        {/* Homepage Widget Builder Card */}
        <div className={styles.panelCard}>
          <div className={styles.panelTitle}>
            <span>🛠️</span>
            <span>จัดการหน้าแรกลูกค้า (Widget Builder)</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', marginBottom: '16px' }}>
            สลับลำดับ Widget เปิด/ปิดส่วนแสดงผล แก้ไขชื่อหมวดหมู่ (ลดพิเศษ, สินค้าแนะนำ) มีผลกับหน้าเว็บทันที
          </p>
          <Link href="/staff/homepage-builder" className={styles.actionButton} style={{ display: 'inline-flex', alignItems: 'center', background: '#059669' }}>
            เปิดเครื่องมือจัดหน้าแรก ›
          </Link>
        </div>
      </div>
    </div>
  );
}
