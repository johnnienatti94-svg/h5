import { NextRequest, NextResponse } from 'next/server';
import { getAllBranches, createBranch } from '@/server/repositories/branchesStore';
import { requireAdminOrHqAuth } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET() {
  const branches = getAllBranches();
  return NextResponse.json({ success: true, data: { stores: branches } });
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdminOrHqAuth(request);
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const result = createBranch(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.branch }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Invalid request body' },
      { status: 500 }
    );
  }
}
