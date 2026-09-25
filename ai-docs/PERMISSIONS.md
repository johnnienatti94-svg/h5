# MeePro Permissions & Security Architecture

> **Target:** `/ai-docs/PERMISSIONS.md`  
> **Source:** Actual code implementation in `src/lib/rbac.ts`, `src/features/staff/types.ts`, and Supabase migration `20260924073909_authoritative_domain_v1.sql`.

---

## 1. System Role Definitions [VERIFIED FROM CODE & MIGRATION]

The MeePro domain models 5 authoritative roles (`CmsRole` / `StaffRole`):
1. **`CUSTOMER`**: Public visitor or authenticated financing applicant.
2. **`PC_STAFF`**: In-store product consultant / branch representative.
3. **`BRANCH_MANAGER`**: Branch supervisor scoped to their specific physical store.
4. **`HQ`**: Central operations team with content and queue management capabilities.
5. **`ADMIN`**: Full administrator with complete CMS, media, system config, and role privileges.

---

## 2. Layer 1: CMS Permission Matrix (`src/lib/rbac.ts`) [VERIFIED FROM CODE]

Evaluated by `hasPermission(role: CmsRole, action: CmsAction)` on CMS route handlers:

| CMS Action | `CUSTOMER` | `PC_STAFF` | `BRANCH_MANAGER` | `HQ` | `ADMIN` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `READ_PUBLISHED` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PREVIEW_DRAFT` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `EDIT_WIDGETS` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `REORDER_WIDGETS` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `PUBLISH` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `ROLLBACK` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `DELETE_WIDGET` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `MANAGE_MEDIA` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `CUSTOM_EMBED` | ❌ | ❌ | ❌ | ❌ | ✅ |

*Important observation*: `BRANCH_MANAGER` and `PC_STAFF` have **no CMS editing, publishing, or media management permissions**. They only have `READ_PUBLISHED`.

---

## 3. Layer 2: Staff Application Permissions (`src/features/staff/`) [VERIFIED FROM CODE]

Evaluated by staff route handlers (`/api/staff/*`):

| Application Action | `PC_STAFF` | `BRANCH_MANAGER` | `HQ` | `ADMIN` |
| :--- | :---: | :---: | :---: | :---: |
| **View Applications (Own Branch)** | ✅ | ✅ | ✅ | ✅ |
| **View Applications (Cross/Foreign Branch)** | ❌ (HTTP 403) | ❌ (HTTP 403) | ✅ | ✅ |
| **Transition Status (`UNDER_REVIEW` ➔ `APPROVED`/`REJECTED`)** | ❌ | ✅ | ✅ | ✅ |
| **Schedule Pickup Appointment** | ❌ | ✅ | ✅ | ✅ |
| **Add Internal Staff Audit Note** | ✅ | ✅ | ✅ | ✅ |
| **Customer Lookup by National ID/Phone** | ✅ (Own Branch) | ✅ (Own Branch) | ✅ | ✅ |

---

## 4. Layer 3: Database & RLS Permissions [VERIFIED FROM MIGRATION]

From `supabase/migrations/20260924073909_authoritative_domain_v1.sql`:

1. **Anonymous / Public (`anon`, `public`)**:
   - `SELECT` on `branches` where `is_active = true` and `published_version_id is not null`.
   - `SELECT` on `branch_versions`, `products`, `variants`, `offers`, and `media_assets` where `visibility = 'public'`.
   - All `INSERT`, `UPDATE`, `DELETE` are denied.
2. **Authenticated Customers**:
   - `INSERT` on `applications` with required idempotency key.
   - `SELECT` scoped strictly to applications matching their authenticated `customer_id`.
3. **Staff Roles**:
   - Evaluated via PostgreSQL functions in schema `private`:
     - `private.current_staff_role()`
     - `private.is_staff()`
     - `private.is_hq_admin()`
     - `private.has_staff_capability(text)`
     - `private.can_access_branch(uuid)`
   - Branch scoping enforced at PostgreSQL RLS level on `applications` table: `private.can_access_branch(branch_id)` enforces that Branch Managers and PC Staff can only access rows matching their `assigned_branch_id`, while HQ and Admin have global access.
4. **Service Role (`service_role`)**:
   - Bypasses RLS for authoritative migrations and background sync jobs.

---

## 5. Security & Authorization Enforcement [VERIFIED FROM CODE]

- **Admin Store/Product/Offer Endpoints**:
  Server-side authorization is strictly enforced via `requireAdminOrHqAuth()` in `src/lib/rbac.ts`:
  - `POST /api/admin/branches`, `PUT /api/admin/branches/[id]`, `DELETE /api/admin/branches/[id]`
  - `POST /api/admin/products`, `PUT /api/admin/products/[id]`, `DELETE /api/admin/products/[id]`, `PUT /api/admin/products/reorder`
  - `POST /api/offers`, `PUT /api/offers/[id]`, `DELETE /api/offers/[id]`
  - Enforces HTTP 401 Unauthorized for unauthenticated requests and HTTP 403 Forbidden for insufficient permissions (`PC_STAFF`, `BRANCH_MANAGER`, `CUSTOMER`). Only `ADMIN` and `HQ` are permitted.
- **Staff Mutation Endpoints**:
  - `POST /api/staff/applications/[id]/status` and `POST /api/staff/applications/[id]/appointment` explicitly reject `PC_STAFF` with HTTP 403 Forbidden, restricting state changes and appointments strictly to `BRANCH_MANAGER`, `HQ`, and `ADMIN`.

---

## 6. Authentication Boundary & Production Isolation [VERIFIED FROM CODE]

Authorization guards depend directly on the authentication boundary (`authenticateCmsRequest` and `getCurrentStaff`):

1. **Production Token Requirements**:
   - Production requests must provide either a cryptographically signed HMAC token (via `meepro_staff_session` cookie or `Authorization: Bearer <token>`) signed with `STAFF_SESSION_SECRET`, or a verified Supabase Auth JWT.
   - If `STAFF_SESSION_SECRET` is missing in production, the authentication boundary fails closed (HTTP 401).
2. **Development Bypass Isolation**:
   - Development shortcuts (`dev-admin-token`, `dev-hq-token`, `dev-manager-token`, `dev-pcstaff-token`) and development passwords (`staff1234`, `admin1234`) are gated by `isDevAuthAllowed()`.
   - When `process.env.NODE_ENV === 'production'`, `isDevAuthAllowed()` returns `false` unconditionally.
   - Development shortcuts are strictly rejected in production with HTTP 401 Unauthorized.
3. **Database-Backed Staff Accounts & Authorization**:
   - In production, staff users must be provisioned in Supabase Auth (`auth.users`) and have an active row in `public.staff_profiles` with an allowed role (`PC_STAFF`, `BRANCH_MANAGER`, `HQ`, `ADMIN`).
   - `authenticateStaff()` authenticates the user via unprivileged Supabase Auth client (`signInWithPassword`) and verifies active status and role in `public.staff_profiles`. Profiles are NEVER created automatically.
   - If profile is missing, inactive, or holds an unauthorized role, login fails with `บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบเจ้าหน้าที่`.
4. **Session Cookie Issuance**:
   - Upon successful Supabase Auth + `staff_profiles` authorization, `authenticateStaff()` issues the signed HttpOnly `meepro_staff_session` cookie via `signPayload()`.
   - `getCurrentStaff()` and `authenticateCmsRequest()` verify the HMAC signature of this cookie or Bearer token, or verify Supabase Auth JWTs against `public.staff_profiles`.

