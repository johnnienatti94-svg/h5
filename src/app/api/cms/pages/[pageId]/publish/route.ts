import { NextResponse } from 'next/server';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { cmsRepository } from '@/server/repositories/cmsRepository';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const auth = await authenticateCmsRequest(request);

    if (!auth || !hasPermission(auth.role, 'PUBLISH')) {
      return NextResponse.json(
        { error: 'Unauthorized — publishing pages requires Manager or Admin role' },
        { status: 403 }
      );
    }

    let note = '';
    let bodyWidgets: any[] | undefined = undefined;
    try {
      const body = await request.json();
      note = body?.note || '';
      if (Array.isArray(body?.widgets)) {
        bodyWidgets = body.widgets;
      }
    } catch {
      // optional body
    }

    const result = await cmsRepository.publishPage(pageId, {
      userId: auth.userId,
      userName: auth.name,
      note,
      widgets: bodyWidgets,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'PAGE_VALIDATION_FAILED',
          message: 'Page cannot be published due to widget validation errors',
          details: result.errors,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      page: result.page,
      revision: result.revision,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
