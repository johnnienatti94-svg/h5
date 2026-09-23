import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    console.log('[SMS-KUB-WEBHOOK] Received delivery callback:', payload);

    // In a production database, you would update message delivery logs here
    return NextResponse.json({
      status: 'received',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
