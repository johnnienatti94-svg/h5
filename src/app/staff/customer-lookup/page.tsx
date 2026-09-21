'use client';

import React, { useState } from 'react';
import { lookupCustomerByPhone, CustomerRecord } from '@/lib/customerDatabase';
import styles from '../staff.module.css';

export default function StaffCustomerLookupPage() {
  const [searchPhone, setSearchPhone] = useState('0891234567');
  const [customer, setCustomer] = useState<CustomerRecord | null>(lookupCustomerByPhone('0891234567'));
  const [searched, setSearched] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<string[]>(customer?.notes || []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const result = lookupCustomerByPhone(searchPhone);
    setCustomer(result);
    setNotes(result?.notes || []);
    setSearched(true);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const updated = [...notes, `พนักงานบันทึก (${new Date().toLocaleDateString('th-TH')}): ${newNote.trim()}`];
    setNotes(updated);
    setNewNote('');
  };

  return (
    <div>
      <div className={styles.panelCard}>
        <div className={styles.panelTitle}>
          <span>🔍</span>
          <span>ระบบค้นหาข้อมูลลูกค้า (MeePro Customer Lookup — Spec Sec 4 & 22)</span>
        </div>
        <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
          ระบุหมายเลขโทรศัพท์ลูกค้าที่ยืนยันผ่าน OTP เพื่อดูสิทธิ์สมาชิก ยอดสะสมพอยท์ สัญญาผ่อน 0% และประวัติ PDPA
        </p>

        {/* Search Input */}
        <form onSubmit={handleSearch} className={styles.formRow}>
          <input
            type="tel"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="กรอกเบอร์โทรลูกค้า เช่น 0891234567 หรือ 0812345678"
            className={styles.textInput}
            required
          />
          <button type="submit" className={styles.actionButton}>
            ค้นหาข้อมูลลูกค้า
          </button>
        </form>

        {/* Quick Demo Numbers */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: '#64748B' }}>
          <span>เบอร์ตัวอย่าง:</span>
          <button
            type="button"
            onClick={() => { setSearchPhone('0891234567'); setCustomer(lookupCustomerByPhone('0891234567')); }}
            style={{ textDecoration: 'underline', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px' }}
          >
            089-123-4567 (Gold / มีสัญญาผ่อน)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => { setSearchPhone('0812345678'); setCustomer(lookupCustomerByPhone('0812345678')); }}
            style={{ textDecoration: 'underline', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px' }}
          >
            081-234-5678 (Silver)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => { setSearchPhone('0869998877'); setCustomer(lookupCustomerByPhone('0869998877')); }}
            style={{ textDecoration: 'underline', color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px' }}
          >
            086-999-8877 (Platinum VIP)
          </button>
        </div>
      </div>

      {/* Search Result */}
      {customer ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Profile Info */}
          <div className={styles.panelCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>{customer.name}</h2>
                  <span className={styles.statusActive}>● บัญชีผ่านการยืนยันตัวตน</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  รหัสลูกค้า: {customer.id} • อีเมล: {customer.email}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    background: customer.tier === 'Platinum' ? '#0F172A' : customer.tier === 'Gold' ? '#D97706' : '#475569',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                  }}
                >
                  ⭐ {customer.tier} Member
                </span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                  {customer.points.toLocaleString()} พอยท์
                </div>
              </div>
            </div>

            {/* Verification & PDPA Details (Spec Sec 4 & 5) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>หมายเลขโทรศัพท์ยืนยัน OTP:</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{customer.phone}</div>
                <div style={{ fontSize: '10px', color: '#10B981' }}>✓ ยืนยันเมื่อ {customer.phoneVerifiedAt}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>ความยินยอม PDPA Consent:</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {customer.pdpaConsent.accepted ? 'ยินยอมแล้ว (Active)' : 'ยังไม่ยินยอม'}
                </div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>
                  เวอร์ชัน {customer.pdpaConsent.version} • {customer.pdpaConsent.acceptedAt}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>ยอดซื้อสะสมตลอดการเป็นสมาชิก:</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  ฿{customer.totalSpent.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Active 0% Installment Contracts */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                💳 สัญญาผ่อนชำระ MeePro 0% ที่กำลังผ่อนอยู่ ({customer.activeContracts.length} สัญญา)
              </h3>
              {customer.activeContracts.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#94A3B8', padding: '8px', background: '#F8FAFC', borderRadius: '6px' }}>
                  ไม่มีสัญญาผ่อนที่ค้างชำระ
                </div>
              ) : (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>เลขที่สัญญา</th>
                      <th>สินค้า</th>
                      <th>ยอดเต็ม</th>
                      <th>ค่างวด/เดือน</th>
                      <th>งวดคงเหลือ</th>
                      <th>ธนาคาร</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.activeContracts.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700 }}>{c.id}</td>
                        <td>{c.product}</td>
                        <td>฿{c.totalAmount.toLocaleString()}</td>
                        <td style={{ color: '#2563EB', fontWeight: 700 }}>฿{c.monthlyInstallment.toLocaleString()}</td>
                        <td>{c.remainingMonths} เดือน</td>
                        <td>{c.bank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Staff Notes */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                📝 บันทึกประวัติการให้บริการของสาขา
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                {notes.map((n, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: '#334155', padding: '6px 10px', background: '#F1F5F9', borderRadius: '6px' }}>
                    • {n}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="พิมพ์ข้อความบันทึกเพิ่มเติมสำหรับลูกค้ารายนี้..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className={styles.textInput}
                  style={{ height: '36px', fontSize: '12px' }}
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className={styles.actionButton}
                  style={{ height: '36px', padding: '0 14px', fontSize: '11px' }}
                >
                  เพิ่มบันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : searched ? (
        <div className={styles.panelCard} style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔍</div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>ไม่พบข้อมูลลูกค้าสำหรับเบอร์นี้</h3>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            ลูกค้าอาจยังไม่ได้ยืนยันตัวตนผ่าน OTP หรือระบุหมายเลขโทรศัพท์ผิด
          </p>
        </div>
      ) : null}
    </div>
  );
}
