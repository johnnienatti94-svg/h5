import { NextResponse } from 'next/server';
import { authenticateCmsRequest, hasPermission } from '@/lib/rbac';
import { cmsRepository } from '@/server/repositories/cmsRepository';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    const auth = await authenticateCmsRequest(request);

    if (!auth || !hasPermission(auth.role, 'MANAGE_MEDIA')) {
      return NextResponse.json(
        { error: 'Unauthorized — requires Staff or Admin role to delete media' },
        { status: 403 }
      );
    }

    const result = await cmsRepository.deleteMediaAsset(assetId);

    if (result.inUse) {
      return NextResponse.json(
        {
          error: 'MEDIA_IN_USE',
          message: 'Cannot delete media asset referenced by active published pages or versions',
          references: result.references,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, deletedId: assetId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
