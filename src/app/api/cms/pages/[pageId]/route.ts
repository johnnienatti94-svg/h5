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
    const isPreview = Boolean(auth && hasPermission(auth.role, 'PREVIEW_DRAFT'));

    const { page, widgets } = await cmsRepository.getPage(pageId, isPreview);
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page, widgets });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const auth = await authenticateCmsRequest(request);
    if (!auth || !hasPermission(auth.role, 'EDIT_WIDGETS')) {
      return NextResponse.json(
        { error: 'Unauthorized — requires Staff or Admin role to edit pages' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { widgets, expectedRevision } = body;

    if (!Array.isArray(widgets)) {
      return NextResponse.json(
        { error: 'Invalid payload: widgets array is required' },
        { status: 400 }
      );
    }

    const result = await cmsRepository.saveDraft(pageId, {
      widgets,
      expectedRevision,
      updatedBy: auth.userId,
    });

    if ('conflict' in result) {
      return NextResponse.json(
        {
          error: 'REVISION_CONFLICT',
          message: result.message,
          currentRevision: result.currentRevision,
          latestDraft: result.latestDraft,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      page: result.page,
      widgets: result.widgets,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
