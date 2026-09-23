'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Copy, Check, Sparkles } from 'lucide-react';
import { AnyWidget } from '@/types/widget';

interface PromoPopupConfig {
  imageUrl?: string;
  headline?: string;
  couponCode?: string;
  actionHref?: string;
  delaySeconds?: number;
}

interface Props {
  widget: AnyWidget;
}

export default function PromoPopupModalWidget({ widget }: Props) {
  const config = (widget.config || {}) as PromoPopupConfig;
  const imageUrl = config.imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80';
  const headline = config.headline || 'Special Exclusive Offer!';
  const couponCode = config.couponCode;
  const actionHref = config.actionHref || '#';
  const delaySeconds = config.delaySeconds || 3;

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const dismissedKey = `promo_dismissed_${widget.id}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(dismissedKey)) {
      return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [delaySeconds, widget.id]);

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`promo_dismissed_${widget.id}`, 'true');
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!couponCode) return;
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        >
          <X size={18} color="#0F172A" />
        </button>

        {/* Promo Image */}
        <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#F1F5F9' }}>
          <Image
            src={imageUrl}
            alt={headline}
            fill
            sizes="380px"
            style={{ objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#0F172A',
              color: '#F59E0B',
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: '999px',
            }}
          >
            <Sparkles size={12} />
            LIMITED TIME OFFER
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '20px 20px 24px', textAlign: 'center' }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#0F172A',
              marginBottom: '8px',
              lineHeight: 1.3,
            }}
          >
            {headline}
          </h3>

          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', lineHeight: 1.4 }}>
            Take advantage of exclusive discounts applied directly at checkout today!
          </p>

          {couponCode && (
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1.5px dashed #0D9488',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Promo Code
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', letterSpacing: '0.05em' }}>
                  {couponCode}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: copied ? '#10B981' : '#0D9488',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}

          <Link
            href={actionHref}
            onClick={handleClose}
            style={{
              display: 'block',
              width: '100%',
              backgroundColor: '#0D9488',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              padding: '12px',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
            }}
          >
            Claim Offer Now
          </Link>
        </div>
      </div>
    </div>
  );
}
