import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';
import { submitTradeInApplication } from '@/server/repositories/tradeInRepository';

export async function POST(req: NextRequest) {
  let customer = await getCurrentCustomer();

  // Dev bypass fallback if in development/test
  if (!customer && process.env.NODE_ENV !== 'production') {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.includes('dev-customer') || authHeader.includes('0851780999')) {
      customer = {
        id: 'cust-demo-001',
        phone: '0851780999',
        e164: '+66851780999',
        phoneVerified: true,
        contactName: 'ลูกค้าทดสอบ',
        createdAt: new Date().toISOString(),
      };
    }
  }

  if (!customer) {
    return NextResponse.json(
      { success: false, code: 'UNAUTHORIZED', error: 'กรุณายืนยันเบอร์โทรศัพท์ด้วยรหัส OTP ก่อนส่งคำขอ' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));

    if (!body.contactName || !body.deviceSelection || !body.branchId || !body.appointmentStartsAt) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลชื่อผู้ติดต่อ สาขา และเวลานัดหมายให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const result = await submitTradeInApplication(customer.id, {
      idempotencyKey: body.idempotencyKey,
      contactName: body.contactName.trim(),
      verifiedPhone: customer.phone,
      nationalIdMasked: body.nationalIdMasked,
      address: body.address,
      deviceSelection: body.deviceSelection,
      declaredAnswers: body.declaredAnswers || {},
      quoteSnapshot: body.quoteSnapshot,
      imeiOrSerial: body.imeiOrSerial,
      evidenceFiles: body.evidenceFiles || [],
      branchId: body.branchId,
      appointmentStartsAt: body.appointmentStartsAt,
      customerNote: body.customerNote,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/tradein/applications/submit] Error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
