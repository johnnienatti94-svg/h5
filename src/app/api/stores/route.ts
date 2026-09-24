import { NextResponse } from 'next/server';

import type { StoresListApiResponse } from '@/features/branches/types';
import { listPublishedBranches } from '@/server/repositories/branchesRepository';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<StoresListApiResponse>> {
  const result = await listPublishedBranches();

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Store information is temporarily unavailable.',
        },
      },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }

  return NextResponse.json(
    { success: true, data: { stores: result.data } },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
