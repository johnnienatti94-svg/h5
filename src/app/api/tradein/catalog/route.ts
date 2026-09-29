import { NextResponse } from 'next/server';
import { getTradeInCatalog } from '@/server/repositories/tradeInRepository';

export async function GET() {
  try {
    const catalog = await getTradeInCatalog();
    return NextResponse.json({ success: true, ...catalog });
  } catch (error) {
    console.error('[API /api/tradein/catalog] Error:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถดึงข้อมูลแคตตาล็อกได้' }, { status: 500 });
  }
}
