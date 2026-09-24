import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';
import { getCustomerDraft, saveCustomerDraft, clearCustomerDraft } from '@/server/repositories/applicationsRepository';

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json(
      { success: false, code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบเพื่อดูแบบร่างใบสมัคร' },
      { status: 401 }
    );
  }

  const draft = await getCustomerDraft(customer.id);
  return NextResponse.json({ success: true, draft });
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json(
      { success: false, code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบเพื่อบันทึกแบบร่าง' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const draft = await saveCustomerDraft(customer.id, {
      ...body,
      verifiedPhone: customer.phone,
    });
    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error('[API /api/applications/draft] Save error:', error);
    return NextResponse.json(
      { success: false, code: 'SERVER_ERROR', message: 'ไม่สามารถบันทึกแบบร่างได้' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ success: false, code: 'UNAUTHORIZED' }, { status: 401 });
  }
  await clearCustomerDraft(customer.id);
  return NextResponse.json({ success: true, message: 'ลบแบบร่างเรียบร้อยแล้ว' });
}
