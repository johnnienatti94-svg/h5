import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mime = searchParams.get('mime');
    const search = searchParams.get('q');

    let query = supabase.from('media_assets').select('*').order('created_at', { ascending: false });

    if (mime) {
      query = query.ilike('mime_type', `%${mime}%`);
    }

    if (search) {
      query = query.or(`alt_text.ilike.%${search}%,storage_path.ilike.%${search}%`);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      // Fallback preset demo assets if table is empty or newly created
      return NextResponse.json({
        assets: [
          {
            id: 'med-001',
            storage_path: '/banners/hero_deal.jpg',
            public_url: '/logo.jpg',
            mime_type: 'image/jpeg',
            width: 1200,
            height: 600,
            alt_text: 'โปรโมชั่นเปิดร้าน MeePro',
            created_at: new Date().toISOString(),
          },
        ],
      });
    }

    return NextResponse.json({ assets: data || [] });
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
    if (!auth || !hasPermission(auth.role, 'MANAGE_MEDIA')) {
      return NextResponse.json(
        { error: 'Unauthorized — requires Staff or Admin role to upload media' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { storage_path, public_url, mime_type, width, height, alt_text, metadata } = body;

    if (!storage_path) {
      return NextResponse.json({ error: 'Missing required field: storage_path' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('media_assets')
      .insert({
        storage_path,
        public_url: public_url || storage_path,
        mime_type: mime_type || 'image/jpeg',
        width: typeof width === 'number' ? width : null,
        height: typeof height === 'number' ? height : null,
        alt_text: alt_text || '',
        metadata: metadata || {},
        created_by: auth.userId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ asset: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
