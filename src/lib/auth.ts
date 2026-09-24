'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { normalizeThaiPhone } from './phone';
import { supabase } from './supabase';

const publicRoutes = ['/login'];

export interface AuthState {
  userId: string;
  phone: string;
  phone_verified: boolean;
}

export async function getAuthUser(): Promise<AuthState | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.phone) return null;

  const phone = normalizeThaiPhone(data.user.phone);
  if (!phone) return null;

  return {
    userId: data.user.id,
    phone: phone.national,
    phone_verified: Boolean(data.user.phone_confirmed_at),
  };
}

export async function clearAuth(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      const currentAuth = await getAuthUser();
      if (!active) return;

      setAuth(currentAuth);
      const isPublic = publicRoutes.some((route) => pathname?.startsWith(route));

      if (!currentAuth && !isPublic) {
        router.replace('/login');
      } else if (currentAuth && pathname === '/login') {
        router.replace('/home');
      }

      setIsChecking(false);
    }

    void verifySession();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  return { isChecking, auth };
}
