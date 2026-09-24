'use client';

import React, { useState, useEffect } from 'react';
import { getSystemConfig, saveSystemConfig, SystemConfig } from '@/lib/adminSystem';
import styles from '../admin.module.css';

export default function AdminSystemConfigPage() {
  const [config, setConfig] = useState<SystemConfig>(getSystemConfig());
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    setConfig(getSystemConfig());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSystemConfig(config);
    setSaveStatus('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว มีผลต่อบริการทันที');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div>
      <div className={styles.consoleHeader}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
            ⚙️ การตั้งค่าระบบ & OTP GATEWAY
          </h1>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            ควบคุมโครงสร้างพื้นฐาน เกตเวย์ส่งรหัส OTP และระบบป้องกันอัตโนมัติ (Spec Sec 23)
          </p>
        </div>
      </div>

      {saveStatus && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: '#064E3B',
            color: '#6EE7B7',
            fontSize: '12px',
            marginBottom: '16px',
          }}
        >
          ✓ {saveStatus}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: OTP Gateway Configuration */}
        <div className={styles.consoleCard}>
          <div className={styles.consoleTitle}>
            <span>📱</span>
            <span>การตั้งค่าผู้ให้บริการ OTP (OTP Provider Configuration — Spec Sec 7 & 23)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ผู้ให้บริการเกตเวย์ SMS/OTP</label>
              <select
                value={config.otpProvider}
                onChange={(e) => setConfig({ ...config, otpProvider: e.target.value as SystemConfig['otpProvider'] })}
                className={styles.formInput}
              >
                <option value="SupabaseAuth">Supabase Auth Phone OTP</option>
                <option value="ThaiBulkSMS">ThaiBulkSMS (ประเทศไทย - มาตรฐาน)</option>
                <option value="Twilio">Twilio Verify API (ระดับนานาชาติ)</option>
                <option value="AWS_SNS">Amazon SNS (AWS Cloud SMS)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>อายุการใช้งานของรหัส OTP (วินาที)</label>
              <input
                type="number"
                value={config.otpExpirySeconds}
                onChange={(e) => setConfig({ ...config, otpExpirySeconds: Number(e.target.value) })}
                className={styles.formInput}
                min={60}
                max={900}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ระยะเวลารอส่งรหัสใหม่ (Cooldown วินาที)</label>
              <input
                type="number"
                value={config.otpCooldownSeconds}
                onChange={(e) => setConfig({ ...config, otpCooldownSeconds: Number(e.target.value) })}
                className={styles.formInput}
                min={30}
                max={300}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bot Verification & Security */}
        <div className={styles.consoleCard}>
          <div className={styles.consoleTitle}>
            <span>🛡️</span>
            <span>ระบบป้องกันบอท & การจำกัดอัตราเรียก API (Spec Sec 6 & 23)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ระดับความเข้มงวดของ Turnstile Bot Check</label>
              <select
                value={config.botProtectionSensitivity}
                onChange={(e) => setConfig({ ...config, botProtectionSensitivity: e.target.value as SystemConfig['botProtectionSensitivity'] })}
                className={styles.formInput}
              >
                <option value="Low">Low (ตรวจสอบเฉพาะบอทที่พฤติกรรมชัดเจน)</option>
                <option value="Medium">Medium (สมดุลความสะดวกและความปลอดภัย - แนะนำ)</option>
                <option value="High">High (ท้าทายทุกคำขอที่น่าสงสัย)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>API Rate Limit ต่อ IP (คำขอ / นาที)</label>
              <input
                type="number"
                value={config.apiRateLimitPerMin}
                onChange={(e) => setConfig({ ...config, apiRateLimitPerMin: Number(e.target.value) })}
                className={styles.formInput}
                min={30}
                max={600}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Maintenance Mode */}
        <div className={styles.consoleCard}>
          <div className={styles.consoleTitle}>
            <span>🛑</span>
            <span>โหมดปิดปรับปรุงระบบ (Maintenance Mode — Spec Sec 23)</span>
          </div>

          <div className={styles.formGroup}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.maintenanceMode}
                onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#EF4444' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 700, color: config.maintenanceMode ? '#F87171' : '#9CA3AF' }}>
                เปิดใช้งานโหมดปิดปรับปรุงระบบ (ระบบจะแสดงแบนเนอร์แจ้งเตือนและระงับการสั่งซื้อ)
              </span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>ข้อความประกาศปิดปรับปรุง (Maintenance Message)</label>
            <textarea
              value={config.maintenanceMessage}
              onChange={(e) => setConfig({ ...config, maintenanceMessage: e.target.value })}
              className={styles.formInput}
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            padding: '12px 24px',
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          }}
        >
          💾 บันทึกการเปลี่ยนแปลงทั้งหมด
        </button>
      </form>
    </div>
  );
}
