'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-4">
      {/* Page Title & Hierarchy Intro */}
      <section className="pt-2 pb-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[26px] font-bold text-[#0F172A] tracking-tight">About Us</h1>
            <p className="text-[12px] text-[#64748B] mt-0.5">เกี่ยวกับเรา • ข้อมูลองค์กรและการติดต่อ</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#007ACC] shadow-xs">
            <span className="material-symbols-outlined text-[22px]">domain</span>
          </div>
        </div>
      </section>

      {/* Company Profile Bento Card */}
      <section className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col space-y-3.5">
        <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF6E00]">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </div>
          <h2 className="text-[15px] font-bold text-[#0F172A]">เกี่ยวกับ MeePro</h2>
        </div>

        <p className="text-[13px] text-[#64748B] leading-relaxed">
          MeePro แพลตฟอร์มจำหน่ายสมาร์ตโฟนและสินค้าไอทีชั้นนำ ที่มุ่งเน้นการให้บริการสินค้าคุณภาพ ผ่อนง่าย ได้ของแท้ เข้าถึงได้สะดวกรวดเร็ว พร้อมการดูแลและบริการหลังการขายที่อบอุ่น
        </p>

        {/* Value Highlights / Key Pillars Grid */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          {/* Pillar 1 */}
          <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50/80 border border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16A365] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0F172A]">ของแท้ 100%</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">รับประกันศูนย์ไทยทุกเครื่อง มั่นใจในคุณภาพมาตรฐาน</p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50/80 border border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#007ACC] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0F172A]">จัดส่งทั่วไทย</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">รวดเร็ว ปลอดภัย พร้อมประกันคุ้มครองสินค้าสูญหาย</p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50/80 border border-[#E2E8F0]">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6E00] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0F172A]">ดูแลลูกค้าด้วยใจ</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">ทีมบริการผู้เชี่ยวชาญพร้อมช่วยเหลือและแนะนำตลอด 24 ชม.</p>
            </div>
          </div>
        </div>

        {/* Trust Stats Bar */}
        <div className="pt-2 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-center">
          <div className="py-2 px-2 bg-slate-50 rounded-lg">
            <span className="text-[19px] font-bold text-[#007ACC] leading-tight block">100,000+</span>
            <span className="text-[11px] text-[#64748B]">ผู้ใช้บริการทั่วไทย</span>
          </div>
          <div className="py-2 px-2 bg-slate-50 rounded-lg">
            <span className="text-[19px] font-bold text-[#16A365] leading-tight block">50+ สาขา</span>
            <span className="text-[11px] text-[#64748B]">ศูนย์บริการมาตรฐาน</span>
          </div>
        </div>
      </section>

      {/* LINE Official Consultation Card */}
      <section className="bg-white rounded-2xl p-4 border-2 border-[#06C755]/20 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-[#06C755]/5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 pr-2">
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-[#06C755]/10 text-[#06C755] text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06C755] animate-pulse" />
              <span>Official Account</span>
            </div>
            <h2 className="text-[15px] font-bold text-[#0F172A] pt-1">คุยกับเจ้าหน้าที่ผ่าน LINE</h2>
            <p className="text-[12px] text-[#64748B] leading-relaxed">
              ให้คำปรึกษา ตอบไว ดูแลคุณตลอดการใช้งาน ไม่พลาดทุกสิทธิประโยชน์
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#06C755] flex items-center justify-center text-white shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[26px]">chat</span>
          </div>
        </div>

        <div className="mt-4 pt-1">
          <a
            href="https://line.me"
            target="_blank"
            rel="noreferrer"
            className="w-full h-11 bg-[#06C755] text-white rounded-xl text-[14px] font-semibold flex items-center justify-center space-x-2 shadow-sm hover:brightness-105 active:scale-[0.99] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add_comment</span>
            <span>แอด LINE @meepro</span>
          </a>
        </div>
      </section>

      {/* Contact Section ('ติดต่อเรา') */}
      <section className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-[#007ACC]">
            <span className="material-symbols-outlined text-[18px]">contacts</span>
          </div>
          <h2 className="text-[15px] font-bold text-[#0F172A]">ติดต่อเรา</h2>
        </div>

        <div className="space-y-2">
          {/* Phone Row */}
          <a
            className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            href="tel:021234567"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#007ACC] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">call</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#0F172A]">02-123-4567</p>
              <p className="text-[11px] text-[#64748B]">จันทร์ - อาทิตย์ 08:00 - 22:00 น.</p>
            </div>
            <span className="material-symbols-outlined text-[#94A3B8] text-[18px] self-center">chevron_right</span>
          </a>

          {/* Email Row */}
          <a
            className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            href="mailto:support@meepro.co.th"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#007ACC] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">mail</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#0F172A]">support@meepro.co.th</p>
              <p className="text-[11px] text-[#64748B]">ทีมบริการลูกค้าพร้อมตอบกลับภายใน 24 ชม.</p>
            </div>
            <span className="material-symbols-outlined text-[#94A3B8] text-[18px] self-center">chevron_right</span>
          </a>

          {/* Office Location Row */}
          <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-slate-50/70">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#007ACC] shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#0F172A]">สำนักงานใหญ่ (Head Office)</p>
              <p className="text-[11px] text-[#64748B] leading-relaxed mt-0.5">
                อาคาร มีโปร ทาวเวอร์ ชั้น 18 ถ.สาทรใต้ แขวงยานนาวา เขตสาทร กรุงเทพฯ 10120
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Channels Section */}
      <section className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF6E00]">
            <span className="material-symbols-outlined text-[18px]">share</span>
          </div>
          <h2 className="text-[15px] font-bold text-[#0F172A]">ติดตามข่าวสารและโปรโมชั่น</h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Facebook */}
          <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50 border border-[#E2E8F0]/70 hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0">
              <span className="text-xs font-black">f</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#64748B] leading-tight">Facebook</p>
              <p className="text-[11px] font-semibold text-[#0F172A] truncate">MeePro Thailand</p>
            </div>
          </div>

          {/* LINE */}
          <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50 border border-[#E2E8F0]/70 hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-[#06C755] text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[14px]">chat</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#64748B] leading-tight">LINE</p>
              <p className="text-[11px] font-semibold text-[#0F172A] truncate">@meepro</p>
            </div>
          </div>

          {/* Instagram */}
          <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50 border border-[#E2E8F0]/70 hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#64748B] leading-tight">Instagram</p>
              <p className="text-[11px] font-semibold text-[#0F172A] truncate">@meepro_th</p>
            </div>
          </div>

          {/* TikTok */}
          <div className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50 border border-[#E2E8F0]/70 hover:bg-slate-100 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[14px]">music_note</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#64748B] leading-tight">TikTok</p>
              <p className="text-[11px] font-semibold text-[#0F172A] truncate">@meepro_th</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Info & Version Meta footer info */}
      <section className="text-center pt-2 pb-4 space-y-1">
        <p className="text-[11px] text-[#64748B]">MeePro Application Version 2.4.0 (Build 382)</p>
        <p className="text-[10px] text-[#94A3B8]">© 2024 MeePro Co., Ltd. สงวนลิขสิทธิ์ทุกประการ</p>
      </section>
    </div>
  );
}
