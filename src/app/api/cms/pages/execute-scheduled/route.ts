import { NextResponse } from 'next/server';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { cmsRepository } from '@/server/repositories/cmsRepository';

export async function POST(request: Request) {
  try {
    const auth = await authenticateCmsRequest(request);
    // Can be invoked by staff with PUBLISH or background worker token
    if (!auth || !hasPermission(auth.role, 'PUBLISH')) {
      return NextResponse.json(
        { error: 'Unauthorized — requires Staff or Admin role' },
        { status: 403 }
      );
    }

    const result = await cmsRepository.executeScheduledJobs();

    return NextResponse.json({
      success: true,
      executedCount: result.executedCount,
      jobs: result.jobs,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
