-- ===========================================================================
-- MeePro Trade-In Valuation & Cash Offer Schema Migration
-- Migration: 20260929100000_tradein_valuation_system.sql
-- ===========================================================================

begin;

-- 1. Trade-In 6-Field Hierarchy Catalog Tables
create table if not exists public.tradein_categories (
  id text primary key,
  slug text not null unique,
  name text not null,
  icon_name text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tradein_brands (
  id text primary key,
  slug text not null unique,
  name text not null,
  logo_url text,
  category_ids jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tradein_models (
  id text primary key,
  slug text not null unique,
  name text not null,
  category_id text not null references public.tradein_categories(id) on delete restrict,
  brand_id text not null references public.tradein_brands(id) on delete restrict,
  image_url text not null,
  supported_features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Step 4: Storage only
create table if not exists public.tradein_storages (
  id text primary key,
  name text not null,
  label text not null,
  size_value_gb integer not null check (size_value_gb > 0),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Step 5: Color
create table if not exists public.tradein_colors (
  id text primary key,
  name text not null,
  label text not null,
  hex_code text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Step 6: Market Variant
create table if not exists public.tradein_market_variants (
  id text primary key,
  code text not null unique,
  name text not null,
  label text not null,
  adjustment_type text not null default 'NONE' check (adjustment_type in ('NONE', 'PERCENTAGE', 'FIXED')),
  adjustment_value numeric not null default 0,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Supported Combinations and Base Buyback Prices
create table if not exists public.tradein_configurations (
  id text primary key,
  model_id text not null references public.tradein_models(id) on delete restrict,
  storage_option_id text not null references public.tradein_storages(id) on delete restrict,
  color_option_id text not null references public.tradein_colors(id) on delete restrict,
  market_variant_option_id text not null references public.tradein_market_variants(id) on delete restrict,
  base_buyback_price_minor integer not null check (base_buyback_price_minor >= 0),
  image_url text,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (model_id, storage_option_id, color_option_id, market_variant_option_id)
);

-- 2. Assessment Topics, Answer Options, and Deduction Rules
create table if not exists public.tradein_assessment_topics (
  id text primary key,
  title text not null,
  subtitle text,
  is_required boolean not null default true,
  is_multi_select boolean not null default false,
  applicable_category_ids jsonb not null default '[]'::jsonb,
  applicable_model_ids jsonb not null default '[]'::jsonb,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tradein_assessment_options (
  id text primary key,
  topic_id text not null references public.tradein_assessment_topics(id) on delete cascade,
  label text not null,
  description text,
  is_exclusive boolean not null default false,
  requires_evidence boolean not null default false,
  requires_details boolean not null default false,
  adjustment_type text not null check (
    adjustment_type in ('NO_DEDUCTION', 'FIXED', 'PERCENTAGE', 'REPAIR_DEDUCTION', 'MANUAL_ASSESSMENT', 'HOLD_OR_REJECT')
  ),
  adjustment_value numeric not null default 0,
  overlap_group text,
  manual_review_required boolean not null default false,
  eligibility_hold boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Trade-In Applications, Appointments, and Audit Events
create table if not exists public.tradein_applications (
  id text primary key,
  reference text not null unique,
  customer_id uuid not null references public.customer_profiles(user_id) on delete restrict,
  status text not null check (status in (
    'DRAFT', 'ESTIMATED', 'MANUAL_ASSESSMENT_REQUIRED', 'SUBMITTED', 'NEEDS_INFO',
    'UNDER_REVIEW', 'APPOINTMENT_CONFIRMED', 'INSPECTED', 'FINAL_OFFER_READY',
    'ACCEPTED', 'PAYMENT_PENDING', 'COMPLETED', 'DECLINED', 'CANCELLED', 'EXPIRED'
  )),
  revision integer not null default 1 check (revision > 0),
  contact_name text not null,
  verified_phone text not null check (verified_phone ~ '^\+[1-9][0-9]{7,14}$' or verified_phone ~ '^0[689][0-9]{8}$'),
  national_id_masked text,
  address text,
  device_selection jsonb not null,
  device_display_summary jsonb not null,
  declared_answers jsonb not null,
  quote_snapshot jsonb not null,
  inspected_answers jsonb,
  final_offer_snapshot jsonb,
  accepted_offer_revision integer,
  customer_decision text check (customer_decision in ('ACCEPTED', 'DECLINED')),
  customer_decision_at timestamptz,
  imei_or_serial text,
  evidence_files jsonb not null default '[]'::jsonb,
  appointment jsonb,
  handover_checklist jsonb,
  payment_record jsonb,
  idempotency_key text,
  customer_note text,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists tradein_applications_customer_idempotency_idx
  on public.tradein_applications (customer_id, idempotency_key)
  where idempotency_key is not null;

create index if not exists tradein_applications_customer_idx
  on public.tradein_applications (customer_id, created_at desc);

create table if not exists public.tradein_application_events (
  id text primary key default gen_random_uuid()::text,
  application_id text not null references public.tradein_applications(id) on delete cascade,
  actor_kind text not null check (actor_kind in ('CUSTOMER', 'STAFF', 'SYSTEM')),
  actor_id text,
  actor_name text,
  event_type text not null,
  from_status text,
  to_status text,
  customer_visible boolean not null default true,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tradein_events_app_idx
  on public.tradein_application_events (application_id, created_at desc);

create table if not exists public.tradein_branch_capacities (
  branch_id uuid primary key references public.branches(id) on delete cascade,
  max_slots_per_hour integer not null default 4 check (max_slots_per_hour > 0),
  open_hour integer not null default 10 check (open_hour >= 0 and open_hour <= 23),
  close_hour integer not null default 21 check (close_hour >= 0 and close_hour <= 23),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Enable Row Level Security (RLS)
alter table public.tradein_categories enable row level security;
alter table public.tradein_brands enable row level security;
alter table public.tradein_models enable row level security;
alter table public.tradein_storages enable row level security;
alter table public.tradein_colors enable row level security;
alter table public.tradein_market_variants enable row level security;
alter table public.tradein_configurations enable row level security;
alter table public.tradein_assessment_topics enable row level security;
alter table public.tradein_assessment_options enable row level security;
alter table public.tradein_applications enable row level security;
alter table public.tradein_application_events enable row level security;
alter table public.tradein_branch_capacities enable row level security;

-- Catalog is publicly readable
create policy tradein_categories_select on public.tradein_categories for select using (true);
create policy tradein_brands_select on public.tradein_brands for select using (true);
create policy tradein_models_select on public.tradein_models for select using (true);
create policy tradein_storages_select on public.tradein_storages for select using (true);
create policy tradein_colors_select on public.tradein_colors for select using (true);
create policy tradein_market_variants_select on public.tradein_market_variants for select using (true);
create policy tradein_configurations_select on public.tradein_configurations for select using (true);
create policy tradein_topics_select on public.tradein_assessment_topics for select using (true);
create policy tradein_options_select on public.tradein_assessment_options for select using (true);

-- Applications: Customer can view their own; Staff can view according to branch scope
create policy tradein_applications_customer_select on public.tradein_applications
  for select using (
    (select auth.uid()) = customer_id
    or (select private.is_staff())
  );

create policy tradein_applications_customer_insert on public.tradein_applications
  for insert with check (
    (select auth.uid()) = customer_id
  );

commit;
