# MeePro Current Operational Status

> **Target:** `/ai-docs/CURRENT_STATUS.md`  
> **Status:** Active Operational Baseline  
> **Last Verification Run:** 2026-09-24 (29/29 E2E Assertions Passing)

---

## 1. Working Modules & Features

- **Store Locator & Branches (`/stores`, `/admin/branches`)**: Full public directory, Google Maps links, phone normalization (`+66`), and complete Admin CRUD (Add, Edit, Delete).
- **Product Catalog (`/products`, `/admin/products`)**: Multi-brand, multi-category browsing, detail page with variant selection, and Admin management with Move Up/Down custom sequence organization.
- **Installment Offers & Promotions (`/admin/offers`)**: 0% tenure calculations, admin pre-creation with start and expiration dates, and lifecycle status badges (Active, Scheduled, Expired).
- **Media Library (`/admin/media`)**: Image uploads, MIME validation, dimension extraction, and reference deletion protection (prevents breaking published pages).
- **Visual Page Builder (`/admin/page-builder`)**: Modular widget layout editor, draft vs published isolation, revision snapshots, UTC publication scheduling, and concurrency conflict handling (HTTP 409).
- **Security & Authorization**: Strict backend-only CMS enforcement, RBAC for Branch Managers and Staff, and branch-scoped queue locking.
- **System Config Toggles (`/admin/system-config`)**: Global toggles to disable Member Tier display and MeePoints rewards system-wide.

---

## 2. Partially Working

- **Live Database Sync**: Dual-mode data access layer operates on resilient in-memory stores in development and connects to Supabase PostgreSQL when credentials and migrated tables are provided.
- **SMS Gateway**: OTP verification endpoint functions in test mode with verification cooldown and mock simulation.

---

## 3. Known Issues & Warnings

- Standalone `npm run lint` calls raw ESLint 9 without an explicit flat config (`eslint.config.mjs`), which causes standalone invocations to hang when scanning root folders; however, build-time compilation and TypeScript type checking (`next build`) pass cleanly with 0 errors.

---

## 4. Planned

- Biometric verification via National Digital ID (NDID).
- Webhook auto-reconciliation for monthly direct-debit bank payments.
- Real-time WebSocket notifications for branch staff on new application submission.
