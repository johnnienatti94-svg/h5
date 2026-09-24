export interface PublicBranch {
  id: string;
  slug: string;
  name: string;
  fullAddress: string;
  province: string | null;
  region: string | null;
  displayPhone: string;
  normalizedPhone: string;
  telHref: string;
  googleMapsUrl: string;
  imageUrl: string | null;
  imageAlt: string | null;
  openingHours: string[];
  directions: string | null;
  publishedAt: string;
}

export type BranchRepositoryErrorCode =
  | 'INVALID_SLUG'
  | 'NOT_FOUND'
  | 'DATA_SOURCE_UNAVAILABLE'
  | 'INVALID_PUBLISHED_DATA';

export interface BranchRepositoryError {
  code: BranchRepositoryErrorCode;
  message: string;
}

export type BranchRepositoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: BranchRepositoryError };

export type PublicStoresApiErrorCode =
  | 'INVALID_REQUEST'
  | 'STORE_NOT_FOUND'
  | 'SERVICE_UNAVAILABLE';

export interface PublicStoresApiError {
  success: false;
  error: {
    code: PublicStoresApiErrorCode;
    message: string;
  };
}

export type StoresListApiResponse =
  | {
      success: true;
      data: { stores: PublicBranch[] };
    }
  | PublicStoresApiError;

export type StoreDetailApiResponse =
  | {
      success: true;
      data: { store: PublicBranch };
    }
  | PublicStoresApiError;
