import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let publicServerClient: SupabaseClient | null = null;

/**
 * Anonymous, server-only client for public RLS-protected reads.
 * It deliberately cannot carry a user session or a service-role credential.
 */
export function getSupabasePublicServerClient(): SupabaseClient {
  if (publicServerClient) {
    return publicServerClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    throw new Error('Supabase public server configuration is missing.');
  }

  publicServerClient = createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'meepro-public-server',
      },
    },
  });

  return publicServerClient;
}
