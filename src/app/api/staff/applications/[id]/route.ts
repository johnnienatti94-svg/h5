import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import { getStaffApplicationById } from '@/server/repositories/applicationsRepository';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  const { id } = await params;
  const result = await getStaffApplicationById(id, staff);
  if (!result.success) {
    return NextResponse.json(result, { status: result.error?.includes('สิทธิ์') ? 403 : 404 });
  }

  return NextResponse.json(result);
}
