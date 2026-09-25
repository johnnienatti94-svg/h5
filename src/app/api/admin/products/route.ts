import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProductsList,
  createProduct,
} from '@/server/repositories/catalogStore';
import { requireAdminOrHqAuth } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = getAllProductsList().map((p) => {
    const minPriceMinor = Math.min(...p.variants.map((v) => v.cashPriceMinor));
    const minMonthlyMinor = p.variants.find((v) => v.isInStock)
      ? Math.round(minPriceMinor / 10)
      : undefined;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand.name,
      brandSlug: p.brand.slug,
      category: p.category.name,
      categorySlug: p.category.slug,
      summary: p.summary,
      description: p.description,
      imageUrl: p.images[0]?.url || '',
      basePriceMinor: minPriceMinor,
      monthlyFromMinor: minMonthlyMinor,
      isInStock: p.variants.some((v) => v.isInStock),
      variantsCount: p.variants.length,
      publishedAt: p.publishedAt,
    };
  });

  return NextResponse.json({ success: true, products });
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdminOrHqAuth(request);
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const result = createProduct(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: result.product }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 500 }
    );
  }
}
