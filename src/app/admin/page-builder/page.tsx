'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VisualPageBuilder from '@/components/cms/VisualPageBuilder';
import { useAdminGuard } from '@/lib/adminSystem';
import { supabase } from '@/lib/supabase';

interface EditablePage {
  id: string;
  name: string;
}

function AdminPageBuilderContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || 'home';
  const { admin, isChecking } = useAdminGuard();
  const [page, setPage] = useState<EditablePage | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!admin) return;
    let active = true;

    void supabase
      .from('pages')
      .select('id, name')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data) {
          if (slug !== 'home') {
            void supabase
              .from('pages')
              .select('id, name')
              .eq('slug', 'home')
              .maybeSingle()
              .then(({ data: homeData }) => {
                if (!active) return;
                if (homeData) {
                  setPage(homeData as EditablePage);
                } else {
                  setLoadError('ไม่พบหน้า home ที่แก้ไขได้ กรุณาตรวจสอบ migration และข้อมูลเริ่มต้น');
                }
              });
            return;
          }
          setLoadError('ไม่พบหน้า home ที่แก้ไขได้ กรุณาตรวจสอบ migration และข้อมูลเริ่มต้น');
          return;
        }
        setPage(data as EditablePage);
      });

    return () => {
      active = false;
    };
  }, [admin, slug]);

  if (isChecking || !admin) {
    return <div style={{ color: '#CBD5E1' }}>กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (loadError) {
    return <div role="alert" style={{ padding: '20px', borderRadius: '12px', background: '#3F1D23', color: '#FECACA' }}>{loadError}</div>;
  }

  if (!page) {
    return <div role="status" style={{ color: '#CBD5E1' }}>กำลังโหลดแบบร่าง...</div>;
  }

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', paddingBottom: '32px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 4px' }}>
          ศูนย์จัดการหน้าเว็บไซต์
        </h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
          บันทึกแบบร่าง ตรวจสอบ และเผยแพร่ด้วยบัญชีผู้ดูแลที่ยืนยันแล้ว
        </p>
      </div>
      <VisualPageBuilder role={admin.role} pageId={page.id} pageTitle={page.name} />
    </div>
  );
}

export default function AdminPageBuilderPage() {
  return (
    <Suspense fallback={<div style={{ color: '#CBD5E1' }}>กำลังโหลด...</div>}>
      <AdminPageBuilderContent />
    </Suspense>
  );
}
