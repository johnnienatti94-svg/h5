'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInStaff } from '@/lib/staffAuth';
import styles from '../staff.module.css';

export default function StaffLoginPage() {
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
      router.replace(staff.role === 'ADMIN' || staff.role === 'HQ' ? '/admin/dashboard' : '/staff/dashboard');
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
        background: '#142B4A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px 24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.35)',
        }}
        aria-labelledby="staff-login-title"
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div aria-hidden="true" style={{ fontSize: '36px', marginBottom: '8px' }}>🏢</div>
          <h1 id="staff-login-title" style={{ fontSize: '20px', fontWeight: 800, color: '#142B4A' }}>
            MEEPRO STAFF PORTAL
          </h1>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            เข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่ที่ผู้ดูแลระบบออกให้
          </p>
        </div>

        {errorMsg && (
          <div role="alert" style={{ padding: '10px', borderRadius: '8px', background: '#FEE2E2', color: '#991B1B', fontSize: '12px', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label htmlFor="staff-phone" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              เบอร์โทรศัพท์เจ้าหน้าที่
            </label>
            <input
              id="staff-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={styles.textInput}
              style={{ width: '100%' }}
              placeholder="0xx-xxx-xxxx"
              required
            />
          </div>

          <div>
            <label htmlFor="staff-password" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              รหัสผ่าน
            </label>
            <input
              id="staff-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={styles.textInput}
              style={{ width: '100%' }}
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className={styles.actionButton} style={{ width: '100%', minHeight: '44px', marginTop: '8px' }}>
            {isSubmitting ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบเจ้าหน้าที่'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '11px', lineHeight: 1.6, color: '#64748B', textAlign: 'center' }}>
          บัญชีและสิทธิ์สาขาถูกตรวจสอบจาก Supabase Auth และฐานข้อมูลทุกครั้ง ไม่มีบัญชีสาธิตในระบบจริง
        </p>
      </section>
    </main>
  );
}
