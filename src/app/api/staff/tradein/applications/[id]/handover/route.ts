import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import { recordHandoverAndPayment } from '@/server/repositories/tradeInRepository';
import type { TradeInHandoverChecklist, TradeInPaymentRecord } from '@/features/tradein/types';

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
    const { handoverChecklist, paymentRecord } = body as {
      handoverChecklist?: TradeInHandoverChecklist;
      paymentRecord?: TradeInPaymentRecord;
    };

    if (!handoverChecklist || !paymentRecord) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกรายการตรวจสอบการส่งมอบและข้อมูลการชำระเงินให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const result = await recordHandoverAndPayment(id, staff.id, handoverChecklist, paymentRecord);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/staff/tradein/applications/[id]/handover] Error:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการบันทึกการส่งมอบและจ่ายเงิน' }, { status: 500 });
  }
}
