# MeePro Roles & Permissions Matrix

> **Target:** `/ai-docs/PERMISSIONS.md`  
> **Source:** `src/lib/rbac.ts` and authorization test suite (`§15 Scenario 9`)

---

## 1. Role Definitions

1. **SUPER_ADMIN**: Full system administrator. Can access all branch queues, modify system config, publish CMS pages, manage staff accounts, and configure global financing parameters.
2. **BRANCH_MANAGER**: Oversees a specific physical branch. Can review and transition applications assigned to their branch, manage in-store appointment pickups, and add staff audit notes. Locked from querying foreign branch queues.
3. **SALES_ASSOCIATE**: In-store staff member. Can view products, look up customer applications at their branch, and verify physical pickup. Cannot publish CMS pages or alter system configurations.
4. **CUSTOMER**: End-user. Can browse published catalog, calculate installments, request OTP, submit credit applications, and view their own account profile.

---

## 2. Permissions Matrix

| Capability / Action | Super Admin | Branch Manager | Sales Associate | Customer |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Catalog & Offers** | ✅ | ✅ | ✅ | ✅ |
| **Submit Financing Application** | ❌ | ❌ | ❌ | ✅ |
| **View Own Account / Applications** | ❌ | ❌ | ❌ | ✅ |
| **Lookup Customer Applications** | ✅ (All) | ✅ (Own Branch) | ✅ (Own Branch) | ❌ |
| **Transition Application State** | ✅ | ✅ | ❌ | ❌ |
| **Add Internal Staff Note** | ✅ | ✅ | ✅ | ❌ |
| **Query Foreign Branch Queue** | ✅ | ❌ (HTTP 403) | ❌ (HTTP 403) | ❌ |
| **Edit Store Branches (CRUD)** | ✅ | ❌ | ❌ | ❌ |
| **Edit Product Catalog & Order** | ✅ | ❌ | ❌ | ❌ |
| **Manage 0% Offers & Pre-create** | ✅ | ❌ | ❌ | ❌ |
| **Upload / Delete Media** | ✅ | ❌ | ❌ | ❌ |
| **Edit CMS Draft Pages** | ✅ | ❌ | ❌ | ❌ |
| **Publish CMS Pages to Live** | ✅ | ❌ (HTTP 403) | ❌ (HTTP 403) | ❌ |
| **Toggle System Config** | ✅ | ❌ | ❌ | ❌ |

---

## 3. Server-Side Enforcement Safeguards

- Every staff/admin route invokes `authenticateCmsRequest()` and checks `hasPermission(role, permission)` before executing mutations.
- Unauthenticated requests to staff routes return **HTTP 401 Unauthorized**.
- Unauthorized or out-of-scope actions return **HTTP 403 Forbidden**.
