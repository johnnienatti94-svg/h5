/**
 * MeePro CMS v2.1 — Database Access Layer & Typed Model Definitions
 * Connects to Supabase PostgreSQL schema defined in Phase 2
 */

import { supabase, supabaseAdmin } from './supabase';

export type PageStatus = 'draft' | 'published' | 'archived';

export interface PageRecord {
  id: string;
  slug: string;
  name: string;
  status: PageStatus;
  published_at?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export type SupportedWidgetType =
  // 1. Header & Navigation
  | 'HEADER_LOGO'
  | 'ANNOUNCEMENT_BAR'
  | 'SEARCH_BAR'
  | 'CATEGORY_NAV'
  | 'STICKY_BOTTOM_NAV'
  // 2. Banners & Content
  | 'HERO_BANNER'
  | 'BANNER_CAROUSEL'
  | 'IMAGE_GRID'
  | 'VIDEO_PLAYER'
  | 'RICH_TEXT'
  | 'IMAGE_WITH_TEXT'
  | 'CTA_BUTTON'
  // 3. Product Browsing
  | 'PRODUCT_GRID'
  | 'PRODUCT_CAROUSEL'
  | 'FEATURED_PRODUCT'
  | 'COLLECTION_TILES'
  | 'TABBED_PRODUCTS'
  | 'BRAND_SHOWCASE'
  | 'RECENTLY_VIEWED'
  | 'RECOMMENDED_PRODUCTS'
  // 4. Promotions & Urgency
  | 'SALE_DEAL_SECTION'
  | 'COUNTDOWN_TIMER'
  | 'COUPON_VOUCHER_BLOCK'
  | 'BUNDLE_OFFER'
  | 'SHOPPABLE_IMAGE'
  // 5. Trust & Information
  | 'REVIEWS_TESTIMONIALS'
  | 'TRUST_BADGES'
  | 'PAYMENT_OPTIONS'
  | 'SHIPPING_RETURNS'
  | 'FAQ_ACCORDION'
  | 'STORE_LOCATOR'
  // 6. Engagement & Support
  | 'SIGNUP_LEAD_FORM'
  | 'SOCIAL_MEDIA_FEED'
  | 'FLOATING_CHAT_BUTTON'
  | 'PROMO_POPUP_MODAL'
  // 7. Layout & Embed
  | 'SPACER_DIVIDER'
  | 'FOOTER'
  | 'CUSTOM_EMBED';

export interface PageWidgetRecord {
  id: string;
  page_id: string;
  widget_type: SupportedWidgetType | string;
  config_version: number;
  title?: string;
  subtitle?: string;
  sort_order: number;
  is_active: boolean;
  visible_from?: string;
  visible_until?: string;
  config: Record<string, any>;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PageRevisionRecord {
  id: string;
  page_id: string;
  revision_number: number;
  snapshot: {
    page: PageRecord;
    widgets: PageWidgetRecord[];
  };
  note?: string;
  created_by?: string;
  created_at: string;
}

export interface MediaAssetRecord {
  id: string;
  storage_path: string;
  public_url?: string;
  mime_type?: string;
  width?: number;
  height?: number;
  alt_text?: string;
  metadata: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch a page by its slug (e.g. 'home') along with its widgets.
 * When isPreview is false, only published pages and active widgets are returned.
 */
export async function getPageWithWidgets(
  slug: string = 'home',
  isPreview: boolean = false
): Promise<{ page: PageRecord | null; widgets: PageWidgetRecord[] }> {
  try {
    const client = isPreview ? supabaseAdmin : supabase;

    // 1. Fetch Page
    let pageQuery = client.from('pages').select('*').eq('slug', slug);
    if (!isPreview) {
      pageQuery = pageQuery.eq('status', 'published');
    }
    const { data: pageData, error: pageError } = await pageQuery.maybeSingle();

    if (pageError || !pageData) {
      return { page: null, widgets: [] };
    }

    // 2. Fetch Widgets
    let widgetQuery = client
      .from('page_widgets')
      .select('*')
      .eq('page_id', pageData.id)
      .order('sort_order', { ascending: true });

    if (!isPreview) {
      widgetQuery = widgetQuery.eq('is_active', true);
    }

    const { data: widgetsData, error: widgetsError } = await widgetQuery;

    return {
      page: pageData as PageRecord,
      widgets: (widgetsData || []) as PageWidgetRecord[],
    };
  } catch (err) {
    console.error('Error fetching page with widgets:', err);
    return { page: null, widgets: [] };
  }
}

/**
 * Save or update a widget configuration (Staff or Admin)
 */
export async function upsertWidget(
  widget: Partial<PageWidgetRecord> & { page_id: string; widget_type: string }
): Promise<{ data: PageWidgetRecord | null; error: string | null }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('page_widgets')
      .upsert(widget)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as PageWidgetRecord, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Reorder widgets in a single transaction-like batch
 */
export async function reorderWidgets(
  pageId: string,
  orders: { id: string; sort_order: number }[]
): Promise<{ success: boolean; error: string | null }> {
  try {
    const promises = orders.map(({ id, sort_order }) =>
      supabaseAdmin
        .from('page_widgets')
        .update({ sort_order })
        .eq('id', id)
        .eq('page_id', pageId)
    );

    const results = await Promise.all(promises);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      return { success: false, error: failed.error.message };
    }
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Create a revision snapshot before or during publishing
 */
export async function createPageRevision(
  pageId: string,
  note?: string,
  userId?: string
): Promise<{ revision: PageRevisionRecord | null; error: string | null }> {
  try {
    // 1. Fetch current state
    const { data: page } = await supabaseAdmin
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single();

    const { data: widgets } = await supabaseAdmin
      .from('page_widgets')
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true });

    if (!page) {
      return { revision: null, error: 'Page not found' };
    }

    // 2. Count existing revisions
    const { count } = await supabaseAdmin
      .from('page_revisions')
      .select('*', { count: 'exact', head: true })
      .eq('page_id', pageId);

    const nextRev = (count || 0) + 1;

    // 3. Save snapshot
    const { data: rev, error } = await supabaseAdmin
      .from('page_revisions')
      .insert({
        page_id: pageId,
        revision_number: nextRev,
        snapshot: { page, widgets: widgets || [] },
        note: note || `Revision #${nextRev}`,
        created_by: userId,
      })
      .select()
      .single();

    if (error) return { revision: null, error: error.message };
    return { revision: rev as PageRevisionRecord, error: null };
  } catch (err) {
    return { revision: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
