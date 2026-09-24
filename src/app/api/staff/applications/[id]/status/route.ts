import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import { staffUpdateStatus } from '@/server/repositories/applicationsRepository';
import type { ApplicationStatus } from '@/features/applications/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const toStatus = body.toStatus as ApplicationStatus;

  if (!toStatus) {
    return NextResponse.json({ success: false, error: 'กรุณาระบุสถานะเป้าหมาย' }, { status: 400 });
  }

  const result = await staffUpdateStatus(id, staff, toStatus, {
    reason: body.reason,
    customerMessage: body.customerMessage,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
