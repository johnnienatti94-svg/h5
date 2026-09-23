import { NextRequest, NextResponse } from 'next/server';
import { validateCartAndGenerateQuote } from '@/lib/commerceRules';

/**
 * POST /api/checkout/validate
 * Server-authoritative checkout quote generation & price/coupon/inventory validation.
 * Spec Section 10: Server-Authoritative Commerce Rules
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, couponCode, installmentMonths } = body;

    const result = validateCartAndGenerateQuote(items, couponCode, installmentMonths);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: result.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      quote: result.quote,
    });
  } catch (error: any) {
    console.error('Error in /api/checkout/validate:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบคำสั่งซื้อ',
      },
      { status: 500 }
    );
  }
}
