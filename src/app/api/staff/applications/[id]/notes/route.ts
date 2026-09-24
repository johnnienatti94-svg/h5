import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import {
  addStaffInternalNote,
  getStaffInternalNotes,
} from '@/server/repositories/applicationsRepository';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ success: false, error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
  }

  const { id } = await params;
  const notes = await getStaffInternalNotes(id, staff);
  return NextResponse.json({ success: true, notes });
}

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
  if (!body.note || typeof body.note !== 'string') {
    return NextResponse.json({ success: false, error: 'กรุณาระบุข้อความโน้ต' }, { status: 400 });
  }

  const result = await addStaffInternalNote(id, staff, body.note);
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
