# MeePro Design System & Tokens

> **Target:** `/ai-docs/DESIGN_SYSTEM.md`  
> **Source:** `src/app/globals.css`, Tailwind v4 configuration, and component styles

---

## 1. Color Palette & Brand Tokens

| Token Name | Hex Code | Role & Usage |
| :--- | :--- | :--- |
| **Brand Primary (Navy)** | `#142B4A` | Primary headers, navigation background, active state pills |
| **Brand Action (Orange)** | `#FF6E00` | Primary CTA buttons, installment badges, price highlights |
| **Brand Accent (Blue)** | `#007ACC` | Interactive links, secondary chips, informative highlights |
| **Success Emerald** | `#10B981` / `#059669` | 0% interest badges, in-stock pills, positive toasts |
| **Warning Amber** | `#F59E0B` / `#D97706` | Pre-created / scheduled campaigns, low stock alerts |
| **Danger Rose** | `#F43F5E` / `#E11D48` | Delete buttons, out-of-stock badges, error banners |
| **Slate Neutrals** | `#F8FAFC` to `#0F172A` | Background fills, border dividers, body copy, subtle cards |

---

## 2. Typography & Thai-First Font Stacks

- **Primary Font Family**:
  ```css
  font-family: var(--font-inter), 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  ```
- **Scale**:
  - `text-2xl` (24px, font-extrabold): Page main titles (`<h1>`)
  - `text-base` / `text-lg` (16–18px, font-bold): Card headlines, product titles
  - `text-sm` (14px): Standard navigation, form labels, table cells
  - `text-xs` (12px): Secondary metadata, timestamps, badge labels
  - `text-[11px]` / `text-[10px]`: Micro-labels, SKU / slug identifiers

---

## 3. Responsive Breakpoints & Safe Areas

| Breakpoint | Target Viewport | Layout Adaptation |
| :--- | :--- | :--- |
| **Mobile Compact** | `320px` – `375px` | Single-column, full-bleed cards, bottom sticky navigation |
| **Mobile Standard** | `390px` (iPhone 14/15/16) | Standard mobile presentation, touch target padding (min 44px) |
| **Tablet** | `768px` (iPad / Portrait) | 2-column grids, sidebar drawer navigation |
| **Desktop** | `1024px` – `1440px` | 3 to 4-column product grids, persistent header nav, dual-pane modals |

---

## 4. Standard Reusable UI Components

- **Button Tokens**:
  - Primary Action: `bg-[#FF6E00] hover:bg-[#e56300] text-white font-bold rounded-xl shadow-xs transition-colors`
  - Secondary / Outline: `border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl`
  - Danger / Delete: `border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg`
- **Modal Dialogs**:
  - Fixed centered backdrop: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4`
  - Container: `bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto`
- **Badges**:
  - Active: `px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold`
  - Scheduled: `px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold`
  - Expired: `px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold`
