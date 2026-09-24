import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';
import { getCustomerApplicationById } from '@/server/repositories/applicationsRepository';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json(
      { success: false, code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const application = await getCustomerApplicationById(customer.id, id);

  if (!application) {
    return NextResponse.json(
      { success: false, code: 'NOT_FOUND', message: 'ไม่พบใบสมัคร หรือไม่มีสิทธิ์เข้าถึง' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, application });
}
