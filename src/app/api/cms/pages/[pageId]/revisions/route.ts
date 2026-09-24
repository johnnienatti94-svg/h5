import { NextResponse } from 'next/server';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { cmsRepository } from '@/server/repositories/cmsRepository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const auth = await authenticateCmsRequest(request);

    if (!auth || !hasPermission(auth.role, 'PREVIEW_DRAFT')) {
      return NextResponse.json(
        { error: 'Unauthorized — requires Staff or Admin role to view revisions' },
        { status: 403 }
      );
    }

    const revisions = await cmsRepository.getRevisions(pageId);
    return NextResponse.json({ revisions });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
