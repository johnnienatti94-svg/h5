import type { Metadata } from 'next';
import { listPublishedProducts } from '@/server/repositories/catalogRepository';
import { listPublishedBranches } from '@/server/repositories/branchesRepository';
import ApplicationWizard from '@/components/apply/ApplicationWizard';
import { DEV_PRODUCTS } from '@/server/fixtures/devCatalog';
import { DEV_BRANCH_FIXTURES } from '@/server/fixtures/devBranches';

export const metadata: Metadata = {
  title: 'สมัครผ่อนสินค้าออนไลน์ ดอกเบี้ย 0% รับเครื่องที่สาขา | MeePro',
  description:
    'ส่งคำขอสมัครผ่อนชำระสมาร์ทโฟน แท็บเล็ต และอุปกรณ์ไอทีแท้ศูนย์ ดอกเบี้ย 0% อนุมัติไว นัดหมายรับเครื่องที่สาขา MeePro ใกล้บ้าน',
};

interface ApplyPageProps {
  searchParams: Promise<{
    product?: string;
    variant?: string;
    offer?: string;
    branch?: string;
  }>;
}

export default async function ApplyPage({ searchParams }: ApplyPageProps) {
  const params = await searchParams;

  // Fetch published products & branches
  const [productsRes, branchesRes] = await Promise.all([
    listPublishedProducts({ pageSize: 50 }),
    listPublishedBranches(),

  ]);

  // Use repo results with dev fixtures fallback
  const products = DEV_PRODUCTS;
  const branches = branchesRes.ok && branchesRes.data.length > 0
    ? branchesRes.data
    : DEV_BRANCH_FIXTURES;

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#142B4A]">
          ใบสมัครผ่อนชำระสินค้า MeePro
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          กรอกข้อมูลเพื่อขออนุมัติวงเงินผ่อน 0% และนัดหมายรับเครื่องที่สาขา MeePro ที่คุณสะดวก
        </p>
      </div>

      <ApplicationWizard
        products={products}
        branches={branches}
        initialProductSlug={params.product}
        initialVariantId={params.variant}
        initialOfferId={params.offer}
        initialBranchSlug={params.branch}
      />
    </main>
  );
}
