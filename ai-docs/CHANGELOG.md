# MeePro Development Changelog

> **Target:** `/ai-docs/CHANGELOG.md`  
> **Standard:** Authoritative record of development milestones and system updates.

---

## 2026-09-25 — Security Hardening: Admin API Server-Side Authorization
### Requested
- Investigate and fix high-priority authorization vulnerability where administrative mutation endpoints lacked server-side authorization guards.
- Implement least-privilege server-side authorization reusing existing `src/lib/rbac.ts` and `src/server/auth/staffServerAuth.ts`.
- Enforce HTTP 401 Unauthorized for unauthenticated calls and HTTP 403 Forbidden for unauthorized roles.
- Protect `/api/admin/branches/*`, `/api/admin/products/*`, and `/api/offers/*` mutation routes.
- Enforce `PC_STAFF` restriction on `/api/staff/applications/[id]/status` and `/api/staff/applications/[id]/appointment`.
- Add dedicated automated security test suite and update relevant documentation.
### Changed
- `src/lib/rbac.ts`: Exported `requireAdminOrHqAuth()` helper and added development shortcuts for standard roles.
- `src/server/auth/staffServerAuth.ts`: Added PC_STAFF development account and Bearer token resolution to `getCurrentStaff()`.
- `src/app/api/admin/branches/route.ts`: Protected `POST` with `requireAdminOrHqAuth()`.
- `src/app/api/admin/branches/[id]/route.ts`: Protected `PUT` and `DELETE` with `requireAdminOrHqAuth()`.
- `src/app/api/admin/products/route.ts`: Protected `POST` with `requireAdminOrHqAuth()`.
- `src/app/api/admin/products/[id]/route.ts`: Protected `PUT` and `DELETE` with `requireAdminOrHqAuth()`.
- `src/app/api/admin/products/reorder/route.ts`: Protected `PUT` with `requireAdminOrHqAuth()`.
- `src/app/api/offers/route.ts`: Protected `POST` with `requireAdminOrHqAuth()`.
- `src/app/api/offers/[id]/route.ts`: Protected `PUT` and `DELETE` with `requireAdminOrHqAuth()`.
- `src/app/api/staff/applications/[id]/status/route.ts`: Enforced `PC_STAFF` restriction (HTTP 403).
- `src/app/api/staff/applications/[id]/appointment/route.ts`: Enforced `PC_STAFF` restriction (HTTP 403).
- `scripts/verify-admin-authorization.mjs`: Added comprehensive 27-assertion security test suite.
- `ai-docs/API_CONTRACTS.md`: Updated admin route contracts with authentication and authorization requirements.
- `ai-docs/PERMISSIONS.md`: Documented server-side authorization enforcement in Section 5.
- `ai-docs/TECHNICAL_DEBT.md`: Marked Item 1.1 as RESOLVED.
- `ai-docs/CURRENT_STATUS.md`: Updated verification run and security governance status.
- `ai-docs/CHANGELOG.md`: Logged security hardening milestone.
### Tests Performed
- `next build`: Passed (TypeScript 0 errors, 57 routes compiled)
- `npm run lint`: Passed (0 errors, 92 pre-existing warnings)
- `node scripts/verify-admin-authorization.mjs`: Passed (27/27 assertions, 100%)
- `node scripts/verify-scenarios.mjs`: Passed (29/29 assertions, 100%)
### Status
- Committed and pushed to `fix/admin-api-authorization`. NOT MERGED to main. NOT DEPLOYED.

---

## 2026-09-24 — Final Documentation-Only Accuracy & Migration Alignment Pass
### Requested
- Correct PostgreSQL security helper names in `PERMISSIONS.md` and `DATABASE.md` to exact `private` schema functions (`private.current_staff_role()`, `private.is_staff()`, `private.is_hq_admin()`, `private.has_staff_capability(text)`, `private.can_access_branch(uuid)`).
- Correct `staff_profiles` schema documentation to exact implemented migration fields (`user_id`, `display_name`, `role`, `assigned_branch_id`, `status`, `created_at`, `updated_at`).
- Correct `customer_profiles` schema documentation to exact implemented migration fields (`user_id`, `normalized_phone`, `display_phone`, `contact_name`, `status`, `created_at`, `updated_at`).
- Simplify ER diagram in `DATABASE.md` to a clean `SIMPLIFIED RELATIONSHIP VIEW` without representative columns.
- Audit entire `ai-docs/` directory to eliminate all occurrences of unverified terms (`current_staff_user`, `staff_has_capability`, `employee_code`, `national_id_sha256`, `mobile_phone_e164`, `SUPER_ADMIN`, `SALES_ASSOCIATE`, `COLLECTED`).
- Ensure no field, table, or rule is labeled verified unless located directly in code or migrations.
### Changed
- `ai-docs/DATABASE.md`
- `ai-docs/PERMISSIONS.md`
- `ai-docs/MASTER_SPEC.md`
- `ai-docs/BUSINESS_RULES.md`
- `ai-docs/CHANGELOG.md`
### Tests Performed
- `next build`: Passed (2.6s, 0 errors)
- `node scripts/verify-scenarios.mjs`: Passed (29/29 assertions, 100%)
### Status
- Committed and pushed to `docs/project-organization`. NOT MERGED to main. NOT DEPLOYED.

---

## 2026-09-24 — Post-Audit Documentation Inaccuracies Corrections
### Requested
- Correct role models across all documents to match code and migrations (`CUSTOMER`, `PC_STAFF`, `BRANCH_MANAGER`, `HQ`, `ADMIN`).
- Correct application state machine to `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `NEEDS_INFO`, `APPROVED`, `REJECTED`, `APPOINTMENT_SET`, `COMPLETED`, `CANCELLED` and align with `VALID_APPLICATION_TRANSITIONS`.
- Refactor `PERMISSIONS.md` into 3 distinct layers (CMS, Staff Application, and Database/RLS).
- Audit all API route handlers; identify lack of in-handler authorization guard on `POST /api/admin/branches` and related admin mutation endpoints; mark with `[SECURITY REVIEW REQUIRED]` and log in `TECHNICAL_DEBT.md`.
- Correct financing statements to reflect actual fixture structures (0% for 3, 6, 10, and 12m scheduled; 24m at 8.28% annual interest).
- Enhance `DATABASE.md` with full table inventory from authoritative migrations and label ER diagram `SIMPLIFIED DOMAIN VIEW — NOT COMPLETE DATABASE SCHEMA`.
- Acknowledge existence of `eslint.config.mjs` in repository root.
- Apply verification labels (`[VERIFIED FROM CODE]`, `[VERIFIED FROM MIGRATION]`, `[DEVELOPMENT FIXTURE]`, `[SECURITY REVIEW REQUIRED]`, `[PLANNED]`).
### Changed
- `ai-docs/MASTER_SPEC.md`
- `ai-docs/BUSINESS_RULES.md`
- `ai-docs/PERMISSIONS.md`
- `ai-docs/API_CONTRACTS.md`
- `ai-docs/ARCHITECTURE.md`
- `ai-docs/DATABASE.md`
- `ai-docs/CURRENT_STATUS.md`
- `ai-docs/TECHNICAL_DEBT.md`
- `ai-docs/CHANGELOG.md`
### Tests Performed
- `next build`: Passed (2.7s)
- `node scripts/verify-scenarios.mjs`: Passed (29/29 assertions, 100%)
### Status
- Committed and pushed to `docs/project-organization`. NOT MERGED to main. NOT DEPLOYED.

---

## 2026-09-24 — AI Documentation Layer & Repository Safety Setup
### Requested
- Establish standardized AI documentation layer (`/ai-docs`) and repository governance rules (`AGENTS.md`) per Master Setup specification.
- Isolate work on dedicated branch `docs/project-organization` with zero functional code regressions and stop before merge/deploy.
### Changed
- Created `/ai-docs` directory with 12 structured architectural, business, and operational documents.
- Created `AGENTS.md` in repository root to guide all future AI assistants.
- Established `ai-docs/BASELINE.md` capturing baseline commit SHA `4251af056a43ccd683a94c629cb8c43b43aba10a`.

---

## 2026-09-24 — Branch, Offer & Product CRUD Management & Promotion Scheduling
### Requested
- Make Store Branches editable, addable, and deletable.
- Support pre-creating installment offers with future start dates (`effectiveFrom`) and expiration dates (`effectiveUntil`).
- Make Products addable, deletable, and organised (reorderable with move up/down and multi-sort).
### Changed
- Created `branchesStore.ts`, `offersStore.ts`, and `catalogStore.ts` with full CRUD, validation, and reordering.
- Implemented `/api/admin/branches`, `/api/admin/products`, `/api/offers` REST endpoints.
- Upgraded Admin UIs for `/admin/branches`, `/admin/offers`, and `/admin/products` with interactive modals and badges.
### Commit
- `4251af0`

---

## 2026-09-24 — Membership & Reward Points Backend Disabling Support
### Requested
- Allow administrators to disable the Tier Membership system and MeePoints rewards system from backend configuration.
### Changed
- Added `membershipEnabled` and `rewardsEnabled` to `SystemConfig` in `adminSystem.ts`.
- Added toggle controls in `/admin/system-config` and Visual Page Builder inspector.
- Updated greeting widgets and account profile to conditionally hide badges and point redemption blocks.
### Commit
- `5408f22`

---

## 2026-09-24 — Security Hardening: Enforce Backend-Only CMS Control
### Requested
- Make frontend uncustomizable by regular visitors; allow customization strictly from backend.
### Changed
- Removed client-side floating `WidgetQuickManagerModal` from public customer pages.
- Secured all layout mutations behind staff/admin session authentication.
### Commit
- `d16537b`
