import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { DEFAULT_HOMEPAGE_WIDGETS } from '@/lib/homepageWidgets';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const auth = await authenticateCmsRequest(request);
    const isStaffOrAdmin = Boolean(auth && hasPermission(auth.role, 'PREVIEW_DRAFT'));

    const { cmsRepository } = await import('@/server/repositories/cmsRepository');
    const { page, widgets } = await cmsRepository.getPage(pageId, isStaffOrAdmin);

    if (!page && pageId !== 'home' && pageId !== 'page-home-001') {
      return NextResponse.json({ error: `Page ${pageId} not found` }, { status: 404 });
    }

    if (!widgets || widgets.length === 0) {
      // Fallback: if page is 'home' or page-home-001, return default widget presets
      if (!page || page.slug === 'home' || pageId === 'home' || pageId === 'page-home-001') {
        const resolvedPageId = page?.id || pageId;
        const mappedDefaults = DEFAULT_HOMEPAGE_WIDGETS.map((w, index) => ({
          id: w.id,
          page_id: resolvedPageId,
          widget_type: w.type.toUpperCase(),
          config_version: 1,
          title: w.title,
          subtitle: w.subtitle,
          sort_order: index,
          is_active: w.isActive,
          config: w,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        return NextResponse.json({ pageId: resolvedPageId, pageSlug: page?.slug || 'home', widgets: mappedDefaults });
      }
      return NextResponse.json({ pageId: page.id, pageSlug: page.slug, widgets: [] });
    }

    return NextResponse.json({ pageId: page?.id || pageId, pageSlug: page?.slug, widgets });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const auth = await authenticateCmsRequest(request);
    if (!auth || !hasPermission(auth.role, 'EDIT_WIDGETS')) {
      return NextResponse.json({ error: 'Unauthorized — requires Staff or Admin role' }, { status: 403 });
    }

    const body = await request.json();

    // Check if batch widgets array was submitted
    if (Array.isArray(body.widgets)) {
      const { cmsRepository } = await import('@/server/repositories/cmsRepository');
      const result = await cmsRepository.saveDraft(pageId, {
        widgets: body.widgets,
        expectedRevision: body.expectedRevision,
        updatedBy: auth.userId,
      });

      if ('conflict' in result) {
        return NextResponse.json(
          {
            error: 'REVISION_CONFLICT',
            message: result.message,
            currentRevision: result.currentRevision,
            latestDraft: result.latestDraft,
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        page: result.page,
        widgets: result.widgets,
      });
    }

    const { widget_type, title, subtitle, sort_order, config } = body;

    if (!widget_type) {
      return NextResponse.json({ error: 'Missing required field: widget_type' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('page_widgets')
      .insert({
        page_id: pageId,
        widget_type,
        config_version: 1,
        title: title || '',
        subtitle: subtitle || '',
        sort_order: typeof sort_order === 'number' ? sort_order : 0,
        is_active: true,
        config: config || {},
        created_by: auth.userId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ widget: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
