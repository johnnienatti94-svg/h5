import { NextRequest, NextResponse } from 'next/server';
import { formatThaiPhone, normalizeThaiPhone } from '@/lib/phone';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { PRIVACY_POLICY_CONFIGURED, PRIVACY_POLICY_VERSION } from '@/lib/policyConfig';
import { verifyCustomerOtp } from '@/server/auth/customerAuth';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const normalizedPhone = normalizeThaiPhone(body.phone);

    if (!normalizedPhone || typeof body.code !== 'string' || !/^\d{6}$/.test(body.code)) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_OTP_INPUT',
          message: 'กรุณากรอกเบอร์โทรศัพท์และรหัส OTP 6 หลัก',
        },
        { status: 400 }
      );
    }

    if (
      !PRIVACY_POLICY_CONFIGURED ||
      body.privacyAccepted !== true ||
      body.privacyPolicyVersion !== PRIVACY_POLICY_VERSION
    ) {
      return NextResponse.json(
        {
          success: false,
          code: 'PRIVACY_CONSENT_REQUIRED',
          message: 'กรุณาอ่านและยอมรับนโยบายความเป็นส่วนตัวฉบับปัจจุบัน',
        },
        { status: 400 }
      );
    }

    // 1. Try server customerAuth verification first
    const serverResult = await verifyCustomerOtp(normalizedPhone.national, body.code, {
      privacyAccepted: true,
      privacyPolicyVersion: body.privacyPolicyVersion,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    if (serverResult.success && serverResult.user) {
      // Also try to persist to Supabase if available
      try {
        const userAgent = (req.headers.get('user-agent') || '').slice(0, 500) || null;
        await supabaseAdmin.rpc('complete_customer_phone_login', {
          p_user_id: serverResult.user.id,
          p_normalized_phone: normalizedPhone.e164,
          p_display_phone: formatThaiPhone(normalizedPhone.national),
          p_document_version: PRIVACY_POLICY_VERSION,
          p_user_agent: userAgent,
        });
      } catch {
        // Ignore Supabase persistence errors in dev fallback
      }

      return NextResponse.json({
        success: true,
        message: 'ยืนยันรหัส OTP สำเร็จ',
        session: {
          access_token: `mock_session_${serverResult.user.id}`,
          refresh_token: `mock_refresh_${serverResult.user.id}`,
        },
        user: {
          id: serverResult.user.id,
          phone: formatThaiPhone(normalizedPhone.national),
          phone_verified: true,
        },
      });
    }

    // 2. Try Supabase verification if server challenge didn't match
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: normalizedPhone.e164,
        token: body.code,
        type: 'sms',
      });

      if (!error && data.session && data.user) {
        return NextResponse.json({
          success: true,
          message: 'ยืนยันรหัส OTP สำเร็จ',
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          },
          user: {
            id: data.user.id,
            phone: formatThaiPhone(normalizedPhone.national),
            phone_verified: true,
          },
        });
      }
    } catch {
      // Ignore
    }

    return NextResponse.json(
      {
        success: false,
        code: serverResult.code || 'OTP_VERIFICATION_FAILED',
        message: serverResult.message || 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว',
      },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        code: 'OTP_VERIFICATION_FAILED',
        message: 'ไม่สามารถตรวจสอบรหัส OTP ได้',
      },
      { status: 500 }
    );
  }
}

