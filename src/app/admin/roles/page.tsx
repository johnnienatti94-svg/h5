'use client';

import React from 'react';
import { RBAC_MATRIX } from '@/lib/adminSystem';
import styles from '../admin.module.css';

export default function AdminRolesPage() {
  return (
    <div>
      <div className={styles.consoleHeader}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
            🛡️ ตารางสิทธิ์การใช้งานตามบทบาท (RBAC Permission Matrix — Spec Sec 24)
          </h1>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            การตรวจสอบความปลอดภัยระดับโครงสร้าง: Authentication + Role + Permission
          </p>
        </div>
      </div>

      <div className={styles.consoleCard}>
        <div style={{ marginBottom: '16px', fontSize: '12px', color: '#9CA3AF', lineHeight: '1.6' }}>
          ตามข้อกำหนดสเปกข้อ 24 การจำกัดสิทธิ์ต้องดำเนินการตรวจสอบบนฝั่งเซิร์ฟเวอร์ (Server-side validation)
          ไม่พึ่งพาเพียงการซ่อนปุ่มบนหน้าจอ โดยมี 5 บทบาทหลักในระบบ MeePro:
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.consoleTable}>
            <thead>
              <tr>
                <th style={{ minWidth: '180px' }}>โมดูลการทำงาน</th>
                <th style={{ minWidth: '220px' }}>คำอธิบายหน้าที่</th>
                <th style={{ textAlign: 'center', width: '90px' }}>CUSTOMER</th>
                <th style={{ textAlign: 'center', width: '90px' }}>STAFF</th>
                <th style={{ textAlign: 'center', width: '90px' }}>MANAGER</th>
                <th style={{ textAlign: 'center', width: '90px' }}>ADMIN</th>
                <th style={{ textAlign: 'center', width: '90px' }}>DEVELOPER</th>
              </tr>
            </thead>
            <tbody>
              {RBAC_MATRIX.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#F8FAFC' }}>{row.module}</td>
                  <td style={{ color: '#94A3B8', fontSize: '11px' }}>{row.description}</td>
                  <td style={{ textAlign: 'center' }}>
                    {row.customer ? <span style={{ color: '#34D399' }}>✓</span> : <span style={{ color: '#475569' }}>✕</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.staff ? <span style={{ color: '#34D399' }}>✓</span> : <span style={{ color: '#475569' }}>✕</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.manager ? <span style={{ color: '#34D399' }}>✓</span> : <span style={{ color: '#475569' }}>✕</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.admin ? <span style={{ color: '#34D399' }}>✓</span> : <span style={{ color: '#475569' }}>✕</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.developer ? <span style={{ color: '#34D399' }}>✓</span> : <span style={{ color: '#475569' }}>✕</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '20px', padding: '12px', background: '#1E293B', borderRadius: '8px', fontSize: '11px', color: '#94A3B8' }}>
          💡 <strong>Security Rule:</strong> คำขอแก้ไขข้อมูลใดๆ ผ่าน API จะต้องมี JWT Header
          พร้อมตรวจสอบ Role Claim และ Permission Scope ใน Middleware ก่อนอนุญาตให้ดำเนินการ
        </div>
      </div>
    </div>
  );
}
