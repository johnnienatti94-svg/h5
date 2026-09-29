import { NextRequest, NextResponse } from 'next/server';
import { DEV_BRANCH_FIXTURES } from '@/server/fixtures/devBranches';
import { DEV_BRANCH_CAPACITIES } from '@/server/fixtures/devTradeInCatalog';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branchId') || DEV_BRANCH_FIXTURES[0].id;

  const capacity = DEV_BRANCH_CAPACITIES.find((c) => c.branchId === branchId) || {
    branchId,
    maxSlotsPerHour: 4,
    openHour: 10,
    closeHour: 19,
  };

  // Generate slots for the next 7 days
  const availableSlots: Array<{ date: string; time: string; fullIso: string; available: boolean }> = [];
  const today = new Date();

  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];

    for (let hour = capacity.openHour; hour <= capacity.closeHour; hour++) {
      const timeStr = `${String(hour).padStart(2, '0')}:00`;
      const fullIso = `${dateStr}T${timeStr}:00.000Z`;

      availableSlots.push({
        date: dateStr,
        time: timeStr,
        fullIso,
        available: true,
      });
    }
  }

  return NextResponse.json({ success: true, branchId, slots: availableSlots });
}
