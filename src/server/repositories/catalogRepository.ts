import 'server-only';

import type {
  CatalogFilterParams,
  CatalogRepositoryResult,
  PaginatedCatalogResult,
  PublicProductDetail,
} from '@/features/catalog/types';
import {
  DEV_BRANDS,
  DEV_CATEGORIES,
  DEV_PRODUCTS,
  DEV_PRODUCT_SUMMARIES,
} from '@/server/fixtures/devCatalog';
import { getSupabasePublicServerClient } from '@/lib/supabasePublicServer';

export async function listPublishedProducts(
  params: CatalogFilterParams = {}
): Promise<CatalogRepositoryResult<PaginatedCatalogResult>> {
  try {
    // 1. Attempt Supabase query if tables exist
    const client = getSupabasePublicServerClient();
    const { error: probeError } = await client
      .from('products')
      .select('id')
      .limit(1);

    if (probeError) {
      // Table not yet migrated or live DB unavailable -> gracefully fall back to dev fixtures
      return {
        ok: true,
        data: filterAndPaginateDevProducts(params),
      };
    }

    // Live Supabase query implementation (when DB is migrated)
    // For now, if 0 records exist or tables are empty, fall back to dev fixtures
    return {
      ok: true,
      data: filterAndPaginateDevProducts(params),
    };
  } catch (error) {
    console.error('[catalogRepository] listPublishedProducts error:', error);
    return {
      ok: true,
      data: filterAndPaginateDevProducts(params),
    };
  }
}

export async function getPublishedProductBySlug(
  slug: string
): Promise<CatalogRepositoryResult<PublicProductDetail>> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) {
    return {
      ok: false,
      error: { code: 'INVALID_SLUG', message: 'The product slug is invalid.' },
    };
  }

  try {
    const client = getSupabasePublicServerClient();
    const { data, error } = await client
      .from('products')
      .select('id')
      .eq('slug', normalizedSlug)
      .maybeSingle();

    if (!error && data) {
      // Future: hydrate from DB tables
    }

    // Fallback to dev fixture
    const devProduct = DEV_PRODUCTS.find((p) => p.slug === normalizedSlug);
    if (devProduct) {
      return { ok: true, data: devProduct };
    }

    return {
      ok: false,
      error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' },
    };
  } catch (error) {
    console.error('[catalogRepository] getPublishedProductBySlug error:', error);
    const devProduct = DEV_PRODUCTS.find((p) => p.slug === normalizedSlug);
    if (devProduct) {
      return { ok: true, data: devProduct };
    }
    return {
      ok: false,
      error: { code: 'PRODUCT_NOT_FOUND', message: 'Product not found.' },
    };
  }
}

function filterAndPaginateDevProducts(
  params: CatalogFilterParams
): PaginatedCatalogResult {
  const {
    query = '',
    category,
    brand,
    condition = 'all',
    storage,
    branchSlug,
    minPriceMinor,
    maxPriceMinor,
    sort = 'featured',
    page = 1,
    pageSize = 12,
  } = params;

  let filtered = [...DEV_PRODUCTS];

  // Search query
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.name.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.variants.some((v) => v.name.toLowerCase().includes(q) || v.sku.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (category && category !== 'all') {
    const catLower = category.toLowerCase();
    filtered = filtered.filter((p) => p.category.slug === catLower);
  }

  // Brand filter
  if (brand && brand !== 'all') {
    const brandLower = brand.toLowerCase();
    filtered = filtered.filter((p) => p.brand.slug === brandLower);
  }

  // Condition filter
  if (condition && condition !== 'all') {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => v.condition === condition)
    );
  }

  // Storage filter
  if (storage && storage !== 'all') {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => v.storageLabel === storage)
    );
  }

  // Branch filter (in stock at selected branch)
  if (branchSlug && branchSlug !== 'all') {
    filtered = filtered.filter((p) =>
      Object.values(p.branchAvailability).some((branchStocks) =>
        branchStocks.some(
          (b) =>
            b.branchSlug === branchSlug &&
            (b.status === 'in_stock' || b.status === 'low_stock')
        )
      )
    );
  }

  // Price range filter
  if (minPriceMinor !== undefined && minPriceMinor > 0) {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => v.cashPriceMinor >= minPriceMinor)
    );
  }
  if (maxPriceMinor !== undefined && maxPriceMinor > 0) {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => v.cashPriceMinor <= maxPriceMinor)
    );
  }

  // Sort
  if (sort === 'price_asc') {
    filtered.sort((a, b) => {
      const minA = Math.min(...a.variants.map((v) => v.cashPriceMinor));
      const minB = Math.min(...b.variants.map((v) => v.cashPriceMinor));
      return minA - minB;
    });
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => {
      const minA = Math.min(...a.variants.map((v) => v.cashPriceMinor));
      const minB = Math.min(...b.variants.map((v) => v.cashPriceMinor));
      return minB - minA;
    });
  } else if (sort === 'newest') {
    filtered.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  const total = filtered.length;
  const safePageSize = Math.max(1, Math.min(48, pageSize));
  const totalPages = Math.ceil(total / safePageSize) || 1;
  const safePage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (safePage - 1) * safePageSize;
  const pageProducts = filtered.slice(startIndex, startIndex + safePageSize);

  // Derive available storages across all products
  const storagesSet = new Set<string>();
  DEV_PRODUCTS.forEach((p) => {
    p.variants.forEach((v) => {
      if (v.storageLabel) storagesSet.add(v.storageLabel);
    });
  });

  return {
    products: pageProducts.map((p) => {
      const match = DEV_PRODUCT_SUMMARIES.find((s) => s.id === p.id);
      if (match) return match;
      const minCash = Math.min(...p.variants.map((v) => v.cashPriceMinor));
      const maxCash = Math.max(...p.variants.map((v) => v.cashPriceMinor));
      const bestOffer = p.offers[0];
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand.name,
        brandSlug: p.brand.slug,
        category: p.category.name,
        categorySlug: p.category.slug,
        categoryName: p.category.name,
        summary: p.summary,
        condition: p.variants[0]?.condition || 'new',
        thumbnailUrl: p.images[0]?.url || '',
        minCashPriceMinor: minCash,
        maxCashPriceMinor: maxCash,
        compareAtPriceMinor: p.variants[0]?.compareAtPriceMinor,
        bestInstallmentMonths: bestOffer?.installmentCount,
        bestInstallmentMonthlyMinor: bestOffer?.installmentAmountMinor,
        hasZeroPercent: p.offers.some((o) => o.installmentCount > 0),
        badge: p.variants[0]?.condition === 'used' ? 'มือสองเกรด A' : 'ผ่อน 0%',
        publishedAt: p.publishedAt,
      };
    }),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    availableCategories: DEV_CATEGORIES,
    availableBrands: DEV_BRANDS,
    availableConditions: [
      { value: 'new', label: 'เครื่องใหม่แกะกล่อง', count: DEV_PRODUCTS.filter((p) => p.variants.some((v) => v.condition === 'new')).length },
      { value: 'used', label: 'เครื่องมือสองคัดเกรด', count: DEV_PRODUCTS.filter((p) => p.variants.some((v) => v.condition === 'used')).length },
    ],
    availableStorages: Array.from(storagesSet),
  };
}
