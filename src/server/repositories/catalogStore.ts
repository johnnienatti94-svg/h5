import 'server-only';

import { randomUUID } from 'crypto';
import type {
  PublicProductDetail,
  CatalogFilterParams,
  PaginatedCatalogResult,
  ProductCondition,
} from '@/features/catalog/types';
import { DEV_PRODUCTS, DEV_BRANDS, DEV_CATEGORIES } from '@/server/fixtures/devCatalog';

// In-memory persistent product store
let productsStore: PublicProductDetail[] = [...DEV_PRODUCTS];

export function getAllProductsList(): PublicProductDetail[] {
  return [...productsStore];
}

export function getProductById(id: string): PublicProductDetail | null {
  return productsStore.find((p) => p.id === id) || null;
}

export function getProductBySlug(slug: string): PublicProductDetail | null {
  const normalized = slug.trim().toLowerCase();
  return productsStore.find((p) => p.slug.toLowerCase() === normalized) || null;
}

export function filterAndPaginateProducts(
  params: CatalogFilterParams = {}
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
    pageSize = 24,
  } = params;

  let filtered = [...productsStore];

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
    filtered = filtered.filter((p) => p.category.slug === catLower || p.category.id === catLower);
  }

  // Brand filter
  if (brand && brand !== 'all') {
    const brandLower = brand.toLowerCase();
    filtered = filtered.filter((p) => p.brand.slug === brandLower || p.brand.id === brandLower);
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

  // Price range
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
  const startIndex = (page - 1) * pageSize;
  const pageProducts = filtered.slice(startIndex, startIndex + pageSize);

  const summaries = pageProducts.map((p) => {
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
      condition: p.variants[0]?.condition || ('new' as ProductCondition),
      thumbnailUrl: p.images[0]?.url || '',
      minCashPriceMinor: minCash,
      maxCashPriceMinor: maxCash,
      compareAtPriceMinor: p.variants[0]?.compareAtPriceMinor,
      bestInstallmentMonths: bestOffer?.installmentCount,
      bestInstallmentMonthlyMinor: bestOffer?.installmentAmountMinor,
      hasZeroPercent: (p.offers || []).some((o) => o.installmentCount > 0),
      badge: p.variants[0]?.condition === 'used' ? 'มือสองเกรด A' : 'ผ่อน 0%',
      publishedAt: p.publishedAt,
    };
  });

  return {
    products: summaries,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
    availableCategories: DEV_CATEGORIES,
    availableBrands: DEV_BRANDS,
    availableConditions: [
      {
        value: 'new' as const,
        label: 'เครื่องใหม่แกะกล่อง',
        count: productsStore.filter((p) => p.variants.some((v) => v.condition === 'new')).length,
      },
      {
        value: 'used' as const,
        label: 'เครื่องมือสองคัดเกรด',
        count: productsStore.filter((p) => p.variants.some((v) => v.condition === 'used')).length,
      },
    ],
    availableStorages: ['64GB', '128GB', '256GB', '512GB', '1TB'],
  };
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  brandSlug: string;
  categorySlug: string;
  summary?: string;
  description?: string;
  imageUrl?: string;
  basePriceBaht: number;
  monthlyFromBaht?: number;
  installmentMonths?: number[];
  inStock?: boolean;
}

export function createProduct(input: CreateProductInput): {
  success: boolean;
  product?: PublicProductDetail;
  error?: string;
} {
  if (!input.name?.trim()) {
    return { success: false, error: 'กรุณากรอกชื่อสินค้า' };
  }

  const id = randomUUID();
  const slug = (
    input.slug?.trim() ||
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') ||
    `prod-${Date.now().toString(36)}`
  ).toLowerCase();

  if (getProductBySlug(slug)) {
    return { success: false, error: `Slug "${slug}" already exists.` };
  }

  const brand =
    DEV_BRANDS.find((b) => b.slug === input.brandSlug || b.name.toLowerCase() === input.brandSlug.toLowerCase()) || {
      id: `brand-${input.brandSlug.toLowerCase()}`,
      slug: input.brandSlug.toLowerCase(),
      name: input.brandSlug,
    };

  const category =
    DEV_CATEGORIES.find((c) => c.slug === input.categorySlug) || {
      id: `cat-${input.categorySlug.toLowerCase()}`,
      slug: input.categorySlug.toLowerCase(),
      name: input.categorySlug,
      displayOrder: 10,
    };

  const cashPriceMinor = Math.round(input.basePriceBaht * 100);
  const monthlyFromMinor = input.monthlyFromBaht
    ? Math.round(input.monthlyFromBaht * 100)
    : Math.round(cashPriceMinor / 10);

  const images = input.imageUrl
    ? [{ url: input.imageUrl, alt: input.name, displayOrder: 1 }]
    : [
        {
          url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
          alt: input.name,
          displayOrder: 1,
        },
      ];

  const newProduct: PublicProductDetail = {
    id,
    slug,
    name: input.name.trim(),
    brand,
    category,
    summary: input.summary?.trim() || input.name,
    description: input.description?.trim() || input.name,
    images,
    variants: [
      {
        id: `var-${id.substring(0, 8)}`,
        sku: `${slug.toUpperCase()}-STD`,
        name: `${input.name} Standard`,
        condition: 'new',
        storageLabel: '128GB',
        colorLabel: 'Standard',
        colorHex: '#142B4A',
        cashPriceMinor,
        compareAtPriceMinor: Math.round(cashPriceMinor * 1.1),
        warrantyDescription: 'ประกันศูนย์ไทย 1 ปีเต็ม',
        conditionDescription: 'เครื่องใหม่แท้ 100%',
        isInStock: input.inStock !== undefined ? input.inStock : true,
        attributes: {},
      },
    ],
    offers: [
      {
        id: `off-${slug}-10m`,
        offerId: `OFF-${slug.toUpperCase()}-01`,
        title: 'ผ่อน 0% นาน 10 เดือน',
        cashPriceMinor,
        downPaymentMinor: 0,
        installmentCount: 10,
        installmentAmountMinor: monthlyFromMinor,
        feesTotalMinor: 0,
        totalPayableMinor: cashPriceMinor,
        terms: '0% นาน 10 เดือน สำหรับลูกค้า MeePro',
        validFrom: new Date().toISOString(),
        validUntil: '2026-12-31T23:59:59Z',
      },
    ],
    branchAvailability: {},
    specs: {},
    warranty: 'ประกันศูนย์ไทย 1 ปีเต็ม',
    publishedAt: new Date().toISOString(),
  };

  // Add to front so newly created products are immediately prominent
  productsStore.unshift(newProduct);
  return { success: true, product: newProduct };
}

export function updateProduct(
  id: string,
  input: Partial<CreateProductInput>
): {
  success: boolean;
  product?: PublicProductDetail;
  error?: string;
} {
  const index = productsStore.findIndex((p) => p.id === id);
  if (index === -1) {
    return { success: false, error: 'Product not found' };
  }

  const existing = productsStore[index];

  let brand = existing.brand;
  if (input.brandSlug) {
    brand =
      DEV_BRANDS.find((b) => b.slug === input.brandSlug || b.name.toLowerCase() === input.brandSlug?.toLowerCase()) || {
        id: `brand-${input.brandSlug.toLowerCase()}`,
        slug: input.brandSlug.toLowerCase(),
        name: input.brandSlug,
      };
  }

  let category = existing.category;
  if (input.categorySlug) {
    category =
      DEV_CATEGORIES.find((c) => c.slug === input.categorySlug) || {
        id: `cat-${input.categorySlug.toLowerCase()}`,
        slug: input.categorySlug.toLowerCase(),
        name: input.categorySlug,
        displayOrder: 10,
      };
  }

  const cashPriceMinor =
    input.basePriceBaht !== undefined ? Math.round(input.basePriceBaht * 100) : existing.variants[0]?.cashPriceMinor || 1000000;

  const images = input.imageUrl
    ? [{ url: input.imageUrl, alt: input.name || existing.name, displayOrder: 1 }]
    : existing.images;

  const updated: PublicProductDetail = {
    ...existing,
    name: input.name !== undefined ? input.name.trim() : existing.name,
    slug: input.slug !== undefined ? input.slug.trim().toLowerCase() : existing.slug,
    brand,
    category,
    summary: input.summary !== undefined ? input.summary.trim() : existing.summary,
    description: input.description !== undefined ? input.description.trim() : existing.description,
    images,
    variants: existing.variants.map((v, i) =>
      i === 0
        ? {
            ...v,
            cashPriceMinor,
            isInStock: input.inStock !== undefined ? input.inStock : v.isInStock,
          }
        : v
    ),
  };

  productsStore[index] = updated;
  return { success: true, product: updated };
}

export function deleteProduct(id: string): { success: boolean; error?: string } {
  const initialLen = productsStore.length;
  productsStore = productsStore.filter((p) => p.id !== id);
  if (productsStore.length === initialLen) {
    return { success: false, error: 'Product not found' };
  }
  return { success: true };
}

export function moveProductOrder(id: string, direction: 'up' | 'down'): { success: boolean; products: PublicProductDetail[] } {
  const index = productsStore.findIndex((p) => p.id === id);
  if (index === -1) return { success: false, products: productsStore };

  if (direction === 'up' && index > 0) {
    const temp = productsStore[index];
    productsStore[index] = productsStore[index - 1];
    productsStore[index - 1] = temp;
    return { success: true, products: productsStore };
  }

  if (direction === 'down' && index < productsStore.length - 1) {
    const temp = productsStore[index];
    productsStore[index] = productsStore[index + 1];
    productsStore[index + 1] = temp;
    return { success: true, products: productsStore };
  }

  return { success: true, products: productsStore };
}

export function reorderProducts(orderedIds: string[]): { success: boolean; products: PublicProductDetail[] } {
  const map = new Map(productsStore.map((p) => [p.id, p]));
  const reordered: PublicProductDetail[] = [];

  for (const id of orderedIds) {
    const p = map.get(id);
    if (p) {
      reordered.push(p);
      map.delete(id);
    }
  }

  // Append any remainder
  for (const p of map.values()) {
    reordered.push(p);
  }

  productsStore = reordered;
  return { success: true, products: productsStore };
}
