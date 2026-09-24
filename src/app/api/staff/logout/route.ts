import { NextResponse } from 'next/server';
import { clearStaffSession } from '@/server/auth/staffServerAuth';

export async function POST() {
  await clearStaffSession();
  return NextResponse.json({ success: true, message: 'ออกจากระบบเจ้าหน้าที่สำเร็จ' });
}
