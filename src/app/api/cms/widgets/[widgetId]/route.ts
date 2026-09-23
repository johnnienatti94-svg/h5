import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { validateWidgetConfig } from '@/lib/widgetSchemas';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const { widgetId } = await params;
    const auth = authenticateCmsRequest(request);

    if (!auth || !hasPermission(auth.role, 'EDIT_WIDGETS')) {
      return NextResponse.json(
        { error: 'Unauthorized — requires Staff or Admin role to edit widgets' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, subtitle, sort_order, is_active, visible_from, visible_until, config, widget_type } = body;

    // Validate config if provided
    if (config && widget_type) {
      const check = validateWidgetConfig(widget_type, config);
      if (!check.isValid) {
        return NextResponse.json(
          { error: `Invalid widget configuration: ${check.error}` },
          { status: 422 }
        );
      }
    }

    const updatePayload: Record<string, any> = {
      updated_by: auth.userId,
    };

    if (title !== undefined) updatePayload.title = title;
    if (subtitle !== undefined) updatePayload.subtitle = subtitle;
    if (sort_order !== undefined) updatePayload.sort_order = sort_order;
    if (is_active !== undefined) updatePayload.is_active = is_active;
    if (visible_from !== undefined) updatePayload.visible_from = visible_from;
    if (visible_until !== undefined) updatePayload.visible_until = visible_until;
    if (config !== undefined) updatePayload.config = config;

    const { data, error } = await supabaseAdmin
      .from('page_widgets')
      .update(updatePayload)
      .eq('id', widgetId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ widget: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  try {
    const { widgetId } = await params;
    const auth = authenticateCmsRequest(request);

    if (!auth || !hasPermission(auth.role, 'DELETE_WIDGET')) {
      return NextResponse.json(
        { error: 'Unauthorized — deleting widgets requires Manager or Admin role' },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from('page_widgets')
      .delete()
      .eq('id', widgetId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: widgetId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
