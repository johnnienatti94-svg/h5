import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, PackageOpen } from 'lucide-react';
import { getPublishedProductBySlug } from '@/server/repositories/catalogRepository';
import { listPublishedBranches } from '@/server/repositories/branchesRepository';
import ProductDetailView from '@/components/products/ProductDetailView';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedProductBySlug(slug);

  if (!result.ok) {
    return {
      title: 'ไม่พบสินค้า | MeePro',
      robots: { index: false, follow: false },
    };
  }

  const p = result.data;
  return {
    title: `${p.name} — ผ่อน 0% เริ่มต้น | MeePro`,
    description: p.summary,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: {
      title: `${p.name} | MeePro`,
      description: p.summary,
      images: p.images[0]?.url ? [{ url: p.images[0].url }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [productResult, branchesResult] = await Promise.all([
    getPublishedProductBySlug(slug),
    listPublishedBranches(),
  ]);

  if (!productResult.ok) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 text-[#FF6E00] flex items-center justify-center">
          <PackageOpen size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[#142B4A]">ไม่พบสินค้าที่คุณต้องการ</h1>
        <p className="text-sm text-[#64748B]">
          สินค้านี้อาจยังไม่ได้เผยแพร่ สินค้าหมด หรือลิงก์ไม่ถูกต้อง
        </p>
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#142B4A] text-white text-sm font-bold hover:bg-[#1E3A5F] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>กลับไปเลือกชมสินค้าทั้งหมด</span>
          </Link>
        </div>
      </div>
    );
  }

  const availableBranches = branchesResult.ok ? branchesResult.data : [];
  return <ProductDetailView product={productResult.data} availableBranches={availableBranches} />;
}
