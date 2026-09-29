import { NextRequest, NextResponse } from 'next/server';
import { calculateQuote } from '@/server/repositories/tradeInRepository';
import type { TradeInDeviceSelection, CustomerConditionAnswers } from '@/features/tradein/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { deviceSelection, answers } = body as {
      deviceSelection?: TradeInDeviceSelection;
      answers?: CustomerConditionAnswers;
    };

    if (!deviceSelection || !deviceSelection.modelId || !deviceSelection.storageOptionId) {
      return NextResponse.json(
        { success: false, error: 'กรุณาเลือกรุ่นและความจุของอุปกรณ์ให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Force condition to USED
    const sanitizedSelection: TradeInDeviceSelection = {
      ...deviceSelection,
      condition: 'USED',
    };

    const quote = await calculateQuote(sanitizedSelection, answers || {});
    return NextResponse.json({ success: true, quote });
  } catch (error) {
    console.error('[API /api/tradein/calculate] Error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการคำนวณราคาประเมิน' },
      { status: 500 }
    );
  }
}
