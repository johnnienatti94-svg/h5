import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';
import { cancelCustomerApplication } from '@/server/repositories/applicationsRepository';

export async function POST(
  req: NextRequest,
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
  const body = await req.json().catch(() => ({}));
  const reason = typeof body.reason === 'string' ? body.reason : 'ลูกค้ายกเลิกคำขอผ่านระบบ';

  const result = await cancelCustomerApplication(customer.id, id, reason);
  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
