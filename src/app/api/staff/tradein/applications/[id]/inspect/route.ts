import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import { recordStaffInspection } from '@/server/repositories/tradeInRepository';
import type { CustomerConditionAnswers, TradeInOfferAdjustment } from '@/features/tradein/types';

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
    const { inspectedAnswers, manualAdjustments, staffNote } = body as {
      inspectedAnswers?: CustomerConditionAnswers;
      manualAdjustments?: TradeInOfferAdjustment[];
      staffNote?: string;
    };

    if (!inspectedAnswers) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุผลการตรวจสภาพเครื่อง' }, { status: 400 });
    }

    const result = await recordStaffInspection(id, {
      staffUserId: staff.id,
      inspectedAnswers,
      manualAdjustments,
      staffNote,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/staff/tradein/applications/[id]/inspect] Error:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการบันทึกผลการตรวจสภาพ' }, { status: 500 });
  }
}
