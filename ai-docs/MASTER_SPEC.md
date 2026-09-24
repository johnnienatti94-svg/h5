# MeePro Master Specification

> **Status:** Authoritative Baseline Documentation  
> **Last Updated:** 2026-09-24  
> **Source of Truth:** Actual Codebase Analysis (`meepro-app`)

---

## 1. Application Purpose

**MeePro** is a comprehensive omni-channel retail financing and device installment platform tailored for Thailand. It enables consumers to purchase smartphones, tablets, laptops, and consumer electronics through flexible installment plans (including 0% interest tenures up to 10–24 months), with digital application submission, instantaneous pre-scoring, in-store pickup across 45+ physical branches, and robust staff review workflows.

---

## 2. System Architecture & Applications

### A. Customer-Facing Storefront (`/(main)`)
- **Home (`/home` or `/`)**: Dynamic widget-driven landing page supporting hero banners, customer greeting widgets, brand showcases, product grids, trust badges, and promotional carousels.
- **Product Catalog (`/products` & `/catalog`)**: Multi-faceted filtering by brand (Apple, Samsung, Xiaomi, OPPO, vivo, etc.), category, condition (New / Refurbished / Used), price range, and installment months.
- **Product Detail (`/products/[slug]`)**: Device variants (storage, color, condition), authoritative price calculations, 0% installment offer calculators, branch stock availability checking, and instant application launch.
- **Credit Application (`/apply`)**: Step-by-step digital financing application with Thai National ID, employment information, salary verification, and branch selection for physical pickup.
- **Customer Account (`/account`)**: Identity profile, member tier (e.g. Gold/Silver/VIP), MeePoints rewards balance, active financing applications, and credit limits.
- **Store Locator (`/stores`)**: Directory of 45+ physical branch locations across Thailand with normalized phone numbers (`+66`), opening hours, landmark directions, and Google Maps deep-links.

### B. Staff & Branch Portal (`/staff`)
- **Staff Authentication (`/staff/login`)**: Role-based access for Sales Associates, Branch Managers, Underwriters, and Super Admins.
- **Application Queue (`/staff/applications`)**: Scoped queue filtering by branch, state-machine transitions (`SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `COLLECTED`), internal staff notes, and audit history.
- **Customer Lookup (`/staff/customer-lookup`)**: Quick lookup by National ID or Phone Number.
- **Appointment Scheduling (`/staff/applications/[id]/appointment`)**: Coordination for in-store pickup and verification.

### C. Admin Console (`/admin`)
- **Visual Page Builder (`/admin/page-builder`)**: No-code CMS block editor with live preview, drag-and-drop widget reordering, revision snapshotting, and scheduled publication.
- **Branch Management (`/admin/branches`)**: Full CRUD (Create, Read, Update, Delete) for physical stores, Google Maps links, and opening hours.
- **Product Catalog (`/admin/products`)**: Full CRUD, stock status management, and custom display sequence organization (Move Up / Down, multi-sort).
- **Installment Offers & Promotions (`/admin/offers`)**: Create and pre-create promotional campaigns with explicit start dates (`effectiveFrom`) and expiration dates (`effectiveUntil`), 0% tenures, and status lifecycle badges.
- **Media Library (`/admin/media`)**: Asset uploads, dimension validation, and reference deletion protection (blocks deleting images actively used on published pages).
- **System Configuration (`/admin/system-config`)**: Global toggles for Member Tier display, MeePoints rewards system, maintenance mode, and emergency banners.

---

## 3. Technology Stack

- **Framework**: Next.js 16.3.5 (App Router, Turbopack)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4 & Vanilla CSS Modules
- **UI Components & Icons**: Radix UI primitives, Lucide React (`^1.47.0`)
- **Validation**: Zod (`^4.6.5`)
- **Data Layer / Backend**: Supabase PostgreSQL with resilient in-memory development repository fallbacks
- **Deployment Platform**: Vercel (`www.meeprochat.online`)

---

## 4. Implementation Status Matrix

### A. Implemented
- [x] Omnichannel customer storefront with responsive breakpoints (320px, 390px, 768px, 1024px, 1440px).
- [x] Canonical Store Locator (`/stores`) and legacy redirect (`/branches` -> `/stores`).
- [x] Thai E.164 phone normalization (`+66...`) and secure HTTPS map links.
- [x] Product catalog with multi-variant pricing, 0% installment tenures, and branch availability.
- [x] Idempotent application submission (`/api/applications/submit`) preventing duplicate debt commitments.
- [x] Staff queue with branch-level access control (Branch Managers locked to assigned branch).
- [x] CMS Visual Block Editor with concurrency conflict detection (HTTP 409 `REVISION_CONFLICT`), draft isolation, and revision rollback.
- [x] Admin Branch CRUD management.
- [x] Admin Product CRUD with drag/move-order organization.
- [x] Admin Installment Offer CRUD with future pre-creation scheduling and expiration dates.
- [x] Media Library with reference protection (HTTP 409 `MEDIA_IN_USE`).
- [x] System Configuration with global toggles for Membership and MeePoints Rewards.
- [x] Backend-only CMS customization enforcement (frontend quick manager removed for security).

### B. Partially Implemented
- [~] **Live Supabase Synchronization**: Repositories are dual-architected to sync with PostgreSQL when live connection strings are present, currently operating on robust in-memory stores during local development.
- [~] **SMS Gateway Integration**: OTP verification endpoint mock-implemented with secure fallback mode (`123456` in dev) and webhook receiver.

### C. Planned / TODO
- [ ] National Digital ID (NDID) automated Thai biometric verification integration.
- [ ] Direct bank payment gateway webhooks for automatic monthly installment debiting.
- [ ] Line Notify automated messaging for application approval and pickup reminders.

### D. Needs Verification
- [ ] Production Supabase RLS policy sync across newly deployed multi-tenant tables.
- [ ] External CDN image asset optimization pipeline for user-uploaded media.
