import type { Metadata } from 'next';
import { Suspense } from 'react';
import { listPublishedProducts } from '@/server/repositories/catalogRepository';
import { listPublishedBranches } from '@/server/repositories/branchesRepository';
import ProductsCatalogView from '@/components/products/ProductsCatalogView';
import type { ProductCondition } from '@/features/catalog/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'สินค้าทั้งหมด ผ่อน 0% ทุกรุ่น ไม่ใช้บัตรเครดิต | MeePro',
  description: 'สมาร์ตโฟน แท็บเล็ต แล็ปท็อป และแกดเจ็ตเครื่องแท้ประกันศูนย์ไทย ผ่อนสบาย 0% นานสูงสุด 24 เดือน สมัครง่าย อนุมัติไวที่ MeePro',
  alternates: { canonical: '/products' },
};

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    condition?: string;
    storage?: string;
    branch?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  const query = params.q || undefined;
  const category = params.category || undefined;
  const brand = params.brand || undefined;
  const condition = (params.condition as ProductCondition | 'all') || undefined;
  const storage = params.storage || undefined;
  const branchSlug = params.branch || undefined;
  const minPriceMinor = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPriceMinor = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sort = (params.sort as any) || undefined;
  const page = params.page ? Number(params.page) : 1;
  const pageSize = params.pageSize ? Number(params.pageSize) : 12;

  const [result, branchesResult] = await Promise.all([
    listPublishedProducts({
      query,
      category,
      brand,
      condition,
      storage,
      branchSlug,
      minPriceMinor,
      maxPriceMinor,
      sort,
      page,
      pageSize,
    }),
    listPublishedBranches(),
  ]);

  const catalogData = result.ok
    ? result.data
    : {
        products: [],
        total: 0,
        page: 1,
        pageSize: 12,
        totalPages: 1,
        availableCategories: [],
        availableBrands: [],
        availableConditions: [],
        availableStorages: [],
      };

  const availableBranches = branchesResult.ok ? branchesResult.data : [];

  return (
    <Suspense fallback={<div className="p-8 text-center text-[#64748B]">กำลังโหลดรายการสินค้า...</div>}>
      <ProductsCatalogView initialData={catalogData} availableBranches={availableBranches} />
    </Suspense>
  );
}
