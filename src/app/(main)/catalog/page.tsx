import { redirect } from 'next/navigation';

export default async function LegacyCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (typeof val === 'string') search.set(key, val);
    else if (Array.isArray(val)) val.forEach((v) => search.append(key, v));
  });

  const query = search.toString();
  redirect(query ? `/products?${query}` : '/products');
}
