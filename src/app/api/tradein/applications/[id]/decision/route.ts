import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';
import { recordCustomerDecision } from '@/server/repositories/tradeInRepository';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  let customer = await getCurrentCustomer();
  if (!customer && process.env.NODE_ENV !== 'production') {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.includes('dev-customer') || authHeader.includes('0851780999')) {
      customer = { id: 'cust-demo-001', phone: '0851780999', e164: '+66851780999', phoneVerified: true, createdAt: '' };
    }
  }

  if (!customer) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { decision, expectedRevision } = body as {
      decision?: 'ACCEPTED' | 'DECLINED';
      expectedRevision?: number;
    };

    if (!decision || expectedRevision === undefined) {
      return NextResponse.json(
        { success: false, error: 'กรุณาระบุการตัดสินใจและเวอร์ชันข้อเสนอที่ต้องการตอบรับ' },
        { status: 400 }
      );
    }

    const result = await recordCustomerDecision(id, customer.id, decision, expectedRevision);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/tradein/applications/[id]/decision] Error:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการบันทึกคำตอบรับ' }, { status: 500 });
  }
}
