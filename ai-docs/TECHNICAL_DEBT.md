# MeePro Technical Debt & Risk Audit

> **Target:** `/ai-docs/TECHNICAL_DEBT.md`  
> **Policy:** Document reality and recommend actions; DO NOT execute automatic refactoring.

---

## 1. LOW RISK

### Item 1.1: Standalone ESLint 9 Script Configuration
- **Finding**: Running `npm run lint` directly runs `eslint .` without a modern ESLint Flat Config (`eslint.config.mjs`), which causes standalone command runs to hang scanning parent directories.
- **Current State**: Next.js internal build-time checks pass cleanly without issue.
- **Recommendation**: Create a lightweight `eslint.config.mjs` with `@next/eslint-plugin-next` flat config when convenient.

### Item 1.2: Unused Legacy Directory Stubs
- **Finding**: Legacy redirects exist for `/branches` -> `/stores` to preserve canonical presentation.
- **Current State**: Handled smoothly via HTTP 307 redirects.
- **Recommendation**: Keep redirect indefinitely for SEO and old bookmarks.

---

## 2. MEDIUM RISK

### Item 2.1: Dual-Mode Database Repositories
- **Finding**: `branchesStore.ts`, `catalogStore.ts`, and `offersStore.ts` maintain in-memory maps during local development while providing Supabase connection logic.
- **Current State**: Essential for rapid local development and automated CI testing without live cloud credentials.
- **Recommendation**: Maintain dual-mode pattern; ensure live Supabase migration scripts are cataloged in `supabase/migrations/` when transitioning all environments to PostgreSQL.

---

## 3. HIGH RISK

### Item 3.1: Financial Rounding Satang Invariance
- **Finding**: Installment calculators must strictly preserve integer satang accuracy. Any floating-point arithmetic introduces fractional satang errors over 10-24 month periods.
- **Current State**: Integer division with remainder pinning is correctly implemented.
- **Recommendation**: Require all future developers/agents to pass `verify-scenarios.mjs` before touching `currency.ts` or offer calculation logic.
