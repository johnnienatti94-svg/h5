import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCustomer } from '@/server/auth/customerAuth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  let customer = await getCurrentCustomer();
  if (!customer && process.env.NODE_ENV !== 'production') {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.includes('dev-customer') || authHeader.includes('0851780999')) {
      customer = { id: 'cust-demo-001', phone: '0851780999', e164: '+66851780999', phoneVerified: true, createdAt: '' };
    }
  }

  if (!customer) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('type') || 'DEVICE_PHOTO';

    if (!file) {
      return NextResponse.json({ success: false, error: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
    }

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'ขนาดไฟล์ต้องไม่เกิน 10MB' }, { status: 400 });
    }

    // Validate mime
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'รองรับเฉพาะไฟล์รูปภาพ JPG, PNG, WebP หรือ PDF' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const randomKey = crypto.randomBytes(8).toString('hex');
    const privateStoragePath = `private/tradein/${customer.id}/${documentType}_${Date.now()}_${randomKey}.${ext}`;

    return NextResponse.json({
      success: true,
      file: {
        type: documentType,
        fileName: file.name,
        storagePath: privateStoragePath,
        byteSize: file.size,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API /api/tradein/upload] Error:', error);
    return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' }, { status: 500 });
  }
}
