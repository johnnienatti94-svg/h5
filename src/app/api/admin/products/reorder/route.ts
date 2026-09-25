import { NextRequest, NextResponse } from 'next/server';
import {
  reorderProducts,
  moveProductOrder,
} from '@/server/repositories/catalogStore';
import { requireAdminOrHqAuth } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  const authCheck = await requireAdminOrHqAuth(request);
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const body = await request.json();

    // If move action: { action: 'move', id: string, direction: 'up' | 'down' }
    if (body.action === 'move' && body.id && body.direction) {
      const result = moveProductOrder(body.id, body.direction);
      return NextResponse.json({ success: true, count: result.products.length });
    }

    // If batch reorder: { orderedIds: string[] }
    if (Array.isArray(body.orderedIds)) {
      const result = reorderProducts(body.orderedIds);
      return NextResponse.json({ success: true, count: result.products.length });
    }

    return NextResponse.json(
      { success: false, error: 'Provide action="move" with id & direction, or orderedIds array' },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 500 }
    );
  }
}
