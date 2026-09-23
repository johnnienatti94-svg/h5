import { NextResponse } from 'next/server';
import { reorderWidgets } from '@/lib/cmsDb';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const auth = authenticateCmsRequest(request);

    if (!auth || !hasPermission(auth.role, 'REORDER_WIDGETS')) {
      return NextResponse.json(
        { error: 'Unauthorized — requires Staff or Admin role to reorder widgets' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orders } = body;

    if (!Array.isArray(orders)) {
      return NextResponse.json(
        { error: 'Invalid payload: orders must be an array of { id, sort_order }' },
        { status: 400 }
      );
    }

    const result = await reorderWidgets(pageId, orders);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: orders.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
