import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import { getStaffTradeInApplications } from '@/server/repositories/tradeInRepository';
import type { TradeInApplicationStatus } from '@/features/tradein/types';

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') as TradeInApplicationStatus) || undefined;
  const search = searchParams.get('search') || undefined;

  // Branch scoping: If not ADMIN/HQ, enforce assigned branch
  let branchId = searchParams.get('branchId') || undefined;
  if (staff.role !== 'ADMIN' && staff.role !== 'HQ') {
    branchId = staff.branchId;
  }

  const applications = await getStaffTradeInApplications({ branchId, status, search });
  return NextResponse.json({ success: true, applications });
}
