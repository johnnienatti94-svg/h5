'use client';

import React, { useState } from 'react';
import { INITIAL_LOGS, SystemLogEntry } from '@/lib/adminSystem';
import styles from '../admin.module.css';

export default function AdminLogsPage() {
  const [logs] = useState<SystemLogEntry[]>(INITIAL_LOGS);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredLogs = logs.filter((entry) => {
    const matchType = selectedType === 'ALL' || entry.type === selectedType;
    const matchQuery =
      entry.message.toLowerCase().includes(searchFilter.toLowerCase()) ||
      entry.source.toLowerCase().includes(searchFilter.toLowerCase()) ||
      entry.ipAddress.includes(searchFilter);
    return matchType && matchQuery;
  });

  const exportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `meepro-system-logs-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div>
      <div className={styles.consoleHeader}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
            📜 บันทึกเหตุการณ์ระบบ (OBSERVABILITY LOGS — Spec Sec 23)
          </h1>
          <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            ตรวจสอบ API Logs, Webhook Logs, Audit Trail และ Error Logs เพื่อความโปร่งใสและตรวจสอบได้
          </p>
        </div>

        <button
          onClick={exportLogs}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            background: '#1F2937',
            border: '1px solid #374151',
            color: '#E2E8F0',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ⬇️ ส่งออก Log (JSON)
        </button>
      </div>

      {/* Log Type Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['ALL', 'API', 'WEBHOOK', 'AUDIT', 'ERROR'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedType === type ? '1px solid #3B82F6' : '1px solid #1F2937',
              background: selectedType === type ? 'rgba(59, 130, 246, 0.15)' : '#111827',
              color: selectedType === type ? '#60A5FA' : '#94A3B8',
            }}
          >
            {type === 'ALL' ? 'บันทึกทั้งหมด' : `${type} Logs`}
          </button>
        ))}

        <input
          type="text"
          placeholder="ค้นหาข้อความ, Source, หรือ IP..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className={styles.formInput}
          style={{ flex: 1, minWidth: '200px', height: '32px', fontSize: '11px' }}
        />
      </div>

      {/* Logs Table */}
      <div className={styles.consoleCard} style={{ padding: '0', overflow: 'hidden' }}>
        <table className={styles.consoleTable}>
          <thead>
            <tr>
              <th style={{ width: '90px' }}>ประเภท</th>
              <th style={{ width: '150px' }}>วัน-เวลา</th>
              <th>แหล่งกำเนิด (Source)</th>
              <th>ข้อความเหตุการณ์ (Message)</th>
              <th style={{ width: '120px' }}>IP Address</th>
              <th style={{ width: '90px', textAlign: 'center' }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background:
                        log.type === 'AUDIT'
                          ? '#312E81'
                          : log.type === 'API'
                          ? '#064E3B'
                          : log.type === 'WEBHOOK'
                          ? '#701A75'
                          : '#7F1D1D',
                      color: '#FFF',
                    }}
                  >
                    {log.type}
                  </span>
                </td>
                <td style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
                  {log.timestamp}
                </td>
                <td style={{ fontWeight: 600, color: '#CBD5E1', fontSize: '11px' }}>
                  {log.source}
                </td>
                <td style={{ color: '#F1F5F9', fontSize: '12px' }}>
                  {log.message}
                </td>
                <td style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
                  {log.ipAddress}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span
                    className={
                      log.status === 'SUCCESS'
                        ? styles.badgeSuccess
                        : log.status === 'WARNING'
                        ? styles.badgeWarning
                        : styles.badgeDanger
                    }
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
