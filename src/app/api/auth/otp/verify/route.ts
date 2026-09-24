import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerOtp } from '@/server/auth/customerAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, code, privacyAccepted, privacyPolicyVersion } = body;

    if (!phone || typeof phone !== 'string' || !code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, code: 'INVALID_INPUT', message: 'กรุณากรอกเบอร์โทรศัพท์และรหัส OTP 6 หลัก' },
        { status: 400 }
      );
    }

    const result = await verifyCustomerOtp(phone, code, {
      privacyAccepted: Boolean(privacyAccepted),
      privacyPolicyVersion: typeof privacyPolicyVersion === 'string' ? privacyPolicyVersion : undefined,
      userAgent: req.headers.get('user-agent') || undefined,
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/auth/otp/verify] Error:', error);
    return NextResponse.json(
      { success: false, code: 'SERVER_ERROR', message: 'เกิดข้อผิดพลาดในการยืนยัน OTP' },
      { status: 500 }
    );
  }
}
