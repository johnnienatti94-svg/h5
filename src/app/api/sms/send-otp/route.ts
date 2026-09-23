import { NextRequest, NextResponse } from 'next/server';
import { sendSmsOtp } from '@/lib/smsService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกหมายเลขโทรศัพท์' },
        { status: 400 }
      );
    }

    const result = await sendSmsOtp(phone);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message, cooldownRemaining: result.cooldownRemaining },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      refCode: result.refCode,
      cooldownRemaining: result.cooldownRemaining,
      debugOtp: result.debugOtp,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่ง OTP';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
