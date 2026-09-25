import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('[supabase] Supabase public configuration is missing. Using build placeholder.');
}

/**
 * Public Supabase client for client-side authentication and safe queries
 */
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

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
