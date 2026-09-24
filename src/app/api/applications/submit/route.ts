import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';
import { submitApplication } from '@/server/repositories/applicationsRepository';
import type { SubmitApplicationInput } from '@/features/applications/types';

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json(
      { success: false, code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบและยืนยันเบอร์โทรศัพท์ก่อนส่งใบสมัคร' },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Partial<SubmitApplicationInput>;

    if (!body.contactName || !body.productId || !body.variantId || !body.selectedBranchId) {
      return NextResponse.json(
        { success: false, code: 'MISSING_FIELDS', message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' },
        { status: 400 }
      );
    }

    if (!body.privacyAccepted || !body.termsAccepted) {
      return NextResponse.json(
        { success: false, code: 'CONSENT_REQUIRED', message: 'กรุณายินยอมตามข้อกำหนดและนโยบายความเป็นส่วนตัว' },
        { status: 400 }
      );
    }

    const input: SubmitApplicationInput = {
      productId: body.productId,
      variantId: body.variantId,
      offerVersionId: body.offerVersionId || '',
      contactName: body.contactName.trim(),
      verifiedPhone: customer.phone,
      selectedBranchId: body.selectedBranchId,
      customerNote: body.customerNote,
      privacyAccepted: body.privacyAccepted,
      privacyPolicyVersion: body.privacyPolicyVersion || '2026-09-01',
      termsAccepted: body.termsAccepted,
      marketingAccepted: body.marketingAccepted,
      idempotencyKey: body.idempotencyKey,
    };

    const result = await submitApplication(customer.id, input);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/applications/submit] Error:', error);
    return NextResponse.json(
      { success: false, code: 'SERVER_ERROR', message: 'เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
