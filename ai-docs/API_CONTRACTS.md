# MeePro API Contracts Specification

> **Target:** `/ai-docs/API_CONTRACTS.md`  
> **Source:** Actual route handlers in `src/app/api/` [VERIFIED FROM CODE]

---

## 1. Store & Branch APIs

### `GET /api/stores`
- **Route Handler**: `src/app/api/stores/route.ts`
- **Authentication**: None (Public)
- **Authorization**: None (Public)
- **Request**: None
- **Response**: `{ success: true, data: { stores: PublicBranch[] } }`
- **Side Effects**: None (Read-only)
- **Errors**: 503 (If store unavailable)

### `GET /api/stores/[slug]`
- **Route Handler**: `src/app/api/stores/[slug]/route.ts`
- **Authentication**: None (Public)
- **Authorization**: None (Public)
- **Request**: URL param `slug`
- **Response**: `{ success: true, data: { store: PublicBranch } }`
- **Side Effects**: None (Read-only)
- **Errors**: 400 (Invalid slug format), 404 (Store not found), 503 (Unavailable)

### `POST /api/admin/branches` [SECURITY REVIEW REQUIRED]
- **Route Handler**: `src/app/api/admin/branches/route.ts`
- **Authentication**: None present in route handler `[SECURITY REVIEW REQUIRED — route handler does not contain an explicit authorization guard]`
- **Authorization**: None present in route handler `[SECURITY REVIEW REQUIRED]`
- **Request Body**: `{ name: string, slug?: string, fullAddress: string, province?: string, region?: string, displayPhone: string, googleMapsUrl?: string, openingHours?: string | string[], directions?: string }`
- **Response**: 201 Created `{ success: true, data: PublicBranch }`
- **Errors**: 400 (Validation failure, duplicate slug, invalid phone format), 500 (Parse error)
- **Side Effects**: Inserts new branch into `branchesStore` (and DB when connected).

### `PUT /api/admin/branches/[id]` [SECURITY REVIEW REQUIRED]
- **Route Handler**: `src/app/api/admin/branches/[id]/route.ts`
- **Authentication**: None present in route handler `[SECURITY REVIEW REQUIRED — route handler does not contain an explicit authorization guard]`
- **Authorization**: None present in route handler `[SECURITY REVIEW REQUIRED]`
- **Request Body**: Partial branch fields
- **Response**: 200 OK `{ success: true, data: PublicBranch }`
- **Errors**: 400 (Validation error), 404 (Branch not found), 500 (Server error)
- **Side Effects**: Mutates branch record in `branchesStore`.

### `DELETE /api/admin/branches/[id]` [SECURITY REVIEW REQUIRED]
- **Route Handler**: `src/app/api/admin/branches/[id]/route.ts`
- **Authentication**: None present in route handler `[SECURITY REVIEW REQUIRED — route handler does not contain an explicit authorization guard]`
- **Authorization**: None present in route handler `[SECURITY REVIEW REQUIRED]`
- **Response**: 200 OK `{ success: true, message: string }`
- **Errors**: 404 (Branch not found)
- **Side Effects**: Deletes branch from `branchesStore`.

---

## 2. Product Catalog APIs

### `GET /api/products`
- **Route Handler**: `src/app/api/products/route.ts`
- **Authentication**: None (Public)
- **Authorization**: None (Public)
- **Query Params**: `q`, `category`, `brand`, `condition`, `storage`, `branch`, `minPrice`, `maxPrice`, `sort`, `page`, `pageSize`
- **Response**: `{ success: true, data: PaginatedCatalogResult }`
- **Side Effects**: None (Read-only)

### `GET /api/products/[slug]`
- **Route Handler**: `src/app/api/products/[slug]/route.ts`
- **Authentication**: None (Public)
- **Authorization**: None (Public)
- **Response**: `{ success: true, data: { product: PublicProductDetail } }`
- **Errors**: 400 (Invalid slug), 404 (Product not found)

### `POST /api/admin/products` [SECURITY REVIEW REQUIRED]
- **Route Handler**: `src/app/api/admin/products/route.ts`
- **Authentication**: None present in route handler `[SECURITY REVIEW REQUIRED — route handler does not contain an explicit authorization guard]`
- **Authorization**: None present in route handler `[SECURITY REVIEW REQUIRED]`
- **Request Body**: `{ name: string, slug?: string, brandSlug: string, categorySlug: string, basePriceBaht: number, monthlyFromBaht?: number, imageUrl?: string, summary?: string, description?: string, inStock?: boolean }`
- **Response**: 201 Created `{ success: true, product: PublicProductDetail }`
- **Errors**: 400 (Validation failure or duplicate slug), 500 (Server error)
- **Side Effects**: Inserts product into `catalogStore`.

### `PUT /api/admin/products/[id]` & `DELETE /api/admin/products/[id]` [SECURITY REVIEW REQUIRED]
- **Route Handler**: `src/app/api/admin/products/[id]/route.ts`
- **Authentication & Authorization**: None present in route handler `[SECURITY REVIEW REQUIRED]`
- **Side Effects**: Updates or deletes product in `catalogStore`.

### `PUT /api/admin/products/reorder` [SECURITY REVIEW REQUIRED]
- **Route Handler**: `src/app/api/admin/products/reorder/route.ts`
- **Authentication & Authorization**: None present in route handler `[SECURITY REVIEW REQUIRED]`
- **Request Body**: `{ action: 'move', id: string, direction: 'up' | 'down' }` OR `{ orderedIds: string[] }`
- **Response**: 200 OK `{ success: true, count: number }`
- **Side Effects**: Rearranges product sequence in `catalogStore`.

---

## 3. Installment Offers APIs

### `GET /api/offers`
- **Route Handler**: `src/app/api/offers/route.ts`
- **Authentication**: None (Public)
- **Response**: `{ success: true, offers: OfferWithStatus[] }`
- **Side Effects**: None

### `POST /api/offers` [SECURITY REVIEW REQUIRED]
- **Route Handler**: `src/app/api/offers/route.ts`
- **Authentication & Authorization**: None present in route handler `[SECURITY REVIEW REQUIRED — route handler does not contain an explicit authorization guard]`
- **Request Body**: `{ name: string, planCode?: string, months: number, interestRateAnnual: number, isZeroPercent?: boolean, minPriceBaht?: number, effectiveFrom: string, effectiveUntil?: string | null, description: string, badge?: string, isActive?: boolean }`
- **Response**: 201 Created `{ success: true, offer: OfferWithStatus }`
- **Side Effects**: Inserts offer with computed status into `offersStore`.

### `PUT /api/offers/[id]` & `DELETE /api/offers/[id]` [SECURITY REVIEW REQUIRED]
- **Route Handler**: `src/app/api/offers/[id]/route.ts`
- **Authentication & Authorization**: None present in route handler `[SECURITY REVIEW REQUIRED]`
- **Side Effects**: Updates or deletes offer in `offersStore`.

---

## 4. Digital Financing Applications APIs

### `POST /api/applications/submit`
- **Route Handler**: `src/app/api/applications/submit/route.ts`
- **Authentication**: Session / OTP challenge verification
- **Authorization**: Customer
- **Request Body**: `{ productId, variantId, offerVersionId, contactName, verifiedPhone, selectedBranchId, idempotencyKey, ... }`
- **Response**: 201 Created `{ success: true, data: { application: PublicApplication } }`
- **Errors**: 400 (Missing required fields), 409 (Idempotent replay detected)
- **Side Effects**: Creates application record; duplicate `idempotencyKey` returns existing record idempotently.

### `GET /api/staff/applications`
- **Route Handler**: `src/app/api/staff/applications/route.ts`
- **Authentication**: Required (`meepro_staff_session` or Bearer token via `src/server/auth/staffServerAuth.ts`)
- **Authorization**: Staff roles (`PC_STAFF`, `BRANCH_MANAGER`, `HQ`, `ADMIN`)
- **Scoping**: Returns 403 Forbidden if `BRANCH_MANAGER` or `PC_STAFF` requests a `branchId` differing from their assigned branch.
- **Errors**: 401 Unauthorized, 403 Forbidden

### `POST /api/staff/applications/[id]/status`
- **Route Handler**: `src/app/api/staff/applications/[id]/status/route.ts`
- **Authentication**: Staff session required
- **Authorization**: Requires `BRANCH_MANAGER`, `HQ`, or `ADMIN`
- **Request Body**: `{ toStatus: ApplicationStatus, reason?: string }`
- **Errors**: 400 (Invalid transition per `VALID_APPLICATION_TRANSITIONS`), 401 Unauthorized, 403 Forbidden
- **Side Effects**: Updates application state and records event in audit trail.

---

## 5. CMS & Media APIs

### `GET /api/cms/media` & `POST /api/cms/media`
- **Route Handler**: `src/app/api/cms/media/route.ts`
- **Authentication**: `authenticateCmsRequest(request)` required for POST
- **Authorization**: Checks `hasPermission(auth.role, 'MANAGE_MEDIA')` (`HQ` or `ADMIN`)
- **Errors**: 401 Unauthorized, 403 Forbidden, 400 (Unsupported MIME type)

### `DELETE /api/cms/media/[assetId]`
- **Route Handler**: `src/app/api/cms/media/[assetId]/route.ts`
- **Authentication**: `authenticateCmsRequest(request)` required
- **Authorization**: Checks `hasPermission(auth.role, 'MANAGE_MEDIA')` (`HQ` or `ADMIN`)
- **Errors**: 401 Unauthorized, 403 Forbidden, 409 Conflict (`MEDIA_IN_USE`) if asset is referenced by published pages.

### `PUT /api/cms/pages/[pageId]`
- **Route Handler**: `src/app/api/cms/pages/[pageId]/route.ts`
- **Authentication**: `authenticateCmsRequest(request)` required
- **Authorization**: Checks `hasPermission(auth.role, 'EDIT_WIDGETS')` (`HQ` or `ADMIN`)
- **Request Body**: `{ expectedRevision: number, widgets: PageWidgetRecord[] }`
- **Errors**: 409 Conflict (`REVISION_CONFLICT`) if `expectedRevision` does not match server revision.
- **Side Effects**: Saves page draft widgets and increments draft revision.
