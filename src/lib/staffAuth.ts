'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { normalizeThaiPhone } from './phone';
import { supabase } from './supabase';

export type StaffRole = 'PC_STAFF' | 'BRANCH_MANAGER' | 'HQ' | 'ADMIN';

export interface StaffUser {
  id: string;
  name: string;
  role: StaffRole;
  branchId?: string;
  phone?: string;
}

export async function getStaffAuth(): Promise<StaffUser | null> {
  try {
    const res = await fetch('/api/staff/me');
    const data = await res.json();
    if (data.authenticated && data.staff) {
      return data.staff;
    }
  } catch {
    // Continue to Supabase check
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('staff_profiles')
      .select('user_id, display_name, role, assigned_branch_id, status')
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (profileError || !profile) return null;

    const allowedRoles: StaffRole[] = ['PC_STAFF', 'BRANCH_MANAGER', 'HQ', 'ADMIN'];
    const role = profile.role as StaffRole;
    if (!allowedRoles.includes(role)) return null;

    return {
      id: userData.user.id,
      name: profile.display_name,
      role,
      branchId: profile.assigned_branch_id || undefined,
      phone: userData.user.phone,
    };
  } catch {
    return null;
  }
}

export async function signInStaff(phoneInput: string, password: string): Promise<StaffUser> {
  const phone = normalizeThaiPhone(phoneInput);
  if (!phone || !password) throw new Error('กรุณากรอกเบอร์โทรศัพท์และรหัสผ่าน');

  // Authenticate via authoritative server endpoint (/api/staff/login)
  const res = await fetch('/api/staff/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone.national, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.success && data.staff) {
    return data.staff;
  }
  throw new Error(data.error || 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง');
}

export async function clearStaffAuth(): Promise<void> {
  try {
    await fetch('/api/staff/logout', { method: 'POST' });
  } catch {
    // Ignore
  }
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignore
  }
}


export function useStaffGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let active = true;

    async function verifyStaff() {
      const current = await getStaffAuth();
      if (!active) return;

      setStaff(current);
      const isLoginPage = pathname === '/staff/login';
      if (!current && !isLoginPage) router.replace('/staff/login');
      else if (current && isLoginPage) router.replace('/staff/dashboard');
      setIsChecking(false);
    }

    void verifyStaff();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  return { staff, isChecking };
}
