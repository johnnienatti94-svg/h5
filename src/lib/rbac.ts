/**
 * MeePro CMS v2.1 — Role-Based Access Control (RBAC) & Authorization
 * Specification Reference: MeePro_Project_Update_v2.1.md Section 8
 */

import 'server-only';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from './supabaseAdmin';

export type CmsRole = 'CUSTOMER' | 'PC_STAFF' | 'BRANCH_MANAGER' | 'HQ' | 'ADMIN';

export type CmsAction =
  | 'READ_PUBLISHED'
  | 'PREVIEW_DRAFT'
  | 'EDIT_WIDGETS'
  | 'REORDER_WIDGETS'
  | 'PUBLISH'
  | 'ROLLBACK'
  | 'DELETE_WIDGET'
  | 'MANAGE_MEDIA'
  | 'CUSTOM_EMBED';

/**
 * Permission Matrix matching Section 8 of Specification v2.1
 */
const ROLE_PERMISSIONS: Record<CmsRole, Set<CmsAction>> = {
  CUSTOMER: new Set(['READ_PUBLISHED']),
  PC_STAFF: new Set(['READ_PUBLISHED']),
  BRANCH_MANAGER: new Set(['READ_PUBLISHED']),
  HQ: new Set([
    'READ_PUBLISHED',
    'PREVIEW_DRAFT',
    'EDIT_WIDGETS',
    'REORDER_WIDGETS',
    'PUBLISH',
    'ROLLBACK',
    'DELETE_WIDGET',
    'MANAGE_MEDIA',
  ]),
  ADMIN: new Set([
    'READ_PUBLISHED',
    'PREVIEW_DRAFT',
    'EDIT_WIDGETS',
    'REORDER_WIDGETS',
    'PUBLISH',
    'ROLLBACK',
    'DELETE_WIDGET',
    'MANAGE_MEDIA',
    'CUSTOM_EMBED',
  ]),
};

/**
 * Check if a given role is authorized to perform a CMS action
 */
export function hasPermission(role: CmsRole, action: CmsAction): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.has(action);
}

export interface AuthContext {
  userId: string;
  name: string;
  role: CmsRole;
  assignedBranchId?: string;
  email?: string;
}

import { verifyStaffToken, isDevAuthAllowed } from '@/server/auth/staffServerAuth';

/**
 * Server-side request authenticator for Next.js CMS API routes.
 * Supports:
 * 1. Bearer tokens (signed staff HMAC sessions, Supabase JWTs, or dev tokens in dev/test)
 * 2. HttpOnly cookie (meepro_staff_session)
 */
export async function authenticateCmsRequest(req: Request): Promise<AuthContext | null> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  // 1. Development token shortcuts (STRICTLY PROHIBITED IN PRODUCTION)
  if (isDevAuthAllowed()) {
    if (token === 'dev-admin-token') {
      return {
        userId: 'staff-admin-001',
        name: 'วิชัย ผู้ดูแลระบบ HQ',
        role: 'ADMIN',
      };
    }
    if (token === 'dev-hq-token') {
      return {
        userId: 'staff-hq-001',
        name: 'ศิริพร ฝ่ายการตลาดส่วนกลาง',
        role: 'HQ',
      };
    }
    if (token === 'dev-manager-token') {
      return {
        userId: 'staff-bm-001',
        name: 'สมศักดิ์ ผู้จัดการสาขา',
        role: 'BRANCH_MANAGER',
        assignedBranchId: '00000000-0000-4000-8000-000000000001',
      };
    }
    if (token === 'dev-pcstaff-token') {
      return {
        userId: 'staff-pc-001',
        name: 'กิตติพงษ์ พนักงานขาย',
        role: 'PC_STAFF',
        assignedBranchId: '00000000-0000-4000-8000-000000000001',
      };
    }
  }

  // 2. Check signed staff token from Bearer header
  if (token) {
    const verified = verifyStaffToken(token);
    if (verified) {
      return {
        userId: verified.id,
        name: verified.name,
        role: verified.role as CmsRole,
        assignedBranchId: verified.branchId,
      };
    }
  }

  // 3. Check HttpOnly cookie meepro_staff_session
  const cookieHeader = req.headers.get('cookie') || '';
  const matchCookie = cookieHeader.match(/meepro_staff_session=([^;]+)/);
  if (matchCookie?.[1]) {
    const verifiedCookie = verifyStaffToken(decodeURIComponent(matchCookie[1]));
    if (verifiedCookie) {
      return {
        userId: verifiedCookie.id,
        name: verifiedCookie.name,
        role: verifiedCookie.role as CmsRole,
        assignedBranchId: verifiedCookie.branchId,
      };
    }
  }

  // 4. Fallback to Supabase Auth token if present
  if (!token) return null;

  try {
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) return null;

    const { data: staff, error: staffError } = await supabaseAdmin
      .from('staff_profiles')
      .select('user_id, display_name, role, assigned_branch_id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (staffError || !staff) return null;

    const allowedRoles: CmsRole[] = ['PC_STAFF', 'BRANCH_MANAGER', 'HQ', 'ADMIN'];
    const role = staff.role as CmsRole;
    if (!allowedRoles.includes(role)) return null;

    return {
      userId: user.id,
      name: staff.display_name,
      role,
      assignedBranchId: staff.assigned_branch_id || undefined,
      email: user.email,
    };
  } catch {
    return null;
  }
}

/**
 * Require ADMIN or HQ authorization for administrative mutation routes.
 * Returns { auth } on success, or { errorResponse } with 401/403 status.
 */
export async function requireAdminOrHqAuth(
  req: Request
): Promise<{ auth: AuthContext; errorResponse?: never } | { auth?: never; errorResponse: NextResponse }> {
  const auth = await authenticateCmsRequest(req);
  if (!auth) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized — Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (auth.role !== 'ADMIN' && auth.role !== 'HQ') {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden — Requires ADMIN or HQ role' },
        { status: 403 }
      ),
    };
  }

  return { auth };
}

