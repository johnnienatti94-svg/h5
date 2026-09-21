'use client';

import React, { useState } from 'react';
import { MEEPRO_BRANCHES, BranchLocation } from '@/lib/branchesData';
import styles from './location.module.css';

const REGIONS = [
  { id: 'all', label: 'ทุกสาขา' },
  { id: 'bangkok', label: 'กรุงเทพฯ' },
  { id: 'vicinity', label: 'ปริมณฑล' },
  { id: 'provincial', label: 'ต่างจังหวัด' },
];

export default function LocationPage() {
  const [selectedRegion, setSelectedRegion] = useState('all');

  const filteredBranches = MEEPRO_BRANCHES.filter((b) => {
    if (selectedRegion === 'all') return true;
    return b.region === selectedRegion;
  });

  return (
    <div className={styles.locationContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>
          <span>📍</span>
          <span>สาขา MeePro ทั่วประเทศ</span>
        </h1>
        <p className={styles.pageSubtitle}>
          เข้ารับบริการ ทดลองเครื่องจริง หรือรับสินค้าออนไลน์ได้ที่สาขาใกล้คุณ
        </p>
      </div>

      {/* Region Tabs */}
      <div className={styles.regionFilterBar}>
        {REGIONS.map((r) => (
          <button
            key={r.id}
            className={`${styles.regionPill} ${selectedRegion === r.id ? styles.regionPillActive : ''}`}
            onClick={() => setSelectedRegion(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Branch Cards List */}
      <div className={styles.branchList}>
        {filteredBranches.map((branch) => (
          <div key={branch.id} className={styles.branchCard}>
            <div className={styles.branchHeader}>
              <div>
                <h2 className={styles.branchName}>{branch.name}</h2>
                <div className={styles.branchFloor}>{branch.floor}</div>
              </div>
              <span className={styles.statusBadge}>● เปิดให้บริการ</span>
            </div>

            <p className={styles.branchAddress}>{branch.address}</p>

            {branch.btsMrtNearby && (
              <div className={styles.transitBadge}>
                🚆 {branch.btsMrtNearby}
              </div>
            )}

            <div className={styles.hoursRow}>
              <span>🕒</span>
              <span>{branch.operatingHours}</span>
            </div>

            <div className={styles.servicesWrapper}>
              <span className={styles.servicesTitle}>บริการที่มี ณ สาขานี้:</span>
              <div className={styles.serviceTags}>
                {branch.services.map((s, idx) => (
                  <span key={idx} className={styles.serviceTag}>
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.actionRow}>
              <a href={`tel:${branch.phone}`} className={styles.callBtn}>
                <span>📞</span>
                <span>โทร {branch.displayPhone}</span>
              </a>
              <a
                href={branch.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.directionsBtn}
              >
                <span>🗺</span>
                <span>นำทาง Google Maps</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
