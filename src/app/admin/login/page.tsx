'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearStaffAuth, signInStaff } from '@/lib/staffAuth';
import styles from '../admin.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const staff = await signInStaff(phone, password);
      if (staff.role !== 'ADMIN' && staff.role !== 'HQ') {
        await clearStaffAuth();
        throw new Error('บัญชีนี้ไม่มีสิทธิ์เข้าสู่ระบบผู้ดูแล');
      }
      router.replace('/admin/dashboard');
    } catch (cause) {
      setErrorMsg(cause instanceof Error ? cause.message : 'ไม่สามารถเข้าสู่ระบบได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#0B0F19',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <section
        aria-labelledby="admin-login-title"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#111827',
          border: '1px solid #1F2937',
          borderRadius: '16px',
          padding: '32px 24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div aria-hidden="true" style={{ fontSize: '36px', marginBottom: '8px' }}>🔐</div>
          <h1 id="admin-login-title" style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC', letterSpacing: '1px' }}>
            MEEPRO ADMIN CONSOLE
          </h1>
          <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
            เข้าสู่ระบบด้วยบัญชี HQ หรือผู้ดูแลที่ออกโดยระบบ
          </p>
        </div>

        {errorMsg && (
          <div role="alert" style={{ padding: '10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #7F1D1D', color: '#FCA5A5', fontSize: '12px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label htmlFor="admin-phone" style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
              เบอร์โทรศัพท์เจ้าหน้าที่
            </label>
            <input
              id="admin-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={styles.formInput}
              style={{ width: '100%' }}
              placeholder="0xx-xxx-xxxx"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-password" style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
              รหัสผ่าน
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={styles.formInput}
              style={{ width: '100%' }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              minHeight: '44px',
              background: isSubmitting ? '#475569' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isSubmitting ? 'wait' : 'pointer',
              marginTop: '8px',
            }}
          >
            {isSubmitting ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบผู้ดูแล'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '11px', lineHeight: 1.6, color: '#64748B', textAlign: 'center' }}>
          ตัวตนและสิทธิ์จะถูกตรวจสอบจาก Supabase Auth และโปรไฟล์เจ้าหน้าที่ทุกครั้ง
        </p>
      </section>
    </main>
  );
}
