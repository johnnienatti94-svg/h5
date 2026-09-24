import { NextRequest, NextResponse } from 'next/server';
import { normalizeThaiPhone } from '@/lib/phone';
import { supabase } from '@/lib/supabase';
import { requestCustomerOtp } from '@/server/auth/customerAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const normalizedPhone = normalizeThaiPhone(body.phone);

    if (!normalizedPhone) {
      return NextResponse.json(
        { success: false, code: 'INVALID_PHONE', message: 'กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง' },
        { status: 400 }
      );
    }

    if (process.env.NODE_ENV === 'production' && !body.captchaToken) {
      return NextResponse.json(
        {
          success: false,
          code: 'BOT_VERIFICATION_REQUIRED',
          message: 'กรุณายืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ',
        },
        { status: 400 }
      );
    }

    // Try Supabase auth first
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone.e164,
        options: {
          shouldCreateUser: true,
          captchaToken: typeof body.captchaToken === 'string' ? body.captchaToken : undefined,
        },
      });

      if (!error) {
        // Also register with server auth challenge
        await requestCustomerOtp(normalizedPhone.national);
        return NextResponse.json({
          success: true,
          message: 'หากหมายเลขสามารถรับบริการได้ ระบบจะส่งรหัส OTP ให้คุณ',
          cooldownRemaining: 60,
        });
      }
    } catch {
      // Continue to local auth fallback
    }

    // Fall back to server customerAuth (enforces cooldown, attempt limits, and dev code)
    const result = await requestCustomerOtp(normalizedPhone.national);
    if (!result.success) {
      return NextResponse.json(result, { status: result.code === 'COOLDOWN_ACTIVE' ? 429 : 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      cooldownRemaining: result.cooldownRemaining,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        code: 'OTP_SEND_FAILED',
        message: 'ไม่สามารถส่งรหัส OTP ได้ กรุณาลองอีกครั้งภายหลัง',
      },
      { status: 500 }
    );
  }
}

