'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { normalizeThaiPhone } from './phone';
import { supabase } from './supabase';

const publicRoutes = ['/login', '/privacy', '/terms', '/api'];

export interface AuthState {
  userId: string;
  phone: string;
  phone_verified: boolean;
  contactName?: string | null;
}

export async function getAuthUser(): Promise<AuthState | null> {
  // 1. Check server-side customer session via /api/auth/me
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.user) {
        let name = data.user.contactName;
        if (!name && typeof window !== 'undefined') {
          name = localStorage.getItem('meepro_customer_name') || null;
        }
        return {
          userId: data.user.id,
          phone: data.user.phone,
          phone_verified: true,
          contactName: name,
        };
      }
    }
  } catch {
    // Ignore network error and continue
  }

  // 2. Check local client storage cache
  if (typeof window !== 'undefined') {
    const cachedAuth = localStorage.getItem('meepro_customer_auth');
    if (cachedAuth) {
      try {
        const parsed = JSON.parse(cachedAuth);
        if (parsed.userId && parsed.phone) {
          return {
            userId: parsed.userId,
            phone: parsed.phone,
            phone_verified: Boolean(parsed.phone_verified),
            contactName: parsed.contactName || localStorage.getItem('meepro_customer_name') || null,
          };
        }
      } catch {
        // Invalid json
      }
    }
  }

  // 3. Fallback to Supabase auth session
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data.user?.phone) {
      const phone = normalizeThaiPhone(data.user.phone);
      if (phone) {
        return {
          userId: data.user.id,
          phone: phone.national,
          phone_verified: Boolean(data.user.phone_confirmed_at),
          contactName: typeof window !== 'undefined' ? localStorage.getItem('meepro_customer_name') : null,
        };
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

export async function clearAuth(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {}
  try {
    await supabase.auth.signOut();
  } catch {}
  if (typeof window !== 'undefined') {
    localStorage.removeItem('meepro_customer_auth');
    localStorage.removeItem('meepro_customer_name');
  }
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
        const redirectParam = pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
        router.replace(`/login${redirectParam}`);
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
