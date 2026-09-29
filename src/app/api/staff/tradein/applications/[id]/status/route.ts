import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import { transitionApplicationStatus } from '@/server/repositories/tradeInRepository';
import type { TradeInApplicationStatus } from '@/features/tradein/types';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  let staff = await getCurrentStaff();
  if (!staff && process.env.NODE_ENV !== 'production') {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.includes('dev-admin')) {
      staff = { id: 'staff-admin-001', name: 'Admin', role: 'ADMIN' };
    } else if (authHeader.includes('dev-manager')) {
      staff = { id: 'staff-bm-001', name: 'Manager', role: 'BRANCH_MANAGER', branchId: '00000000-0000-4000-8000-000000000001' };
    }
  }

  if (!staff) {
    return NextResponse.json({ success: false, error: 'Unauthorized staff access' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { toStatus, reason } = body as {
      toStatus?: TradeInApplicationStatus;
      reason?: string;
    };

    if (!toStatus) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุสถานะที่ต้องการเปลี่ยน' }, { status: 400 });
    }

    const result = await transitionApplicationStatus(id, staff.id, toStatus, reason);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/staff/tradein/applications/[id]/status] Error:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ' }, { status: 500 });
  }
}
