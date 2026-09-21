# MeePro Mobile Customer Website Specification

## 1. Overview

Build a **mobile-first customer website** for MeePro.

The system should support:

- Customer frontend
- Staff backend
- Developer/Admin backend
- Phone number + OTP authentication
- Editable e-commerce style homepage
- Product catalog
- Promotion page
- Branch location page
- Customer account page

The customer interface should feel like a modern mobile application rather than a desktop website resized for mobile.

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
- Logo should be editable from Staff/Admin backend.

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
- Start date
- End date
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
- Must begin with 0

Invalid message:

```text
กรุณากรอกเบอร์มือถือให้ถูกต้อง
```

---

# 4. Remember Customer Phone Number

After OTP verification, the system should remember the verified phone number.

The phone number will later be used to connect the customer session with the MeePro customer database.

Recommended fields:

```text
phone: 0891234567
phone_verified: true
phone_verified_at: timestamp
```

The phone number can be used as the customer's main lookup key.

Future database flow:

```text
Verified Phone Number
        ↓
Search Customer Database
        ↓
Matching Record Found
        ↓
Link Customer Record
```

If no database record exists, retain the verified phone number so a record can be linked or created later.

The remembered phone number alone must not be treated as authentication. Customer authentication should depend on the secure session created after OTP verification.

---

# 5. PDPA Consent

Before OTP can be requested, the customer must check:

```text
☐ ข้าพเจ้ายอมรับนโยบายความเป็นส่วนตัว
```

**นโยบายความเป็นส่วนตัว** must be clickable.

Recommended behavior:

- Open Privacy Policy as modal or bottom sheet.
- Do not force customer to leave the login page.

Store:

- Phone number
- Consent version
- Consent timestamp
- Privacy Policy version
- User agent where appropriate

---

# 6. Human / Bot Verification

Add bot protection before the OTP request button.

Recommended wording:

```text
ยืนยันว่าคุณไม่ใช่โปรแกรมอัตโนมัติ
```

Recommended implementation:

- Cloudflare Turnstile
- reCAPTCHA
- Equivalent server-validated bot protection

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

Verification must also be validated by the backend before requesting OTP.

---

# 7. OTP

Button:

```text
กดรับ OTP
```

Enable only when:

```text
Valid Phone Number ✅
PDPA Accepted ✅
Human Verification ✅
```

After OTP is sent:

```text
กรอกรหัส OTP

รหัส OTP ถูกส่งไปยัง
089-xxx-4567

[ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ]

ส่ง OTP อีกครั้งได้ใน 60 วินาที
```

Recommended:

- 6-digit OTP
- Auto focus
- Support paste
- Numeric keyboard
- Auto verify after all digits entered
- Resend cooldown
- Server-side OTP validation
- Rate limiting
- OTP expiry
- Brute-force protection

---

# 8. Security Message

Display a shield icon with:

```text
🛡 ข้อมูลของคุณจะถูกจัดเก็บอย่างปลอดภัย
   และได้รับการดูแลตามนโยบายความเป็นส่วนตัว
```

Avoid making an absolute statement that customer data will never be shared with third parties, because external service providers may be required for OTP, hosting, payments, analytics, or other processing.

---

# 9. Customer Homepage

The homepage should use an **editable widget-based e-commerce landing page**.

Staff/Admin should be able to:

- Add widgets
- Remove widgets
- Hide/show widgets
- Reorder widgets
- Rename section titles
- Change content
- Change images
- Select products
- Schedule publishing
- Preview before publishing

Do not hard-code the homepage layout.

---

# 10. Top Navigation

Use a sticky top navigation.

```text
┌──────────────────────────────┐
│ ☰   [ MEEPRO LOGO ]         │
└──────────────────────────────┘
```

Left side:

- Menu icon
- MeePro logo

Recommended height:

```text
56–64px
```

---

# 11. Homepage Main Banner

Place directly underneath the top navigation.

Recommended source image:

```text
3000 × 1000 px
Ratio 3:1
```

Example:

```text
┌──────────────────────────────┐
│                              │
│      PROMOTION BANNER        │
│                              │
└──────────────────────────────┘
           ● ○ ○
```

Features:

- Swipe left/right
- Auto slide
- Pagination dots
- Multiple banners
- Clickable destination
- Start/end publish date
- Enable/disable
- Reorder banners
- Responsive rendering

---

# 12. Product Showcase

Default section title:

```text
ลดพิเศษ
```

The title must be editable.

Examples:

- ลดพิเศษ
- สินค้าแนะนำ
- โปรแรงวันนี้
- ขายดี
- สินค้าใหม่

---

## 12.1 Product Showcase Layout

Use:

```text
2 products per slide
×
3 slides
=
6 products
```

Example:

```text
ลดพิเศษ                    ดูทั้งหมด >

┌─────────────┐ ┌─────────────┐
│ Product Img │ │ Product Img │
│             │ │             │
│ Product     │ │ Product     │
│ Name        │ │ Name        │
│ ฿XX,XXX     │ │ ฿XX,XXX     │
└─────────────┘ └─────────────┘

            ● ○ ○
```

Users swipe horizontally through three slides.

---

## 12.2 Product Card

Each product card may display:

- Product image
- Product name
- Normal price
- Promotional price
- Discount badge
- Installment information
- Product detail link

Products should later connect directly to the MeePro product database.

---

# 13. Homepage Widget Architecture

Recommended structure:

```text
Homepage
│
├── Main Banner
├── ลดพิเศษ
├── Product Showcase
├── Campaign Banner
├── Brand Showcase
├── Promotion
├── New Products
└── Other Widgets
```

Each widget should contain fields similar to:

```text
widget_id
widget_type
title
sort_order
status
start_at
end_at
settings
```

Example:

```text
widget_id: HOME-0002
widget_type: PRODUCT_SHOWCASE
title: ลดพิเศษ
sort_order: 2
status: ACTIVE
```

---

# 14. Homepage Builder

Staff/Admin should have a drag-and-drop homepage builder.

Example:

```text
Homepage Builder

☰ Hero Banner
☰ ลดพิเศษ
☰ โปรโมชั่นผ่อน
☰ สินค้าใหม่
☰ Brand
☰ Campaign Banner
```

Allow:

- Drag to reorder
- Enable/disable
- Edit
- Duplicate widget
- Delete widget
- Preview
- Publish

---

# 15. Fixed Bottom Navigation

Use a fixed five-tab navigation across the main customer website.

Order:

```text
Home
Catalog
Promotion
Location
Account
```

Mobile layout:

```text
┌────────────────────────────────────────┐
│                                        │
│             PAGE CONTENT               │
│                                        │
├────────────────────────────────────────┤
│  🏠      ▦       %       📍       👤   │
│ Home  Catalog Promotion Location Account│
└────────────────────────────────────────┘
```

Recommended routes:

```text
/home
/catalog
/promotion
/location
/account
```

Requirements:

- Fixed to bottom
- Visible during scrolling
- Active tab highlighted
- Icon + text
- Mobile safe-area support
- Must not cover page content
- Minimum touch-friendly size
- Approximate height 64–72px

---

# 16. Home Tab

Route:

```text
/home
```

Purpose:

- Main banners
- Featured products
- Campaigns
- Promotional widgets
- Curated product collections
- Editable homepage widgets

---

# 17. Catalog Tab

Route:

```text
/catalog
```

Purpose:

- Browse all products
- Search products
- Browse by category
- Apply filters
- Open product details

Recommended structure:

```text
Catalog

[ Search products... ]

Categories
[ iPhone ] [ Android ]
[ Tablet ] [ Accessories ]
[ Used ] [ Other ]

Filters
- Brand
- Category
- Condition
- Price
- Promotion

Products

┌─────────────┐ ┌─────────────┐
│ Product Img │ │ Product Img │
│ Product     │ │ Product     │
│ ฿XX,XXX     │ │ ฿XX,XXX     │
└─────────────┘ └─────────────┘
```

Catalog should connect to the same product database used by homepage widgets.

---

# 18. Promotion Tab

Route:

```text
/promotion
```

Purpose:

- Current promotions
- Special offers
- Installment promotions
- Campaigns
- Promotional products

---

# 19. Location Tab

Route:

```text
/location
```

Purpose:

- MeePro branch list
- Branch name
- Address
- Opening hours
- Phone number
- Available services
- Map
- Directions

---

# 20. Account Tab

Route:

```text
/account
```

Purpose:

- Verified mobile number
- Customer profile
- Personal information
- Transactions / Orders
- Notifications
- Privacy settings
- Logout

The verified phone number from the OTP flow should automatically be associated with the customer session.

---

# 21. Customer Homepage Layout

```text
┌──────────────────────────────┐
│ ☰   MEEPRO                   │
├──────────────────────────────┤
│                              │
│      BANNER SLIDER           │
│                              │
│          ● ○ ○               │
├──────────────────────────────┤
│ ลดพิเศษ            ดูทั้งหมด >│
│                              │
│ ┌──────────┐ ┌──────────┐   │
│ │ Product  │ │ Product  │   │
│ │    1     │ │    2     │   │
│ └──────────┘ └──────────┘   │
│                              │
│          ● ○ ○               │
├──────────────────────────────┤
│                              │
│   OTHER EDITABLE WIDGETS     │
│                              │
├──────────────────────────────┤
│ 🏠   ▦     %      📍      👤 │
│Home Catalog Promo Location Account│
└──────────────────────────────┘
```

---

# 22. Staff Backend

Staff backend should eventually support:

- Customer lookup
- Banner management
- Homepage widget management
- Product showcase management
- Promotion management
- Branch/location management
- Product selection
- Customer records
- Reports
- Publishing controls

---

# 23. Developer / Admin Backend

Developer/Admin backend should support:

- System configuration
- API configuration
- OTP provider configuration
- Roles and permissions
- API logs
- Webhook logs
- Audit logs
- Error logs
- Homepage configuration
- System content
- Maintenance mode
- Integration settings

---

# 24. Roles

Suggested roles:

```text
CUSTOMER
STAFF
MANAGER
ADMIN
DEVELOPER
```

All permissions must be validated server-side.

Do not rely only on hiding frontend buttons.

Protected operations should validate:

```text
Authentication
+
Role
+
Permission
```

---

# 25. Mobile UX Requirements

Customer frontend should:

- Be designed mobile-first
- Feel like a native mobile app
- Avoid horizontal page scrolling
- Use large touch targets
- Support mobile keyboards
- Respect iPhone safe areas
- Work correctly on Android
- Keep bottom navigation visible
- Use responsive images
- Use loading states
- Use clear error states
- Use fast page transitions
- Keep customer experience simple and clean

Recommended maximum content width on larger screens:

```text
480px
```

Desktop can center the mobile customer interface instead of stretching it across the screen.

---

# 26. Current Main Customer Journey

```text
Open Website
      ↓
Landing Page
      ↓
Enter Phone Number
      ↓
Accept PDPA
      ↓
Human Verification
      ↓
Request OTP
      ↓
Verify OTP
      ↓
Authenticated Session
      ↓
Customer Homepage
      ↓
┌─────────┬─────────┬───────────┬──────────┬─────────┐
│ Home    │ Catalog │ Promotion │ Location │ Account │
└─────────┴─────────┴───────────┴──────────┴─────────┘
```

The system should remember the verified phone number so it can later be linked to the MeePro customer database.
