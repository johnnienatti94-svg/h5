# MeePro Mobile Customer Website Specification
**Version:** v1.1  
**Status:** Completed & Verified  
**Date:** 2026-09-21  

---

## 1. Overview

Build a **mobile-first customer website** for MeePro.

The system supports:

- **Customer frontend**: Mobile-first web app (max-width 480px, centered on larger displays).
- **Staff backend**: In-store POS and operations portal (`/staff`).
- **Developer/Admin backend**: Security, telemetry, configuration, and audit console (`/admin`).
- **Phone number + OTP authentication**: Uniform login/registration flow with PDPA consent and bot verification.
- **Editable e-commerce style homepage**: Dynamic widget-driven architecture.
- **Product catalog**: Instant keyword search, category pills, brand & price filters, product detail sheet.
- **Promotion page**: Flash sale countdown clock, 0% installment bank cards, claimable coupon vouchers.
- **Branch location page**: Store locator by region with opening hours, transit guide, and one-tap call/maps.
- **Customer account page**: Verified phone display, Gold tier badge, points balance, orders tracking, and logout.

The customer interface feels like a modern mobile application rather than a desktop website resized for mobile.

---

# 2. Customer Login / Registration Landing Page

## Page Structure

```text
[ MEEPRO LOGO ]

[ 1:1 BANNER SLIDER ]

เข้าสู่ระบบ / ลงทะเบียน

เข้าสู่ระบบด้วยเบอร์มือถือ

[ 0xx-xxx-xxxx ]

☐ ข้าพเจ้ายอมรับนโยบายความเป็นส่วนตัว

[ Human / Bot Verification ]

[ กดรับ OTP ]

🛡 ข้อมูลของคุณจะถูกจัดเก็บอย่างปลอดภัย
   และได้รับการดูแลตามนโยบายความเป็นส่วนตัว
```

---

## 2.1 Logo

- Display MeePro logo at the top center.
- Maintain the original aspect ratio.
- Recommended maximum width: 140–180px.
- Logo is editable from Staff/Admin backend.

---

## 2.2 Landing Page Banner

Use a swipeable banner slider.

Recommended image:

```text
1040 × 1040 px
Ratio 1:1
```

Features:

- Swipe left/right
- Auto slide
- Pagination dots
- Multiple banners
- Clickable destination
- Enable / Disable
- Start date / End date
- Reorder banners

---

# 3. Phone Number Authentication

Both existing and new customers follow **exactly the same process**.

Do not show:

- Existing Customer
- New Customer
- Login vs Register selection

Customer sees only:

```text
เข้าสู่ระบบ / ลงทะเบียน
```

Flow:

```text
Enter Mobile Number
        ↓
Accept PDPA
        ↓
Human Verification
        ↓
Request OTP
        ↓
Enter OTP
        ↓
OTP Verified
        ↓
Customer Access
```

---

## 3.1 Phone Number Input

Placeholder:

```text
0xx-xxx-xxxx
```

Example:

```text
089-123-4567
```

Store normalized value internally:

```text
0891234567
```

Validation:

- Numbers only
- 10 digits
- Must begin with 0 (e.g. 06, 08, 09)

Invalid message:

```text
กรุณากรอกเบอร์มือถือให้ถูกต้อง
```

---

# 4. Remember Customer Phone Number

After OTP verification, the system remembers the verified phone number.

The phone number connects the customer session with the MeePro customer database.

Stored fields:

```text
phone: 0891234567
phone_verified: true
phone_verified_at: timestamp
```

The phone number is used as the customer's main lookup key.

---

# 5. PDPA Consent

Before OTP can be requested, the customer must check:

```text
☐ ข้าพเจ้ายอมรับนโยบายความเป็นส่วนตัว
```

**นโยบายความเป็นส่วนตัว** is clickable and opens as a mobile modal/bottom sheet without forcing the customer to leave the page.

Store:

- Phone number
- Consent version
- Consent timestamp
- Privacy Policy version
- User agent where appropriate

---

# 6. Human / Bot Verification

Add bot protection before the OTP request button:

```text
ยืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ
```

Implementation:
- Cloudflare Turnstile / reCAPTCHA simulator with interactive verification state.

Flow:

```text
Valid Phone Number
        +
PDPA Accepted
        +
Human Verification Passed
        ↓
Enable กดรับ OTP
```

---

# 7. OTP Screen

Button:

```text
กดรับ OTP
```

Verification Screen:

```text
กรอกรหัส OTP

รหัส OTP ถูกส่งไปยัง
089-xxx-4567

[ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ]

ส่ง OTP อีกครั้งได้ใน 60 วินาที
```

Features:
- 6-digit OTP individual boxes
- Auto focus and advance
- Paste support
- Numeric keyboard (`inputMode="numeric"`)
- 60s countdown cooldown
- Resend button

---

# 8. Security Message

Display a shield icon with:

```text
🛡 ข้อมูลของคุณจะถูกจัดเก็บอย่างปลอดภัย
   และได้รับการดูแลตามนโยบายความเป็นส่วนตัว
```

---

# 9. Customer Homepage Widget Architecture

The homepage is driven by an **editable widget-based e-commerce layout**:

```text
Homepage
│
├── Customer Greeting (Points & Tier)
├── Hero Banner (3:1 Aspect Ratio)
├── Category Grid (6 Quick Links)
├── Product Showcase 1 (ลดพิเศษ — 2x3 Carousel)
├── Campaign Highlight Banner (0% Installment)
├── Product Showcase 2 (สินค้าแนะนำ — 2x3 Carousel)
└── Brand Showcase (Partner Brands)
```

Each widget contains:
- `id`: Unique identifier (e.g. `HOME-0001`)
- `type`: `HERO_BANNER`, `PRODUCT_SHOWCASE`, `CATEGORY_GRID`, `CAMPAIGN_BANNER`, `BRAND_SHOWCASE`, `CUSTOMER_GREETING`
- `title`: Editable section title
- `sortOrder`: Sequence integer
- `isActive`: Boolean flag
- `settings`: Widget-specific parameters

---

# 10. Fixed Bottom Navigation

Fixed five-tab navigation across the customer portal:

```text
/home       (Home)
/catalog    (Catalog)
/promotion  (Promotion)
/location   (Location)
/account    (Account)
```

Requirements:
- Fixed to bottom with backdrop blur
- Active tab indicator
- iOS safe-area inset padding
- Maximum width 480px, centered on tablet/desktop

---

# 11. Staff Backend (`/staff`)

Dedicated staff operations portal:

- **Authentication**: Staff login with Staff ID & PIN (`staff01` / PIN `1234`, `manager01` / PIN `8888`).
- **Dashboard**: Store metrics, active contracts, and widget counts.
- **Customer Lookup (CRM)**: Search customer by verified phone number (`089-123-4567`), view PDPA consent timestamp, points, active 0% installment contracts, and staff consultation notes.
- **Homepage Builder**: Live widget reordering, enable/disable toggles, and section title editing.
- **Banner Manager**: 3:1 hero banner & campaign management with publish schedule, target links, click counts, and status toggles.

---

# 12. Admin / Developer Backend (`/admin`)

Security and operations console:

- **Authentication**: Security login (`admin01` / PIN `9999`, `dev01` / PIN `7777`).
- **Telemetry Dashboard**: System Uptime (99.99%), P95 latency (42ms), active sessions, OTP gateway success (99.8%).
- **System & OTP Configuration**: Gateway provider selection (Mock, ThaiBulkSMS, Twilio, AWS SNS), OTP expiration/cooldown, bot check sensitivity.
- **Maintenance Mode**: One-click maintenance switch with custom broadcast announcement banner.
- **Role-Based Access Control (RBAC)**: Complete matrix across all 5 roles (`CUSTOMER`, `STAFF`, `MANAGER`, `ADMIN`, `DEVELOPER`).
- **Observability Logs**: Unified log viewer with category filters (API, Webhook, Audit, Error) and JSON export.

---

# 13. Comprehensive Route Directory (19 Routes)

```text
/
├── (auth)
│   └── /login                   ← Authentication landing & OTP flow
├── (main)
│   ├── /home                    ← Customer homepage & widget engine
│   ├── /catalog                 ← Product catalog & search
│   ├── /promotion               ← Promotions, deals & flash sales
│   ├── /location                ← Store locator & maps
│   └── /account                 ← Customer account & logout
├── /staff
│   ├── /staff/login             ← Staff portal authentication
│   ├── /staff/dashboard         ← Staff store operations dashboard
│   ├── /staff/customer-lookup   ← CRM customer lookup by phone
│   ├── /staff/homepage-builder  ← Live homepage widget builder
│   └── /staff/banners           ← Banner & campaign manager
└── /admin
    ├── /admin/login             ← Admin/developer console login
    ├── /admin/dashboard         ← System telemetry & maintenance switch
    ├── /admin/system-config     ← OTP gateway & bot check settings
    ├── /admin/roles             ← Role-based permission matrix (RBAC)
    └── /admin/logs              ← Observability & audit logs
```

---

# 14. Production Deployment & Containerization Guide

### 14.1 Environment Variables (`.env.production`)
```bash
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://meepro.co.th
NEXT_PUBLIC_OTP_GATEWAY=ThaiBulkSMS
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAA...
JWT_SECRET=your-super-secure-production-jwt-secret
```

### 14.2 Dockerfile
```dockerfile
# Multi-stage production build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

### 14.3 Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name meepro.co.th www.meepro.co.th;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name meepro.co.th www.meepro.co.th;

    ssl_certificate /etc/letsencrypt/live/meepro.co.th/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/meepro.co.th/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
