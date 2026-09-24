# MeePro API Contracts Specification

> **Target:** `/ai-docs/API_CONTRACTS.md`  
> **Source:** Authoritative App Router route handlers in `src/app/api/`

---

## 1. Store & Branch APIs

### `GET /api/stores`
- **Auth**: Public
- **Response**: `{ success: true, data: { stores: PublicBranch[] } }`
- **Guarantees**: All branches contain normalized E.164 phone (`+66...`) and secure HTTPS map links.

### `GET /api/stores/[slug]`
- **Auth**: Public
- **Params**: `slug` (string)
- **Response**: `{ success: true, data: { store: PublicBranch } }`
- **Errors**: 400 (Invalid slug), 404 (Store not found)

### `POST /api/admin/branches`
- **Auth**: Admin / Staff
- **Body**: `{ name, slug?, fullAddress, province?, region?, displayPhone, googleMapsUrl?, openingHours?, directions? }`
- **Response**: 201 Created `{ success: true, data: PublicBranch }`

### `PUT /api/admin/branches/[id]`
- **Auth**: Admin / Staff
- **Body**: Partial branch fields
- **Response**: 200 OK `{ success: true, data: PublicBranch }`

### `DELETE /api/admin/branches/[id]`
- **Auth**: Admin / Staff
- **Response**: 200 OK `{ success: true, message: string }`

---

## 2. Product Catalog APIs

### `GET /api/products`
- **Auth**: Public
- **Query Params**: `q`, `category`, `brand`, `condition`, `storage`, `branch`, `minPrice`, `maxPrice`, `sort`, `page`, `pageSize`
- **Response**: `{ success: true, data: PaginatedCatalogResult }`

### `GET /api/products/[slug]`
- **Auth**: Public
- **Response**: `{ success: true, data: { product: PublicProductDetail } }`
- **Errors**: 404 (Product not found)

### `POST /api/admin/products`
- **Auth**: Admin
- **Body**: `{ name, slug?, brandSlug, categorySlug, basePriceBaht, monthlyFromBaht?, imageUrl?, summary?, description?, inStock? }`
- **Response**: 201 Created `{ success: true, product: PublicProductDetail }`

### `PUT /api/admin/products/reorder`
- **Auth**: Admin
- **Body**: `{ action: 'move', id: string, direction: 'up' | 'down' }` OR `{ orderedIds: string[] }`
- **Response**: 200 OK `{ success: true, count: number }`

---

## 3. Installment Offers & Promotions APIs

### `GET /api/offers`
- **Auth**: Public
- **Response**: `{ success: true, offers: OfferWithStatus[] }`
- **Fields**: Each offer includes computed `status`: `'active' | 'scheduled' | 'expired' | 'disabled'`

### `POST /api/offers`
- **Auth**: Admin
- **Body**: `{ name, planCode?, months, interestRateAnnual, isZeroPercent?, minPriceBaht?, effectiveFrom, effectiveUntil?, description, badge?, isActive? }`
- **Response**: 201 Created `{ success: true, offer: OfferWithStatus }`

### `PUT /api/offers/[id]` & `DELETE /api/offers/[id]`
- **Auth**: Admin
- **Response**: 200 OK with updated offer or success deletion confirmation.

---

## 4. Digital Financing Applications APIs

### `POST /api/applications/submit`
- **Auth**: Customer Session / OTP verified
- **Body**: `{ nationalId, customerName, phone, branchId, selectedVariantId, installmentMonths, idempotencyKey }`
- **Response**: 201 Created `{ success: true, application: { id, referenceNo, status: 'SUBMITTED', ... } }`
- **Guarantees**: Repeated calls with same `idempotencyKey` return identical record without duplicate debt commitment.

### `GET /api/staff/applications`
- **Auth**: Staff (`BRANCH_MANAGER` or `SALES_ASSOCIATE`)
- **Query Params**: `branchId`, `status`, `page`, `pageSize`
- **Scoping**: Returns 403 Forbidden if Branch Manager queries a foreign branch queue.

### `POST /api/staff/applications/[id]/status`
- **Auth**: Staff / Branch Manager
- **Body**: `{ toStatus: ApplicationStatus, reason?: string }`
- **Response**: 200 OK with updated application and audit trail entry.

---

## 5. CMS & Media APIs

### `PUT /api/cms/pages/[pageId]`
- **Auth**: Staff / Admin
- **Body**: `{ expectedRevision: number, widgets: PageWidgetRecord[] }`
- **Errors**: 409 Conflict `{ error: 'REVISION_CONFLICT', currentRevision: number }`

### `DELETE /api/cms/media/[assetId]`
- **Auth**: Staff / Admin
- **Response**: 200 OK or 409 Conflict `{ error: 'MEDIA_IN_USE', references: string[] }` if asset is actively rendered on published pages.
