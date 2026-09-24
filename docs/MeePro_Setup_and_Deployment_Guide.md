# MeePro: Full-Stack Setup, Deployment & Operations Guide

**Date:** 24 September 2026  
**Application:** MeePro (มีโปรโฟน) — Digital Smartphone Installment Platform  
**Target Runtime:** Node.js 20+ / Next.js 16 (App Router & Turbopack) / PostgreSQL 15+ (Supabase)

---

## 1. System Overview & Architecture

MeePro is a Thai-first omnichannel smartphone installment platform designed for 0% financing, multi-branch pickup, customer self-service, staff review workflows, and visual CMS publishing.

### Architectural Stack
- **Framework:** Next.js 16 with Turbopack, React 19, Server Components, Route Handlers.
- **Design System:** Custom MeePro Design Tokens (Orange `#FF6E00`, Navy `#142B4A`), Thai-first typography (`Kanit` headings & `Noto Sans Thai` body), CSS Modules and Tailwind CSS v4.
- **Data Architecture:** Authoritative PostgreSQL domain schema with backward/forward migration in [`supabase/migrations/20260924073909_authoritative_domain_v1.sql`](file:///d:/Projects/H5%20project/meepro-app/supabase/migrations/20260924073909_authoritative_domain_v1.sql) and development-fallback persisted repositories for offline development.
- **Security & Authorization:** Role-Based Access Control (RBAC), branch scoping, HttpOnly signed sessions (`meepro_customer_session`, `meepro_staff_session`), Cloudflare Turnstile anti-bot protection.
- **Website Studio CMS:** Shared public/editor block renderer (`PageBlockRenderer`) with 13 typed blocks, draft versioning with `expectedRevision` optimistic locking (HTTP 409 Conflict), scheduled releases (`publish_jobs`), and media deletion reference protection.

---

## 2. Quickstart & Local Installation

### Prerequisites
- Node.js `v20.x` or `v22.x`
- npm `v10.x` or pnpm `v9.x`

### Setup Instructions

```bash
# 1. Clone repository and navigate to app directory
cd meepro-app

# 2. Install dependencies
npm install

# 3. Setup environment configuration
cp .env.example .env.local

# 4. Start local development server (runs on port 3000)
npm run dev

# 5. Execute production build validation (compiles 57 static & dynamic routes)
npm run build
```

---

## 3. Pre-Configured Test Accounts & Credentials

For local development and automated testing, the system provides pre-configured, validated accounts:

| Portal | Role | Phone / Username | Password | Assigned Scope |
|---|---|---|---|---|
| **Staff Portal** | `ADMIN` / `HQ` | `0819999999` | `admin1234` | All 45 Branches Nationwide |
| **Staff Portal** | `BRANCH_MANAGER` | `0819998888` | `staff1234` | CentralWorld Branch Only |
| **Customer Portal** | `CUSTOMER` | Any Thai Mobile (e.g. `0891234567`) | OTP `123456` | Self Application Scope |
| **Admin Direct** | `ADMIN` API Token | Header `Authorization: Bearer dev-admin-token` | N/A | Global CMS & Settings |

---

## 4. Key Public & Administrative Route Directory

### Public Storefront
- `/` or `/home`: Main Storefront Home (renders active CMS widgets via `PageBlockRenderer`).
- `/stores`: Interactive Branch Directory (45 branches, region filtering, live hours).
- `/stores/[slug]`: Canonical branch page with deep-linked accessible `BranchDetailsDialog`.
- `/products`: Catalog browsing, brand filter, flagship devices, 0% installment badges.
- `/products/[slug]`: Product detail page with storage variants, color swatches, 0% calculation table.
- `/apply`: Multi-step installment application wizard with inline phone OTP challenge.
- `/account/applications`: Customer applications list, live progress timeline, and cancellation.
- `/services`, `/faq`, `/privacy`, `/terms`: Information, policies, and trade-in discovery.

### Staff & Branch Workspace
- `/staff/login`: Staff authentication portal with role detection.
- `/staff/applications`: Branch-scoped application queue.
- `/staff/applications/[id]`: Application review, customer documents, internal staff notes, status transitions, and appointment booking.
- `/staff/customer-lookup`: Rapid phone-based customer history lookup.

### Website Studio & Admin Control
- `/admin/page-builder`: Interactive desktop & mobile visual CMS builder with live preview.
- `/admin/pages`: CMS page manager (Draft, Publish Now, Schedule Release, Revisions History, Restore).
- `/admin/media`: Media asset library with dimension tags, alt text, and deletion reference protection.
- `/admin/branches`: Branch administration and Google Maps verification.
- `/admin/products`: Product catalog administration.
- `/admin/offers`: Versioned installment offer plans (3, 6, 10, 24 months).
- `/admin/settings`: Global site branding, logo, hotline, social links, and SEO defaults.

---

## 5. Automated Verification Suites

The repository contains 5 dedicated automated test suites plus the Master Scenario Suite:

```bash
# Phase 2: Public Stores, Canonical Slugs, Dialog & Redirects (14 tests)
node scripts/verify-phase2.mjs

# Phase 3: Catalog, Variants, 0% Offers & Currency Formatter (10 tests)
node scripts/verify-phase3.mjs

# Phase 4: Customer Phone OTP, Sessions & Application Wizard (14 tests)
node scripts/verify-phase4.mjs

# Phase 5: Staff Auth, Branch Scoping, Review Queue & Decisions (17 tests)
node scripts/verify-phase5.mjs

# Phase 6: CMS Visual Builder, Revisions, 409 Conflicts, Media Locks (39 tests)
node scripts/verify-phase6.mjs

# Master Suite: Section 15 12 End-to-End Required Scenarios (29 tests)
node scripts/verify-scenarios.mjs
```

**Cumulative Test Results:** **123 / 123 automated integration tests passing (100% pass rate)**.

---

## 6. Authoritative Database Schema Migration

The complete production PostgreSQL domain schema is located in:
[`supabase/migrations/20260924073909_authoritative_domain_v1.sql`](file:///d:/Projects/H5%20project/meepro-app/supabase/migrations/20260924073909_authoritative_domain_v1.sql)

### Applying Migration to Live Supabase Project:
1. Ensure your live Supabase project is created at [supabase.com](https://supabase.com).
2. Link your project via Supabase CLI:
   ```bash
   supabase link --project-ref your-project-ref
   ```
3. Apply migration:
   ```bash
   supabase db push
   ```
4. Update `.env.local` with your live project's `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

---

## 7. Remaining External Setup Dependencies

Before live customer production deployment, configure the following external integrations:
1. **SMS Gateway:** Point `OTP_PROVIDER` to `ThaiBulkSMS` or `Twilio` with live carrier credentials.
2. **Cloudflare Turnstile:** Register hostname in Cloudflare dashboard and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
3. **AWS S3 Bucket:** Configure private bucket for KYC document uploads with server-side encryption (`aws:kms`) and restricted IAM policies.
4. **SSL / Reverse Proxy:** Ensure production deployment terminates SSL with HTTP Strict Transport Security (HSTS) enabled.
