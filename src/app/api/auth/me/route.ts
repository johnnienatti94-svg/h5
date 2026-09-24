import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';

export async function GET() {
  const user = await getCurrentCustomer();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }
  return NextResponse.json({ authenticated: true, user });
}
