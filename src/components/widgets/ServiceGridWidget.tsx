'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, RefreshCw, FileText, Store, ShieldCheck, HelpCircle } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
  href: string;
  iconName: string;
}

interface Props {
  widget?: {
    id?: string;
    title?: string;
    config?: {
      title?: string;
      subtitle?: string;
      services?: ServiceItem[];
    };
  };
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    title: 'ผ่อนสมาร์ตโฟน 0%',
    description: 'ไม่ต้องใช้บัตรเครดิต อนุมัติไวใน 3 นาที',
    badge: 'ยอดนิยม',
    href: '/apply',
    iconName: 'smartphone',
  },
  {
    id: 'srv-2',
    title: 'มือถือแลกเงิน (Trade-in)',
    description: 'นำเครื่องเก่ามาประเมินราคา รับเงินสดหรือส่วนลดทันที',
    badge: 'ให้ราคาสูง',
    href: '/services#tradein',
    iconName: 'refresh',
  },
  {
    id: 'srv-3',
    title: 'ตรวจสอบสถานะคำขอ',
    description: 'ติดตามผลการอนุมัติและนัดหมายรับเครื่อง',
    href: '/account/applications',
    iconName: 'file',
  },
  {
    id: 'srv-4',
    title: 'ค้นหา 45 สาขาทั่วไทย',
    description: 'ดูที่ตั้ง เบอร์ติดต่อ เวลาเปิดทำการ และเส้นทาง',
    href: '/stores',
    iconName: 'store',
  },
];

export default function ServiceGridWidget({ widget }: Props) {
  const cfg = widget?.config || {};
  const title = cfg.title || widget?.title || 'บริการหลักจาก MeePro';
  const subtitle = cfg.subtitle || 'ครบวงจรเรื่องสมาร์ตโฟนและสินเชื่อดิจิทัลเพื่อคุณ';
  const services = cfg.services && cfg.services.length > 0 ? cfg.services : DEFAULT_SERVICES;

  const iconMap: Record<string, React.ElementType> = {
    smartphone: Smartphone,
    refresh: RefreshCw,
    file: FileText,
    store: Store,
    shield: ShieldCheck,
    help: HelpCircle,
  };

  return (
    <section aria-label={title} className="w-full my-6 p-4 sm:p-6 bg-white rounded-3xl border border-[#E2E8F0] shadow-xs">
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-[#142B4A]">{title}</h2>
        <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((item) => {
          const Icon = iconMap[item.iconName] || Smartphone;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FF6E00] hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100/70 text-[#FF6E00] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={20} />
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#142B4A] group-hover:text-[#FF6E00] transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{item.description}</p>
              </div>
              <span className="mt-4 text-xs font-bold text-[#007ACC] group-hover:underline flex items-center gap-1">
                รายละเอียดบริการ →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
