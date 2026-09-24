<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MeePro AI Agent Master Governance Directives

> **Mandatory Instructions for Antigravity, Gemini, ChatGPT, and all AI coding assistants.**

---

## 1. Before You Write Any Code

You MUST read and inspect the authoritative documentation in `/ai-docs`:
1. `ai-docs/MASTER_SPEC.md` — Core specifications and product features
2. `ai-docs/ARCHITECTURE.md` — Application architecture, layers, and directory layout
3. `ai-docs/BUSINESS_RULES.md` — Satang math, 0% installments, idempotent submission, and state machines
4. `ai-docs/DATABASE.md` — Database schemas, models, and RLS policies
5. `ai-docs/PERMISSIONS.md` — Role-based access control and security boundaries
6. `ai-docs/API_CONTRACTS.md` — Authoritative REST route handlers and parameters
7. `ai-docs/DESIGN_SYSTEM.md` — Brand tokens, typography, and responsive breakpoints
8. `ai-docs/CURRENT_STATUS.md` — Active operational status

Then inspect the actual existing implementation before making any assumptions.

---

## 2. During Implementation

- **Preserve Baseline**: Do NOT refactor working code simply for aesthetics.
- **Reusability**: Reuse existing components (`src/components/`), services, and types (`src/features/`).
- **Financial Invariance**: Never use floating-point numbers for money; store and compute in integer Satang.
- **Security**: Never expose service-role keys or bypass authorization guards (`src/lib/rbac.ts`).
- **No Direct Push to Main**: Always work on isolated feature or fix branches (`feature/*`, `fix/*`, `docs/*`).
- **Zero Merges/Deployments**: Never auto-merge PRs or trigger production deployments. Stop at Human Review.

---

## 3. After Implementation

Always execute validation before reporting:
1. Production Build & Typecheck: `npm run build`
2. End-to-End Test Suite: `node scripts/verify-scenarios.mjs` (must pass 29/29 assertions)
3. Update `ai-docs/CURRENT_STATUS.md` and `ai-docs/CHANGELOG.md` if any behavior or schema changed.

