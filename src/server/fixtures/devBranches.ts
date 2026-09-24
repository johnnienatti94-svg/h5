import 'server-only';

import type { PublicBranch } from '@/features/branches/types';
import { validatePublishedBranch } from '@/features/branches/validation';

/**
 * High-fidelity development fixtures for MeePro store locations.
 * Used during local development and preview environments before/until
 * production database migrations are applied to the live instance.
 */
const RAW_DEV_BRANCHES = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    slug: 'centralworld',
    name: 'MeePro Flagship Store CentralWorld',
    fullAddress: '999/9 ถ. พระรามที่ ๑ แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330',
    province: 'กรุงเทพมหานคร',
    region: 'กรุงเทพฯ',
    displayPhone: '02-255-9001',
    normalizedPhone: '+6622559001',
    googleMapsUrl: 'https://maps.google.com/?q=CentralWorld+Bangkok',
    imageUrl: null,
    imageAlt: 'MeePro Flagship Store CentralWorld',
    openingHours: ['จันทร์ - อาทิตย์ 10:00 - 22:00 น.'],
    directions: 'ชั้น 4 โซน Atrium (ใกล้ลิฟต์แก้ว) BTS ชิดลม / สยาม (มีทางเชื่อม Skywalk)',
    publishedAt: '2026-09-24T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    slug: 'siam-paragon',
    name: 'MeePro Experience Store Siam Paragon',
    fullAddress: '991 ถ. พระรามที่ ๑ แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330',
    province: 'กรุงเทพมหานคร',
    region: 'กรุงเทพฯ',
    displayPhone: '02-610-8112',
    normalizedPhone: '+6626108112',
    googleMapsUrl: 'https://maps.google.com/?q=Siam+Paragon+Bangkok',
    imageUrl: null,
    imageAlt: 'MeePro Experience Store Siam Paragon',
    openingHours: ['จันทร์ - อาทิตย์ 10:00 - 21:30 น.'],
    directions: 'ชั้น 3 โซน Living & Technology BTS สยาม (ทางออก 3 และ 5)',
    publishedAt: '2026-09-24T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    slug: 'mega-bangna',
    name: 'MeePro Store Mega Bangna',
    fullAddress: '39 หมู่ที่ 6 ถ. บางนา-ตราด ตำบลบางแก้ว อำเภอบางพลี สมุทรปราการ 10540',
    province: 'สมุทรปราการ',
    region: 'ปริมณฑล',
    displayPhone: '02-105-1556',
    normalizedPhone: '+6621051556',
    googleMapsUrl: 'https://maps.google.com/?q=Megabangna',
    imageUrl: null,
    imageAlt: 'MeePro Store Mega Bangna',
    openingHours: ['จันทร์ - อาทิตย์ 10:00 - 22:00 น.'],
    directions: 'ชั้น 2 โซน Mega Tech (หน้า HomePro)',
    publishedAt: '2026-09-24T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000004',
    slug: 'central-westgate',
    name: 'MeePro Store Central Westgate',
    fullAddress: '199, 199/1-2 หมู่ที่ 6 ถ. กาญจนาภิเษก ตำบลเสาธงหิน อำเภอบางใหญ่ นนทบุรี 11140',
    province: 'นนทบุรี',
    region: 'ปริมณฑล',
    displayPhone: '02-194-8822',
    normalizedPhone: '+6621948822',
    googleMapsUrl: 'https://maps.google.com/?q=Central+Westgate',
    imageUrl: null,
    imageAlt: 'MeePro Store Central Westgate',
    openingHours: ['จันทร์ - ศุกร์ 10:30 - 21:00 น.', 'เสาร์ - อาทิตย์ 10:00 - 21:30 น.'],
    directions: 'ชั้น 2 โซน Digital (ใกล้โรงภาพยนตร์) MRT สายสีม่วง สถานีตลาดบางใหญ่',
    publishedAt: '2026-09-24T00:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000005',
    slug: 'central-chiangmai',
    name: 'MeePro Store Central Chiangmai Festival',
    fullAddress: '99, 99/1, 99/2 หมู่ที่ 4 ถ. ซูเปอร์ไฮเวย์ ตำบลฟ้าฮ่าม อำเภอเมืองเชียงใหม่ เชียงใหม่ 50000',
    province: 'เชียงใหม่',
    region: 'ภาคเหนือ',
    displayPhone: '053-998-700',
    normalizedPhone: '+6653998700',
    googleMapsUrl: 'https://maps.google.com/?q=Central+Chiangmai+Festival',
    imageUrl: null,
    imageAlt: 'MeePro Store Central Chiangmai Festival',
    openingHours: ['จันทร์ - พฤหัส 11:00 - 21:00 น.', 'ศุกร์ - อาทิตย์ 10:00 - 21:30 น.'],
    directions: 'ชั้น 3 โซน IT World',
    publishedAt: '2026-09-24T00:00:00.000Z',
  },
];

export const DEV_BRANCH_FIXTURES: PublicBranch[] = RAW_DEV_BRANCHES.map((raw) => {
  const result = validatePublishedBranch(raw);
  if (!result.success) {
    throw new Error(`Invalid branch fixture configuration: ${result.reason}`);
  }
  return result.data;
});

export function getDevBranchBySlug(slug: string): PublicBranch | null {
  const normalized = slug.trim().toLowerCase();
  return DEV_BRANCH_FIXTURES.find((b) => b.slug === normalized) ?? null;
}
