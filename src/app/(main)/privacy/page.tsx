import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'นโยบายการคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy) | MeePro',
  description: 'นโยบายการคุ้มครองข้อมูลส่วนบุคคลของ บริษัท บี บ๊อกซ์ เทคโนโลยี (ประเทศไทย) จำกัด ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562',
};

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-6">
      <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] hover:text-[#142B4A]">
        <ArrowLeft size={16} /> กลับไปหน้าเกี่ยวกับเรา
      </Link>

      <header className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#FF6E00]">
          <Shield size={16} />
          <span>PDPA COMPLIANCE • พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#142B4A]">
          นโยบายการคุ้มครองข้อมูลส่วนบุคคล (Privacy Policy)
        </h1>
        <p className="text-xs text-[#64748B]">
          บริษัท บี บ๊อกซ์ เทคโนโลยี (ประเทศไทย) จำกัด • ประกาศ ณ วันที่ 30 กันยายน 2569
        </p>
      </header>

      <article className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-6 text-sm text-[#334155] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#142B4A]">1. ขอบเขตและเจตนารมณ์</h2>
          <p>
            บริษัท บี บ๊อกซ์ เทคโนโลยี (ประเทศไทย) จำกัด (“บริษัท”) เจ้าของเว็บไซต์ https://www.meeproth.com ให้ความสำคัญต่อการคุ้มครองข้อมูลส่วนตัวของท่านมากที่สุด บริษัทจะเก็บรวบรวม บันทึก เผยแพร่และใช้งานเฉพาะข้อมูลที่ท่านให้กับทางบริษัทด้วยความสมัครใจเท่านั้น เพื่อการให้บริการตามสัญญา การจัดส่งสินค้า การตรวจสอบคำขอผ่อนชำระ และการพัฒนาประสบการณ์ใช้งานตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#142B4A]">2. ข้อมูลส่วนบุคคลที่เราจัดเก็บ</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>ข้อมูลระบุตัวตน:</strong> ชื่อ-นามสกุล, เลขประจำตัวประชาชน (สำหรับยืนยันตัวตนการผ่อนชำระ), รูปถ่าย และข้อมูล e-KYC ตามกฎหมาย</li>
            <li><strong>ข้อมูลติดต่อ:</strong> หมายเลขโทรศัพท์มือถือ (สำหรับรหัสผ่านใช้ครั้งเดียว OTP และแจ้งเตือนสัญญา), ที่อยู่จัดส่ง, อีเมล</li>
            <li><strong>ข้อมูลการทำธุรกรรม:</strong> ข้อมูลคำสั่งซื้อ, สินค้าที่เลือก, ข้อมูลการผ่อนชำระ และบันทึกการชำระเงิน</li>
            <li><strong>ข้อมูลทางเทคนิค:</strong> คุกกี้ที่จำเป็นสำหรับการรักษาความปลอดภัยและสถานะการเข้าสู่ระบบ</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#142B4A]">3. วัตถุประสงค์ในการประมวลผลข้อมูล</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>เพื่อดำเนินการตามคำขอสมัครผ่อนชำระ คำสั่งซื้อ และการจัดส่งสินค้า</li>
            <li>เพื่อการตรวจสอบความถูกต้องและยืนยันตัวตนผ่านระบบ SMS OTP</li>
            <li>เพื่อให้บริการหลังการขาย การเคลมประกันศูนย์ และการนัดหมายรับเครื่องที่สาขา</li>
            <li>เพื่อปฏิบัติตามหน้าที่ตามกฎหมายที่เกี่ยวข้อง</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#142B4A]">4. สิทธิของเจ้าของข้อมูลส่วนบุคคล</h2>
          <p>
            ท่านมีสิทธิในการขอเข้าถึง ขอรับสำเนา ขอแก้ไขข้อมูลให้ถูกต้อง ขอระงับการใช้ ขอคัดค้านการประมวลผล หรือขอให้ลบทำลายข้อมูลส่วนบุคคลของท่านได้ตามที่กฎหมายกำหนด
          </p>
        </section>

        <section className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
          <h2 className="text-sm font-bold text-[#142B4A]">5. ช่องทางการติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)</h2>
          <p className="text-xs text-[#64748B]">
            หากท่านมีข้อสงสัยหรือประสงค์จะใช้สิทธิเกี่ยวกับข้อมูลส่วนบุคคล โปรดติดต่อเรา:
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
