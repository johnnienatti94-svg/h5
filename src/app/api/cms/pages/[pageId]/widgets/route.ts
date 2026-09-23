import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { DEFAULT_HOMEPAGE_WIDGETS } from '@/lib/homepageWidgets';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const auth = authenticateCmsRequest(request);
    const isStaffOrAdmin = auth && hasPermission(auth.role, 'PREVIEW_DRAFT');

    const client = isStaffOrAdmin ? supabaseAdmin : supabase;

    let query = client
      .from('page_widgets')
      .select('*')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: true });

    if (!isStaffOrAdmin) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback: if page is 'home' or page-home-001, return default widget presets
      if (pageId === 'home' || pageId === 'page-home-001') {
        const mappedDefaults = DEFAULT_HOMEPAGE_WIDGETS.map((w, index) => ({
          id: w.id,
          page_id: pageId,
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
        return NextResponse.json({ widgets: mappedDefaults });
      }
      return NextResponse.json({ widgets: [] });
    }

    return NextResponse.json({ widgets: data });
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
    const auth = authenticateCmsRequest(request);
    if (!auth || !hasPermission(auth.role, 'EDIT_WIDGETS')) {
      return NextResponse.json({ error: 'Unauthorized — requires Staff or Admin role' }, { status: 403 });
    }

    const body = await request.json();
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
