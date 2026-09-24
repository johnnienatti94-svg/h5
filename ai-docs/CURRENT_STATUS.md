# MeePro Current Operational Status

> **Target:** `/ai-docs/CURRENT_STATUS.md`  
> **Status:** Active Operational Baseline [VERIFIED FROM CODE]  
> **Last Verification Run:** 2026-09-25 (29/29 Master E2E Scenarios Passing + 36/36 Security Tests Passing)

---

## 1. Working Modules & Features [VERIFIED FROM CODE]

- **Store Locator & Branches (`/stores`, `/admin/branches`)**: Full public directory, Google Maps links, phone normalization (`+66`), and complete Admin CRUD (Add, Edit, Delete). Server-side authorization enforced via `requireAdminOrHqAuth()`.
- **Product Catalog (`/products`, `/admin/products`)**: Multi-brand, multi-category browsing, detail page with variant selection, and Admin management with Move Up/Down custom sequence organization. Server-side authorization enforced via `requireAdminOrHqAuth()`.
- **Installment Offers & Promotions (`/admin/offers`)**: 0% tenure calculations, admin pre-creation with start and expiration dates, and lifecycle status badges (Active, Scheduled, Expired). Server-side authorization enforced via `requireAdminOrHqAuth()`.
- **Media Library (`/admin/media`)**: Image uploads, MIME validation, dimension extraction, and reference deletion protection (prevents breaking published pages).
- **Visual Page Builder (`/admin/page-builder`)**: Modular widget layout editor, draft vs published isolation, revision snapshots, UTC publication scheduling, and concurrency conflict handling (HTTP 409).
- **Security & Authorization**: Strict backend-only CMS enforcement, RBAC for Staff roles (`PC_STAFF`, `BRANCH_MANAGER`, `HQ`, `ADMIN`), server-side admin API protection, and branch-scoped queue locking.
- **Production Authentication Hardening**: Development bearer tokens (`dev-admin-token`, `dev-pcstaff-token`, etc.) and default test passwords (`staff1234`, `admin1234`) strictly isolated behind `isDevAuthAllowed()` and unconditionally rejected in production (`NODE_ENV === 'production'`). Missing `STAFF_SESSION_SECRET` fails closed (HTTP 401). Real Supabase Auth JWTs verified against `public.staff_profiles`.
- **System Config Toggles (`/admin/system-config`)**: Global toggles to disable Member Tier display and MeePoints rewards system-wide.

---

## 2. Partially Working & Development Fixtures [DEVELOPMENT FIXTURE]

- **Live Database Sync**: Dual-mode data access layer operates on resilient in-memory stores in development and connects to Supabase PostgreSQL when credentials and migrated tables are provided.
- **SMS Gateway**: OTP verification endpoint functions in test mode with verification cooldown and mock simulation.

---

## 3. Discovered Security & Governance Items [RESOLVED]

- **Admin Route Authorization Guards [RESOLVED]**: Route handlers in `src/app/api/admin/branches/*`, `src/app/api/admin/products/*`, and `src/app/api/offers/*` now enforce server-side authentication and role authorization via `requireAdminOrHqAuth()`, returning 401 for unauthenticated calls and 403 for unauthorized roles. `PC_STAFF` role restrictions are also enforced on `/api/staff/applications/[id]/status` and `/api/staff/applications/[id]/appointment`.
- **Production Authentication Boundary Hardening [RESOLVED AT CODE LEVEL — PENDING VERCEL ENV & SUPABASE USERS]**: Hardened `src/server/auth/staffServerAuth.ts` and `src/lib/rbac.ts` so that development authentication mechanisms cannot work in production. Added fail-closed secret resolution, Supabase Auth token fallback in `getCurrentStaff()`, and upgraded security test suite to 36 assertions proving isolation, rejection, fail-closed handling, and permission boundaries.
- **ESLint Configuration**: Flat config `eslint.config.mjs` executes via `npm run lint` with 0 errors.

---

## 4. Planned [PLANNED]

- Biometric verification via National Digital ID (NDID).
- Webhook auto-reconciliation for monthly direct-debit bank payments.
- Real-time WebSocket notifications for branch staff on new application submission.
