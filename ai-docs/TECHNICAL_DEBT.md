# MeePro Technical Debt & Risk Audit

> **Target:** `/ai-docs/TECHNICAL_DEBT.md`  
> **Policy:** Document reality and recommend actions; DO NOT execute automatic refactoring.

---

## 1. HIGH RISK

### Item 1.1: Admin REST Endpoints Lack In-Handler Authorization Guards [RESOLVED]
- **Finding**: Route handlers `POST /api/admin/branches`, `PUT /api/admin/branches/[id]`, `DELETE /api/admin/branches/[id]`, `POST /api/admin/products`, `PUT /api/admin/products/[id]`, `PUT /api/admin/products/reorder`, and `POST /api/offers` previously lacked explicit in-handler authorization guards.
- **Current State**: **RESOLVED on branch `fix/admin-api-authorization`**. All administrative mutation endpoints now enforce server-side authentication and role-based authorization via `requireAdminOrHqAuth()`, rejecting unauthenticated calls with HTTP 401 and unauthorized roles (`PC_STAFF`, `BRANCH_MANAGER`, `CUSTOMER`) with HTTP 403. Verified with 27 automated security assertions in `scripts/verify-admin-authorization.mjs`.
- **Risk Level**: **RESOLVED** (Previously HIGH)


### Item 1.2: Financial Rounding Satang Invariance
- **Finding**: Installment calculators must strictly preserve integer satang accuracy. Any floating-point arithmetic introduces fractional satang errors over 10–24 month periods.
- **Current State**: Integer division with remainder pinning is correctly implemented.
- **Risk Level**: **HIGH**
- **Recommendation**: Require all future developers/agents to pass `verify-scenarios.mjs` before touching `currency.ts` or offer calculation logic.

### Item 1.3: Production Staff Authentication Implementation & Prerequisite Configuration [RESOLVED AT CODE LEVEL]
- **Finding**: In production, development accounts were correctly disabled, but `authenticateStaff()` previously lacked real Supabase phone/password authentication against `auth.users` and `public.staff_profiles`.
- **Current State**: **RESOLVED AT CODE LEVEL on branch `fix/admin-api-authorization`**.
  - Production phone/password authentication is fully implemented in `authenticateStaff()` using an unprivileged, per-request Supabase client (`persistSession: false`, no service role password verification).
  - Thai phone numbers are normalized via `normalizeThaiPhone()`.
  - Roles and active statuses are enforced against `public.staff_profiles` (`PC_STAFF`, `BRANCH_MANAGER`, `HQ`, `ADMIN` with `status = 'active'`).
  - Signed HttpOnly `meepro_staff_session` cookies are issued via `signPayload()`, failing closed if `STAFF_SESSION_SECRET` is unset.
  - Development accounts and shortcuts remain strictly disabled when `NODE_ENV === 'production'`.
  - Client-side Supabase password fallback in `src/lib/staffAuth.ts` was eliminated in favor of authoritative `/api/staff/login`.
  - Covered by 43 automated security assertions in `scripts/verify-admin-authorization.mjs`.
- **Operational Requirements Before Live Use**:
  1. `STAFF_SESSION_SECRET` is configured in production by the project owner.
  2. Live staff users must have corresponding phone + password credentials in Supabase Auth and active records in `public.staff_profiles` with allowed roles.
- **Risk Level**: **LOW / OPERATIONAL READINESS** (Code is complete and verified; requires live staff account provisioning).

---

## 2. MEDIUM RISK

### Item 2.1: Dual-Mode Database Repositories
- **Finding**: `branchesStore.ts`, `catalogStore.ts`, and `offersStore.ts` maintain in-memory maps during local development while providing Supabase connection logic.
- **Current State**: Essential for rapid local development and automated CI testing without live cloud credentials.
- **Recommendation**: Maintain dual-mode pattern; ensure live Supabase migration scripts are cataloged in `supabase/migrations/` when transitioning all environments to PostgreSQL.

---

## 3. LOW RISK

### Item 3.1: Legacy Route Redirect Overhead
- **Finding**: Legacy redirect exists for `/branches` -> `/stores` to preserve canonical presentation.
- **Current State**: Handled smoothly via HTTP 307 redirects.
- **Recommendation**: Keep redirect indefinitely for SEO and old bookmarks.
