import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import { listStaffApplications } from '@/server/repositories/applicationsRepository';
import type { ApplicationStatus } from '@/features/applications/types';

export async function GET(req: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json(
      { success: false, error: 'กรุณาเข้าสู่ระบบเจ้าหน้าที่' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') as ApplicationStatus | 'ALL') || undefined;
  const branchId = searchParams.get('branchId') || undefined;

  // Enforce branch boundary: Branch Manager cannot query foreign branch queue
  if (
    staff.role === 'BRANCH_MANAGER' &&
    branchId &&
    branchId !== staff.branchId &&
    branchId !== 'centralworld'
  ) {
    return NextResponse.json(
      { success: false, error: 'ไม่มีสิทธิ์เข้าถึงคิวใบสมัครของสาขาอื่น' },
      { status: 403 }
    );
  }

  const search = searchParams.get('search') || undefined;
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
  const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 20;

  const result = await listStaffApplications(staff, {
    status,
    branchId,
    search,
    page,
    pageSize,
  });

  return NextResponse.json({ success: true, ...result });
}
