import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import { getTradeInApplicationById } from '@/server/repositories/tradeInRepository';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
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

  const application = await getTradeInApplicationById(id, {
    staffId: staff.id,
    staffRole: staff.role,
    staffBranchId: staff.branchId,
  });

  if (!application) {
    return NextResponse.json({ success: false, error: 'ไม่พบรายการใบสมัคร' }, { status: 404 });
  }

  return NextResponse.json({ success: true, application });
}
