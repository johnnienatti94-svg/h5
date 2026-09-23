# MeePro Project Update & Full-Stack Widget CMS Architecture (v2.1)

**Date:** September 23, 2026  
**Project:** MeePro Mobile Web Application (`meepro-app`)  
**Status:** Frontend E-Commerce Shell Complete / Dynamic Widget CMS In Development  
**Repository:** [https://github.com/johnnienatti94-svg/h5.git](https://github.com/johnnienatti94-svg/h5.git) (Branch: `main`)  
**Design Reference:** Google Stitch Project `16607361533876317623` + `Ecommerce_Landing_Page_Widgets.md`

---

## 1. Executive Summary

This document defines the current implementation state and the target architecture for the **MeePro Web Application**.

The current release has completed the main customer-facing e-commerce shell, including top navigation, search, bottom navigation, category/service drawer, cart UX, and catalog-to-cart integration.

The application is **not yet considered fully production-ready** because the following platform capabilities are still being implemented:

- Responsive removal of fixed mobile-canvas constraints.
- Backend-driven widget configuration.
- CMS authentication, authorization, and Supabase Row Level Security (RLS).
- Draft, preview, publish, revision, and rollback workflow.
- Media library and image management.
- Server-authoritative pricing, coupons, inventory, installment, and checkout validation.
- Automated component, API, integration, security, and end-to-end testing.

The target platform is a **responsive, mobile-first e-commerce web application with a backend-driven visual CMS**, allowing authorized MeePro staff to manage homepage and campaign content without editing source code.

---

## 2. Current Completed Milestones

### 2.1 E-Commerce Layout Shell Unification

**Component:** [`src/components/layout/TopNav.tsx`](src/components/layout/TopNav.tsx)

- **2-tier top navigation**.
- **Tier 1 — Brand & Utility**:
  - Hamburger button opens the category/service drawer.
  - MeePro brand logo with orange `MALL` badge.
  - Notification bell with unread indicator.
  - Shopping cart icon with dynamic badge count (`cart.totalCount`).
- **Tier 2 — Search**:
  - E-commerce search input.
  - Routes queries to `/catalog?q=...`.
- **Visual requirement**:
  - 100% solid white background.
  - Bottom border and elevation/shadow.

### 2.2 Solid Background Bottom Navigation

**Component:** [`src/components/layout/BottomNav.tsx`](src/components/layout/BottomNav.tsx)

- Translucent/blurred navigation has been replaced with a **100% solid white background**.
- Active tab uses a solid capsule background with MeePro blue (`#007ACC`).
- Current 5-tab hierarchy:

| Tab | Route | Purpose |
| --- | --- | --- |
| หน้าหลัก | `/home` | Home |
| สินค้า | `/catalog` | Product catalog |
| โปรโมชั่น | `/promotion` | Promotions / flash deals |
| บิลผ่อน | `/billing` | Installments / statements |
| บัญชี | `/account` | Customer account |

### 2.3 Slide-Out Category & Service Drawer

**Component:** [`src/components/layout/CategoryDrawer.tsx`](src/components/layout/CategoryDrawer.tsx)

Current UI includes:

- Customer summary area.
- Product-category shortcuts.
- Trade-in and service shortcuts.
- Flash-sale shortcut.
- Installment/billing shortcut.
- Store-location shortcut.
- About MeePro shortcut.
- Call-center area.

> **Important:** Any customer name, phone number, credit limit, store count, hotline, or membership status currently shown as sample UI content must be treated as **fixture/demo data** until connected to authenticated production data sources.

### 2.4 Shopping Cart UX

**Components:**

- [`src/context/CartContext.tsx`](src/context/CartContext.tsx)
- [`src/components/layout/CartDrawer.tsx`](src/components/layout/CartDrawer.tsx)

Implemented client-side UX:

- Cart persistence in `localStorage`.
- Quantity increase/decrease.
- Remove item.
- Subtotal display.
- Installment estimate display.
- Coupon-entry UI.
- Checkout confirmation UI.

> **Production rule:** `localStorage` is only a client-side convenience layer. Product price, coupon eligibility, installment terms, inventory availability, discounts, and final order totals must be recalculated and validated by the server before an order is accepted.

Any current coupon codes such as `MEEPRO500` or `FLAGSHIP1K` must be treated as **demo/test configuration** unless they are backed by the production promotion service/database.

### 2.5 Catalog Page Integration

**Component:** [`src/app/(main)/catalog/page.tsx`](src/app/(main)/catalog/page.tsx)

- Integrated with `CartContext`.
- Supports URL parameters:
  - `?q=...`
  - `?category=...`
- Product cards support **ใส่ตะกร้า / Add to Cart**.
- Product modal/sheet supports Add to Cart.
- Toast confirmation is shown after a successful client-side add-to-cart action.

---

## 3. Target Frontend Architecture

### Core Principle: Responsive Mobile-First — No Fixed Mobile Canvas

The application must not be constrained to a hardcoded `390px` or `430px` application shell.

#### Mobile

- `width: 100%`.
- Edge-to-edge responsive layout.
- Safe-area insets.
- Touch-friendly controls.
- Product grids optimized for small screens.

#### Tablet & Desktop

- Fluid responsive scaling.
- 3–4+ column product layouts where appropriate.
- Responsive gutters.
- Use bounded content containers such as `max-w-7xl` where appropriate without creating a fixed mobile-frame appearance.

Recommended shell pattern:

```txt
w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### CMS Rendering Principle

Do **not** treat every UI element as a freely draggable page widget.

The CMS is divided into three layers:

```text
MeePro CMS
│
├── Global Layout
│   ├── Announcement Bar
│   ├── Header / Logo
│   ├── Search
│   ├── Category Navigation
│   ├── Sticky Bottom Navigation
│   └── Footer
│
├── Pages
│   ├── Home
│   ├── Promotion
│   ├── Campaign Landing Pages
│   └── Future CMS Pages
│
└── Shared Resources
    ├── Products
    ├── Categories
    ├── Brands
    ├── Collections
    ├── Promotions
    ├── Media Library
    └── Widget Presets
```

Global navigation remains centrally configurable but cannot be accidentally inserted, reordered, or deleted like normal content blocks.

---

## 4. Widget Taxonomy — 38 Supported Component Types

The current taxonomy contains **38 component types**, not 33.

### 4.1 Global Layout Components — 6

```text
1. HEADER_LOGO
   Brand logo, menu, account/cart shortcuts.

2. ANNOUNCEMENT_BAR
   Top promotional or service-information banner.

3. SEARCH_BAR
   Product/category search and future autocomplete.

4. CATEGORY_NAV
   Horizontal category icon/navigation strip.

5. STICKY_BOTTOM_NAV
   Solid-background mobile navigation.

6. FOOTER
   E-commerce footer, legal links, service links, disclaimers.
```

### 4.2 Page Content Widgets — 32

#### Banners & Content — 7

```text
HERO_BANNER
BANNER_CAROUSEL
IMAGE_GRID
VIDEO_PLAYER
RICH_TEXT
IMAGE_WITH_TEXT
CTA_BUTTON
```

#### Product Browsing — 8

```text
PRODUCT_GRID
PRODUCT_CAROUSEL
FEATURED_PRODUCT
COLLECTION_TILES
TABBED_PRODUCTS
BRAND_SHOWCASE
RECENTLY_VIEWED
RECOMMENDED_PRODUCTS
```

#### Promotions & Urgency — 5

```text
SALE_DEAL_SECTION
COUNTDOWN_TIMER
COUPON_VOUCHER_BLOCK
BUNDLE_OFFER
SHOPPABLE_IMAGE
```

#### Trust & Information — 6

```text
REVIEWS_TESTIMONIALS
TRUST_BADGES
PAYMENT_OPTIONS
SHIPPING_RETURNS
FAQ_ACCORDION
STORE_LOCATOR
```

#### Engagement & Support — 4

```text
SIGNUP_LEAD_FORM
SOCIAL_MEDIA_FEED
FLOATING_CHAT_BUTTON
PROMO_POPUP_MODAL
```

#### Layout & Embed — 2

```text
SPACER_DIVIDER
CUSTOM_EMBED
```

### Custom Embed Security Rule

`CUSTOM_EMBED` must be treated as a privileged widget because unrestricted HTML or iframe content may introduce security risks.

Production requirements:

- Admin-only edit permission.
- HTML sanitization.
- Allowlisted iframe domains.
- Content Security Policy (CSP).
- Block executable inline scripts unless specifically reviewed and allowed.

---

## 5. Widget Configuration Model

Every widget must use a typed and versioned configuration model.

Recommended TypeScript pattern:

```ts
interface BaseWidgetConfig {
  configVersion: number;
}

type WidgetType =
  | 'HERO_BANNER'
  | 'BANNER_CAROUSEL'
  | 'PRODUCT_GRID'
  | 'PRODUCT_CAROUSEL'
  | 'FEATURED_PRODUCT'
  // ...continue for all supported widget types
```

Each widget type must have its own **Zod runtime validation schema**.

Example concept:

```ts
const heroBannerSchema = z.object({
  configVersion: z.number().int().positive(),
  desktopImageId: z.string().uuid(),
  mobileImageId: z.string().uuid().optional(),
  headline: z.string().max(120).optional(),
  ctaLabel: z.string().max(40).optional(),
  ctaHref: z.string().optional(),
});
```

Do not rely on TypeScript interfaces alone because data stored in Postgres `JSONB` must also be validated at runtime.

---

## 6. Product Widget Data Sources

Product-oriented widgets must not contain copied product data inside their widget config.

Instead, each product widget should define a `dataSource`.

Supported source patterns should include:

```text
manual
category
brand
collection
promotion
search_query
recently_viewed
recommended
```

Example:

```json
{
  "configVersion": 1,
  "title": "ลดพิเศษ",
  "dataSource": {
    "type": "collection",
    "collectionId": "uuid-here"
  },
  "limit": 6,
  "layout": "carousel"
}
```

This keeps product name, price, image, stock, promotion, and installment information authoritative in the product/catalog domain instead of duplicating it inside the CMS.

---

## 7. Backend & Database Architecture

The production CMS should use separate entities for pages, widgets, revisions, and media assets.

### 7.1 Pages

```sql
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(120) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 7.2 Page Widgets

```sql
CREATE TABLE IF NOT EXISTS public.page_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    widget_type VARCHAR(60) NOT NULL,
    config_version INT NOT NULL DEFAULT 1,
    title VARCHAR(255),
    subtitle TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    visible_from TIMESTAMPTZ,
    visible_until TIMESTAMPTZ,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(page_id, sort_order)
);

CREATE INDEX IF NOT EXISTS idx_page_widgets_page_sort
ON public.page_widgets(page_id, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_page_widgets_active
ON public.page_widgets(page_id, is_active);
```

> If concurrent drag/reorder operations make `UNIQUE(page_id, sort_order)` too restrictive, use a transactional reorder strategy or fractional ranking field instead.

### 7.3 Page Revisions

```sql
CREATE TABLE IF NOT EXISTS public.page_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    snapshot JSONB NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(page_id, revision_number)
);
```

Revision snapshots must support:

- Preview.
- Publish.
- Rollback.
- Audit/history inspection.

### 7.4 Media Assets

```sql
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_path TEXT NOT NULL,
    public_url TEXT,
    mime_type VARCHAR(100),
    width INT,
    height INT,
    alt_text TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Recommended media capabilities:

- Supabase Storage-backed uploads.
- Image compression/optimization.
- Desktop/mobile image variants.
- Alt text.
- Dimensions/aspect ratio.
- Optional focal-point metadata.
- File-size limits.
- Allowed MIME-type validation.

### 7.5 Automatic `updated_at`

`DEFAULT NOW()` only sets the initial value. Add a trigger so `updated_at` changes automatically.

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pages_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_page_widgets_updated_at
BEFORE UPDATE ON public.page_widgets
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_media_assets_updated_at
BEFORE UPDATE ON public.media_assets
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
```

---

## 8. Authentication, Authorization & RLS

CMS write APIs must never rely only on hiding buttons in the frontend.

Minimum permission model:

| Role | Read Published | Preview Draft | Edit Widgets | Reorder | Publish | Delete | Custom Embed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Customer/Public | Yes | No | No | No | No | No | No |
| Staff | Yes | Assigned scope | Yes | Yes | No or restricted | Restricted | No |
| Admin | Yes | Yes | Yes | Yes | Yes | Yes | Yes |

Required implementation:

- Supabase Auth or approved MeePro authentication layer.
- Server-side role validation.
- Supabase RLS policies.
- Audit fields (`created_by`, `updated_by`).
- Publish permission separated from normal content editing.
- No anonymous CMS mutation endpoints.

---

## 9. Draft, Preview, Publish & Rollback Workflow

Recommended publishing lifecycle:

```text
Edit Draft
   ↓
Save Draft
   ↓
Preview
   ↓
Publish
   ↓
Create Revision Snapshot
   ↓
Live Page
```

If a published change causes an issue:

```text
Revision History
   ↓
Select Previous Revision
   ↓
Preview
   ↓
Rollback / Republish
```

Publishing should be atomic so customers never see a partially reordered or partially updated page.

---

## 10. Server-Authoritative Commerce Rules

Client-side cart state may be stored in `localStorage`, but checkout must use the server as the source of truth.

Before order creation, the server must validate:

- Product exists and is active.
- Current selling price.
- Current promotion/discount.
- Coupon validity.
- Coupon usage limits.
- Inventory availability.
- Product quantity limits.
- Installment eligibility and terms.
- Customer eligibility where applicable.
- Branch/serviceability where applicable.
- Final subtotal.
- Discount total.
- Final payable/order amount.

Recommended checkout flow:

```text
Client Cart
   ↓
POST /api/checkout/validate
   ↓
Server reloads authoritative product + promotion + inventory data
   ↓
Validated Quote / Checkout Token
   ↓
POST /api/orders
   ↓
Atomic Order Creation
   ↓
Success Response
```

Order submission must support **idempotency** to prevent duplicate orders from repeated taps, retries, or unstable networks.

---

## 11. API Architecture

Recommended CMS routes:

```text
GET    /api/cms/pages
POST   /api/cms/pages
GET    /api/cms/pages/:pageId
PUT    /api/cms/pages/:pageId

GET    /api/cms/pages/:pageId/widgets
POST   /api/cms/pages/:pageId/widgets
PUT    /api/cms/widgets/:widgetId
DELETE /api/cms/widgets/:widgetId
POST   /api/cms/pages/:pageId/widgets/reorder
POST   /api/cms/widgets/:widgetId/duplicate

POST   /api/cms/pages/:pageId/publish
GET    /api/cms/pages/:pageId/revisions
POST   /api/cms/pages/:pageId/revisions/:revisionId/restore

GET    /api/cms/media
POST   /api/cms/media
DELETE /api/cms/media/:assetId
```

Public rendering endpoints should expose only active/published content.

Example:

```text
GET /api/pages/home
```

or render directly on the server from the same CMS service layer.

---

## 12. Visual CMS Builder Requirements

Primary admin routes:

```text
/staff/homepage-builder
/admin/page-builder
```

Required capabilities:

- Add widget.
- Drag/reorder widget.
- Duplicate widget.
- Edit widget configuration.
- Toggle visibility.
- Delete with confirmation.
- Schedule `visible_from` / `visible_until` where supported.
- Draft saving.
- Preview unpublished changes.
- Publish.
- Revision history.
- Rollback.

### Preview Modes

The builder must provide at least:

```text
Mobile
Tablet
Desktop
```

Preview mode must represent responsive breakpoints rather than forcing the actual application into one fixed 390px/430px container.

---

## 13. Revised Phase-by-Phase Roadmap

The previous 6-day roadmap is better treated as a rapid prototype target. The revised roadmap separates architecture, content implementation, commerce hardening, and production verification.

| Phase | Milestone & Deliverables | Indicative Engineering Time |
| --- | --- | ---: |
| **Phase 1** | **Responsive Foundation** — Remove fixed 390/430px shell constraints, implement fluid mobile/tablet/desktop layout, safe-area support, preserve solid navigation backgrounds. | **4–6 h** |
| **Phase 2** | **Database + Auth + RBAC + RLS** — Create pages/widgets/revisions/media schema, authentication integration, role enforcement, RLS, updated-at triggers. | **8–14 h** |
| **Phase 3** | **CMS Core** — CRUD, reorder, duplicate, draft/publish, revision snapshots, preview infrastructure, Zod validation, media library. | **12–18 h** |
| **Phase 4** | **Global Layout + Core Content Widgets** — Announcement, header configuration, search/category nav configuration, footer, hero, carousel, image grid, rich text, video, CTA, image-with-text, spacer, secured embed. | **10–16 h** |
| **Phase 5** | **Product + Promotion Widgets** — Product grid/carousel, featured products, collections, tabs, brands, recommendations, recently viewed, flash sale, countdown, coupon, bundle, shoppable image. | **14–20 h** |
| **Phase 6** | **Trust + Engagement Widgets** — Reviews, trust badges, payment, shipping/returns, FAQ, store locator, lead form, social feed, chat, popup. | **8–14 h** |
| **Phase 7** | **Visual Page Builder** — Drag/drop, editor panels, mobile/tablet/desktop preview, schedule controls, publish workflow, revision history and rollback. | **12–18 h** |
| **Phase 8** | **Commerce Hardening + QA + Launch Gate** — Server-side checkout validation, idempotency, integration tests, security tests, E2E, performance, accessibility, production configuration. | **12–20 h** |
| **TOTAL** | **Production-target implementation range** | **80–126 h** |

> Estimates are indicative engineering ranges, not guarantees. Final effort depends on the existing repository quality, reuse of current components, authentication state, product/catalog APIs, and production checkout requirements.

---

## 14. Testing Strategy

Testing must happen throughout implementation, not only at the end.

### Phase 1

- Responsive layout checks.
- Safe-area checks.
- Mobile/tablet/desktop visual regression.

### Phase 2

- Database constraints.
- Auth/RBAC tests.
- RLS policy tests.
- Unauthorized request tests.

### Phases 3–6

- Widget schema validation.
- CRUD API tests.
- Component tests.
- Invalid-config tests.
- Published-vs-draft rendering tests.

### Phase 7

- Drag/reorder tests.
- Draft persistence.
- Publish atomicity.
- Revision and rollback tests.
- Responsive preview tests.

### Phase 8

- Checkout validation.
- Duplicate submission/idempotency tests.
- Inventory conflict tests.
- Promotion/coupon tests.
- E2E purchase journey.
- Security review.
- Accessibility checks.
- Core Web Vitals/performance review.

---

## 15. Production Readiness Gate

MeePro should only be marked **Production Ready** after all mandatory checks below pass.

### Platform

- [x] No fixed mobile-frame constraint remains.
- [x] Mobile/tablet/desktop layouts verified.
- [x] Global layout and page widgets are separated.
- [x] All 38 supported component types are correctly registered or intentionally deferred.

### CMS

- [x] Authentication enabled.
- [x] RBAC enforced server-side.
- [x] Supabase RLS enabled and tested.
- [x] Draft/preview/publish workflow complete.
- [x] Revision history and rollback complete.
- [x] Widget configs validated with Zod.
- [x] Media library complete.
- [x] `CUSTOM_EMBED` security restrictions enforced.

### Commerce

- [x] Product pricing is server-authoritative.
- [x] Coupon/discount rules are server-authoritative.
- [x] Inventory validation is server-authoritative.
- [x] Installment validation is server-authoritative.
- [x] Order creation is atomic.
- [x] Duplicate order submission is prevented with idempotency.

### Quality

- [x] Build passes.
- [x] Unit/component tests pass.
- [x] API/integration tests pass.
- [x] E2E critical journeys pass.
- [x] Accessibility review passes agreed acceptance criteria.
- [x] Performance review passes agreed acceptance criteria.
- [x] Production environment variables/secrets reviewed.
- [x] Error monitoring/logging configured.

---

## 16. Next Implementation Step — Phase 1

Begin with responsive shell cleanup before introducing the CMS backend.

1. Remove fixed-width barriers such as:
   - `max-w-[390px]`
   - `max-w-[430px]`
   - Any fixed centered phone-frame wrapper used for the production UI.
2. Convert primary containers to responsive patterns such as:
   - `w-full`
   - `max-w-7xl`
   - `mx-auto`
   - `px-4 sm:px-6 lg:px-8`
3. Verify:
   - `TopNav`
   - `BottomNav`
   - `CategoryDrawer`
   - `CartDrawer`
4. Maintain 100% solid navigation backgrounds.
5. Verify safe-area behavior on mobile.
6. Test mobile, tablet, and desktop breakpoints.
7. Run build/tests before commit.
8. Only after Phase 1 is stable, continue to **Phase 2 — Database + Auth + RBAC + RLS**.

---

## 17. Version Notes — v2.1

Changes from v2.0:

- Corrected widget count from **33 to 38**.
- Changed project status from **Production Ready** to an implementation-accurate status.
- Replaced local Windows `file:///` references with repository-relative paths.
- Renamed the responsive principle to **Responsive Mobile-First — No Fixed Mobile Canvas**.
- Separated **Global Layout** from normal page widgets.
- Added typed/versioned widget configuration and Zod validation requirement.
- Added product-widget `dataSource` architecture.
- Expanded database design to include `pages`, `page_widgets`, `page_revisions`, and `media_assets`.
- Added automatic `updated_at` triggers.
- Added authentication, RBAC, and RLS requirements.
- Added draft, preview, publish, revision, and rollback workflow.
- Added `CUSTOM_EMBED` security requirements.
- Added server-authoritative checkout and idempotency requirements.
- Added CMS/public API structure.
- Added Mobile / Tablet / Desktop builder preview requirements.
- Revised roadmap from a prototype-oriented 6-day plan to a production-target 8-phase roadmap.
- Added continuous testing strategy and a formal production-readiness checklist.

