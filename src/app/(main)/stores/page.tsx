import StoresDirectory from '@/components/branches/StoresDirectory';
import { listPublishedBranches } from '@/server/repositories/branchesRepository';

export const dynamic = 'force-dynamic';

export default async function StoresPage() {
  const result = await listPublishedBranches();

  return (
    <StoresDirectory
      branches={result.ok ? result.data : []}
      loadError={result.ok ? null : 'ระบบไม่สามารถอ่านข้อมูลสาขาที่เผยแพร่แล้วได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง'}
    />
  );
}
