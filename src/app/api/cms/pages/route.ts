import { NextResponse } from 'next/server';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { cmsRepository } from '@/server/repositories/cmsRepository';

export async function GET(request: Request) {
  try {
    const auth = await authenticateCmsRequest(request);
    const isPreview = Boolean(auth && hasPermission(auth.role, 'PREVIEW_DRAFT'));
    const pages = await cmsRepository.getPages(isPreview);
    return NextResponse.json({ pages });
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
    if (!auth || !hasPermission(auth.role, 'EDIT_WIDGETS')) {
      return NextResponse.json(
        { error: 'Unauthorized — creating pages requires Staff or Admin role' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { slug, name } = body;

    if (!slug || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, name' },
        { status: 400 }
      );
    }

    const page = await cmsRepository.createPage({
      slug,
      name,
      userId: auth.userId,
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
