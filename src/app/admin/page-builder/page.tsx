'use client';

import React from 'react';
import VisualPageBuilder from '@/components/cms/VisualPageBuilder';

export default function AdminPageBuilderPage() {
  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', paddingBottom: '32px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 4px' }}>
          🎨 ศูนย์ควบคุมและจัดหน้าเว็บไซต์ (Admin Visual Page Builder)
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
          สิทธิ์ Admin สูงสุด: ปรับแต่ง Layout จัดเรียง Widgets เผยแพร่สู่ระบบจริง (Publish) และย้อนกลับเวอร์ชัน (Rollback Revisions)
        </p>
      </div>

      <VisualPageBuilder role="admin" pageId="p-home-001" pageTitle="หน้าแรก MeePro (Live Homepage)" />
    </div>
  );
}
