import { redirect } from 'next/navigation';

export default async function LegacyLocationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/stores/${encodeURIComponent(slug)}`);
}
