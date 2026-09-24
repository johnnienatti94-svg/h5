import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import { scheduleStaffAppointment } from '@/server/repositories/applicationsRepository';

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

  if (!body.startsAt) {
    return NextResponse.json(
      { success: false, error: 'กรุณาระบุวันและเวลานัดหมาย' },
      { status: 400 }
    );
  }

  const result = await scheduleStaffAppointment(id, staff, body.startsAt, body.note);
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
