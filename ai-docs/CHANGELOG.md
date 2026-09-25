# MeePro Development Changelog

> **Target:** `/ai-docs/CHANGELOG.md`  
> **Standard:** Authoritative record of development milestones and system updates.

---

## 2026-09-25 — Real Production Staff Login Implementation
### Requested
- Complete the final missing production authentication flow for MeePro staff login on branch `fix/admin-api-authorization`.
- Implement production phone/password authentication in `src/server/auth/staffServerAuth.ts -> authenticateStaff()`:
  - Normalize Thai phone number using `normalizeThaiPhone()`.
  - Authenticate against Supabase Auth using `signInWithPassword({ phone: normalized.e164, password })`.
  - DO NOT use the Supabase service-role client for password validation; instantiate a fresh per-request client using publishable credentials (`auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }`).
  - Query `public.staff_profiles` using authenticated user's UUID; require `status = 'active'` and allowed roles (`PC_STAFF`, `BRANCH_MANAGER`, `HQ`, `ADMIN`). Fail with `"บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบเจ้าหน้าที่"` if missing/inactive. Do NOT create profiles automatically.
  - Return generic `"เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง"` on invalid Supabase Auth credentials.
  - Issue cryptographically signed `meepro_staff_session` HttpOnly cookie with 7-day TTL (`httpOnly: true, secure: production, sameSite: 'lax', path: '/'`).
  - Fail closed if `STAFF_SESSION_SECRET` is missing in production.
- Keep all existing development authentication mechanisms strictly disabled in production (`NODE_ENV === 'production'`).
- Keep login UX intact on `/staff/login` with role-based routing (ADMIN/HQ -> `/admin/dashboard`, BM/PC_STAFF -> `/staff/dashboard`).
- Review `src/lib/staffAuth.ts` and make `/api/staff/login` authoritative; remove unnecessary client-side password fallback.
- Extend test suite with tests for rules A-J and verify build, lint, and all master scenarios.
### Changed
- `src/server/auth/staffServerAuth.ts`:
  - Implemented unprivileged, per-request Supabase Auth client for `signInWithPassword`.
  - Added and exported `resolveStaffProfile()` querying `public.staff_profiles` for active status and allowed roles (`PC_STAFF`, `BRANCH_MANAGER`, `HQ`, `ADMIN`).
  - Implemented complete production authentication flow in `authenticateStaff()` issuing signed HttpOnly session cookies.
  - Updated `getCurrentStaff()` to resolve authenticated user profiles via `resolveStaffProfile()`.
- `src/lib/staffAuth.ts`:
  - Removed client-side Supabase password fallback; established `/api/staff/login` as authoritative login pathway.
- `scripts/verify-admin-authorization.mjs`:
  - Added unit/contract and live HTTP verification for invalid credentials (Rule D), missing staff profiles (Rule E), inactive/unauthorized staff profiles (Rule F), active allowed profile session generation (Rule G), and live `/api/staff/login` error responses (43/43 assertions passing).
- `ai-docs/API_CONTRACTS.md`, `ai-docs/PERMISSIONS.md`, `ai-docs/TECHNICAL_DEBT.md`, `ai-docs/CURRENT_STATUS.md`:
  - Documented production staff authentication architecture, contract, security boundaries, and operational readiness.
### Tests Performed
- `next build`: Passed (TypeScript 0 errors, 57 routes compiled successfully)
- `npm run lint`: Passed (0 errors, 92 pre-existing layout warnings)
- `node scripts/verify-admin-authorization.mjs`: Passed (43/43 assertions, 100%)
- `node scripts/verify-scenarios.mjs`: Passed (29/29 master scenario assertions, 100%)
### Status
- Committed and pushed to `fix/admin-api-authorization`. NOT MERGED to main. NOT DEPLOYED.

---

## 2026-09-25 — Security Review Correction: Production Authentication Hardening
### Requested
- Audit authentication boundary on branch `fix/admin-api-authorization` to ensure development authentication mechanisms cannot work in production.
- Strictly disable development shortcut tokens (`dev-admin-token`, `dev-hq-token`, `dev-manager-token`, `dev-pcstaff-token`) when `process.env.NODE_ENV === 'production'`.
- Strictly disable development test accounts/passwords (`DEV_STAFF_ACCOUNTS`, `staff1234`, `admin1234`) in production.
- Fail closed if `STAFF_SESSION_SECRET` is missing in production (never generate random secret at runtime, never commit secret, fallback only in dev/test).
- Determine intended production staff auth architecture from Supabase (`auth.users` + `public.staff_profiles`) and wire into `getCurrentStaff()`.
- Update security tests to explicitly prove Rules A (dev shortcuts work only in dev/test), B (dev shortcuts rejected in production simulation), C (missing secret fails closed), D (unauthenticated -> 401), E (insufficient role -> 403), F (properly authenticated ADMIN/HQ -> authorized), and ensure 29/29 master scenario suite passes without depending on insecure shortcuts.
- Update documentation across `API_CONTRACTS.md`, `PERMISSIONS.md`, `TECHNICAL_DEBT.md`, `CURRENT_STATUS.md`, and `CHANGELOG.md`.
### Changed
- `src/server/auth/staffServerAuth.ts`:
  - Added and exported `isDevAuthAllowed()` strictly gating development shortcuts behind `process.env.NODE_ENV !== 'production'`.
  - Added `getStaffSessionSecret()` failing closed (`null`) in production if `STAFF_SESSION_SECRET` is unset or empty.
  - Gated `DEV_STAFF_ACCOUNTS` and `signPayload` so passwords and signing cannot operate insecurely in production.
  - Added Supabase Auth JWT fallback to `getCurrentStaff()` to resolve authenticated staff callers against `public.staff_profiles`.
- `src/lib/rbac.ts`:
  - Imported and used `isDevAuthAllowed()` in `authenticateCmsRequest()`, strictly preventing development bearer shortcuts from authenticating in production.
- `src/components/cms/VisualPageBuilder.tsx`:
  - Gated fallback `dev-admin-token` behind `process.env.NODE_ENV !== 'production'`.
- `scripts/verify-admin-authorization.mjs`:
  - Upgraded test suite with Section 0 testing Rules A.1-A.2, B.1-B.3, and C.1-C.4 (36 total passing assertions).
  - Replaced test dependencies on raw shortcut strings with cryptographically signed HMAC tokens.
- `scripts/verify-scenarios.mjs`:
  - Replaced test dependencies on `dev-admin-token` with cryptographically signed HMAC session tokens; updated staff login handling to fall back to signed tokens in production mode.
- `ai-docs/API_CONTRACTS.md`: Added Section 6 documenting authentication transport, secret hardening, and shortcut isolation.
- `ai-docs/PERMISSIONS.md`: Added Section 6 documenting production authentication boundaries and Supabase profile resolution.
- `ai-docs/TECHNICAL_DEBT.md`: Added Item 1.3 documenting production deployment prerequisites (`STAFF_SESSION_SECRET` and Supabase staff accounts).
- `ai-docs/CURRENT_STATUS.md`: Updated verification baseline to 36 security assertions and 29 scenario assertions.
### Tests Performed
- `next build`: Passed (TypeScript 0 errors, 57 routes compiled successfully)
- `npm run lint`: Passed (0 errors, 92 pre-existing warnings)
- `node scripts/verify-admin-authorization.mjs`: Passed (36/36 assertions, 100%)
- `node scripts/verify-scenarios.mjs`: Passed (29/29 master scenario assertions, 100%)
- HTTP Production Simulation: Verified `dev-admin-token` returns HTTP 401 Unauthorized and `staff1234` returns HTTP 401.
### Status
- Committed and pushed to `fix/admin-api-authorization`. NOT MERGED to main. NOT DEPLOYED.

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
