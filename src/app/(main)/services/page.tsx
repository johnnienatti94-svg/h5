import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CreditCard,
  ShieldCheck,
  Wrench,
  RefreshCw,
  Store,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'บริการของเรา | MeePro',
  description: 'บริการครบวงจรจาก MeePro — ผ่อนมือถือ 0% เครื่องแท้ประกันศูนย์ MeePro Care Trade-in และบริการรับที่สาขา',
};

const SERVICES = [
  {
    id: 'installment',
    title: 'บริการผ่อนชำระ 0%',
    subtitle: 'อนุมัติไว ไม่ต้องใช้บัตรเครดิต',
    description: 'เลือกผ่อนสมาร์ตโฟนและแกดเจ็ตได้นานสูงสุด 24 เดือน สมัครง่ายผ่านเบอร์โทรศัพท์และบัตรประชาชน รู้ผลไวภายในวันเดียว',
    icon: CreditCard,
    color: '#FF6E00',
    bgColor: '#FFF6EF',
    highlights: [
      'ผ่อน 0% นานสูงสุด 24 เดือน',
      'ไม่ต้องมีบัตรเครดิต สมัครได้ทุกอาชีพ',
      'อนุมัติไว ทราบผลและรับเครื่องได้ที่สาขา',
      'เช็กค่างวดและสัญญาโปร่งใส ไม่มีค่าธรรมเนียมแอบแฝง',
    ],
    ctaText: 'ดูสินค้าที่ร่วมรายการ',
    ctaHref: '/products',
  },
  {
    id: 'genuine-warranty',
    title: 'เครื่องแท้ประกันศูนย์ 100%',
    subtitle: 'มั่นใจทุกเครื่อง ตรวจสอบได้',
    description: 'สินค้าทุกชิ้นจาก MeePro เป็นเครื่องใหม่แท้ศูนย์ไทย ได้รับการคุ้มครองตามมาตรฐานผู้ผลิต เข้าศูนย์บริการชั้นนำได้ทั่วประเทศ',
    icon: ShieldCheck,
    color: '#16A34A',
    bgColor: '#F0FDF4',
    highlights: [
      'ประกันศูนย์ไทยอย่างเป็นทางการ 1 ปีเต็ม',
      'รับประกันเปลี่ยนเครื่องใหม่ตามเงื่อนไขศูนย์',
      'มีใบกำกับภาษีเต็มรูปแบบทุกคำสั่งซื้อ',
    ],
    ctaText: 'เลือกซื้อสินค้า',
    ctaHref: '/products',
  },
  {
    id: 'meepro-care',
    title: 'ศูนย์บริการ MeePro Care',
    subtitle: 'ดูแลใกล้ชิดหลังการขาย',
    description: 'บริการตรวจเช็กสุขภาพเครื่อง เปลี่ยนฟิล์มกระจก แบตเตอรี่ และให้คำปรึกษาการใช้งานสมาร์ตโฟนโดยผู้เชี่ยวชาญ',
    icon: Wrench,
    color: '#0284C7',
    bgColor: '#F0F9FF',
    highlights: [
      'ติดฟิล์มและทำความสะอาดเครื่องฟรีสำหรับสมาชิก',
      'ตรวจเช็กแบตเตอรี่และระบบเบื้องต้นฟรี',
      'ส่งเคลมศูนย์แท้ผ่านหน้าร้าน MeePro ทุกสาขา',
    ],
    ctaText: 'ค้นหาสาขาใกล้คุณ',
    ctaHref: '/stores',
  },
  {
    id: 'trade-in',
    title: 'MeePro Trade-in',
    subtitle: 'เครื่องเก่าแลกใหม่ ให้ราคาสูง',
    description: 'นำสมาร์ตโฟนเครื่องเดิมมาประเมินราคาที่สาขา ใช้เป็นส่วนลดดาวน์หรือส่วนลดแลกซื้อเครื่องใหม่ได้ทันที',
    icon: RefreshCw,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    highlights: [
      'ประเมินราคาตามสภาพจริง รวดเร็วใน 10 นาที',
      'ใช้ลดเงินดาวน์หรือราคาสดได้ทันที',
      'ข้อมูลปลอดภัยด้วยบริการล้างข้อมูลมาตรฐานสากล',
    ],
    ctaText: 'สอบถามรายละเอียด',
    ctaHref: '/stores',
  },
  {
    id: 'bopis',
    title: 'รับเครื่องที่สาขา (Click & Collect)',
    subtitle: 'สั่งออนไลน์ รับเครื่องได้ทันที',
    description: 'เลือกดูสินค้าและทำสัญญาออนไลน์ จากนั้นแวะรับเครื่องจริง ตรวจสภาพ และรับคำแนะนำการใช้งานที่สาขาใกล้บ้านคุณ',
    icon: Store,
    color: '#D97706',
    bgColor: '#FFFBEB',
    highlights: [
      'เลือกรับได้จาก 5 สาขาทั่วกรุงเทพฯ และภูมิภาค',
      'ตรวจเช็กเครื่องก่อนเซ็นรับ สบายใจ 100%',
      'พนักงานพร้อมให้คำแนะนำและโอนถ่ายข้อมูลให้ฟรี',
    ],
    ctaText: 'ดูสาขาทั้งหมด',
    ctaHref: '/stores',
  },
];

export default function ServicesPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#FFF6EF] via-white to-[#F6F7F9] p-6 sm:p-8 rounded-3xl border border-[#FFE2CC] shadow-xs">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF6E00]/10 text-[#FF6E00]">
            <Sparkles size={14} aria-hidden="true" />
            MEEPRO SERVICES
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#142B4A] tracking-tight">
            บริการครบวงจรเพื่อคนรักสมาร์ตโฟน
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            MeePro พร้อมมอบประสบการณ์ที่ดีที่สุดตั้งแต่การเลือกซื้อ การผ่อนชำระแบบสบายกระเป๋า ไปจนถึงบริการดูแลหลังการขายอย่างอบอุ่นที่สาขาใกล้คุณ
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="space-y-6" aria-label="รายการบริการทั้งหมด">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.id}
                className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: service.bgColor, color: service.color }}
                    >
                      <Icon size={24} aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#142B4A]">{service.title}</h2>
                      <p className="text-xs font-medium text-[#64748B]">{service.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#475569] leading-relaxed">
                    {service.description}
                  </p>

                  <ul className="space-y-1.5 pt-2">
                    {service.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#334155]">
                        <CheckCircle2 size={15} className="text-[#16A34A] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-[#F1F5F9]">
                  <Link
                    href={service.ctaHref}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF6E00] hover:text-[#E56200] transition-colors"
                  >
                    <span>{service.ctaText}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Contact / Help Banner */}
      <section className="bg-[#142B4A] text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold">ต้องการคำปรึกษาเพิ่มเติม?</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            ทีมงาน MeePro ยินดีให้คำแนะนำทุกขั้นตอน ทั้งเรื่องการเลือกเครื่องและเงื่อนไขการผ่อน
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/stores"
            className="px-5 py-2.5 rounded-xl bg-[#FF6E00] text-white text-sm font-bold hover:bg-[#E56200] transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Store size={18} />
            <span>ไปที่หน้าสาขา</span>
          </Link>
          <a
            href="tel:022559001"
            className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-colors border border-white/20 inline-flex items-center gap-2"
          >
            <PhoneCall size={17} />
            <span>ติดต่อเรา</span>
          </a>
        </div>
      </section>
    </div>
  );
}
