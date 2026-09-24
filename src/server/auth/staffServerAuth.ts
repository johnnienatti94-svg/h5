import 'server-only';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { normalizeThaiPhone } from '@/lib/phone';
import type { StaffUser, StaffRole } from '@/features/staff/types';

const STAFF_COOKIE_NAME = 'meepro_staff_session';
const STAFF_SECRET = process.env.STAFF_SESSION_SECRET || 'meepro-staff-secret-2026';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Validated development staff directory
const DEV_STAFF_ACCOUNTS: Array<StaffUser & { passwordHash: string }> = [
  {
    id: 'staff-bm-001',
    name: 'สมศักดิ์ ผู้จัดการสาขา',
    role: 'BRANCH_MANAGER',
    branchId: '00000000-0000-4000-8000-000000000001',
    phone: '0819998888',
    passwordHash: 'staff1234',
  },

  {
    id: 'staff-admin-001',
    name: 'วิชัย ผู้ดูแลระบบ HQ',
    role: 'ADMIN',
    phone: '0819999999',
    passwordHash: 'admin1234',
  },
];

function signPayload(user: StaffUser): string {
  const payload = {
    ...user,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', STAFF_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyStaffToken(token: string): StaffUser | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;


    const expected = crypto.createHmac('sha256', STAFF_SECRET).update(data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as StaffUser & { expiresAt: number };
    if (payload.expiresAt < Date.now()) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      role: payload.role as StaffRole,
      branchId: payload.branchId,
      phone: payload.phone,
    };
  } catch {
    return null;
  }
}

/**
 * Authenticate staff user on server with phone + password and issue session cookie.
 */
export async function authenticateStaff(
  phoneInput: string,
  passwordInput: string
): Promise<{ success: boolean; staff?: StaffUser; error?: string }> {
  const normalized = normalizeThaiPhone(phoneInput);
  if (!normalized || !passwordInput) {
    return { success: false, error: 'กรุณากรอกเบอร์โทรศัพท์และรหัสผ่าน' };
  }

  // 1. Check development staff accounts
  const devAccount = DEV_STAFF_ACCOUNTS.find(
    (a) => a.phone === normalized.national && a.passwordHash === passwordInput.trim()
  );

  if (devAccount) {
    const staffUser: StaffUser = {
      id: devAccount.id,
      name: devAccount.name,
      role: devAccount.role,
      branchId: devAccount.branchId,
      phone: devAccount.phone,
    };

    const cookieStore = await cookies();
    cookieStore.set(STAFF_COOKIE_NAME, signPayload(staffUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });

    return { success: true, staff: staffUser };
  }

  return { success: false, error: 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง' };
}

/**
 * Read current staff session from HttpOnly cookie.
 */
export async function getCurrentStaff(): Promise<StaffUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyStaffToken(token);
  } catch {
    return null;
  }
}

/**
 * Sign out staff user.
 */
export async function clearStaffSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_COOKIE_NAME);
}
