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
        { error: 'Unauthorized — requires Staff or Admin role' },
        { status: 403 }
      );
    }

    const jobs = await cmsRepository.getScheduledJobs(pageId);
    return NextResponse.json({ jobs });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const auth = await authenticateCmsRequest(request);
    if (!auth || !hasPermission(auth.role, 'PUBLISH')) {
      return NextResponse.json(
        { error: 'Unauthorized — scheduling publication requires Manager or Admin role' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { scheduledAtUtc } = body;

    if (!scheduledAtUtc) {
      return NextResponse.json(
        { error: 'Missing required field: scheduledAtUtc' },
        { status: 400 }
      );
    }

    const job = await cmsRepository.schedulePublish(pageId, {
      scheduledAtUtc,
      userId: auth.userId,
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
