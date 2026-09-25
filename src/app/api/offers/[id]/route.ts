import { NextRequest, NextResponse } from 'next/server';
import { getOfferById, updateOffer, deleteOffer } from '@/server/repositories/offersStore';
import { requireAdminOrHqAuth } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const offer = getOfferById(id);
  if (!offer) {
    return NextResponse.json({ success: false, error: 'Offer not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, offer });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdminOrHqAuth(request);
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateOffer(id, body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, offer: result.offer });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdminOrHqAuth(request);
  if (authCheck.errorResponse) return authCheck.errorResponse;

  const { id } = await params;
  const result = deleteOffer(id);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Offer deleted successfully' });
}
