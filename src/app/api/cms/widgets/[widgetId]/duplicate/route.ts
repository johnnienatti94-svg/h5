import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const { widgetId } = await params;
    const auth = await authenticateCmsRequest(request);

    if (!auth || !hasPermission(auth.role, 'EDIT_WIDGETS')) {
      return NextResponse.json(
        { error: 'Unauthorized — requires Staff or Admin role to duplicate widgets' },
        { status: 403 }
      );
    }

    // 1. Fetch original widget
    const { data: original, error: origError } = await supabaseAdmin
      .from('page_widgets')
      .select('*')
      .eq('id', widgetId)
      .single();

    if (origError || !original) {
      return NextResponse.json({ error: 'Original widget not found' }, { status: 404 });
    }

    // 2. Insert duplicated copy
    const { data: cloned, error: cloneError } = await supabaseAdmin
      .from('page_widgets')
      .insert({
        page_id: original.page_id,
        widget_type: original.widget_type,
        config_version: original.config_version,
        title: original.title ? `${original.title} (สำเนา)` : 'สำเนาวิดเจ็ต',
        subtitle: original.subtitle,
        sort_order: (original.sort_order || 0) + 1,
        is_active: false, // Default duplicated widgets to inactive so staff can review
        visible_from: original.visible_from,
        visible_until: original.visible_until,
        config: original.config,
        created_by: auth.userId,
      })
      .select()
      .single();

    if (cloneError) {
      return NextResponse.json({ error: cloneError.message }, { status: 500 });
    }

    return NextResponse.json({ widget: cloned }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
