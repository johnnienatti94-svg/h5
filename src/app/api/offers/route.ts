import { NextRequest, NextResponse } from 'next/server';
import { getAllOffers, createOffer } from '@/server/repositories/offersStore';
import { requireAdminOrHqAuth } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const offers = getAllOffers();
    return NextResponse.json({ success: true, offers });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdminOrHqAuth(request);
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const result = createOffer(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, offer: result.offer }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
