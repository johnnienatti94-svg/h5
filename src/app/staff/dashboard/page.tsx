'use client';

import Link from 'next/link';
import { Building2, ShieldCheck, Store } from 'lucide-react';
import { useStaffGuard } from '@/lib/staffAuth';
import styles from '../staff.module.css';

export default function StaffDashboardPage() {
  const { staff, isChecking } = useStaffGuard();

  if (isChecking || !staff) {
    return <div role="status">กำลังตรวจสอบสิทธิ์...</div>;
  }

  return (
    <div>
      <section
        style={{
          background: 'linear-gradient(135deg, #142B4A 0%, #1E3A5F 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 10px 24px rgba(20, 43, 74, 0.2)',
        }}
      >
        <div style={{ fontSize: '13px', opacity: 0.82 }}>พื้นที่ทำงานเจ้าหน้าที่</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: '#FFFFFF' }}>
          สวัสดี, {staff.name}
        </h1>
        <p style={{ fontSize: '13px', opacity: 0.86, marginTop: '8px' }}>
          บทบาท: {staff.role} · สาขา: {staff.branchId || 'ไม่กำหนดสาขา'}
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <section className={styles.panelCard}>
          <div className={styles.panelTitle}><ShieldCheck size={21} aria-hidden="true" /><span>สิทธิ์จากฐานข้อมูล</span></div>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.65 }}>
            ระบบตรวจสอบสถานะ บทบาท และสาขาที่ได้รับมอบหมายจากโปรไฟล์เจ้าหน้าที่ทุกครั้ง ไม่รับค่าบทบาทจากเบราว์เซอร์
          </p>
        </section>

        <section className={styles.panelCard}>
          <div className={styles.panelTitle}><Building2 size={21} aria-hidden="true" /><span>งานตามขอบเขตสาขา</span></div>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.65 }}>
            คิวใบสมัครและการจัดการสาขาจะเปิดเมื่อ repository และการทดสอบ RLS ของ workflow นั้นพร้อมใช้งาน
          </p>
        </section>

        <section className={styles.panelCard}>
          <div className={styles.panelTitle}><Store size={21} aria-hidden="true" /><span>ตรวจสอบหน้าสาธารณะ</span></div>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.65, marginBottom: '14px' }}>
            ดูเฉพาะข้อมูลสาขาเวอร์ชันที่เผยแพร่แล้วเช่นเดียวกับลูกค้า
          </p>
          <Link href="/stores" className={styles.actionButton}>เปิดหน้าสาขา</Link>
        </section>
      </div>
    </div>
  );
}
