import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import {
  getAssessmentTopics,
  upsertAssessmentTopic,
  updatePayoutPolicy,
} from '@/server/repositories/tradeInRepository';

export async function GET() {
  const topics = await getAssessmentTopics();
  return NextResponse.json({ success: true, topics });
}

export async function PUT(req: NextRequest) {
  let staff = await getCurrentStaff();
  if (!staff && process.env.NODE_ENV !== 'production') {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.includes('dev-admin')) {
      staff = { id: 'staff-admin-001', name: 'Admin', role: 'ADMIN' };
    }
  }

  if (!staff || (staff.role !== 'ADMIN' && staff.role !== 'HQ')) {
    return NextResponse.json({ success: false, error: 'Unauthorized: requires ADMIN or HQ role' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { topic, payoutPercentage, roundingRule } = body;

    if (payoutPercentage !== undefined && roundingRule !== undefined) {
      const policy = await updatePayoutPolicy(Number(payoutPercentage), roundingRule);
      return NextResponse.json({ success: true, policy });
    }

    if (topic) {
      const updated = await upsertAssessmentTopic(topic);
      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid update payload' }, { status: 400 });
  } catch (error) {
    console.error('[API /api/admin/tradein/rules] Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
