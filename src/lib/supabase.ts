import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://htfhkhldftzqfutatswi.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_4KrYiHeYZ6d_e7LvjmAUdQ_x99NnhYX';

const supabaseServiceKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

/**
 * Public Supabase client for client-side authentication and safe queries
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Privileged Supabase client using service-role secret key (Server-side only)
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database TypeScript interfaces matching MeePro Specification
export interface CustomerRecord {
  id: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  tier: 'MeePro Member' | 'MeePro Silver' | 'MeePro Gold' | 'MeePro Platinum';
  points: number;
  points_expiring?: number;
  points_expiring_date?: string;
  pdpa_consented: boolean;
  pdpa_consented_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetRecord {
  id: string;
  type: 'banner_carousel' | 'category_grid' | 'product_shelf' | 'flash_sale' | 'promo_card' | 'store_locator' | 'brand_showcase';
  title: string;
  subtitle?: string;
  sort_order: number;
  is_active: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BannerRecord {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  image_url?: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface AuditLogRecord {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  resource: string;
  ip_address?: string;
  metadata?: Record<string, any>;
  created_at: string;
}
