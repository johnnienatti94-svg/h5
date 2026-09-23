import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const auth = authenticateCmsRequest(request);

    if (!auth || !hasPermission(auth.role, 'PREVIEW_DRAFT')) {
      return NextResponse.json(
        { error: 'Unauthorized — requires Staff or Admin role to view revisions' },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('page_revisions')
      .select('id, page_id, revision_number, note, created_by, created_at')
      .eq('page_id', pageId)
      .order('revision_number', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ revisions: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
