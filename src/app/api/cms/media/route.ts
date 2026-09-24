import { NextResponse } from 'next/server';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { cmsRepository } from '@/server/repositories/cmsRepository';

export async function GET(request: Request) {
  try {
    const assets = await cmsRepository.getMediaAssets();
    return NextResponse.json({ assets });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateCmsRequest(request);
    if (!auth || !hasPermission(auth.role, 'MANAGE_MEDIA')) {
      return NextResponse.json(
        { error: 'Unauthorized — requires Staff or Admin role to upload media' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { storage_path, public_url, mime_type, width, height, alt_text, metadata } = body;

    if (!storage_path) {
      return NextResponse.json(
        { error: 'Missing required field: storage_path' },
        { status: 400 }
      );
    }

    // MIME type validation
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4'];
    const mime = mime_type || 'image/jpeg';
    if (!allowedMimes.includes(mime)) {
      return NextResponse.json(
        { error: `Unsupported media MIME type: ${mime}` },
        { status: 400 }
      );
    }

    const asset = await cmsRepository.createMediaAsset({
      storage_path,
      public_url,
      mime_type: mime,
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      alt_text: alt_text || '',
      metadata,
      userId: auth.userId,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
