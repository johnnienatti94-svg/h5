import { NextResponse } from 'next/server';

import type {
  PublicStoresApiErrorCode,
  StoreDetailApiResponse,
} from '@/features/branches/types';
import { getPublishedBranchBySlug } from '@/server/repositories/branchesRepository';

export const dynamic = 'force-dynamic';

interface StoreRouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(
  _request: Request,
  { params }: StoreRouteContext
): Promise<NextResponse<StoreDetailApiResponse>> {
  const { slug } = await params;
  const result = await getPublishedBranchBySlug(slug);

  if (!result.ok) {
    const response = mapRepositoryError(result.error.code);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: response.code,
          message: response.message,
        },
      },
      {
        status: response.status,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }

  return NextResponse.json(
    { success: true, data: { store: result.data } },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}

function mapRepositoryError(code: string): {
  code: PublicStoresApiErrorCode;
  message: string;
  status: 400 | 404 | 503;
} {
  if (code === 'INVALID_SLUG') {
    return {
      code: 'INVALID_REQUEST',
      message: 'The store slug is invalid.',
      status: 400,
    };
  }

  if (code === 'NOT_FOUND') {
    return {
      code: 'STORE_NOT_FOUND',
      message: 'Store not found.',
      status: 404,
    };
  }

  return {
    code: 'SERVICE_UNAVAILABLE',
    message: 'Store information is temporarily unavailable.',
    status: 503,
  };
}
