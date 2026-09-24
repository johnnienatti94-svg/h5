import { NextResponse } from 'next/server';
import { DEV_PRODUCTS } from '@/server/fixtures/devCatalog';

export async function GET() {
  try {
    // Extract unique active offers across catalog products
    const offerMap = new Map<string, any>();

    for (const product of DEV_PRODUCTS) {
      for (const offer of product.offers || []) {
        if (!offerMap.has(offer.id)) {
          offerMap.set(offer.id, {
            id: offer.id,
            offerId: offer.offerId,
            planCode: `ZERO_${offer.installmentCount}M`,
            name: offer.title || `ผ่อน 0% นาน ${offer.installmentCount} เดือน`,
            months: offer.installmentCount,
            interestRateAnnual: 0,
            isZeroPercent: true,
            effectiveFrom: offer.validFrom || '2026-01-01T00:00:00Z',
            effectiveUntil: offer.validUntil || undefined,
            description: offer.terms || `ข้อเสนอผ่อนชำระดอกเบี้ยพิเศษ ${offer.installmentCount} เดือน`,
          });
        }
      }
    }

    const offers = Array.from(offerMap.values());
    return NextResponse.json({ success: true, offers });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
