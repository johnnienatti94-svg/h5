'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser, clearAuth } from '@/lib/auth';
import { getSystemConfig, SystemConfig } from '@/lib/adminSystem';
import PrivacyPolicyModal from '@/components/auth/PrivacyPolicyModal';
import Link from 'next/link';
import type { PublicApplication, ApplicationDraft } from '@/features/applications/types';
import { STATUS_LABELS } from '@/features/applications/types';

export default function AccountPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sysConfig, setSysConfig] = useState<SystemConfig | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [logoutStep, setLogoutStep] = useState<'idle' | 'confirm' | 'loading' | 'success'>('idle');
  const [logoutTime, setLogoutTime] = useState('');
  const [applications, setApplications] = useState<PublicApplication[]>([]);
  const [draft, setDraft] = useState<ApplicationDraft | null>(null);
  const [isLoadingApps, setIsLoadingApps] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadAccount() {
      setSysConfig(getSystemConfig());
      const user = await getAuthUser();
      if (!active) return;
      if (user?.phone) {
        setPhone(user.phone);
        setIsAuthenticated(true);
        setIsLoadingApps(true);

        try {
          const [appsRes, draftRes] = await Promise.all([
            fetch('/api/applications').then((r) => r.json()).catch(() => ({ applications: [] })),
            fetch('/api/applications/draft').then((r) => r.json()).catch(() => ({ draft: null })),
          ]);
          if (active) {
            if (appsRes.success && Array.isArray(appsRes.applications)) {
              setApplications(appsRes.applications);
            }
            if (draftRes.success && draftRes.draft) {
              setDraft(draftRes.draft);
            }
          }
        } finally {
          if (active) setIsLoadingApps(false);
        }
      }
      setIsCheckingAuth(false);
    }

    void loadAccount();
    return () => {
      active = false;
    };
  }, []);


  const handleStartLogout = () => {
    setLogoutStep('confirm');
  };

  const handleConfirmLogout = async () => {
    setLogoutStep('loading');
    const now = new Date();
    const timeStr = `วันนี้ เวลา ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} น.`;
    setLogoutTime(timeStr);

    try {
      await clearAuth();
      setLogoutStep('success');
    } catch {
      setLogoutStep('idle');
    }
  };

  const handleFinishLogout = () => {
    router.replace('/login');
  };

  const displayPhone = phone.length >= 10
    ? `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`
    : phone;

  if (isCheckingAuth) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12" role="status">
        <div className="h-40 rounded-2xl border border-[#E2E8F0] bg-white animate-pulse" />
        <span className="sr-only">กำลังตรวจสอบบัญชี</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-12 pb-24">
        <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#C94F00]">
            <span className="material-symbols-outlined text-[28px]" aria-hidden="true">person</span>
          </div>
          <h1 className="text-2xl font-bold text-[#142B4A]">เข้าสู่ระบบเพื่อดูบัญชีของคุณ</h1>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            ใช้หมายเลขโทรศัพท์ที่ยืนยันแล้วเพื่อดูใบสมัคร สถานะ และข้อมูลนัดหมายของคุณ
          </p>
          <Link href="/login" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#C94F00] px-5 font-bold text-white sm:w-auto">
            เข้าสู่ระบบด้วย OTP
          </Link>
        </section>
      </div>
    );
  }

  // Screen 14: Full Logout Success View
  if (logoutStep === 'success') {
    return (
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-6 pb-20 animate-fade-in flex flex-col justify-between min-h-[600px]">
        {/* Central Feedback Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col items-center text-center mt-2">
          {/* Animated Success Badge */}
          <div className="relative flex items-center justify-center my-3">
            <div className="absolute w-20 h-20 rounded-full bg-emerald-500/10 animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border-2 border-[#16A365]/30">
              <span className="material-symbols-outlined text-[#16A365] text-[36px]">check_circle</span>
            </div>
          </div>

          <h1 className="text-[22px] font-bold text-[#0F172A] mt-2 mb-1">
            ออกจากระบบสำเร็จ
          </h1>
          <p className="text-[13px] text-[#64748B] px-2 leading-relaxed">
            คุณได้ออกจากระบบ MeePro เรียบร้อยแล้ว ข้อมูลบัญชีและเซสชันการเงินของคุณได้รับการปกป้องอย่างปลอดภัย
          </p>

          {/* Session Summary Box */}
          <div className="w-full bg-[#F8FAFC] rounded-xl p-3.5 mt-5 border border-[#E2E8F0] text-left space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] text-[#64748B] shrink-0 pt-0.5">บัญชีที่ออกจากระบบ</span>
              <span className="text-[12px] font-semibold text-[#0F172A] text-right">{displayPhone}</span>
            </div>
            <div className="h-[1px] w-full bg-[#E2E8F0]" />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#64748B]">เวลาที่ดำเนินการ</span>
              <span className="text-[12px] font-semibold text-[#0F172A]">{logoutTime || 'วันนี้'}</span>
            </div>
            <div className="h-[1px] w-full bg-[#E2E8F0]" />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#64748B]">สถานะความปลอดภัย</span>
              <div className="flex items-center gap-1 text-[#16A365]">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                <span className="text-[11px] font-bold">เซสชันถูกยกเลิกแล้ว (ปลอดภัย 100%)</span>
              </div>
            </div>
          </div>

          {/* Security Alert Note */}
          <div className="mt-4 flex items-center gap-2 text-left bg-slate-50 p-2.5 rounded-lg border border-[#E2E8F0] w-full">
            <span className="material-symbols-outlined text-[#007ACC] text-[18px] shrink-0">lock</span>
            <p className="text-[11px] text-[#64748B]">
              เพื่อความปลอดภัยสูงสุด กรุณาปิดแท็บนี้หรือแอปพลิเคชันหากใช้งานบนอุปกรณ์สาธารณะ
            </p>
          </div>

          {/* CTA */}
          <div className="w-full mt-6">
            <button
              type="button"
              onClick={handleFinishLogout}
              className="w-full h-12 bg-[#007ACC] hover:bg-[#0061A3] text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
            >
              <span>กลับสู่หน้าเข้าสู่ระบบ</span>
              <span className="material-symbols-outlined text-[18px]">login</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 pt-2 text-center text-[11px] text-[#64748B]">
          <p>MeePro Financial Services & Commercial Network</p>
          <p className="text-[10px] text-slate-400 mt-0.5">เวอร์ชันระบบ 2.4.0 • มาตรฐานความปลอดภัย ISO/IEC 27001</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-4">
      {/* 1. Profile Header Card (Stitch Screen 11) */}
      <section className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex items-center gap-3.5">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-blue-50 border-2 border-[#007ACC] shrink-0 flex items-center justify-center text-[#007ACC]">
          <span className="material-symbols-outlined text-[32px]">person</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[15px] font-bold text-[#0F172A] truncate">ลูกค้า MeePro</h2>
            <span className="material-symbols-outlined text-[#007ACC] text-[18px]">verified</span>
          </div>
          <p className="text-xs text-[#64748B] truncate">{displayPhone} • บัญชียืนยันตัวตนแล้ว</p>
          {sysConfig?.membershipEnabled !== false && (
            <div className="mt-1 inline-flex items-center gap-1 bg-blue-50/70 px-2 py-0.5 rounded text-[11px] font-semibold text-[#007ACC]">
              <span>⭐ MeePro Member Tier Gold</span>
            </div>
          )}
        </div>
      </section>

      {/* 2. Quick Financial Overview Widget */}
      <section className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-[#64748B] font-medium">
            {sysConfig?.rewardsEnabled !== false ? 'คะแนนสะสม & วงเงินพร้อมใช้' : 'วงเงินพร้อมใช้'}
          </span>
          <Link href="/billing" className="text-xs text-[#007ACC] font-semibold hover:underline">
            ดูบิลของฉัน
          </Link>
        </div>
        {sysConfig?.rewardsEnabled !== false ? (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0]">
            <div>
              <span className="text-[11px] text-[#64748B] block">แต้มสะสม MeePoints</span>
              <span className="text-[18px] font-bold text-[#0F172A]">
                1,240 <span className="text-xs font-normal text-[#64748B]">แต้ม</span>
              </span>
            </div>
            <div className="border-l border-[#E2E8F0] pl-3">
              <span className="text-[11px] text-[#64748B] block">วงเงินพร้อมใช้</span>
              <span className="text-[18px] font-bold text-[#007ACC]">฿15,000</span>
            </div>
          </div>
        ) : (
          <div className="pt-2 border-t border-[#E2E8F0]">
            <span className="text-[11px] text-[#64748B] block">วงเงินพร้อมใช้</span>
            <span className="text-[18px] font-bold text-[#007ACC]">฿15,000</span>
          </div>
        )}
      </section>

      {/* Active Incomplete Draft Alert */}

      {draft && (
        <section className="bg-[#FFF6EF] border border-[#FFE4D1] rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF6E00]/10 text-[#FF6E00] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">edit_document</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#142B4A]">คุณมีใบสมัครที่ยังทำไม่เสร็จ</h3>
              <p className="text-xs text-[#64748B]">ดำเนินการต่อเพื่อส่งคำขอรับสิทธิ์ผ่อน 0%</p>
            </div>
          </div>
          <Link
            href="/apply"
            className="px-4 py-2 bg-[#FF6E00] hover:bg-[#E05D00] text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-sm"
          >
            ทำรายการต่อ
          </Link>
        </section>
      )}

      {/* 2.5 My Applications Section */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FF6E00] text-xl">assignment</span>
            <h3 className="text-sm font-bold text-[#142B4A]">ใบสมัครผ่อนชำระของฉัน</h3>
          </div>
          <Link href="/apply" className="text-xs text-[#FF6E00] font-bold hover:underline">
            + สมัครผ่อนใหม่
          </Link>
        </div>

        {isLoadingApps ? (
          <div className="py-6 text-center text-xs text-[#64748B] animate-pulse">
            กำลังโหลดรายการใบสมัคร...
          </div>
        ) : applications.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B] space-y-2">
            <p>ยังไม่มีประวัติการสมัครผ่อนชำระในบัญชีนี้</p>
            <Link
              href="/products"
              className="inline-block px-4 py-2 bg-[#142B4A] text-white text-xs font-bold rounded-xl hover:bg-[#0E1E34]"
            >
              เลือกดูสินค้าและเริ่มสมัคร
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const statusCfg = STATUS_LABELS[app.status] || {
                label: app.status,
                color: '#64748B',
                bg: '#F1F5F9',
              };

              return (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all bg-[#F8FAFC]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-[#64748B]">{app.reference}</span>
                      <h4 className="font-bold text-sm text-[#142B4A]">{app.productSnapshot.name}</h4>
                      <p className="text-xs text-[#64748B]">
                        {app.variantSnapshot.storage} • {app.variantSnapshot.color}
                      </p>
                    </div>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                      style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                    >
                      ● {statusCfg.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#E2E8F0] gap-2 text-xs">
                    <div className="text-[#64748B]">
                      <span>ค่างวด: </span>
                      <strong className="text-[#FF6E00]">{app.offerSnapshot.monthlyInstallmentFormatted} / ด.</strong>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span>สาขา: {app.branchSnapshot.name}</span>
                    </div>

                    <Link
                      href={`/account/applications/${app.id}`}
                      className="font-bold text-[#FF6E00] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>ดูรายละเอียด</span>
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Account Settings Menu Section */}

      <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm divide-y divide-[#E2E8F0] overflow-hidden">
        <div className="px-4 py-2.5 bg-[#F8FAFC]">
          <span className="text-xs font-semibold text-[#64748B]">การตั้งค่าและความปลอดภัย</span>
        </div>

        <button
          type="button"
          onClick={() => alert('แก้ไขข้อมูลส่วนตัว')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#64748B] text-xl">person_outline</span>
            <span className="text-[13px] font-semibold text-[#0F172A]">ข้อมูลส่วนตัว</span>
          </div>
          <span className="material-symbols-outlined text-[#94A3B8] text-lg">chevron_right</span>
        </button>

        <Link
          href="/billing"
          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#64748B] text-xl">receipt_long</span>
            <span className="text-[13px] font-semibold text-[#0F172A]">บิลและประวัติการผ่อนชำระ</span>
          </div>
          <span className="material-symbols-outlined text-[#94A3B8] text-lg">chevron_right</span>
        </Link>

        <button
          type="button"
          onClick={() => alert('การตั้งค่า PIN ความปลอดภัย')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#64748B] text-xl">lock</span>
            <span className="text-[13px] font-semibold text-[#0F172A]">รหัส PIN และความปลอดภัย</span>
          </div>
          <span className="material-symbols-outlined text-[#94A3B8] text-lg">chevron_right</span>
        </button>
      </section>

      {/* 4. Support & About Section */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm divide-y divide-[#E2E8F0] overflow-hidden">
        <div className="px-4 py-2.5 bg-[#F8FAFC]">
          <span className="text-xs font-semibold text-[#64748B]">บริการและความช่วยเหลือ</span>
        </div>

        <Link
          href="/about"
          className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#64748B] text-xl">info</span>
            <span className="text-[13px] font-semibold text-[#0F172A]">เกี่ยวกับ MeePro</span>
          </div>
          <span className="material-symbols-outlined text-[#94A3B8] text-lg">chevron_right</span>
        </Link>

        <button
          type="button"
          onClick={() => setShowPolicyModal(true)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#64748B] text-xl">policy</span>
            <span className="text-[13px] font-semibold text-[#0F172A]">นโยบายความเป็นส่วนตัว (PDPA)</span>
          </div>
          <span className="material-symbols-outlined text-[#94A3B8] text-lg">chevron_right</span>
        </button>

        {/* Logout Trigger Row */}
        <button
          type="button"
          onClick={handleStartLogout}
          className="w-full flex items-center justify-between px-4 py-3.5 bg-red-50/50 hover:bg-red-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 text-[#DC3345]">
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="text-[13px] font-bold">ออกจากระบบ</span>
          </div>
          <span className="material-symbols-outlined text-[#DC3345] text-lg">chevron_right</span>
        </button>
      </section>

      {/* Version */}
      <div className="text-center pt-1 pb-4">
        <p className="text-[11px] text-[#64748B]">MeePro เวอร์ชัน 2.4.0 (Build 382)</p>
      </div>

      {/* MODAL 1: SCREEN 12 (LOGOUT CONFIRMATION) */}
      {logoutStep === 'confirm' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-[327px] bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xl flex flex-col items-center animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4 text-[#DC3345]">
              <span className="material-symbols-outlined text-3xl">power_settings_new</span>
            </div>

            <h3 className="text-[18px] font-bold text-[#0F172A] text-center mb-2">
              ยืนยันการออกจากระบบ
            </h3>

            <p className="text-[13px] text-[#64748B] text-center px-1 leading-relaxed mb-6">
              คุณต้องการออกจากระบบ MeePro ใช่หรือไม่? หากออกจากระบบ คุณจะต้องเข้าสู่ระบบใหม่ด้วยเบอร์โทรศัพท์และรหัส OTP
            </p>

            <div className="w-full flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="w-full py-3.5 px-4 bg-[#DC3345] hover:brightness-95 text-white font-bold text-sm rounded-xl shadow-sm active:scale-98 transition-transform flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                <span>ออกจากระบบ</span>
              </button>

              <button
                type="button"
                onClick={() => setLogoutStep('idle')}
                className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl active:scale-98 transition-all flex items-center justify-center"
              >
                <span>ยกเลิก</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SCREEN 13 (LOGGING OUT LOADING STATE) */}
      {logoutStep === 'loading' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[280px] bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 border-3 border-[#007ACC]/30 border-t-[#007ACC] rounded-full animate-spin" />
            <h4 className="text-[16px] font-bold text-[#0F172A]">กำลังออกจากระบบ...</h4>
            <p className="text-xs text-[#64748B]">กำลังบันทึกและยกเลิกเซสชันของคุณอย่างปลอดภัย</p>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPolicyModal && (
        <PrivacyPolicyModal onAccept={() => setShowPolicyModal(false)} />
      )}
    </div>
  );
}
