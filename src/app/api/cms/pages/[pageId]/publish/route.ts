import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { validateWidgetConfig } from '@/lib/widgetSchemas';
import { createPageRevision } from '@/lib/cmsDb';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const auth = authenticateCmsRequest(request);

    if (!auth || !hasPermission(auth.role, 'PUBLISH')) {
      return NextResponse.json(
        { error: 'Unauthorized — publishing pages requires Manager or Admin role' },
        { status: 403 }
      );
    }

    // 1. Fetch current page and widgets
    const { data: page, error: pageError } = await supabaseAdmin
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .single();

    if (pageError || !page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const { data: widgets, error: widgetsError } = await supabaseAdmin
      .from('page_widgets')
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true });

    if (widgetsError) {
      return NextResponse.json({ error: widgetsError.message }, { status: 500 });
    }

    // 2. Validate all active widgets with Zod runtime schemas
    const validationErrors: string[] = [];
    for (const w of widgets || []) {
      if (w.is_active) {
        const check = validateWidgetConfig(w.widget_type, w.config);
        if (!check.isValid) {
          validationErrors.push(`Widget [${w.title || w.widget_type}]: ${check.error}`);
        }
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Page cannot be published due to widget validation errors',
          details: validationErrors,
        },
        { status: 422 }
      );
    }

    // 3. Create immutable revision snapshot
    const revResult = await createPageRevision(
      pageId,
      `Published by ${auth.name} (${auth.role})`,
      auth.userId
    );

    // 4. Atomically mark page as published
    const now = new Date().toISOString();
    const { data: updatedPage, error: updateError } = await supabaseAdmin
      .from('pages')
      .update({
        status: 'published',
        published_at: now,
        updated_by: auth.userId,
      })
      .eq('id', pageId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      page: updatedPage,
      revision: revResult.revision,
      published_at: now,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
