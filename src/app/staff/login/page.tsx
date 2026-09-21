'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_STAFF_USERS, setStaffAuth } from '@/lib/staffAuth';
import styles from '../staff.module.css';

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('staff01');
  const [pin, setPin] = useState('1234');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const account = DEMO_STAFF_USERS[username.trim()];
    if (account && account.pin === pin.trim()) {
      setStaffAuth(account.user);
      router.replace('/staff/dashboard');
    } else {
      setErrorMsg('รหัสพนักงานหรือรหัสผ่าน PIN ไม่ถูกต้อง (ลอง staff01 / PIN: 1234)');
    }
  };

  const quickLogin = (userKey: string) => {
    const account = DEMO_STAFF_USERS[userKey];
    if (account) {
      setUsername(userKey);
      setPin(account.pin);
      setStaffAuth(account.user);
      router.replace('/staff/dashboard');
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px 24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏢</div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>MEEPRO STAFF PORTAL</h1>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            ระบบปฏิบัติการสำหรับเจ้าหน้าที่สาขาและฝ่ายบริหาร
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: '#FDE8E8',
              color: '#9B1C1C',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              รหัสพนักงาน (Staff ID)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.textInput}
              style={{ width: '100%' }}
              placeholder="e.g. staff01"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              รหัส PIN / Password
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className={styles.textInput}
              style={{ width: '100%' }}
              placeholder="4-digit PIN"
              required
            />
          </div>

          <button type="submit" className={styles.actionButton} style={{ width: '100%', height: '44px', marginTop: '8px' }}>
            เข้าสู่ระบบเจ้าหน้าที่
          </button>
        </form>

        {/* Quick Demo Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #E2E8F0', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '10px' }}>
            บัญชีทดสอบด่วน (Quick Demo Accounts)
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              onClick={() => quickLogin('staff01')}
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                cursor: 'pointer',
              }}
            >
              👤 พนักงานหน้าร้าน (Staff)
            </button>
            <button
              onClick={() => quickLogin('manager01')}
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                cursor: 'pointer',
              }}
            >
              ⭐ ผู้จัดการ (Manager)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
