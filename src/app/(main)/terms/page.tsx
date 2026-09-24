import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ข้อกำหนดและเงื่อนไขการให้บริการ (Terms of Service) | MeePro',
  description: 'เงื่อนไขและข้อตกลงการใช้งานแพลตฟอร์ม MeePro และการสมัครผ่อนชำระอุปกรณ์สื่อสารและสินค้าไอที',
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-6">
      <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] hover:text-[#142B4A]">
        <ArrowLeft size={16} /> กลับไปหน้าเกี่ยวกับเรา
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#FF6E00]">
          <FileText size={16} />
          <span>TERMS OF SERVICE • ข้อกำหนดการให้บริการ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#142B4A]">
          ข้อกำหนดและเงื่อนไขการให้บริการ
        </h1>
        <p className="text-xs text-[#64748B]">
          บริษัท บี บ๊อกซ์ เทคโนโลยี (ประเทศไทย) จำกัด • มีผลบังคับใช้ตั้งแต่วันที่ 30 กันยายน 2569
        </p>
      </header>

      <article className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-6 text-sm text-[#334155] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#142B4A]">1. บทนำและการยอมรับข้อตกลง</h2>
          <p>
            การเข้าถึงและการใช้งานเว็บไซต์ https://www.meeproth.com และบริการที่เกี่ยวข้องของ บริษัท บี บ๊อกซ์ เทคโนโลยี (ประเทศไทย) จำกัด (“บริษัท”) ถือว่าท่านได้รับทราบ เข้าใจ และตกลงที่จะปฏิบัติตามข้อกำหนดและเงื่อนไขการให้บริการฉบับนี้ทุกประการ หากท่านไม่ยอมรับเงื่อนไขเหล่านี้ โปรดงดเว้นการใช้งานแพลตฟอร์ม
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#142B4A]">2. การสมัครสมาชิกและการยืนยันตัวตน</h2>
          <p>
            ผู้ใช้บริการต้องให้ข้อมูลที่ถูกต้อง ครบถ้วน และเป็นจริงในการลงทะเบียนและการยืนยันตัวตนด้วยหมายเลขโทรศัพท์มือถือผ่านรหัสผ่านใช้ครั้งเดียว (OTP) ท่านมีหน้าที่รับผิดชอบในการเก็บรักษาความปลอดภัยของบัญชีผู้ใช้และอุปกรณ์ของตนเอง
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#142B4A]">3. การสั่งซื้อและการผ่อนชำระ</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>ข้อมูลราคา สเปกสินค้า และโปรโมชั่นที่แสดงบนเว็บไซต์เป็นข้อมูลล่าสุดตามที่ผู้ผลิตกำหนด</li>
            <li>การอนุมัติคำขอผ่อนชำระ วงเงินดาวน์ และจำนวนงวดเป็นไปตามหลักเกณฑ์การประเมินความเสี่ยงของบริษัท</li>
            <li>เมื่อได้รับการอนุมัติ ลูกค้าต้องนำบัตรประชาชนตัวจริงมารับเครื่องและลงนามในสัญญา ณ สาขาที่เลือกไว้</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#142B4A]">4. การรับประกันสินค้าและการคืนสินค้า</h2>
          <p>
            สินค้าทุกชิ้นรับประกันศูนย์ไทย 1 ปีเต็มตามมาตรฐานผู้ผลิต หากพบปัญหาจากการผลิตภายในระยะเวลาที่กำหนด สามารถนำเครื่องเข้าตรวจสอบเพื่อเปลี่ยนเครื่องใหม่หรือส่งซ่อมศูนย์แท้ได้ที่สาขา MeePro ทุกแห่ง
          </p>
        </section>

        <section className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
          <h2 className="text-sm font-bold text-[#142B4A]">5. การติดต่อบริษัท</h2>
          <p className="text-xs text-[#64748B]">
            หากมีข้อสงสัยเกี่ยวกับข้อกำหนดการให้บริการ สามารถติดต่อได้ที่:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2 text-xs font-semibold text-[#142B4A]">
            <a href="mailto:meeproth@meeproth.com" className="flex items-center gap-1.5 hover:text-[#FF6E00]">
              <Mail size={16} /> meeproth@meeproth.com
            </a>
            <a href="tel:0962299086" className="flex items-center gap-1.5 hover:text-[#FF6E00]">
              <Phone size={16} /> 096-229-9086
            </a>
          </div>
        </section>
      </article>
    </div>
  );
}
