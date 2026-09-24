import { NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';
import { getCustomerApplications } from '@/server/repositories/applicationsRepository';

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json(
      { success: false, code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' },
      { status: 401 }
    );
  }

  const applications = await getCustomerApplications(customer.id);
  return NextResponse.json({ success: true, applications });
}
