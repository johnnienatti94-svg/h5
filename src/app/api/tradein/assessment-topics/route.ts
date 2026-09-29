import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentTopics } from '@/server/repositories/tradeInRepository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelId = searchParams.get('modelId') || undefined;
    const topics = await getAssessmentTopics(modelId);
    return NextResponse.json({ success: true, topics });
  } catch (error) {
    console.error('[API /api/tradein/assessment-topics] Error:', error);
    return NextResponse.json({ success: false, error: 'ไม่สามารถดึงคำถามประเมินสภาพได้' }, { status: 500 });
  }
}
