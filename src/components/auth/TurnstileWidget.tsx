'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

interface TurnstileApi {
  render: (container: HTMLElement, options: {
    sitekey: string;
    theme: 'light';
    size: 'flexible';
    callback: (token: string) => void;
    'error-callback': () => void;
    'expired-callback': () => void;
    'timeout-callback': () => void;
  }) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  siteKey: string;
  onTokenChange: (token: string | null) => void;
  onError: () => void;
}

export default function TurnstileWidget({ siteKey, onTokenChange, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const onErrorRef = useRef(onError);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
    onErrorRef.current = onError;
  }, [onError, onTokenChange]);

  useEffect(() => {
    if (!scriptReady || !containerRef.current || !window.turnstile || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'light',
      size: 'flexible',
      callback: (token) => onTokenChangeRef.current(token),
      'error-callback': () => {
        onTokenChangeRef.current(null);
        onErrorRef.current();
      },
      'expired-callback': () => onTokenChangeRef.current(null),
      'timeout-callback': () => onTokenChangeRef.current(null),
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [scriptReady, siteKey]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} aria-label="การตรวจสอบว่าไม่ใช่โปรแกรมอัตโนมัติ" />
    </>
  );
}
