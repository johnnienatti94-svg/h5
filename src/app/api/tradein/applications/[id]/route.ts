import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import { getTradeInApplicationById } from '@/server/repositories/tradeInRepository';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  let customer = await getCurrentCustomer();
  let staff = await getCurrentStaff();

  // Dev mode bypass
  if (!customer && !staff && process.env.NODE_ENV !== 'production') {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.includes('dev-customer')) {
      customer = { id: 'cust-demo-001', phone: '0851780999', e164: '+66851780999', phoneVerified: true, createdAt: '' };
    } else if (authHeader.includes('dev-admin')) {
      staff = { id: 'staff-admin-001', name: 'Admin', role: 'ADMIN' };
    }
  }

  if (!customer && !staff) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const application = await getTradeInApplicationById(id, {
    customerId: customer?.id,
    staffId: staff?.id,
    staffRole: staff?.role,
    staffBranchId: staff?.branchId,
  });

  if (!application) {
    return NextResponse.json({ success: false, error: 'ไม่พบรายการใบสมัคร' }, { status: 404 });
  }

  return NextResponse.json({ success: true, application });
}
