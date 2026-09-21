'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Public routes that don't require auth
const publicRoutes = ['/login'];

// Auth state type
export interface AuthState {
  phone: string;
  phone_verified: boolean;
  phone_verified_at: string;
}

// Get auth from localStorage
export function getAuth(): AuthState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('meepro_auth');
    if (!raw) return null;
    const auth = JSON.parse(raw) as AuthState;
    if (auth.phone_verified) return auth;
    return null;
  } catch {
    return null;
  }
}

export const getAuthUser = getAuth;

// Clear auth
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('meepro_auth');
}

// Auth guard hook
export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    const currentAuth = getAuth();
    setAuth(currentAuth);

    const isPublic = publicRoutes.some((route) => pathname?.startsWith(route));

    if (!currentAuth && !isPublic) {
      // Not authenticated, redirect to login
      router.replace('/login');
    } else if (currentAuth && pathname === '/login') {
      // Already authenticated, redirect to home
      router.replace('/home');
    }

    setIsChecking(false);
  }, [pathname, router]);

  return { isChecking, auth };
}
