import 'server-only';
import crypto from 'crypto';

import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { validateWidgetConfig } from '@/lib/widgetSchemas';
import type { PageRecord, PageWidgetRecord, PageRevisionRecord, MediaAssetRecord } from '@/lib/cmsDb';

function isUuid(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

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
          current_revision: (p as any).draft_revision || p.current_revision || 1,
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
      let pageQuery = client.from('pages').select('*');

      if (isUuid(identifier)) {
        pageQuery = pageQuery.eq('id', identifier);
      } else {
        const slug = identifier === 'page-home-001' ? 'home' : identifier;
        pageQuery = pageQuery.eq('slug', slug);
      }

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
            current_revision: (pageData as any).draft_revision || pageData.current_revision || 1,
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
      Array.from(DEV_PAGES.values()).find((p) => p.slug === identifier || p.id === identifier) ||
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
    const targetPageId = existing.page.id;

    const formattedWidgets: PageWidgetRecord[] = payload.widgets.map((w, index) => {
      const widgetUuid = isUuid(w.id) ? (w.id as string) : crypto.randomUUID();
      const originalKey = w.id && !isUuid(w.id) ? w.id : undefined;
      const config = { ...(w.config || {}) };
      if (originalKey && !config._widget_key) {
        config._widget_key = originalKey;
      }
      return {
        id: widgetUuid,
        page_id: targetPageId,
        widget_type: w.widget_type,
        config_version: w.config_version || 1,
        title: w.title || '',
        subtitle: w.subtitle || '',
        sort_order: typeof w.sort_order === 'number' ? w.sort_order : index + 1,
        is_active: w.is_active !== false,
        visible_from: w.visible_from,
        visible_until: w.visible_until,
        config,
        created_by: isUuid(w.created_by) ? w.created_by : (isUuid(payload.updatedBy) ? payload.updatedBy : undefined),
        updated_by: isUuid(payload.updatedBy) ? payload.updatedBy : undefined,
        created_at: w.created_at || now,
        updated_at: now,
      };
    });

    // Update in Supabase if page is backed by Supabase
    if (isUuid(targetPageId)) {
      try {
        await supabaseAdmin.from('page_widgets').delete().eq('page_id', targetPageId);
        if (formattedWidgets.length > 0) {
          const dbRows = formattedWidgets.map((fw) => ({
            id: fw.id,
            page_id: fw.page_id,
            widget_type: fw.widget_type,
            config_version: fw.config_version,
            title: fw.title,
            subtitle: fw.subtitle || null,
            sort_order: fw.sort_order,
            is_active: fw.is_active,
            visible_from: fw.visible_from || null,
            visible_until: fw.visible_until || null,
            config: fw.config,
            created_by: isUuid(fw.created_by) ? fw.created_by : null,
            updated_by: isUuid(payload.updatedBy) ? payload.updatedBy : null,
            updated_at: now,
          }));
          await supabaseAdmin.from('page_widgets').insert(dbRows);
        }
        const { data: updatedPage } = await supabaseAdmin
          .from('pages')
          .update({
            draft_revision: nextRevision,
            updated_by: isUuid(payload.updatedBy) ? payload.updatedBy : null,
            updated_at: now,
          })
          .eq('id', targetPageId)
          .select()
          .single();

        if (updatedPage) {
          existing.page = {
            ...existing.page,
            id: targetPageId,
            slug: (updatedPage as any).slug || existing.page.slug,
            name: (updatedPage as any).name || existing.page.name,
            status: (updatedPage as any).status || existing.page.status,
            created_at: (updatedPage as any).created_at || existing.page.created_at,
            current_revision: nextRevision,
          };
        }
      } catch (err) {
        console.error('[saveDraft] Supabase error:', err);
      }
    }

    // Persist in memory fixtures
    const basePage = existing.page;
    const updatedDevPage: ExtendedPageRecord = {
      ...basePage,
      id: targetPageId,
      slug: basePage.slug || pageId,
      name: basePage.name || pageId,
      status: basePage.status || 'draft',
      created_at: basePage.created_at || now,
      current_revision: nextRevision,
      updated_by: payload.updatedBy,
      updated_at: now,
    };
    DEV_PAGES.set(pageId, updatedDevPage);
    DEV_PAGES.set(targetPageId, updatedDevPage);
    DEV_WIDGETS.set(pageId, formattedWidgets);
    DEV_WIDGETS.set(targetPageId, formattedWidgets);

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

    const targetPageId = existing.page.id;
    const now = new Date().toISOString();
    const revNumber = (existing.page.current_revision || 1) + 1;
    const revisionUuid = crypto.randomUUID();
    const revisionId = `rev-${pageId}-${revNumber}-${Date.now().toString(36)}`;

    const newRevision: PageRevisionRecord = {
      id: revisionId,
      page_id: targetPageId,
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
    DEV_REVISIONS.set(targetPageId, pageRevs);

    // Update page
    const publishBasePage = existing.page;
    const updatedPage: ExtendedPageRecord = {
      ...publishBasePage,
      id: targetPageId,
      slug: publishBasePage.slug || pageId,
      name: publishBasePage.name || pageId,
      created_at: publishBasePage.created_at || now,
      status: 'published',
      published_version_id: revisionId,
      published_at: now,
      current_revision: revNumber,
      updated_by: options.userId,
      updated_at: now,
    };
    DEV_PAGES.set(pageId, updatedPage);
    DEV_PAGES.set(targetPageId, updatedPage);

    if (isUuid(targetPageId)) {
      try {
        await supabaseAdmin.from('page_revisions').insert({
          id: revisionUuid,
          page_id: targetPageId,
          revision_number: revNumber,
          snapshot: newRevision.snapshot,
          note: newRevision.note,
          created_by: isUuid(options.userId) ? options.userId : null,
        });

        await supabaseAdmin
          .from('pages')
          .update({
            status: 'published',
            published_at: now,
            published_version_id: revisionUuid,
            draft_revision: revNumber,
            updated_at: now,
          })
          .eq('id', targetPageId);
      } catch (err) {
        console.error('[publishPage] Supabase error:', err);
      }
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
    const existing = await this.getPage(pageId, true);
    const targetPageId = existing.page?.id || pageId;

    if (isUuid(targetPageId)) {
      try {
        const { data, error } = await supabaseAdmin
          .from('page_revisions')
          .select('*')
          .eq('page_id', targetPageId)
          .order('revision_number', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as PageRevisionRecord[];
        }
      } catch {
        // Fallback
      }
    }

    return DEV_REVISIONS.get(pageId) || DEV_REVISIONS.get(targetPageId) || [];
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
    const existing = await this.getPage(pageId, true);
    if (!existing.page) {
      throw new Error(`Page ${pageId} not found`);
    }

    const nextDraftRev = (existing.page.current_revision || 1) + 1;
    const now = new Date().toISOString();
    const targetPageId = existing.page.id;

    // Create cloned widgets with new timestamps
    const restoredWidgets: PageWidgetRecord[] = snapshotWidgets.map((w) => ({
      ...w,
      id: crypto.randomUUID(),
      page_id: targetPageId,
      updated_by: userId,
      updated_at: now,
    }));

    if (isUuid(targetPageId)) {
      try {
        await supabaseAdmin.from('page_widgets').delete().eq('page_id', targetPageId);
        if (restoredWidgets.length > 0) {
          const dbRows = restoredWidgets.map((fw) => ({
            id: fw.id,
            page_id: fw.page_id,
            widget_type: fw.widget_type,
            config_version: fw.config_version || 1,
            title: fw.title,
            subtitle: fw.subtitle || null,
            sort_order: fw.sort_order,
            is_active: fw.is_active,
            visible_from: fw.visible_from || null,
            visible_until: fw.visible_until || null,
            config: fw.config,
            updated_at: now,
          }));
          await supabaseAdmin.from('page_widgets').insert(dbRows);
        }
        await supabaseAdmin
          .from('pages')
          .update({
            draft_revision: nextDraftRev,
            updated_at: now,
          })
          .eq('id', targetPageId);
      } catch (err) {
        console.error('[restoreRevision] Supabase error:', err);
      }
    }

    DEV_WIDGETS.set(pageId, restoredWidgets);
    DEV_WIDGETS.set(targetPageId, restoredWidgets);
    const updatedPage: ExtendedPageRecord = {
      ...existing.page,
      current_revision: nextDraftRev,
      updated_by: userId,
      updated_at: now,
    };
    DEV_PAGES.set(pageId, updatedPage);
    DEV_PAGES.set(targetPageId, updatedPage);



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
