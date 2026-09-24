import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import { lookupCustomerByPhone } from '@/server/repositories/applicationsRepository';

export async function GET(req: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone') || '';

  const result = await lookupCustomerByPhone(phone, staff);
  if (!result.success) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json(result);
}
