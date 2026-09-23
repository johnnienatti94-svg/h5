import { NextRequest, NextResponse } from 'next/server';
import { verifySmsOtp } from '@/lib/smsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกเบอร์โทรศัพท์และรหัส OTP' },
        { status: 400 }
      );
    }

    const result = await verifySmsOtp(phone, code);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    // Return success authentication metadata
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10
      ? `${cleanPhone.slice(0, 3)}-${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`
      : cleanPhone;

    return NextResponse.json({
      success: true,
      message: result.message,
      user: {
        phone: formattedPhone,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการตรวจสอบ OTP';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
