export type ProductCondition = 'new' | 'used';
export type AvailabilityStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'unavailable';

export interface PublicCategory {
  id: string;
  slug: string;
  name: string;
  displayOrder: number;
}

export interface PublicBrand {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
}

export interface PublicProductVariant {
  id: string;
  sku: string;
  name: string;
  condition: ProductCondition;
  storageLabel: string | null;
  colorLabel: string | null;
  colorHex?: string | null;
  cashPriceMinor: number; // satang (e.g. 3690000 = ฿36,900)
  compareAtPriceMinor?: number | null; // satang
  warrantyDescription: string;
  conditionDescription: string | null;
  isInStock: boolean;
  attributes: Record<string, string>;
}

export interface PublicOfferVersion {
  id: string;
  offerId: string;
  title: string;
  cashPriceMinor: number;
  downPaymentMinor: number;
  installmentCount: number;
  installmentAmountMinor: number;
  feesTotalMinor: number;
  totalPayableMinor: number;
  validFrom: string;
  validUntil: string | null;
  terms: string;
}

export interface PublicBranchStock {
  branchId: string;
  branchSlug: string;
  branchName: string;
  province: string;
  status: AvailabilityStatus;
  statusLabel: string;
  publicNote?: string | null;
}

export interface PublicProductSummary {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  category: string;
  categorySlug: string;
  categoryName: string;
  summary: string;
  condition: ProductCondition;
  thumbnailUrl: string;
  minCashPriceMinor: number;
  maxCashPriceMinor: number;
  compareAtPriceMinor?: number | null;
  bestInstallmentMonths?: number;
  bestInstallmentMonthlyMinor?: number;
  hasZeroPercent: boolean;
  badge?: string | null;
  publishedAt: string;
}

export interface PublicProductDetail {
  id: string;
  slug: string;
  name: string;
  brand: PublicBrand;
  category: PublicCategory;
  summary: string;
  description: string;
  images: Array<{
    url: string;
    alt: string;
    displayOrder: number;
  }>;
  variants: PublicProductVariant[];
  offers: PublicOfferVersion[];
  branchAvailability: Record<string, PublicBranchStock[]>; // variantId -> PublicBranchStock[]
  specs: Record<string, string>;
  warranty: string;
  publishedAt: string;
}

export interface CatalogFilterParams {
  query?: string;
  category?: string;
  brand?: string;
  condition?: ProductCondition | 'all';
  storage?: string;
  branchSlug?: string;
  minPriceMinor?: number;
  maxPriceMinor?: number;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  pageSize?: number;
}

export interface PaginatedCatalogResult {
  products: PublicProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  availableCategories: PublicCategory[];
  availableBrands: PublicBrand[];
  availableConditions: Array<{ value: ProductCondition; label: string; count: number }>;
  availableStorages: string[];
}

export interface CatalogRepositoryError {
  code: 'PRODUCT_NOT_FOUND' | 'INVALID_SLUG' | 'DATA_SOURCE_UNAVAILABLE';
  message: string;
}

export type CatalogRepositoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: CatalogRepositoryError };

/**
 * Money utilities: converts satang integer minor units into formatted THB
 */
export function formatBaht(minorUnits: number): string {
  const baht = Math.round(minorUnits / 100);
  return `฿${baht.toLocaleString('th-TH')}`;
}

export function minorToBaht(minorUnits: number): number {
  return Math.round(minorUnits / 100);
}

export function bahtToMinor(baht: number): number {
  return Math.round(baht * 100);
}
