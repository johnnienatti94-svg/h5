import 'server-only';

import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { validateWidgetConfig } from '@/lib/widgetSchemas';
import type { PageRecord, PageWidgetRecord, PageRevisionRecord, MediaAssetRecord } from '@/lib/cmsDb';

export interface PublishJobRecord {
  id: string;
  page_id: string;
  scheduled_at: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  pinned_snapshot: {
    page: Partial<PageRecord>;
    widgets: PageWidgetRecord[];
  };
  scheduled_by?: string;
  executed_at?: string;
  error?: string;
  created_at: string;
}

export interface ExtendedPageRecord extends PageRecord {
  current_revision: number;
  published_version_id?: string;
}

// Development persistent fixture state
const DEV_PAGES: Map<string, ExtendedPageRecord> = new Map([
  [
    'page-home-001',
    {
      id: 'page-home-001',
      slug: 'home',
      name: 'MeePro Mobile Storefront Home',
      status: 'published',
      current_revision: 3,
      published_version_id: 'rev-home-003',
      published_at: new Date(Date.now() - 3600000).toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  [
    'page-promotions-002',
    {
      id: 'page-promotions-002',
      slug: 'promotions',
      name: 'แคมเปญโปรโมชั่นพิเศษประจำเดือน',
      status: 'draft',
      current_revision: 1,
      created_at: new Date(Date.now() - 43200000).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString(),
    },
  ],
]);

const DEV_WIDGETS: Map<string, PageWidgetRecord[]> = new Map([
  [
    'page-home-001',
    [
      {
        id: 'w-announcement-1',
        page_id: 'page-home-001',
        widget_type: 'ANNOUNCEMENT_BAR',
        config_version: 1,
        title: 'แถบประกาศข้อความ',
        sort_order: 1,
        is_active: true,
        config: {
          text: '🎉 ยินดีต้อนรับสู่ MeePro! รับคูปองส่วนลดพิเศษ ฿500 สำหรับลูกค้าใหม่',
          bgColor: '#142B4A',
          textColor: '#FFFFFF',
          isClosable: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'w-hero-1',
        page_id: 'page-home-001',
        widget_type: 'HERO_BANNER',
        config_version: 1,
        title: 'แบนเนอร์หลักเปิดตัว',
        sort_order: 2,
        is_active: true,
        config: {
          headline: 'iPhone 16 Pro Max ผ่อน 0% สูงสุด 10 เดือน',
          subheadline: 'อนุมัติไวใน 3 นาที รับเครื่องที่ 45 สาขาทั่วประเทศ',
          imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
          ctaLabel: 'เช็กวงเงินทันที',
          ctaHref: '/apply',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'w-process-1',
        page_id: 'page-home-001',
        widget_type: 'PROCESS_STEPS',
        config_version: 1,
        title: 'ขั้นตอนการสมัครผ่อน',
        sort_order: 3,
        is_active: true,
        config: {
          title: 'ขั้นตอนการสมัครผ่อนง่ายๆ 4 สเต็ป',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'w-trust-1',
        page_id: 'page-home-001',
        widget_type: 'TRUST_BADGES',
        config_version: 1,
        title: 'จุดเด่นความน่าเชื่อถือ',
        sort_order: 4,
        is_active: true,
        config: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  ],
  ['page-promotions-002', []],
]);

const DEV_REVISIONS: Map<string, PageRevisionRecord[]> = new Map([
  [
    'page-home-001',
    [
      {
        id: 'rev-home-001',
        page_id: 'page-home-001',
        revision_number: 1,
        snapshot: {
          page: { ...DEV_PAGES.get('page-home-001')! },
          widgets: DEV_WIDGETS.get('page-home-001')!.slice(0, 2),
        },
        note: 'เวอร์ชันตั้งต้นระบบ',
        created_by: 'staff-admin-001',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'rev-home-002',
        page_id: 'page-home-001',
        revision_number: 2,
        snapshot: {
          page: { ...DEV_PAGES.get('page-home-001')! },
          widgets: DEV_WIDGETS.get('page-home-001')!.slice(0, 3),
        },
        note: 'เพิ่มบล็อกขั้นตอนการสมัคร',
        created_by: 'staff-admin-001',
        created_at: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: 'rev-home-003',
        page_id: 'page-home-001',
        revision_number: 3,
        snapshot: {
          page: { ...DEV_PAGES.get('page-home-001')! },
          widgets: [...DEV_WIDGETS.get('page-home-001')!],
        },
        note: 'Published by วิชัย ผู้ดูแลระบบ HQ (ADMIN)',
        created_by: 'staff-admin-001',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  ],
]);

const DEV_PUBLISH_JOBS: Map<string, PublishJobRecord> = new Map();

const DEV_MEDIA_ASSETS: Map<string, MediaAssetRecord> = new Map([
  [
    'med-001',
    {
      id: 'med-001',
      storage_path: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
      public_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
      mime_type: 'image/jpeg',
      width: 1200,
      height: 800,
      alt_text: 'iPhone 16 Pro Max Banner',
      metadata: { sizeBytes: 154200, format: 'jpeg' },
      created_by: 'staff-admin-001',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  [
    'med-002',
    {
      id: 'med-002',
      storage_path: '/assets/sample-unused-logo.png',
      public_url: '/assets/sample-unused-logo.png',
      mime_type: 'image/png',
      width: 500,
      height: 500,
      alt_text: 'Unused Test Logo Asset',
      metadata: { sizeBytes: 42000, format: 'png' },
      created_by: 'staff-admin-001',
      created_at: new Date(Date.now() - 43200000).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString(),
    },
  ],
]);

export class CmsRepository {
  /**
   * List all pages
   */
  async getPages(isPreview: boolean = false): Promise<ExtendedPageRecord[]> {
    try {
      const client = isPreview ? supabaseAdmin : supabase;
      let query = client.from('pages').select('*').order('created_at', { ascending: false });
      if (!isPreview) {
        query = query.eq('status', 'published');
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((p) => ({
          ...p,
          current_revision: p.current_revision || 1,
        }));
      }
    } catch {
      // Fallback
    }

    const pages = Array.from(DEV_PAGES.values());
    if (!isPreview) {
      return pages.filter((p) => p.status === 'published');
    }
    return pages;
  }

  /**
   * Get single page by id or slug
   */
  async getPage(identifier: string, isPreview: boolean = false): Promise<{
    page: ExtendedPageRecord | null;
    widgets: PageWidgetRecord[];
  }> {
    try {
      const client = isPreview ? supabaseAdmin : supabase;
      let pageQuery = client
        .from('pages')
        .select('*')
        .or(`id.eq.${identifier},slug.eq.${identifier}`);

      if (!isPreview) {
        pageQuery = pageQuery.eq('status', 'published');
      }

      const { data: pageData, error: pageError } = await pageQuery.maybeSingle();
      if (!pageError && pageData) {
        const { data: widgetsData } = await client
          .from('page_widgets')
          .select('*')
          .eq('page_id', pageData.id)
          .order('sort_order', { ascending: true });

        const widgets = (widgetsData || []).filter((w) => isPreview || w.is_active);
        return {
          page: {
            ...pageData,
            current_revision: pageData.current_revision || 1,
          },
          widgets,
        };
      }
    } catch {
      // Fallback
    }

    // Match in dev fixtures
    const page =
      DEV_PAGES.get(identifier) ||
      Array.from(DEV_PAGES.values()).find((p) => p.slug === identifier) ||
      null;

    if (!page) {
      return { page: null, widgets: [] };
    }

    if (!isPreview && page.status !== 'published') {
      return { page: null, widgets: [] };
    }

    const allWidgets = DEV_WIDGETS.get(page.id) || [];
    const widgets = isPreview ? allWidgets : allWidgets.filter((w) => w.is_active);
    return { page: { ...page }, widgets: [...widgets] };
  }

  /**
   * Create a new page
   */
  async createPage(data: { slug: string; name: string; userId?: string }): Promise<ExtendedPageRecord> {
    const now = new Date().toISOString();
    const id = `page-${data.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '')}-${Date.now().toString(36)}`;
    const newPage: ExtendedPageRecord = {
      id,
      slug: data.slug,
      name: data.name,
      status: 'draft',
      current_revision: 1,
      created_by: data.userId,
      created_at: now,
      updated_at: now,
    };

    try {
      const { data: created, error } = await supabaseAdmin
        .from('pages')
        .insert({
          id,
          slug: data.slug,
          name: data.name,
          status: 'draft',
          created_by: data.userId,
        })
        .select()
        .single();
      if (!error && created) {
        return { ...created, current_revision: 1 };
      }
    } catch {
      // Fallback
    }

    DEV_PAGES.set(id, newPage);
    DEV_WIDGETS.set(id, []);
    return newPage;
  }

  /**
   * Save draft with optimistic concurrency control (expectedRevision)
   * Spec Section 12:
   * "Saving a draft uses expectedRevision; return a conflict if another editor saved first."
   */
  async saveDraft(
    pageId: string,
    payload: {
      widgets: Array<Partial<PageWidgetRecord> & { widget_type: string }>;
      expectedRevision?: number;
      updatedBy?: string;
    }
  ): Promise<
    | { success: true; page: ExtendedPageRecord; widgets: PageWidgetRecord[] }
    | { conflict: true; currentRevision: number; message: string; latestDraft: PageWidgetRecord[] }
  > {
    const existing = await this.getPage(pageId, true);
    if (!existing.page) {
      throw new Error(`Page ${pageId} not found`);
    }

    const currentRevision = existing.page.current_revision || 1;

    // Check revision conflict
    if (payload.expectedRevision !== undefined && payload.expectedRevision !== currentRevision) {
      return {
        conflict: true,
        currentRevision,
        message: `Revision conflict: expected revision #${payload.expectedRevision}, but current page is at revision #${currentRevision}.`,
        latestDraft: existing.widgets,
      };
    }

    const nextRevision = currentRevision + 1;
    const now = new Date().toISOString();

    const formattedWidgets: PageWidgetRecord[] = payload.widgets.map((w, index) => ({
      id: w.id || `w-${pageId}-${index + 1}-${Date.now().toString(36)}`,
      page_id: pageId,
      widget_type: w.widget_type,
      config_version: w.config_version || 1,
      title: w.title || '',
      subtitle: w.subtitle || '',
      sort_order: typeof w.sort_order === 'number' ? w.sort_order : index + 1,
      is_active: w.is_active !== false,
      visible_from: w.visible_from,
      visible_until: w.visible_until,
      config: w.config || {},
      created_by: w.created_by || payload.updatedBy,
      updated_by: payload.updatedBy,
      created_at: w.created_at || now,
      updated_at: now,
    }));

    // Update in Supabase if reachable
    try {
      await supabaseAdmin.from('page_widgets').delete().eq('page_id', pageId);
      if (formattedWidgets.length > 0) {
        await supabaseAdmin.from('page_widgets').insert(formattedWidgets);
      }
      const { data: updatedPage } = await supabaseAdmin
        .from('pages')
        .update({
          current_revision: nextRevision,
          updated_by: payload.updatedBy,
          updated_at: now,
        })
        .eq('id', pageId)
        .select()
        .single();

      if (updatedPage) {
        return {
          success: true,
          page: { ...updatedPage, current_revision: nextRevision },
          widgets: formattedWidgets,
        };
      }
    } catch {
      // Fallback
    }

    // Persist in memory fixtures
    const updatedDevPage: ExtendedPageRecord = {
      ...existing.page,
      current_revision: nextRevision,
      updated_by: payload.updatedBy,
      updated_at: now,
    };
    DEV_PAGES.set(pageId, updatedDevPage);
    DEV_WIDGETS.set(pageId, formattedWidgets);

    return {
      success: true,
      page: updatedDevPage,
      widgets: formattedWidgets,
    };
  }

  /**
   * Publish page now with full schema validation and immutable revision snapshot
   */
  async publishPage(
    pageId: string,
    options: { userId?: string; userName?: string; note?: string }
  ): Promise<{
    success: boolean;
    page: ExtendedPageRecord;
    revision: PageRevisionRecord;
    errors?: string[];
  }> {
    const existing = await this.getPage(pageId, true);
    if (!existing.page) {
      throw new Error(`Page ${pageId} not found`);
    }

    // Validate all active widgets against their Zod schemas
    const validationErrors: string[] = [];
    for (const w of existing.widgets) {
      if (w.is_active) {
        const check = validateWidgetConfig(w.widget_type, w.config);
        if (!check.isValid) {
          validationErrors.push(`Block [${w.title || w.widget_type}]: ${check.error}`);
        }
      }
    }

    if (validationErrors.length > 0) {
      return {
        success: false,
        page: existing.page,
        revision: null as any,
        errors: validationErrors,
      };
    }

    const now = new Date().toISOString();
    const revNumber = (existing.page.current_revision || 1) + 1;
    const revisionId = `rev-${pageId}-${revNumber}-${Date.now().toString(36)}`;

    const newRevision: PageRevisionRecord = {
      id: revisionId,
      page_id: pageId,
      revision_number: revNumber,
      snapshot: {
        page: { ...existing.page, status: 'published', published_at: now },
        widgets: [...existing.widgets],
      },
      note: options.note || `Published by ${options.userName || 'Admin'}`,
      created_by: options.userId,
      created_at: now,
    };

    // Store revision
    const pageRevs = DEV_REVISIONS.get(pageId) || [];
    pageRevs.unshift(newRevision);
    DEV_REVISIONS.set(pageId, pageRevs);

    // Update page
    const updatedPage: ExtendedPageRecord = {
      ...existing.page,
      status: 'published',
      published_version_id: revisionId,
      published_at: now,
      current_revision: revNumber,
      updated_by: options.userId,
      updated_at: now,
    };
    DEV_PAGES.set(pageId, updatedPage);

    try {
      await supabaseAdmin.from('page_revisions').insert({
        id: revisionId,
        page_id: pageId,
        revision_number: revNumber,
        snapshot: newRevision.snapshot,
        note: newRevision.note,
        created_by: options.userId,
      });

      await supabaseAdmin
        .from('pages')
        .update({
          status: 'published',
          published_at: now,
          updated_by: options.userId,
          updated_at: now,
        })
        .eq('id', pageId);
    } catch {
      // Fallback
    }

    return {
      success: true,
      page: updatedPage,
      revision: newRevision,
    };
  }

  /**
   * Schedule page publication for a future UTC timestamp with an immutable pinned snapshot
   */
  async schedulePublish(
    pageId: string,
    options: { scheduledAtUtc: string; userId?: string }
  ): Promise<PublishJobRecord> {
    const existing = await this.getPage(pageId, true);
    if (!existing.page) {
      throw new Error(`Page ${pageId} not found`);
    }

    const scheduledDate = new Date(options.scheduledAtUtc);
    if (isNaN(scheduledDate.getTime())) {
      throw new Error('Invalid scheduledAtUtc timestamp');
    }

    const jobId = `job-${pageId}-${Date.now().toString(36)}`;
    const job: PublishJobRecord = {
      id: jobId,
      page_id: pageId,
      scheduled_at: options.scheduledAtUtc,
      status: 'pending',
      pinned_snapshot: {
        page: { ...existing.page },
        widgets: JSON.parse(JSON.stringify(existing.widgets)), // deeply cloned pinned snapshot
      },
      scheduled_by: options.userId,
      created_at: new Date().toISOString(),
    };

    DEV_PUBLISH_JOBS.set(jobId, job);
    return job;
  }

  /**
   * Get scheduled publication jobs
   */
  async getScheduledJobs(pageId?: string): Promise<PublishJobRecord[]> {
    const allJobs = Array.from(DEV_PUBLISH_JOBS.values());
    if (pageId) {
      return allJobs.filter((j) => j.page_id === pageId);
    }
    return allJobs;
  }

  /**
   * Cancel scheduled publication job
   */
  async cancelScheduledJob(jobId: string): Promise<boolean> {
    const job = DEV_PUBLISH_JOBS.get(jobId);
    if (!job) return false;
    job.status = 'cancelled';
    return true;
  }

  /**
   * Execute due publication jobs idempotently
   */
  async executeScheduledJobs(): Promise<{ executedCount: number; jobs: PublishJobRecord[] }> {
    const now = new Date();
    const executed: PublishJobRecord[] = [];

    for (const job of DEV_PUBLISH_JOBS.values()) {
      if (job.status === 'pending' && new Date(job.scheduled_at) <= now) {
        // Apply pinned snapshot idempotently
        const page = DEV_PAGES.get(job.page_id);
        if (page) {
          const nowIso = new Date().toISOString();
          const revNumber = page.current_revision + 1;
          const revisionId = `rev-scheduled-${job.id}`;

          const newRev: PageRevisionRecord = {
            id: revisionId,
            page_id: job.page_id,
            revision_number: revNumber,
            snapshot: {
              page: { ...page, status: 'published', published_at: nowIso },
              widgets: job.pinned_snapshot.widgets,
            },
            note: `Scheduled release applied automatically (Job #${job.id})`,
            created_at: nowIso,
          };

          const pageRevs = DEV_REVISIONS.get(job.page_id) || [];
          pageRevs.unshift(newRev);
          DEV_REVISIONS.set(job.page_id, pageRevs);

          DEV_PAGES.set(job.page_id, {
            ...page,
            status: 'published',
            published_at: nowIso,
            published_version_id: revisionId,
            current_revision: revNumber,
            updated_at: nowIso,
          });

          DEV_WIDGETS.set(job.page_id, job.pinned_snapshot.widgets);

          job.status = 'completed';
          job.executed_at = nowIso;
          executed.push(job);
        }
      }
    }

    return { executedCount: executed.length, jobs: executed };
  }

  /**
   * Get page revisions
   */
  async getRevisions(pageId: string): Promise<PageRevisionRecord[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('page_revisions')
        .select('*')
        .eq('page_id', pageId)
        .order('revision_number', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as PageRevisionRecord[];
      }
    } catch {
      // Fallback
    }

    return DEV_REVISIONS.get(pageId) || [];
  }

  /**
   * Restore a historical revision as a new draft
   * Spec Section 12:
   * "Restore makes a new draft from a chosen version; it requires normal review/publish.
   * Never roll back stock, current offers or application states with page history."
   */
  async restoreRevision(
    pageId: string,
    revisionId: string,
    userId?: string
  ): Promise<{ success: boolean; newRevisionNumber: number; widgetsCount: number }> {
    const revisions = await this.getRevisions(pageId);
    const targetRev = revisions.find((r) => r.id === revisionId);
    if (!targetRev) {
      throw new Error(`Revision ${revisionId} not found`);
    }

    const snapshotWidgets = targetRev.snapshot?.widgets || [];
    const page = DEV_PAGES.get(pageId);
    if (!page) {
      throw new Error(`Page ${pageId} not found`);
    }

    const nextDraftRev = page.current_revision + 1;
    const now = new Date().toISOString();

    // Create cloned widgets with new timestamps
    const restoredWidgets: PageWidgetRecord[] = snapshotWidgets.map((w, idx) => ({
      ...w,
      id: `w-restored-${Date.now().toString(36)}-${idx}`,
      page_id: pageId,
      updated_by: userId,
      updated_at: now,
    }));

    // Update draft widgets without touching published pointer or offers
    DEV_WIDGETS.set(pageId, restoredWidgets);
    DEV_PAGES.set(pageId, {
      ...page,
      current_revision: nextDraftRev,
      updated_by: userId,
      updated_at: now,
    });

    return {
      success: true,
      newRevisionNumber: nextDraftRev,
      widgetsCount: restoredWidgets.length,
    };
  }

  /**
   * List media assets
   */
  async getMediaAssets(): Promise<MediaAssetRecord[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as MediaAssetRecord[];
      }
    } catch {
      // Fallback
    }

    return Array.from(DEV_MEDIA_ASSETS.values());
  }

  /**
   * Create media asset
   */
  async createMediaAsset(data: {
    storage_path: string;
    public_url?: string;
    mime_type?: string;
    width?: number;
    height?: number;
    alt_text?: string;
    metadata?: Record<string, any>;
    userId?: string;
  }): Promise<MediaAssetRecord> {
    const id = `med-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const asset: MediaAssetRecord = {
      id,
      storage_path: data.storage_path,
      public_url: data.public_url || data.storage_path,
      mime_type: data.mime_type || 'image/jpeg',
      width: data.width,
      height: data.height,
      alt_text: data.alt_text || '',
      metadata: data.metadata || {},
      created_by: data.userId,
      created_at: now,
      updated_at: now,
    };

    DEV_MEDIA_ASSETS.set(id, asset);
    return asset;
  }

  /**
   * Check if media asset is referenced by any published page or snapshot
   * Spec Section 11:
   * "Prevent deletion of media referenced by published versions unless references
   * are safely replaced or the asset is retained for history."
   */
  async checkMediaAssetReferences(
    assetId: string
  ): Promise<{ inUse: boolean; references: string[] }> {
    const asset = DEV_MEDIA_ASSETS.get(assetId);
    if (!asset) {
      return { inUse: false, references: [] };
    }

    const identifiers = [asset.id, asset.storage_path, asset.public_url].filter(Boolean) as string[];
    const referencingPages = new Set<string>();

    // 1. Inspect all pages and current widgets
    for (const [pageId, widgets] of DEV_WIDGETS.entries()) {
      const page = DEV_PAGES.get(pageId);
      if (page && page.status === 'published') {
        const jsonStr = JSON.stringify(widgets);
        for (const ident of identifiers) {
          if (jsonStr.includes(ident)) {
            referencingPages.add(`${page.name} (${page.slug})`);
            break;
          }
        }
      }
    }

    // 2. Inspect published revision snapshots
    for (const [pageId, revisions] of DEV_REVISIONS.entries()) {
      const page = DEV_PAGES.get(pageId);
      for (const rev of revisions) {
        const jsonStr = JSON.stringify(rev.snapshot);
        for (const ident of identifiers) {
          if (jsonStr.includes(ident)) {
            referencingPages.add(`${page?.name || pageId} [Revision #${rev.revision_number}]`);
            break;
          }
        }
      }
    }

    const refs = Array.from(referencingPages);
    return {
      inUse: refs.length > 0,
      references: refs,
    };
  }

  /**
   * Delete media asset with reference protection
   */
  async deleteMediaAsset(
    assetId: string
  ): Promise<{ success: boolean; inUse?: boolean; references?: string[] }> {
    const check = await this.checkMediaAssetReferences(assetId);
    if (check.inUse) {
      return {
        success: false,
        inUse: true,
        references: check.references,
      };
    }

    DEV_MEDIA_ASSETS.delete(assetId);

    try {
      await supabaseAdmin.from('media_assets').delete().eq('id', assetId);
    } catch {
      // Fallback
    }

    return { success: true };
  }
}

export const cmsRepository = new CmsRepository();
