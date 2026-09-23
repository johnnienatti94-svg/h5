'use client';

import React from 'react';
import VisualPageBuilder from '@/components/cms/VisualPageBuilder';

export default function StaffHomepageBuilderPage() {
  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', paddingBottom: '32px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
          🛠️ ระบบจัดหน้าแรกลูกค้า (Visual Page Builder — Spec Sec 14 & 22)
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
          ปรับเปลี่ยนลำดับการแสดงผล เพิ่ม/ลบ Widget หรือแก้ไขการตั้งค่า พร้อมการแสดงผลแบบ Live Preview
        </p>
      </div>

      <VisualPageBuilder role="staff" pageId="p-home-001" pageTitle="หน้าแรก MeePro (Homepage)" />
    </div>
  );
}
