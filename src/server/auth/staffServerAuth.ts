import 'server-only';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { normalizeThaiPhone } from '@/lib/phone';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { StaffUser, StaffRole } from '@/features/staff/types';

const STAFF_COOKIE_NAME = 'meepro_staff_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Explicit development and test mode gate.
 * MUST NEVER evaluate to true when NODE_ENV === 'production'.
 */
export function isDevAuthAllowed(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test' ||
    process.env.ALLOW_DEV_AUTH === 'true'
  );
}

/**
 * Resolve staff session secret.
 * IN PRODUCTION: Must fail closed (return null) if STAFF_SESSION_SECRET is missing or empty.
 * IN DEVELOPMENT/TEST: Falls back to a deterministic development secret.
 */
export function getStaffSessionSecret(): string | null {
  const secret = process.env.STAFF_SESSION_SECRET;
  if (secret && secret.trim().length > 0) {
    return secret.trim();
  }
  // In production, missing secret must fail closed
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  return 'meepro-staff-secret-2026';
}

// Validated development staff directory (PERMITTED ONLY IN DEV/TEST VIA isDevAuthAllowed)
const DEV_STAFF_ACCOUNTS: Array<StaffUser & { passwordHash: string }> = [
  {
    id: 'staff-pc-001',
    name: 'กิตติพงษ์ พนักงานขาย',
    role: 'PC_STAFF',
    branchId: '00000000-0000-4000-8000-000000000001',
    phone: '0819997777',
    passwordHash: 'staff1234',
  },
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

function signPayload(user: StaffUser): string | null {
  const secret = getStaffSessionSecret();
  if (!secret) return null;

  const payload = {
    ...user,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyStaffToken(token: string): StaffUser | null {
  const secret = getStaffSessionSecret();
  if (!secret) return null;

  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;

    const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');
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

  // 1. Development staff accounts are strictly prohibited in production
  if (isDevAuthAllowed()) {
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

      const signedToken = signPayload(staffUser);
      if (!signedToken) {
        return { success: false, error: 'ระบบยืนยันตัวตนเซิร์ฟเวอร์ยังไม่ได้รับการกำหนดค่าความปลอดภัย' };
      }

      const cookieStore = await cookies();
      cookieStore.set(STAFF_COOKIE_NAME, signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_TTL_SECONDS,
      });

      return { success: true, staff: staffUser };
    }
  }

  return { success: false, error: 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง' };
}

/**
 * Read current staff session from HttpOnly cookie or Authorization Bearer header.
 */
export async function getCurrentStaff(): Promise<StaffUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
    if (token) {
      const verified = verifyStaffToken(token);
      if (verified) return verified;
    }

    const headerStore = await headers();
    const authHeader = headerStore.get('authorization') || '';
    const bearer = authHeader.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
    if (bearer) {
      // 1. Development shortcuts are strictly prohibited in production
      if (isDevAuthAllowed()) {
        if (bearer === 'dev-admin-token') {
          return {
            id: 'staff-admin-001',
            name: 'วิชัย ผู้ดูแลระบบ HQ',
            role: 'ADMIN',
            phone: '0819999999',
          };
        }
        if (bearer === 'dev-hq-token') {
          return {
            id: 'staff-hq-001',
            name: 'ศิริพร ฝ่ายการตลาดส่วนกลาง',
            role: 'HQ',
            phone: '0819996666',
          };
        }
        if (bearer === 'dev-manager-token') {
          return {
            id: 'staff-bm-001',
            name: 'สมศักดิ์ ผู้จัดการสาขา',
            role: 'BRANCH_MANAGER',
            branchId: '00000000-0000-4000-8000-000000000001',
            phone: '0819998888',
          };
        }
        if (bearer === 'dev-pcstaff-token') {
          return {
            id: 'staff-pc-001',
            name: 'กิตติพงษ์ พนักงานขาย',
            role: 'PC_STAFF',
            branchId: '00000000-0000-4000-8000-000000000001',
            phone: '0819997777',
          };
        }
      }

      // 2. Check signed staff session token
      const verifiedBearer = verifyStaffToken(bearer);
      if (verifiedBearer) return verifiedBearer;

      // 3. Fallback to Supabase Auth token if present
      try {
        const {
          data: { user },
          error: userError,
        } = await supabaseAdmin.auth.getUser(bearer);

        if (!userError && user) {
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('staff_profiles')
            .select('user_id, display_name, role, assigned_branch_id, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

          if (!profileError && profile) {
            const allowedRoles: StaffRole[] = ['PC_STAFF', 'BRANCH_MANAGER', 'HQ', 'ADMIN'];
            if (allowedRoles.includes(profile.role as StaffRole)) {
              return {
                id: user.id,
                name: profile.display_name,
                role: profile.role as StaffRole,
                branchId: profile.assigned_branch_id || undefined,
                phone: user.phone,
              };
            }
          }
        }
      } catch {
        // Supabase lookup failed or bypassed
      }
    }

    return null;
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
