import { NextRequest, NextResponse } from 'next/server';
import { listPublishedProducts } from '@/server/repositories/catalogRepository';
import type { ProductCondition } from '@/features/catalog/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const brand = searchParams.get('brand') || undefined;
  const condition = (searchParams.get('condition') as ProductCondition | 'all') || undefined;
  const storage = searchParams.get('storage') || undefined;
  const branchSlug = searchParams.get('branch') || undefined;
  const minPriceMinor = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPriceMinor = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const sort = (searchParams.get('sort') as any) || undefined;
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
  const pageSize = searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : 12;

  const result = await listPublishedProducts({
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
  });

  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    { success: true, data: result.data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
