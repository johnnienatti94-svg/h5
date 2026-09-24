import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ChevronDown, PhoneCall, Store } from 'lucide-react';

export const metadata: Metadata = {
  title: 'คำถามที่พบบ่อย (FAQ) | MeePro',
  description: 'รวมคำถามที่พบบ่อยเกี่ยวกับการผ่อนมือถือ การสั่งซื้อ การรับสินค้า และบริการของ MeePro',
};

const FAQS = [
  {
    q: 'การผ่อนโทรศัพท์กับ MeePro ต้องใช้บัตรเครดิตหรือไม่?',
    a: 'ไม่ต้องใช้บัตรเครดิตครับ คุณสามารถสมัครผ่อนชำระได้โดยใช้เพียงบัตรประจำตัวประชาชนและเบอร์โทรศัพท์ที่ใช้งานจริง ไม่จำกัดอาชีพ ทั้งพนักงานประจำ ฟรีแลนซ์ และผู้ประกอบการ',
  },
  {
    q: 'เอกสารที่ต้องใช้ในการสมัครผ่อนชำระมีอะไรบ้าง?',
    a: 'เอกสารหลักที่ต้องเตรียม ได้แก่ 1. บัตรประจำตัวประชาชนตัวจริง (ยังไม่หมดอายุ) 2. เบอร์โทรศัพท์มือถือที่สามารถรับรหัส OTP ได้ และ 3. บัญชีธนาคารสำหรับตรวจสอบรายการเดินบัญชีเบื้องต้น',
  },
  {
    q: 'ระยะเวลาในการอนุมัติใช้เวลานานแค่ไหน?',
    a: 'ระบบจะทำการตรวจสอบข้อมูลเบื้องต้นและแจ้งผลภายในวันทำการเดียวกัน หากเอกสารครบถ้วน เมื่อได้รับการอนุมัติแล้ว คุณสามารถเดินทางไปรับเครื่องที่สาขา MeePro ที่เลือกไว้ได้ทันที',
  },
  {
    q: 'สินค้าทุกชิ้นเป็นของแท้ศูนย์ไทยหรือไม่?',
    a: 'สินค้าทุกชิ้นของ MeePro เป็นเครื่องใหม่แท้ 100% จากศูนย์บริการอย่างเป็นทางการในประเทศไทย มีประกันศูนย์ไทย 1 ปีเต็ม สามารถนำเครื่องเข้าเคลมได้ที่ศูนย์บริการของแบรนด์นั้นๆ ทั่วประเทศ',
  },
  {
    q: 'สามารถรับเครื่องที่สาขาไหนได้บ้าง?',
    a: 'MeePro มีสาขาให้บริการ 5 แห่ง ได้แก่ CentralWorld, Siam Paragon, Mega Bangna, Central Westgate และ Central Chiangmai Festival โดยสามารถตรวจสอบที่อยู่ เวลาเปิด-ปิด และเบอร์โทรได้ที่หน้าสาขา',
  },
  {
    q: 'มีบริการจัดส่งสินค้าถึงบ้านหรือไม่?',
    a: 'มีบริการจัดส่งพัสดุด่วนทั่วประเทศ พร้อมประกันภัยสินค้าสูญหาย หรือคุณสามารถเลือกรับเครื่องเองที่สาขาใกล้บ้านผ่านบริการ Click & Collect เพื่อตรวจเช็กสภาพเครื่องจริงก่อนรับได้เช่นกัน',
  },
  {
    q: 'สามารถชำระค่างวดผ่านช่องทางใดได้บ้าง?',
    a: 'คุณสามารถชำระค่างวดได้สะดวกผ่านการสแกน QR Code ทุกแอปพลิเคชันธนาคาร (Mobile Banking) หรือชำระที่เคาน์เตอร์สาขาของ MeePro ทุกแห่ง',
  },
];

export default function FaqPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#FFF6EF] via-white to-[#F6F7F9] p-6 sm:p-8 rounded-3xl border border-[#FFE2CC] shadow-xs">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF6E00]/10 text-[#FF6E00]">
            <HelpCircle size={14} aria-hidden="true" />
            MEEPRO FAQ
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#142B4A] tracking-tight">
            คำถามที่พบบ่อย
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            รวมข้อสงสัยเกี่ยวกับการผ่อนชำระ การรับเครื่อง และบริการหลังการขาย เพื่อความสะดวกและความมั่นใจของคุณ
          </p>
        </div>
      </section>

      {/* Accordion List */}
      <section className="space-y-3" aria-label="รายการคำถามที่พบบ่อย">
        {FAQS.map((faq, idx) => (
          <details
            key={idx}
            className="group bg-white rounded-2xl border border-[#E2E8F0] shadow-xs transition-all overflow-hidden"
          >
            <summary className="p-5 font-bold text-[#142B4A] cursor-pointer flex items-center justify-between gap-4 list-none hover:text-[#FF6E00] transition-colors">
              <span className="text-sm sm:text-base">{faq.q}</span>
              <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] group-open:bg-[#FFF6EF] group-open:text-[#FF6E00] flex items-center justify-center shrink-0 transition-transform group-open:rotate-180">
                <ChevronDown size={18} />
              </div>
            </summary>
            <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#475569] leading-relaxed border-t border-[#F1F5F9]">
              {faq.a}
            </div>
          </details>
        ))}
      </section>

      {/* Contact Banner */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h2 className="text-lg font-bold text-[#142B4A]">ยังมีข้อสงสัยเพิ่มเติม?</h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            ปรึกษาทีมงาน MeePro ได้ทั้งทางโทรศัพท์หรือที่หน้าสาขาใกล้คุณ
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/stores"
            className="px-4 py-2.5 rounded-xl bg-[#FFF6EF] text-[#FF6E00] text-sm font-bold hover:bg-[#FFE2CC] transition-colors inline-flex items-center gap-2"
          >
            <Store size={17} />
            <span>ดูสาขาของเรา</span>
          </Link>
          <a
            href="tel:022559001"
            className="px-4 py-2.5 rounded-xl bg-[#142B4A] text-white text-sm font-semibold hover:bg-[#1E3A5F] transition-colors inline-flex items-center gap-2 shadow-xs"
          >
            <PhoneCall size={16} />
            <span>โทรหาเรา</span>
          </a>
        </div>
      </section>
    </div>
  );
}
