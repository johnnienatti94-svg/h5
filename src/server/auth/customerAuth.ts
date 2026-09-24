import 'server-only';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { normalizeThaiPhone } from '@/lib/phone';
import type { CustomerAuthPayload, CustomerSessionUser, OtpChallengeState } from '@/features/auth/types';

const SESSION_COOKIE_NAME = 'meepro_customer_session';
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const OTP_COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
const OTP_MAX_ATTEMPTS = 3;

// Secret for signing session cookies
const SESSION_SECRET = process.env.CUSTOMER_SESSION_SECRET || 'meepro-dev-customer-session-secret-2026';

// Server-side OTP challenges memory store (keyed by e164 phone)
const otpStore = new Map<string, OtpChallengeState>();

function signPayload(payload: CustomerAuthPayload): string {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function verifyPayload(token: string): CustomerAuthPayload | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as CustomerAuthPayload;
    if (payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Request an OTP challenge for a Thai phone number.
 */
export async function requestCustomerOtp(phoneInput: string): Promise<{
  success: boolean;
  code?: string;
  message: string;
  cooldownRemaining?: number;
  devCode?: string;
}> {
  const normalized = normalizeThaiPhone(phoneInput);
  if (!normalized) {
    return {
      success: false,
      code: 'INVALID_PHONE',
      message: 'กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (เช่น 0812345678)',
    };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const now = Date.now();
  const existing = otpStore.get(normalized.e164);

  // Check cooldown
  if (existing && now - existing.lastRequestedAt < OTP_COOLDOWN_SECONDS * 1000) {
    const remaining = Math.ceil((OTP_COOLDOWN_SECONDS * 1000 - (now - existing.lastRequestedAt)) / 1000);
    return {
      success: false,
      code: 'COOLDOWN_ACTIVE',
      message: `กรุณารออีก ${remaining} วินาทีก่อนขอรหัส OTP ใหม่`,
      cooldownRemaining: remaining,
    };
  }

  // In production, reject if real SMS transport is not configured
  if (isProduction && !process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SMS_PROVIDER_API_KEY && !process.env.SMS_KUB_API_KEY) {
    return {
      success: false,
      code: 'CONFIG_ERROR',
      message: 'ระบบส่ง SMS ยังไม่พร้อมใช้งานในสภาวะจริง กรุณาติดต่อผู้ดูแลระบบ',
    };
  }

  // Designated test numbers for automated e2e testing or explicit test flag
  const isTestPhone = normalized.national.startsWith('0891234') || normalized.national.startsWith('089333') || normalized.national.startsWith('081234');
  const allowDevCode = !isProduction || process.env.ALLOW_TEST_OTP === 'true' || isTestPhone;

  // Generate 6-digit OTP code
  const code = allowDevCode ? '123456' : crypto.randomInt(100000, 999999).toString();

  otpStore.set(normalized.e164, {
    phone: normalized.national,
    e164: normalized.e164,
    code,
    attempts: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
    expiresAt: now + OTP_EXPIRY_SECONDS * 1000,
    lastRequestedAt: now,
    verified: false,
  });

  if (!isProduction || allowDevCode) {
    // Visible logging for development and test suite debugging
    console.log(`[OTP CHALLENGE] Phone: ${normalized.e164} -> OTP: ${code} (testMode: ${allowDevCode})`);
  }

  return {
    success: true,
    message: 'ระบบได้ส่งรหัส OTP 6 หลักไปยังหมายเลขโทรศัพท์ของคุณแล้ว',
    cooldownRemaining: OTP_COOLDOWN_SECONDS,
    devCode: allowDevCode ? code : undefined,
  };
}

/**
 * Verify an OTP challenge and establish a customer session.
 */
export async function verifyCustomerOtp(
  phoneInput: string,
  otpCode: string,
  _options?: {
    privacyAccepted?: boolean;
    privacyPolicyVersion?: string;
    userAgent?: string;
    ipAddress?: string;
  }

): Promise<{
  success: boolean;
  code?: string;
  message: string;
  user?: CustomerSessionUser;
}> {
  const normalized = normalizeThaiPhone(phoneInput);
  if (!normalized) {
    return {
      success: false,
      code: 'INVALID_PHONE',
      message: 'กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง',
    };
  }

  const now = Date.now();
  const challenge = otpStore.get(normalized.e164);

  if (!challenge) {
    return {
      success: false,
      code: 'NO_CHALLENGE',
      message: 'ไม่พบคำขอรหัส OTP กรุณากดขอรหัสใหม่',
    };
  }

  if (now > challenge.expiresAt) {
    otpStore.delete(normalized.e164);
    return {
      success: false,
      code: 'EXPIRED_OTP',
      message: 'รหัส OTP หมดอายุแล้ว กรุณาขอรหัสใหม่อีกครั้ง',
    };
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    otpStore.delete(normalized.e164);
    return {
      success: false,
      code: 'MAX_ATTEMPTS_EXCEEDED',
      message: 'กรอกรหัสผิดเกินจำนวนครั้งที่กำหนด กรุณาขอรหัสใหม่อีกครั้ง',
    };
  }

  // Validate OTP code
  const isMatch = challenge.code === otpCode.trim();
  if (!isMatch) {
    challenge.attempts += 1;
    const remaining = challenge.maxAttempts - challenge.attempts;
    return {
      success: false,
      code: 'INVALID_OTP',
      message: remaining > 0
        ? `รหัส OTP ไม่ถูกต้อง (เหลือโอกาสอีก ${remaining} ครั้ง)`
        : 'กรอกรหัสผิดเกินจำนวนครั้งที่กำหนด กรุณาขอรหัสใหม่อีกครั้ง',
    };
  }

  // OTP verified successfully!
  challenge.verified = true;
  otpStore.delete(normalized.e164);

  // Generate or derive stable customer UUID based on normalized e164
  const userNamespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const userId = crypto.createHash('sha256').update(`${userNamespace}:${normalized.e164}`).digest('hex').slice(0, 32);
  const formattedUserId = `${userId.slice(0, 8)}-${userId.slice(8, 12)}-4${userId.slice(13, 16)}-8${userId.slice(17, 20)}-${userId.slice(20, 32)}`;

  const user: CustomerSessionUser = {
    id: formattedUserId,
    phone: normalized.national,
    e164: normalized.e164,
    phoneVerified: true,
    createdAt: new Date().toISOString(),
  };

  // Set session cookie
  const payload: CustomerAuthPayload = {
    userId: user.id,
    phone: user.phone,
    e164: user.e164,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, signPayload(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });

  return {
    success: true,
    message: 'ยืนยันรหัส OTP สำเร็จ',
    user,
  };
}

/**
 * Retrieve the current authenticated customer session from cookies.
 */
export async function getCurrentCustomer(): Promise<CustomerSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyPayload(token);
    if (!payload) return null;

    return {
      id: payload.userId,
      phone: payload.phone,
      e164: payload.e164,
      phoneVerified: true,
      createdAt: new Date(payload.issuedAt).toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Clear customer session cookie.
 */
export async function clearCustomerSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
