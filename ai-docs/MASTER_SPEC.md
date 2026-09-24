# MeePro Master Specification

> **Status:** Authoritative Baseline Documentation [VERIFIED FROM CODE & MIGRATIONS]  
> **Last Updated:** 2026-09-24  
> **Source of Truth:** Actual Codebase & Supabase Migrations (`meepro-app`)

---

## 1. Application Purpose

**MeePro** is an omnichannel retail financing and device installment platform tailored for Thailand. It enables consumers to browse consumer electronics (smartphones, tablets, laptops), calculate installment plans based on current offer structures, submit digital financing applications, and schedule in-store verification and device pickup across physical store branches.

---

## 2. Core User Roles [VERIFIED FROM CODE & MIGRATION]

As defined in `src/lib/rbac.ts`, `src/features/staff/types.ts`, and `supabase/migrations/20260924073909_authoritative_domain_v1.sql`:

1. **`CUSTOMER`**: Public visitor or authenticated applicant.
2. **`PC_STAFF`**: In-store product consultant / branch staff.
3. **`BRANCH_MANAGER`**: Physical store branch manager with branch-scoped queue review authority.
4. **`HQ`**: Central office staff with broad operational, media, and CMS draft capabilities.
5. **`ADMIN`**: System administrator with full CMS publishing, media, and system configuration access.

*(Note: Roles such as `SUPER_ADMIN` and `SALES_ASSOCIATE` do not exist in the codebase and have been removed.)*

---

## 3. System Architecture & Applications

### A. Customer-Facing Storefront (`/(main)`) [IMPLEMENTED]
- **Home (`/home` or `/`)**: Dynamic widget-driven modular storefront supporting hero banners, customer greeting widgets, brand showcases, product grids, trust badges, and promotional carousels.
- **Product Catalog (`/products` & `/catalog`)**: Catalog browsing with filters for brand, category, condition (`new` / `used`), price range, and installment months.
- **Product Detail (`/products/[slug]`)**: Device variants (storage, color, condition), cash pricing, installment calculators, branch stock availability checking, and application start.
- **Credit Application (`/apply`)**: Digital financing application workflow with personal information, employment data, Thai National ID, and branch selection for pickup.
- **Customer Account (`/account`)**: Customer profile card, Member Tier display (can be toggled off via backend system config), MeePoints balance (can be toggled off), and application history.
- **Store Locator (`/stores`)**: Directory of store branches across Thailand with normalized phone numbers (`+66`), opening hours, landmark directions, and Google Maps deep-links.

### B. Staff & Branch Portal (`/staff`) [IMPLEMENTED]
- **Staff Authentication (`/staff/login`)**: Role-based access for `PC_STAFF`, `BRANCH_MANAGER`, `HQ`, and `ADMIN`.
- **Application Queue (`/staff/applications`)**: Scoped queue filtering by branch, state-machine transitions, and internal staff audit notes.
- **Customer Lookup (`/staff/customer-lookup`)**: Customer search by National ID or Phone Number.
- **Appointment Scheduling (`/staff/applications/[id]/appointment`)**: Appointment setting for approved applicants.

### C. Admin Console (`/admin`) [IMPLEMENTED]
- **Visual Page Builder (`/admin/page-builder`)**: No-code CMS block editor with live preview, drag-and-drop widget reordering, revision snapshotting, and scheduled publication.
- **Branch Management (`/admin/branches`)**: Add, edit, and delete store branches, phone normalization, and Google Maps links.
- **Product Catalog (`/admin/products`)**: Add, edit, delete products, manage stock status, and organise storefront display sequence.
- **Installment Offers & Promotions (`/admin/offers`)**: Create and pre-create promotional campaigns with explicit start dates (`effectiveFrom`) and expiration dates (`effectiveUntil`), 0% tenures, and status lifecycle badges.
- **Media Library (`/admin/media`)**: Asset uploads, dimension validation, and reference deletion protection (blocks deleting images actively used on published pages).
- **System Configuration (`/admin/system-config`)**: Global backend toggles for Member Tier display, MeePoints rewards system, maintenance mode, and emergency banners.

---

## 4. Current Financing & Installment Offers [DEVELOPMENT FIXTURE]

Current installment offer fixtures in `src/server/repositories/offersStore.ts` and `src/server/fixtures/devCatalog.ts` represent the current baseline implementation (not permanent immutable policy):
- **3 Months**: 0% interest (`ZERO_3M_V1`)
- **6 Months**: 0% interest (`ZERO_6M_V1`)
- **10 Months**: 0% interest (`ZERO_10M_V1`)
- **12 Months (Scheduled/Pre-created)**: 0% interest (`PROMO_1111_12M`)
- **24 Months**: Non-zero special interest rate (8.28% annual in current fixture) (`EXTENDED_24M_V1`)

---

## 5. Application State Machine [VERIFIED FROM CODE]

As authoritative in `src/features/applications/types.ts`:
- **Allowed States**: `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `NEEDS_INFO`, `APPROVED`, `REJECTED`, `APPOINTMENT_SET`, `COMPLETED`, `CANCELLED`.
- *(Note: `COLLECTED` does not exist in `ApplicationStatus`; the final completion state is `COMPLETED`.)*

---

## 6. Technology Stack [VERIFIED FROM CODE]

- **Framework**: Next.js 16.3.5 (App Router, Turbopack)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4 & Vanilla CSS Modules
- **UI Components & Icons**: Radix UI primitives, Lucide React (`^1.47.0`)
- **Validation**: Zod (`^4.6.5`)
- **Data Layer / Backend**: Dual-mode architecture (Supabase PostgreSQL with resilient in-memory development repositories)
- **Deployment Platform**: Vercel

---

## 7. Implementation Status Matrix

### A. Implemented [VERIFIED FROM CODE]
- [x] Omnichannel customer storefront with responsive breakpoints (320px, 390px, 768px, 1024px, 1440px).
- [x] Canonical Store Locator (`/stores`) and legacy redirect (`/branches` -> `/stores`).
- [x] Thai E.164 phone normalization (`+66...`) and secure HTTPS map links.
- [x] Product catalog with multi-variant pricing, installment tenures, and branch availability.
- [x] Idempotent application submission (`/api/applications/submit`).
- [x] Staff queue with branch-level access control (`BRANCH_MANAGER` scoped to assigned branch).
- [x] CMS Visual Block Editor with concurrency conflict detection (HTTP 409 `REVISION_CONFLICT`), draft isolation, and revision rollback.
- [x] Admin Branch CRUD management.
- [x] Admin Product CRUD with display order organisation.
- [x] Admin Installment Offer CRUD with future pre-creation scheduling and expiration dates.
- [x] Media Library with reference protection (HTTP 409 `MEDIA_IN_USE`).
- [x] System Configuration with global toggles for Membership and MeePoints Rewards.
- [x] Backend-only CMS customization enforcement (frontend quick manager removed for security).

### B. Partially Implemented / Development Fixtures [DEVELOPMENT FIXTURE]
- [~] **Live Supabase Synchronization**: Repositories operate on dual-mode pattern; fallback to in-memory fixtures when live PostgreSQL is unconfigured.
- [~] **SMS Gateway Integration**: OTP verification endpoint mock-implemented with secure fallback mode (`123456` in dev) and cooldown.

### C. Security Review Required [SECURITY REVIEW REQUIRED]
- [!] **Admin Route Authorization Guards**: Route handlers such as `POST /api/admin/branches`, `PUT /api/admin/branches/[id]`, `DELETE /api/admin/branches/[id]`, `POST /api/admin/products`, `PUT /api/admin/products/[id]`, and `PUT /api/admin/products/reorder` lack explicit in-handler session checks.

### D. Planned [PLANNED]
- [ ] National Digital ID (NDID) automated Thai biometric verification integration.
- [ ] Direct bank payment gateway webhooks for automatic monthly installment debiting.
- [ ] Line Notify automated messaging for application approval and pickup reminders.
