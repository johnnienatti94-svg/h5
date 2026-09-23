import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { PageWidgetRecord } from '@/lib/cmsDb';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageId: string; revisionId: string }> }
) {
  try {
    const { pageId, revisionId } = await params;
    const auth = authenticateCmsRequest(request);

    if (!auth || !hasPermission(auth.role, 'ROLLBACK')) {
      return NextResponse.json(
        { error: 'Unauthorized — rolling back page revisions requires Manager or Admin role' },
        { status: 403 }
      );
    }

    // 1. Fetch revision snapshot
    const { data: rev, error: revError } = await supabaseAdmin
      .from('page_revisions')
      .select('*')
      .eq('id', revisionId)
      .eq('page_id', pageId)
      .single();

    if (revError || !rev) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 });
    }

    const snapshot = rev.snapshot as {
      page?: { name?: string; status?: string };
      widgets: PageWidgetRecord[];
    };

    if (!snapshot || !Array.isArray(snapshot.widgets)) {
      return NextResponse.json({ error: 'Corrupt snapshot in revision' }, { status: 500 });
    }

    // 2. Remove current widgets for page
    await supabaseAdmin.from('page_widgets').delete().eq('page_id', pageId);

    // 3. Re-insert widgets from snapshot
    if (snapshot.widgets.length > 0) {
      const cleanWidgets = snapshot.widgets.map((w) => ({
        page_id: pageId,
        widget_type: w.widget_type,
        config_version: w.config_version || 1,
        title: w.title,
        subtitle: w.subtitle,
        sort_order: w.sort_order,
        is_active: w.is_active,
        visible_from: w.visible_from,
        visible_until: w.visible_until,
        config: w.config,
        created_by: auth.userId,
      }));

      const { error: insertError } = await supabaseAdmin
        .from('page_widgets')
        .insert(cleanWidgets);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      restoredRevisionNumber: rev.revision_number,
      widgetCount: snapshot.widgets.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
