import { NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';

export async function GET() {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ authenticated: false, staff: null });
  }
  return NextResponse.json({ authenticated: true, staff });
}
