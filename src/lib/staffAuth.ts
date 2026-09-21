'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type StaffRole = 'STAFF' | 'MANAGER' | 'ADMIN' | 'DEVELOPER';

export interface StaffUser {
  id: string;
  name: string;
  role: StaffRole;
  branch: string;
  email: string;
  token: string;
}

export const DEMO_STAFF_USERS: { [key: string]: { pin: string; user: StaffUser } } = {
  'staff01': {
    pin: '1234',
    user: {
      id: 'STF-001',
      name: 'สมชาย รักบริการ',
      role: 'STAFF',
      branch: 'MeePro Flagship CentralWorld',
      email: 'somchai@meepro.co.th',
      token: 'stf_token_abc123',
    },
  },
  'manager01': {
    pin: '8888',
    user: {
      id: 'MGR-001',
      name: 'วิภาดา จัดการดี',
      role: 'MANAGER',
      branch: 'Headquarters / Content Ops',
      email: 'wiphada@meepro.co.th',
      token: 'mgr_token_xyz888',
    },
  },
};

const STAFF_AUTH_KEY = 'meepro_staff_session_v1';

export function getStaffAuth(): StaffUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STAFF_AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StaffUser;
  } catch {
    return null;
  }
}

export function setStaffAuth(user: StaffUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STAFF_AUTH_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to set staff session:', e);
  }
}

export function clearStaffAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STAFF_AUTH_KEY);
}

export function useStaffGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const current = getStaffAuth();
    setStaff(current);

    const isLoginPage = pathname === '/staff/login';

    if (!current && !isLoginPage) {
      router.replace('/staff/login');
    } else if (current && isLoginPage) {
      router.replace('/staff/dashboard');
    }

    setIsChecking(false);
  }, [pathname, router]);

  return { staff, isChecking };
}
