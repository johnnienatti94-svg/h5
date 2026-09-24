import 'server-only';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    'Supabase server configuration is missing. Set SUPABASE_URL and SUPABASE_SECRET_KEY.'
  );
}

/**
 * Server-only privileged client. Route handlers must authenticate and authorize
 * the caller before using this RLS-bypassing client.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
