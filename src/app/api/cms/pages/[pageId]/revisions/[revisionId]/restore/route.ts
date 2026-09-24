import { NextResponse } from 'next/server';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { cmsRepository } from '@/server/repositories/cmsRepository';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageId: string; revisionId: string }> }
) {
  try {
    const { pageId, revisionId } = await params;
    const auth = await authenticateCmsRequest(request);

    if (!auth || !hasPermission(auth.role, 'ROLLBACK')) {
      return NextResponse.json(
        { error: 'Unauthorized — restoring page revisions requires Manager or Admin role' },
        { status: 403 }
      );
    }

    const result = await cmsRepository.restoreRevision(pageId, revisionId, auth.userId);

    return NextResponse.json({
      success: true,
      message: `Revision ${revisionId} restored as draft #${result.newRevisionNumber}`,
      newRevisionNumber: result.newRevisionNumber,
      widgetsCount: result.widgetsCount,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
