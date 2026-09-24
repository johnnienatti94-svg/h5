# MeePro Permissions & Security Architecture

> **Target:** `/ai-docs/PERMISSIONS.md`  
> **Source:** Actual code implementation in `src/lib/rbac.ts`, `src/features/staff/types.ts`, and Supabase migration `20260924073909_authoritative_domain_v1.sql`.

---

## 1. System Role Definitions [VERIFIED FROM CODE]

The MeePro domain models 5 authoritative roles (`CmsRole` / `StaffRole`):
1. **`CUSTOMER`**: Public visitor or authenticated financing applicant.
2. **`PC_STAFF`**: In-store product consultant / branch representative.
3. **`BRANCH_MANAGER`**: Branch supervisor scoped to their specific physical store.
4. **`HQ`**: Central operations team with content and queue management capabilities.
5. **`ADMIN`**: Full administrator with complete CMS, media, system config, and role privileges.

*(Note: `SUPER_ADMIN` and `SALES_ASSOCIATE` do not exist in the codebase.)*

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
   - Evaluated via PostgreSQL functions `public.current_staff_user()` and `public.staff_has_capability()`.
   - Branch scoping enforced at PostgreSQL RLS level on `applications` table: `branch_id = current_staff_user().branch_id` unless staff has global HQ capability.
4. **Service Role (`service_role`)**:
   - Bypasses RLS for authoritative migrations and background sync jobs.

---

## 5. Security Findings & Gaps [SECURITY REVIEW REQUIRED]

- **Admin Store/Product/Offer Endpoints**:
  Route handlers in `src/app/api/admin/branches/*`, `src/app/api/admin/products/*`, and `src/app/api/offers/*` do not currently call `authenticateCmsRequest()`. They are documented with `[SECURITY REVIEW REQUIRED]` in `API_CONTRACTS.md` and listed in `TECHNICAL_DEBT.md`.
