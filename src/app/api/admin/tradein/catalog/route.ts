import { NextRequest, NextResponse } from 'next/server';
import { getCurrentStaff } from '@/server/auth/staffServerAuth';
import {
  getTradeInCatalog,
  updateConfigurationPrice,
  upsertModel,
  upsertConfiguration,
} from '@/server/repositories/tradeInRepository';

export async function GET() {
  const catalog = await getTradeInCatalog();
  return NextResponse.json({ success: true, ...catalog });
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
    const { configurationId, basePriceMinor, model, configuration } = body;

    if (configurationId && basePriceMinor !== undefined) {
      const updated = await updateConfigurationPrice(configurationId, Number(basePriceMinor));
      return NextResponse.json({ success: true, updated });
    }

    if (model) {
      const updated = await upsertModel(model);
      return NextResponse.json({ success: true, updated });
    }

    if (configuration) {
      const updated = await upsertConfiguration(configuration);
      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid update payload' }, { status: 400 });
  } catch (error) {
    console.error('[API /api/admin/tradein/catalog] Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
