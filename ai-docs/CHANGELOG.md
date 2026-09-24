# MeePro Development Changelog

> **Target:** `/ai-docs/CHANGELOG.md`  
> **Standard:** Authoritative record of development milestones and system updates.

---

## 2026-09-24 — AI Documentation Layer & Repository Safety Setup
### Requested
- Establish standardized AI documentation layer (`/ai-docs`) and repository governance rules (`AGENTS.md`) per Master Setup specification.
- Isolate work on dedicated branch `docs/project-organization` with zero functional code regressions and stop before merge/deploy.
### Changed
- Created `/ai-docs` directory with 12 structured architectural, business, and operational documents.
- Created `AGENTS.md` in repository root to guide all future AI assistants.
- Established `ai-docs/BASELINE.md` capturing baseline commit SHA `4251af056a43ccd683a94c629cb8c43b43aba10a`.
### Files Created
- `ai-docs/BASELINE.md`
- `ai-docs/MASTER_SPEC.md`
- `ai-docs/ARCHITECTURE.md`
- `ai-docs/DATABASE.md`
- `ai-docs/BUSINESS_RULES.md`
- `ai-docs/PERMISSIONS.md`
- `ai-docs/API_CONTRACTS.md`
- `ai-docs/DESIGN_SYSTEM.md`
- `ai-docs/CURRENT_STATUS.md`
- `ai-docs/TECHNICAL_DEBT.md`
- `ai-docs/DEVELOPMENT_WORKFLOW.md`
- `ai-docs/CHANGELOG.md`
- `AGENTS.md`
### Tests Performed
- `next build` (tsc): Passed (2.9s, 0 errors)
- `node scripts/verify-scenarios.mjs`: Passed (29/29 assertions, 100%)
### Deployment Notes
- NOT MERGED to main. NOT DEPLOYED to production. Awaiting human approval.

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
