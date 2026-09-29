import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';
import { getCustomerTradeInApplications } from '@/server/repositories/tradeInRepository';

export async function GET(req: NextRequest) {
  let customer = await getCurrentCustomer();

  if (!customer && process.env.NODE_ENV !== 'production') {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.includes('dev-customer') || authHeader.includes('0851780999')) {
      customer = {
        id: 'cust-demo-001',
        phone: '0851780999',
        e164: '+66851780999',
        phoneVerified: true,
        contactName: 'ลูกค้าทดสอบ',
        createdAt: new Date().toISOString(),
      };
    }
  }

  if (!customer) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const applications = await getCustomerTradeInApplications(customer.id);
  return NextResponse.json({ success: true, applications });
}
