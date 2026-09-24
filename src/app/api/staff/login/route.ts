import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaff } from '@/server/auth/staffServerAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกเบอร์โทรศัพท์และรหัสผ่าน' },
        { status: 400 }
      );
    }

    const result = await authenticateStaff(phone, password);
    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /api/staff/login] Error:', error);
    return NextResponse.json(
      { success: false, error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
