import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';

export async function GET(request: Request) {
  try {
    const auth = authenticateCmsRequest(request);

    // If authenticated staff/admin, can view all pages including drafts
    if (auth && hasPermission(auth.role, 'PREVIEW_DRAFT')) {
      const { data, error } = await supabaseAdmin
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback for initial state before migration is run
        return NextResponse.json({
          pages: [
            {
              id: 'page-home-001',
              slug: 'home',
              name: 'MeePro Mobile Storefront Home',
              status: 'published',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        });
      }

      return NextResponse.json({ pages: data || [] });
    }

    // Public request: only published pages
    const { data, error } = await supabase
      .from('pages')
      .select('id, slug, name, status, published_at')
      .eq('status', 'published');

    if (error) {
      return NextResponse.json({
        pages: [
          {
            id: 'page-home-001',
            slug: 'home',
            name: 'MeePro Mobile Storefront Home',
            status: 'published',
          },
        ],
      });
    }

    return NextResponse.json({ pages: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = authenticateCmsRequest(request);
    if (!auth || !hasPermission(auth.role, 'EDIT_WIDGETS')) {
      return NextResponse.json({ error: 'Unauthorized — requires Staff or Admin role' }, { status: 403 });
    }

    const body = await request.json();
    const { slug, name } = body;

    if (!slug || !name) {
      return NextResponse.json({ error: 'Missing required fields: slug, name' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('pages')
      .insert({
        slug,
        name,
        status: 'draft',
        created_by: auth.userId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ page: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
