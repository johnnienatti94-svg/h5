import { NextRequest, NextResponse } from 'next/server';
import { createOrderWithIdempotency } from '@/lib/commerceRules';

/**
 * POST /api/orders
 * Atomic order creation with Idempotency protection.
 * Spec Section 10: Server-Authoritative Commerce Rules & Idempotency
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idempotencyHeader = req.headers.get('idempotency-key') || req.headers.get('Idempotency-Key');
    const idempotencyKey = idempotencyHeader || body.idempotencyKey;

    if (!idempotencyKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Header "Idempotency-Key" หรือพารามิเตอร์ idempotencyKey จำเป็นสำหรับการสั่งซื้อ',
          code: 'MISSING_IDEMPOTENCY_KEY',
        },
        { status: 400 }
      );
    }

    const { token, customer, paymentMethod, installmentMonths } = body;

    const result = createOrderWithIdempotency({
      idempotencyKey,
      token,
      customer: customer || {
        name: 'ลูกค้าทั่วไป (Customer)',
        phone: '081-234-5678',
      },
      paymentMethod: paymentMethod || 'installment_kbank',
      installmentMonths,
    });

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

    return NextResponse.json(
      {
        success: true,
        order: result.order,
        idempotent: result.idempotent,
        message: result.idempotent
          ? 'คำสั่งซื้อนี้เคยได้รับการประมวลผลแล้ว (Idempotent response)'
          : 'สร้างคำสั่งซื้อสำเร็จเรียบร้อย',
      },
      { status: result.idempotent ? 200 : 201 }
    );
  } catch (error: any) {
    console.error('Error in /api/orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการประมวลผลคำสั่งซื้อ',
      },
      { status: 500 }
    );
  }
}
