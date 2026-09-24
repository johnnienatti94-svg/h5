import { NextRequest, NextResponse } from 'next/server';
import { getPublishedProductBySlug } from '@/server/repositories/catalogRepository';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = await getPublishedProductBySlug(slug);

  if (!result.ok) {
    const status = result.error.code === 'PRODUCT_NOT_FOUND' ? 404 : 400;
    return NextResponse.json(
      { success: false, error: result.error },
      { status, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    { success: true, data: { product: result.data } },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
