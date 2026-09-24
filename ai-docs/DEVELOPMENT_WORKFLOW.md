# MeePro Safe Development Workflow

> **Target:** `/ai-docs/DEVELOPMENT_WORKFLOW.md`  
> **Mandate:** Governance and lifecycle rules for AI assistants and contributors.

---

## 1. Feature Lifecycle Workflow

```text
Requirement / Prompt
       ↓
Review AI Documentation (/ai-docs)
       ↓
Create Dedicated Branch (feature/*, fix/*, docs/*)
       ↓
Implementation (Zero Unnecessary Refactoring)
       ↓
Local Validation (Build + E2E Tests: scripts/verify-scenarios.mjs)
       ↓
Git Commit & Push to Dedicated Branch
       ↓
GitHub Pull Request & Vercel Preview
       ↓
Human Verification / Project Owner Review
       ↓
[EXPLICIT APPROVAL REQUIRED]
       ↓
Merge to main
       ↓
Production Deployment
```

---

## 2. Branch Naming Conventions

- `feature/<feature-name>`: New user journeys, UI widgets, or business features.
- `fix/<issue-name>`: Bug fixes and edge-case corrections.
- `docs/<topic>`: Documentation updates, schema clarifications, and guidelines.
- `hotfix/<critical-issue>`: Immediate emergency production resolutions.

---

## 3. Critical Rules for AI Agents

1. **Never Push Directly to `main`**:
   - Unless explicitly instructed by the project owner for a specific designated sync, all development must occur on dedicated branches.
2. **Never Auto-Merge or Auto-Deploy**:
   - Even if all tests pass and builds succeed, stop at the **Human Review Checkpoint**.
3. **Preserve Business & Financial Logic**:
   - Satang integer calculations, 0% installment rules, branch authorizations, and idempotent application commits must never be altered without explicit architectural direction.
4. **Re-run Authoritative Tests**:
   - Always verify changes with `npm run build` and `node scripts/verify-scenarios.mjs`.
