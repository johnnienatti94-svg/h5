import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';
import { getTradeInDraft, saveTradeInDraft, clearTradeInDraft } from '@/server/repositories/tradeInRepository';

export async function GET(req: NextRequest) {
  const customer = await getCurrentCustomer();
  const anonId = req.headers.get('x-client-session-id') || 'anon';
  const customerId = customer ? customer.id : anonId;

  const draft = await getTradeInDraft(customerId);
  return NextResponse.json({ success: true, draft });
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  const anonId = req.headers.get('x-client-session-id') || 'anon';
  const customerId = customer ? customer.id : anonId;

  const body = await req.json().catch(() => ({}));
  const draft = await saveTradeInDraft(customerId, body);
  return NextResponse.json({ success: true, draft });
}

export async function DELETE(req: NextRequest) {
  const customer = await getCurrentCustomer();
  const anonId = req.headers.get('x-client-session-id') || 'anon';
  const customerId = customer ? customer.id : anonId;

  await clearTradeInDraft(customerId);
  return NextResponse.json({ success: true, message: 'ลบแบบร่างเรียบร้อยแล้ว' });
}
