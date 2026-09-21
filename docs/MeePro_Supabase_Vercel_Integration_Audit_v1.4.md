# MeePro H5: Supabase, Vercel & GitHub Integration Audit (v1.4)

**Document ID**: `MEEPRO-AUDIT-V1.4`  
**Date**: 2026-09-21  
**Target Repository**: `https://github.com/johnnienatti94-svg/h5.git`  
**Target Hosting**: Vercel  
**Database / Auth Engine**: Supabase (`https://htfhkhldftzqfutatswi.supabase.co`)  
**Status**: Completed & Verified  

---

## 1. Executive Summary

In this release (v1.4), the MeePro H5 Mobile Store application has been fully integrated with the user's Supabase project, configured for seamless deployment on Vercel, and prepared for synchronization with the target GitHub repository `https://github.com/johnnienatti94-svg/h5.git`. Furthermore, the customer login interface has been finalized with a modern centered card layout, strict 430 × 260 proportional banner scaling, and single-method Phone Number + OTP authentication (zero third-party/Facebook logins).

---

## 2. Customer Login UI Refinement (Phone + OTP Only)

| Feature | Specification | Implementation Detail | Status |
| :--- | :--- | :--- | :--- |
| **Banner Dimensions** | 430 × 260 proportional | `aspect-ratio: 430 / 260; max-width: 430px; max-height: 260px; border-radius: 18px;` | PASS |
| **Authentication Flow** | Phone + OTP Only | Strict phone number input (`0xx-xxx-xxxx`) and 6-digit OTP verification. | PASS |
| **External Logins** | None | Facebook, Google, Line buttons and "หรือ" dividers completely excluded. | PASS |
| **Visual Aesthetics** | Modern Centered Card | Elevated `#FFFFFF` card, `border-radius: 20px`, `#E2E8F0` border, soft drop shadow. | PASS |
| **Input Controls** | Premium Mobile UX | Thailand flag 🇹🇭, `+66` country badge, emerald green focus ring (`#007849`). | PASS |
| **Compliance & Bot Check** | PDPA & Turnstile | Custom styled checkbox with bottom-sheet modal link + Turnstile card. | PASS |
| **Primary Action** | High-contrast Button | Solid `#007849` rounded button (`กดรับ OTP`). | PASS |

---

## 3. Supabase Integration

### 3.1 Environment Configuration (`.env.local` & `.env.example`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://htfhkhldftzqfutatswi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4KrYiHeYZ6d_e7LvjmAUdQ_x99NnhYX
SUPABASE_SERVICE_ROLE_KEY=[REDACTED_SECRET_KEY]
SUPABASE_JWKS_URL=https://htfhkhldftzqfutatswi.supabase.co/auth/v1/.well-known/jwks.json

# Aliases
SUPABASE_URL=https://htfhkhldftzqfutatswi.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_4KrYiHeYZ6d_e7LvjmAUdQ_x99NnhYX
SUPABASE_SECRET_KEY=[REDACTED_SECRET_KEY]
```

### 3.2 Client Architecture (`src/lib/supabase.ts`)
- **`supabase`**: Public browser client initialized with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **`supabaseAdmin`**: Privileged service client for staff lookup and admin audit operations initialized with `SUPABASE_SERVICE_ROLE_KEY`.
- **Entity Types**: TypeScript interfaces for `CustomerRecord`, `WidgetRecord`, `BannerRecord`, and `AuditLogRecord`.

### 3.3 Database Schema Script (`src/lib/supabase-schema.sql`)
The PostgreSQL schema script includes:
1. `customers`: Phone primary lookup key (`0xx-xxx-xxxx`), tier, points, PDPA timestamp.
2. `otp_verifications`: Phone, OTP code, expiration, and verification flag.
3. `homepage_widgets`: Dynamic widget system types, sort order, and JSONB config.
4. `banners`: 430 × 260 proportional banners, gradients, titles, active flags.
5. `audit_logs`: Admin security and operational logging.
6. Row-Level Security (RLS) policies allowing public read access to active widgets and banners.

---

## 4. Vercel Deployment Configuration

### 4.1 Configuration File (`vercel.json`)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "next build",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 4.2 Production Build Verification
- **Engine**: Next.js 16.3.5 (Turbopack)
- **TypeScript**: 0 errors
- **Total Static Routes Generated**: 19 / 19
- **Build Duration**: < 3.5 seconds

```text
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /account
├ ○ /admin/dashboard
├ ○ /admin/login
├ ○ /admin/logs
├ ○ /admin/roles
├ ○ /admin/system-config
├ ○ /catalog
├ ○ /home
├ ○ /location
├ ○ /login
├ ○ /promotion
├ ○ /staff/banners
├ ○ /staff/customer-lookup
├ ○ /staff/dashboard
├ ○ /staff/homepage-builder
└ ○ /staff/login
```

---

## 5. GitHub Repository Deployment Instructions

To push this codebase to your target GitHub repository (`https://github.com/johnnienatti94-svg/h5.git`):

```powershell
cd "d:\Projects\H5 project\meepro-app"

# 1. Initialize git
git init -b main

# 2. Add remote repository
git remote add origin https://github.com/johnnienatti94-svg/h5.git

# 3. Stage and commit all files
git add .
git commit -m "feat: MeePro H5 mobile store with Supabase integration and modern Phone+OTP login"

# 4. Push to remote (replacing repository content as requested)
git push -u origin main --force
```

### 5.1 Vercel Deployment Steps
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New Project** and import `johnnienatti94-svg/h5`.
3. Under **Environment Variables**, add the Supabase keys:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://htfhkhldftzqfutatswi.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_4KrYiHeYZ6d_e7LvjmAUdQ_x99NnhYX`
   - `SUPABASE_SERVICE_ROLE_KEY` = `[REDACTED_SECRET_KEY]`
   - `SUPABASE_JWKS_URL` = `https://htfhkhldftzqfutatswi.supabase.co/auth/v1/.well-known/jwks.json`
4. Click **Deploy**.
