'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import styles from './StoreDetail.module.css';

export default function CopyMapLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button type="button" onClick={copy} className={styles.copyButton} aria-live="polite">
      {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
      {copied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์'}
    </button>
  );
}
