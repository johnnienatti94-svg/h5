import { NextResponse } from 'next/server';
import { clearCustomerSession } from '@/server/auth/customerAuth';

export async function POST() {
  await clearCustomerSession();
  return NextResponse.json({ success: true, message: 'ออกจากระบบสำเร็จ' });
}
