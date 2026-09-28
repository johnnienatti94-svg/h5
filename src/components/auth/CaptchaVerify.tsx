'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface CaptchaVerifyProps {
  onVerify: (token: string | null) => void;
  primaryColor?: string;
  isBypass?: boolean;
}

/**
 * CAPTCHA-Verify Component
 * Adapted from Ashok-777/CAPTCHA-Verify
 * Combines an interactive human check with a canvas-distorted 6-character CAPTCHA
 */
export default function CaptchaVerify({
  onVerify,
  primaryColor = '#FF6E00',
  isBypass = false,
}: CaptchaVerifyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Character set (excluding easily confused chars: 0/O, 1/l/I)
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

  const generateCaptcha = useCallback(() => {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    setCaptchaCode(code);
    setUserInput('');
    setErrorMsg('');

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Background gradient & noise dots (Ashok-777 logic)
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(
        Math.random() * 200
      )}, ${Math.floor(Math.random() * 200)}, 0.35)`;
      ctx.fillRect(
        Math.floor(Math.random() * canvas.width),
        Math.floor(Math.random() * canvas.height),
        2,
        2
      );
    }

    // 2. Draw CAPTCHA characters with random rotation and distortion
    ctx.font = 'bold 26px sans-serif';
    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = 20 + i * 34;
      const y = 38;
      ctx.translate(x, y);
      const angle = (Math.floor(Math.random() * 36) - 18) * (Math.PI / 180);
      ctx.rotate(angle);
      // Random distinct dark color for each character
      const colors = ['#1E293B', '#0F172A', '#0369A1', '#B45309', '#15803D', '#4338CA'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }

    // 3. Add occluding lines (Ashok-777 logic)
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 180)}, ${Math.floor(
        Math.random() * 180
      )}, ${Math.floor(Math.random() * 180)}, 0.45)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * canvas.width,
        Math.random() * canvas.height
      );
      ctx.stroke();
    }
  }, [CHARS]);

  // Handle initial checkbox toggle
  const handleCheckboxToggle = () => {
    if (isVerified) {
      // Toggle off / reset
      setIsVerified(false);
      setIsOpen(false);
      onVerify(null);
      return;
    }

    // If bypass user, instant verify
    if (isBypass) {
      setIsVerified(true);
      setIsOpen(false);
      onVerify(`human_verified_bypass_${Date.now()}`);
      return;
    }

    // Open CAPTCHA challenge
    setIsOpen(true);
    setTimeout(() => {
      generateCaptcha();
    }, 50);
  };

  // Re-generate whenever canvas is shown
  useEffect(() => {
    if (isOpen && !isVerified) {
      generateCaptcha();
    }
  }, [isOpen, isVerified, generateCaptcha]);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) {
      setErrorMsg('กรุณากรอกรหัสตามที่ปรากฏในภาพ');
      return;
    }

    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      // Compare case-insensitive for smooth mobile UX
      if (userInput.trim().toLowerCase() === captchaCode.toLowerCase()) {
        setIsVerified(true);
        setIsOpen(false);
        setErrorMsg('');
        const token = `human_verified_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        onVerify(token);
      } else {
        setErrorMsg('รหัสไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        generateCaptcha();
      }
    }, 300);
  };

  return (
    <div className="w-full space-y-2">
      {/* 1. Main Human Check Box */}
      <div
        onClick={handleCheckboxToggle}
        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
          isVerified
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800'
            : isOpen
            ? 'bg-blue-50/50 border-blue-200 text-slate-800 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
              isVerified
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : isOpen
                ? 'border-[#007ACC] bg-white ring-2 ring-blue-100'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            {isVerified ? (
              <span className="material-symbols-outlined text-[16px] font-bold">check</span>
            ) : isOpen ? (
              <span className="w-2.5 h-2.5 rounded-xs bg-[#007ACC] animate-pulse" />
            ) : null}
          </div>
          <span className="text-xs font-semibold">
            {isVerified
              ? 'ยืนยันความปลอดภัยสำเร็จ (Human Verified)'
              : isOpen
              ? 'กรุณากรอกรหัส CAPTCHA ด้านล่าง'
              : 'ฉันไม่ใช่โปรแกรมอัตโนมัติ (I am human)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 opacity-70 text-[11px] text-slate-500">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">verified_user</span>
          <span className="font-semibold text-[10px]">CAPTCHA</span>
        </div>
      </div>

      {/* 2. Ashok-777 Distorted Canvas CAPTCHA Box */}
      {isOpen && !isVerified && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">ยืนยันตัวตนด้วยรหัส CAPTCHA:</span>
            <button
              type="button"
              onClick={generateCaptcha}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007ACC] hover:text-[#005FA3] hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              <span>เปลี่ยนภาพใหม่</span>
            </button>
          </div>

          {/* Canvas Display with Refresh Action */}
          <div className="flex items-center justify-center gap-2">
            <div className="rounded-xl overflow-hidden border border-slate-300 shadow-xs bg-white">
              <canvas
                ref={canvasRef}
                width={230}
                height={60}
                className="block select-none cursor-pointer"
                onClick={generateCaptcha}
                title="คลิกเพื่อเปลี่ยนรหัสใหม่"
              />
            </div>
            <button
              type="button"
              onClick={generateCaptcha}
              title="สุ่มรหัสใหม่"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">sync</span>
            </button>
          </div>

          {/* Input & Verify Form */}
          <form onSubmit={handleVerify} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                maxLength={6}
                placeholder="กรอกรหัส 6 หลัก..."
                autoFocus
                className="flex-1 h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#007ACC] focus:border-[#007ACC]"
              />
              <button
                type="submit"
                disabled={isChecking || !userInput.trim()}
                style={{ backgroundColor: primaryColor }}
                className="px-4 h-10 rounded-xl font-bold text-xs text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                {isChecking ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ยืนยัน</span>
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  </>
                )}
              </button>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-red-600 font-semibold pl-1 flex items-center gap-1 animate-pulse">
                <span className="material-symbols-outlined text-[13px]">error</span>
                <span>{errorMsg}</span>
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
