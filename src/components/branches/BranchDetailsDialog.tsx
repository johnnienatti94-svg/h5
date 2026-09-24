'use client';

import Image from 'next/image';
import { Check, Clock3, Copy, ExternalLink, MapPin, Navigation, Phone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PublicBranch } from '@/features/branches/types';
import styles from './BranchDetailsDialog.module.css';

interface BranchDetailsDialogProps {
  branch: PublicBranch | null;
  unavailableSlug?: string;
  onClose: () => void;
  onSelect?: (branch: PublicBranch) => void;
  returnFocusElement?: HTMLElement | null;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function BranchDetailsDialog({
  branch,
  unavailableSlug,
  onClose,
  onSelect,
  returnFocusElement,
}: BranchDetailsDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => returnFocusElement?.focus());
    };
  }, [returnFocusElement]);

  const copyMapLink = async () => {
    if (!branch) return;
    try {
      await navigator.clipboard.writeText(branch.googleMapsUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const titleId = branch ? `branch-dialog-title-${branch.id}` : 'branch-dialog-unavailable-title';

  return (
    <div
      className={styles.backdrop}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div className={styles.headingGroup}>
            <span className={styles.eyebrow}>รายละเอียดสาขา</span>
            <h2 id={titleId} className={styles.title}>
              {branch?.name ?? 'ไม่พบสาขานี้'}
            </h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className={styles.closeButton} aria-label="ปิดรายละเอียดสาขา">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {branch ? (
          <>
            <div className={styles.body}>
              {branch.imageUrl && (
                <div className={styles.imageFrame}>
                  <Image
                    src={branch.imageUrl}
                    alt={branch.imageAlt || `ภาพสาขา ${branch.name}`}
                    fill
                    sizes="(max-width: 767px) 100vw, 600px"
                    className={styles.image}
                  />
                </div>
              )}

              <section className={styles.detailSection} aria-labelledby={`branch-address-${branch.id}`}>
                <div className={styles.sectionIcon}><MapPin size={20} aria-hidden="true" /></div>
                <div className={styles.sectionContent}>
                  <h3 id={`branch-address-${branch.id}`} className={styles.sectionTitle}>ที่อยู่</h3>
                  <p className={styles.address}>{branch.fullAddress}</p>
                  {(branch.province || branch.region) && (
                    <p className={styles.meta}>{[branch.province, branch.region].filter(Boolean).join(' · ')}</p>
                  )}
                </div>
              </section>

              <section className={styles.detailSection} aria-labelledby={`branch-phone-${branch.id}`}>
                <div className={styles.sectionIcon}><Phone size={20} aria-hidden="true" /></div>
                <div className={styles.sectionContent}>
                  <h3 id={`branch-phone-${branch.id}`} className={styles.sectionTitle}>โทรศัพท์</h3>
                  <a href={branch.telHref} className={styles.textLink}>{branch.displayPhone}</a>
                </div>
              </section>

              {branch.openingHours.length > 0 && (
                <section className={styles.detailSection} aria-labelledby={`branch-hours-${branch.id}`}>
                  <div className={styles.sectionIcon}><Clock3 size={20} aria-hidden="true" /></div>
                  <div className={styles.sectionContent}>
                    <h3 id={`branch-hours-${branch.id}`} className={styles.sectionTitle}>เวลาเปิดให้บริการ</h3>
                    <ul className={styles.hoursList}>
                      {branch.openingHours.map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}
                    </ul>
                  </div>
                </section>
              )}

              {branch.directions && (
                <section className={styles.detailSection} aria-labelledby={`branch-directions-${branch.id}`}>
                  <div className={styles.sectionIcon}><Navigation size={20} aria-hidden="true" /></div>
                  <div className={styles.sectionContent}>
                    <h3 id={`branch-directions-${branch.id}`} className={styles.sectionTitle}>คำแนะนำการเดินทาง</h3>
                    <p className={styles.bodyText}>{branch.directions}</p>
                  </div>
                </section>
              )}

              <section className={styles.mapSection} aria-labelledby={`branch-map-${branch.id}`}>
                <h3 id={`branch-map-${branch.id}`} className={styles.sectionTitle}>Google Maps</h3>
                <a href={branch.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={styles.mapUrl}>
                  {branch.googleMapsUrl}
                </a>
                <button type="button" onClick={copyMapLink} className={styles.copyButton} aria-live="polite">
                  {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
                  {copied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์'}
                </button>
              </section>
            </div>

            <div className={styles.actions}>
              <a href={branch.telHref} className={styles.secondaryAction}>
                <Phone size={19} aria-hidden="true" />
                โทร {branch.displayPhone}
              </a>
              <a href={branch.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={styles.primaryAction}>
                <ExternalLink size={19} aria-hidden="true" />
                เปิด Google Maps
              </a>
              {onSelect && (
                <button type="button" className={styles.selectAction} onClick={() => onSelect(branch)}>
                  เลือกสาขานี้
                </button>
              )}
            </div>
          </>
        ) : (
          <div className={styles.unavailable}>
            <MapPin size={32} aria-hidden="true" />
            <p>สาขาที่ระบุไม่มีให้บริการหรือยังไม่ได้เผยแพร่</p>
            {unavailableSlug && <span>รหัสอ้างอิง: {unavailableSlug}</span>}
            <button type="button" onClick={onClose} className={styles.primaryAction}>กลับไปดูสาขาที่เปิดให้บริการ</button>
          </div>
        )}
      </div>
    </div>
  );
}
