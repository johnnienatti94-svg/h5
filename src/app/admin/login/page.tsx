'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_ADMIN_USERS, setAdminAuth } from '@/lib/adminSystem';
import styles from '../admin.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin01');
  const [pin, setPin] = useState('9999');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const account = DEMO_ADMIN_USERS[username.trim()];
    if (account && account.pin === pin.trim()) {
      setAdminAuth(account.user);
      router.replace('/admin/dashboard');
    } else {
      setErrorMsg('ข้อมูลเข้าสู่ระบบไม่ถูกต้อง (ลอง admin01 / PIN: 9999 หรือ dev01 / PIN: 7777)');
    }
  };

  const quickLogin = (userKey: string) => {
    const account = DEMO_ADMIN_USERS[userKey];
    if (account) {
      setUsername(userKey);
      setPin(account.pin);
      setAdminAuth(account.user);
      router.replace('/admin/dashboard');
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0B0F19',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
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
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔐</div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC', letterSpacing: '1px' }}>
            MEEPRO SECURITY CONSOLE
          </h1>
          <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
            ระบบควบคุมระดับผู้ดูแลระบบและวิศวกรซอฟต์แวร์ (Spec Sec 23 & 24)
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #7F1D1D',
              color: '#FCA5A5',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '6px' }}>
              ADMIN / DEVELOPER USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.formInput}
              style={{ width: '100%' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '6px' }}>
              SECURITY PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className={styles.formInput}
              style={{ width: '100%' }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              height: '42px',
              background: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            เข้าสู่ระบบความปลอดภัย
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #1F2937', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#64748B', marginBottom: '10px' }}>
            DEMO ACCESS TRIGGER
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={() => quickLogin('admin01')}
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #374151',
                background: '#1F2937',
                color: '#FCA5A5',
                cursor: 'pointer',
              }}
            >
              🛡️ Admin Demo
            </button>
            <button
              onClick={() => quickLogin('dev01')}
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #374151',
                background: '#1F2937',
                color: '#6EE7B7',
                cursor: 'pointer',
              }}
            >
              💻 Developer Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
