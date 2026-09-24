import { NextRequest, NextResponse } from 'next/server';
import { requestCustomerOtp } from '@/server/auth/customerAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body.phone || typeof body.phone !== 'string') {
      return NextResponse.json(
        { success: false, code: 'INVALID_INPUT', message: 'กรุณากรอกหมายเลขโทรศัพท์' },
        { status: 400 }
      );
    }

    const result = await requestCustomerOtp(body.phone);
    if (!result.success) {
      const status = result.code === 'COOLDOWN_ACTIVE' ? 429 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/auth/otp/request] Error:', error);
    return NextResponse.json(
      { success: false, code: 'SERVER_ERROR', message: 'เกิดข้อผิดพลาดภายในระบบ' },
      { status: 500 }
    );
  }
}
