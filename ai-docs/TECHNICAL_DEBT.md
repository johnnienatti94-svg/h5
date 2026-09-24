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
