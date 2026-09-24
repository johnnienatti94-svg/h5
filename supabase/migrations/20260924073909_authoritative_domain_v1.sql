-- MeePro authoritative domain schema v1
--
-- This is a forward-only migration over 20260923213000_cms_v2_1_schema_and_rls.
-- It closes the original blanket authenticated-user CMS policies and establishes
-- one persisted authority for branches, catalog/offers, applications, content,
-- publication, notifications, and audit history.

begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

-- Harden the trigger function created by the original CMS migration.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Media authority (public CMS assets only; applicant documents use a separate,
-- private storage boundary and are intentionally not modeled as public assets).
-- ---------------------------------------------------------------------------

alter table public.media_assets
  add column if not exists visibility text not null default 'public',
  add column if not exists byte_size bigint,
  add column if not exists checksum_sha256 text,
  add column if not exists focal_point jsonb,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists archived_at timestamptz;

alter table public.media_assets
  drop constraint if exists media_assets_visibility_check,
  add constraint media_assets_visibility_check
    check (visibility in ('public', 'private')),
  drop constraint if exists media_assets_byte_size_check,
  add constraint media_assets_byte_size_check
    check (byte_size is null or byte_size > 0),
  drop constraint if exists media_assets_dimensions_check,
  add constraint media_assets_dimensions_check
    check ((width is null or width > 0) and (height is null or height > 0)),
  drop constraint if exists media_assets_checksum_check,
  add constraint media_assets_checksum_check
    check (checksum_sha256 is null or checksum_sha256 ~ '^[a-f0-9]{64}$');

create unique index if not exists media_assets_storage_path_key
  on public.media_assets (storage_path);

-- ---------------------------------------------------------------------------
-- Branch drafts and immutable published branch versions.
-- ---------------------------------------------------------------------------

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  draft_name text,
  draft_full_address text,
  draft_province text,
  draft_region text,
  draft_display_phone text,
  draft_normalized_phone text,
  draft_google_maps_url text,
  draft_image_asset_id uuid references public.media_assets(id) on delete restrict,
  draft_image_alt text,
  draft_opening_hours jsonb not null default '[]'::jsonb,
  draft_directions text,
  draft_revision bigint not null default 1 check (draft_revision > 0),
  published_version_id uuid,
  is_active boolean not null default false,
  display_order integer not null default 0 check (display_order >= 0),
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branches_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint branches_draft_phone_check check (
    draft_normalized_phone is null
    or draft_normalized_phone ~ '^\+[1-9][0-9]{7,14}$'
  ),
  constraint branches_draft_map_url_check check (
    draft_google_maps_url is null
    or draft_google_maps_url ~* '^https://(www\.)?(maps\.app\.goo\.gl|goo\.gl/maps|google\.[a-z.]+/maps|maps\.google\.[a-z.]+)(/|\?|$)'
  )
);

create table public.branch_versions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete restrict,
  version_number bigint not null check (version_number > 0),
  name text not null check (length(btrim(name)) > 0),
  full_address text not null check (length(btrim(full_address)) > 0),
  province text,
  region text,
  display_phone text not null check (length(btrim(display_phone)) > 0),
  normalized_phone text not null
    check (normalized_phone ~ '^\+[1-9][0-9]{7,14}$'),
  google_maps_url text not null
    check (google_maps_url ~* '^https://(www\.)?(maps\.app\.goo\.gl|goo\.gl/maps|google\.[a-z.]+/maps|maps\.google\.[a-z.]+)(/|\?|$)'),
  image_asset_id uuid references public.media_assets(id) on delete restrict,
  image_alt text,
  opening_hours jsonb not null default '[]'::jsonb,
  directions text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now(),
  unique (branch_id, version_number),
  unique (branch_id, id)
);

alter table public.branches
  add constraint branches_published_version_fkey
  foreign key (id, published_version_id)
  references public.branch_versions(branch_id, id) on delete restrict;

create index branch_versions_branch_id_idx on public.branch_versions (branch_id);
create index branches_public_order_idx on public.branches (display_order, id)
  where is_active and archived_at is null and published_version_id is not null;
create index branches_region_idx on public.branches (draft_region)
  where archived_at is null;

-- ---------------------------------------------------------------------------
-- Supabase Auth owns credentials, OTP challenges, and sessions. These profile
-- tables bind authenticated users to MeePro customer/staff authorization data.
-- ---------------------------------------------------------------------------

create table public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  normalized_phone text not null unique
    check (normalized_phone ~ '^\+[1-9][0-9]{7,14}$'),
  display_phone text not null,
  contact_name text,
  status text not null default 'active'
    check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null
    check (role in ('ADMIN', 'HQ', 'BRANCH_MANAGER', 'PC_STAFF')),
  assigned_branch_id uuid references public.branches(id) on delete restrict,
  status text not null default 'active'
    check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint staff_profiles_branch_scope_check check (
    role <> 'BRANCH_MANAGER' or assigned_branch_id is not null
  )
);

create table public.staff_capabilities (
  staff_user_id uuid not null references public.staff_profiles(user_id) on delete cascade,
  capability text not null check (capability in (
    'APPLICATION_READ', 'APPLICATION_REVIEW', 'BRANCH_DRAFT_EDIT',
    'CMS_DRAFT_EDIT', 'CMS_PREVIEW', 'CMS_PUBLISH', 'MEDIA_MANAGE',
    'CATALOG_MANAGE', 'USER_MANAGE', 'AUDIT_READ'
  )),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (staff_user_id, capability)
);

create index staff_profiles_assigned_branch_id_idx
  on public.staff_profiles (assigned_branch_id)
  where assigned_branch_id is not null;

create or replace function private.current_staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select sp.role
  from public.staff_profiles as sp
  where sp.user_id = (select auth.uid())
    and sp.status = 'active'
  limit 1
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_profiles as sp
    where sp.user_id = (select auth.uid())
      and sp.status = 'active'
  )
$$;

create or replace function private.is_hq_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select private.current_staff_role()) in ('ADMIN', 'HQ'), false)
$$;

create or replace function private.has_staff_capability(requested_capability text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select private.is_hq_admin()) or exists (
    select 1
    from public.staff_capabilities as sc
    join public.staff_profiles as sp on sp.user_id = sc.staff_user_id
    where sc.staff_user_id = (select auth.uid())
      and sc.capability = requested_capability
      and sp.status = 'active'
  )
$$;

create or replace function private.can_access_branch(requested_branch_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_profiles as sp
    where sp.user_id = (select auth.uid())
      and sp.status = 'active'
      and (
        sp.role in ('ADMIN', 'HQ')
        or (sp.role = 'BRANCH_MANAGER' and sp.assigned_branch_id = requested_branch_id)
        or (
          sp.assigned_branch_id = requested_branch_id
          and exists (
            select 1
            from public.staff_capabilities as sc
            where sc.staff_user_id = sp.user_id
              and sc.capability = 'APPLICATION_READ'
          )
        )
      )
  )
$$;

revoke execute on function private.current_staff_role() from public, anon, authenticated;
revoke execute on function private.is_staff() from public, anon, authenticated;
revoke execute on function private.is_hq_admin() from public, anon, authenticated;
revoke execute on function private.has_staff_capability(text) from public, anon, authenticated;
revoke execute on function private.can_access_branch(uuid) from public, anon, authenticated;
grant execute on function private.current_staff_role() to authenticated;
grant execute on function private.is_staff() to authenticated;
grant execute on function private.is_hq_admin() to authenticated;
grant execute on function private.has_staff_capability(text) to authenticated;
grant execute on function private.can_access_branch(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Catalog and versioned offers. CMS blocks reference these records; they do not
-- own stock, prices, or financing terms.
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  logo_asset_id uuid references public.media_assets(id) on delete restrict,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid not null references public.categories(id) on delete restrict,
  brand_id uuid not null references public.brands(id) on delete restrict,
  name text not null,
  summary text,
  description jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  archived_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  sku text not null unique,
  name text not null,
  condition text not null check (condition in ('new', 'used')),
  storage_label text,
  color_label text,
  attributes jsonb not null default '{}'::jsonb,
  warranty_description text,
  condition_description text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, id)
);

create table public.product_media (
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  alt_text text not null,
  display_order integer not null default 0 check (display_order >= 0),
  primary key (product_id, media_asset_id, display_order),
  foreign key (product_id, variant_id)
    references public.variants(product_id, id) on delete cascade
);

create table public.branch_availability (
  branch_id uuid not null references public.branches(id) on delete restrict,
  variant_id uuid not null references public.variants(id) on delete restrict,
  availability_status text not null default 'unavailable'
    check (availability_status in ('in_stock', 'low_stock', 'out_of_stock', 'unavailable')),
  public_note text,
  internal_quantity integer check (internal_quantity is null or internal_quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (branch_id, variant_id)
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  current_version_id uuid,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.offer_versions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers(id) on delete restrict,
  version_number bigint not null check (version_number > 0),
  cash_price_minor bigint not null check (cash_price_minor >= 0),
  down_payment_minor bigint not null default 0 check (down_payment_minor >= 0),
  installment_count smallint not null default 0 check (installment_count between 0 and 120),
  installment_amount_minor bigint not null default 0 check (installment_amount_minor >= 0),
  fees jsonb not null default '[]'::jsonb check (jsonb_typeof(fees) = 'array'),
  fees_total_minor bigint not null default 0 check (fees_total_minor >= 0),
  total_payable_minor bigint generated always as (
    down_payment_minor + (installment_count::bigint * installment_amount_minor) + fees_total_minor
  ) stored,
  valid_from timestamptz not null,
  valid_until timestamptz,
  terms text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (offer_id, version_number),
  unique (offer_id, id),
  constraint offer_versions_validity_check check (valid_until is null or valid_until > valid_from),
  constraint offer_versions_installment_check check (
    (installment_count = 0 and installment_amount_minor = 0)
    or (installment_count > 0 and installment_amount_minor > 0)
  )
);

create table public.offer_version_variants (
  offer_version_id uuid not null references public.offer_versions(id) on delete restrict,
  variant_id uuid not null references public.variants(id) on delete restrict,
  primary key (offer_version_id, variant_id)
);

alter table public.offers
  add constraint offers_current_version_fkey
  foreign key (id, current_version_id)
  references public.offer_versions(offer_id, id) on delete restrict;

create index products_category_status_idx on public.products (category_id, status, id);
create index products_brand_status_idx on public.products (brand_id, status, id);
create index products_published_idx on public.products (published_at desc, id)
  where status = 'published' and archived_at is null;
create index variants_product_status_idx on public.variants (product_id, status, id);
create index product_media_variant_id_idx on public.product_media (variant_id)
  where variant_id is not null;
create index product_media_asset_id_idx on public.product_media (media_asset_id);
create index branch_availability_variant_status_idx
  on public.branch_availability (variant_id, availability_status, branch_id);
create index offer_versions_offer_id_idx on public.offer_versions (offer_id, version_number desc);
create index offer_versions_validity_idx on public.offer_versions (valid_from, valid_until);
create index offer_version_variants_variant_id_idx on public.offer_version_variants (variant_id);

-- ---------------------------------------------------------------------------
-- Managed content authorities.
-- ---------------------------------------------------------------------------

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text,
  content jsonb not null default '{}'::jsonb,
  valid_from timestamptz,
  valid_until timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotions_validity_check check (valid_until is null or valid_from is null or valid_until > valid_from)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_variants (
  collection_id uuid not null references public.collections(id) on delete cascade,
  variant_id uuid not null references public.variants(id) on delete restrict,
  display_order integer not null default 0 check (display_order >= 0),
  primary key (collection_id, variant_id)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text,
  body jsonb not null default '{}'::jsonb,
  hero_asset_id uuid references public.media_assets(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer jsonb not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  display_order integer not null default 0 check (display_order >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customer_profiles(user_id) on delete set null,
  display_name text not null,
  rating smallint not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'archived')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index collection_variants_variant_id_idx on public.collection_variants (variant_id);
create index promotions_public_idx on public.promotions (valid_from, valid_until, published_at desc)
  where status = 'published';
create index articles_public_idx on public.articles (published_at desc, id)
  where status = 'published';
create index faqs_public_idx on public.faqs (display_order, id)
  where status = 'published';
create index reviews_public_idx on public.reviews (display_order, approved_at desc)
  where status = 'approved';

-- ---------------------------------------------------------------------------
-- Applications, immutable events, appointments, consent, and notifications.
-- ---------------------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_id uuid not null references public.customer_profiles(user_id) on delete restrict,
  contact_name text not null,
  verified_phone text not null check (verified_phone ~ '^\+[1-9][0-9]{7,14}$'),
  service_id uuid references public.services(id) on delete restrict,
  variant_id uuid not null references public.variants(id) on delete restrict,
  offer_version_id uuid not null references public.offer_versions(id) on delete restrict,
  offer_snapshot jsonb not null,
  selected_branch_id uuid not null references public.branches(id) on delete restrict,
  branch_snapshot jsonb not null,
  terms_snapshot jsonb not null,
  customer_note text,
  status text not null default 'DRAFT' check (status in (
    'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFO', 'APPROVED',
    'REJECTED', 'APPOINTMENT_SET', 'COMPLETED', 'CANCELLED'
  )),
  revision bigint not null default 1 check (revision > 0),
  idempotency_key text,
  assigned_staff_id uuid references public.staff_profiles(user_id) on delete set null,
  submitted_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users(id) on delete set null,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_submission_check check (
    (status = 'DRAFT' and submitted_at is null)
    or (status <> 'DRAFT' and submitted_at is not null)
  )
);

create unique index applications_customer_idempotency_key_idx
  on public.applications (customer_id, idempotency_key)
  where idempotency_key is not null;
create index applications_customer_created_idx
  on public.applications (customer_id, created_at desc, id);
create index applications_branch_queue_idx
  on public.applications (selected_branch_id, status, submitted_at desc, id)
  where status not in ('DRAFT', 'COMPLETED', 'REJECTED', 'CANCELLED');
create index applications_assignee_queue_idx
  on public.applications (assigned_staff_id, status, submitted_at desc, id)
  where assigned_staff_id is not null;
create index applications_variant_id_idx on public.applications (variant_id);
create index applications_offer_version_id_idx on public.applications (offer_version_id);

create table public.application_events (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.applications(id) on delete restrict,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_kind text not null check (actor_kind in ('CUSTOMER', 'STAFF', 'SYSTEM')),
  event_type text not null,
  from_status text,
  to_status text,
  customer_visible boolean not null default false,
  message text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index application_events_application_created_idx
  on public.application_events (application_id, created_at, id);

create table public.application_internal_notes (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.applications(id) on delete restrict,
  author_id uuid not null references public.staff_profiles(user_id) on delete restrict,
  body text not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now()
);

create index application_internal_notes_application_created_idx
  on public.application_internal_notes (application_id, created_at, id);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete restrict,
  starts_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'change_requested', 'cancelled', 'completed')),
  note text,
  created_by uuid not null references public.staff_profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_branch_starts_idx on public.appointments (branch_id, starts_at, id);

create table public.appointment_change_requests (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete restrict,
  customer_id uuid not null references public.customer_profiles(user_id) on delete restrict,
  requested_note text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  resolved_by uuid references public.staff_profiles(user_id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index appointment_change_requests_appointment_idx
  on public.appointment_change_requests (appointment_id, created_at desc);
create index appointment_change_requests_customer_idx
  on public.appointment_change_requests (customer_id, created_at desc);

create table public.consent_records (
  id bigint generated always as identity primary key,
  customer_id uuid not null references public.customer_profiles(user_id) on delete restrict,
  application_id uuid references public.applications(id) on delete restrict,
  consent_type text not null check (consent_type in ('PRIVACY', 'TERMS', 'MARKETING')),
  document_version text not null,
  accepted boolean not null,
  ip_address inet,
  user_agent text,
  occurred_at timestamptz not null default now()
);

create index consent_records_customer_type_idx
  on public.consent_records (customer_id, consent_type, occurred_at desc);
create index consent_records_application_id_idx
  on public.consent_records (application_id)
  where application_id is not null;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete restrict,
  kind text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_unread_idx
  on public.notifications (recipient_user_id, created_at desc, id)
  where read_at is null;
create index notifications_application_id_idx on public.notifications (application_id)
  where application_id is not null;

create or replace function private.can_access_application(requested_application_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.applications as a
    join public.staff_profiles as sp on sp.user_id = (select auth.uid())
    where a.id = requested_application_id
      and sp.status = 'active'
      and (
        sp.role in ('ADMIN', 'HQ')
        or (
          sp.assigned_branch_id = a.selected_branch_id
          and (
            sp.role = 'BRANCH_MANAGER'
            or exists (
              select 1
              from public.staff_capabilities as sc
              where sc.staff_user_id = sp.user_id
                and sc.capability = 'APPLICATION_READ'
            )
          )
        )
      )
  )
$$;

revoke execute on function private.can_access_application(uuid) from public, anon, authenticated;
grant execute on function private.can_access_application(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Immutable page/site publication snapshots and pinned scheduled jobs.
-- ---------------------------------------------------------------------------

alter table public.pages
  add column if not exists draft_revision bigint not null default 1,
  add column if not exists published_version_id uuid;

create table public.page_drafts (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null unique references public.pages(id) on delete restrict,
  revision bigint not null default 1 check (revision > 0),
  document jsonb not null default '{"schemaVersion":1,"blocks":[]}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.page_versions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete restrict,
  version_number bigint not null check (version_number > 0),
  source_draft_revision bigint not null check (source_draft_revision > 0),
  document jsonb not null,
  change_summary text,
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now(),
  unique (page_id, version_number),
  unique (page_id, id)
);

alter table public.pages
  add constraint pages_published_version_fkey
  foreign key (id, published_version_id)
  references public.page_versions(page_id, id) on delete restrict;

alter table public.page_widgets
  add column if not exists page_draft_id uuid references public.page_drafts(id) on delete restrict;

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  settings_key text not null unique,
  draft_revision bigint not null default 1 check (draft_revision > 0),
  draft_document jsonb not null default '{}'::jsonb,
  published_version_id uuid,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings_versions (
  id uuid primary key default gen_random_uuid(),
  site_settings_id uuid not null references public.site_settings(id) on delete restrict,
  version_number bigint not null check (version_number > 0),
  source_draft_revision bigint not null check (source_draft_revision > 0),
  document jsonb not null,
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz not null default now(),
  unique (site_settings_id, version_number),
  unique (site_settings_id, id)
);

alter table public.site_settings
  add constraint site_settings_published_version_fkey
  foreign key (id, published_version_id)
  references public.site_settings_versions(site_settings_id, id) on delete restrict;

create table public.publish_jobs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('PAGE', 'SITE_SETTINGS', 'BRANCH')),
  entity_id uuid not null,
  pinned_version_id uuid not null,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'succeeded', 'failed', 'cancelled')),
  attempts smallint not null default 0 check (attempts >= 0),
  last_error text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create unique index publish_jobs_pending_target_idx
  on public.publish_jobs (entity_type, entity_id)
  where status in ('pending', 'running');
create index publish_jobs_due_idx on public.publish_jobs (scheduled_for, id)
  where status = 'pending';

-- Convert the existing mutable CMS state into an initial draft and immutable
-- published snapshot before public policies switch to page_versions.
insert into public.page_drafts (page_id, revision, document)
select
  p.id,
  greatest(p.draft_revision, 1),
  jsonb_build_object(
    'schemaVersion', 1,
    'page', jsonb_build_object('slug', p.slug, 'name', p.name),
    'blocks', coalesce(
      jsonb_agg(to_jsonb(w) order by w.sort_order, w.id)
        filter (where w.id is not null),
      '[]'::jsonb
    )
  )
from public.pages as p
left join public.page_widgets as w on w.page_id = p.id
group by p.id, p.slug, p.name, p.draft_revision
on conflict (page_id) do nothing;

update public.page_widgets as w
set page_draft_id = d.id
from public.page_drafts as d
where d.page_id = w.page_id
  and w.page_draft_id is null;

insert into public.page_versions (
  page_id, version_number, source_draft_revision, document, change_summary, published_at
)
select p.id, 1, d.revision, d.document, 'Migrated published CMS state', coalesce(p.published_at, now())
from public.pages as p
join public.page_drafts as d on d.page_id = p.id
where p.status = 'published'
  and p.published_version_id is null
on conflict (page_id, version_number) do nothing;

update public.pages as p
set published_version_id = v.id
from public.page_versions as v
where v.page_id = p.id
  and v.version_number = 1
  and p.status = 'published'
  and p.published_version_id is null;

create index page_versions_page_id_idx on public.page_versions (page_id, version_number desc);
create index page_widgets_page_draft_id_idx on public.page_widgets (page_draft_id, sort_order)
  where page_draft_id is not null;
create index site_settings_versions_settings_id_idx
  on public.site_settings_versions (site_settings_id, version_number desc);

-- ---------------------------------------------------------------------------
-- Append-only audit authority.
-- ---------------------------------------------------------------------------

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_kind text not null check (actor_kind in ('CUSTOMER', 'STAFF', 'SYSTEM')),
  action text not null,
  resource_type text not null,
  resource_id text,
  branch_id uuid references public.branches(id) on delete restrict,
  request_id text,
  ip_address inet,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index audit_events_resource_idx
  on public.audit_events (resource_type, resource_id, occurred_at desc, id);
create index audit_events_actor_idx
  on public.audit_events (actor_user_id, occurred_at desc, id)
  where actor_user_id is not null;
create index audit_events_branch_idx
  on public.audit_events (branch_id, occurred_at desc, id)
  where branch_id is not null;

-- ---------------------------------------------------------------------------
-- updated_at triggers for mutable records.
-- ---------------------------------------------------------------------------

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'branches', 'customer_profiles', 'staff_profiles', 'categories', 'brands',
    'products', 'variants', 'branch_availability', 'offers', 'services',
    'promotions', 'collections', 'articles', 'faqs', 'reviews', 'applications',
    'appointments', 'page_drafts', 'site_settings'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', 'trg_' || target_table || '_updated_at', target_table);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      'trg_' || target_table || '_updated_at',
      target_table
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS, grants, and explicit policies.
-- ---------------------------------------------------------------------------

-- Remove the unsafe policies from the original migration.
drop policy if exists "Allow public read published pages" on public.pages;
drop policy if exists "Allow public read active widgets" on public.page_widgets;
drop policy if exists "Allow public read media assets" on public.media_assets;
drop policy if exists "Allow staff and admin read all pages" on public.pages;
drop policy if exists "Allow staff and admin read all widgets" on public.page_widgets;
drop policy if exists "Allow staff and admin manage widgets" on public.page_widgets;
drop policy if exists "Allow staff and admin manage pages" on public.pages;
drop policy if exists "Allow staff and admin manage revisions" on public.page_revisions;
drop policy if exists "Allow staff and admin manage media" on public.media_assets;

alter table public.branches enable row level security;
alter table public.branch_versions enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.staff_capabilities enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.product_media enable row level security;
alter table public.branch_availability enable row level security;
alter table public.offers enable row level security;
alter table public.offer_versions enable row level security;
alter table public.offer_version_variants enable row level security;
alter table public.services enable row level security;
alter table public.promotions enable row level security;
alter table public.collections enable row level security;
alter table public.collection_variants enable row level security;
alter table public.articles enable row level security;
alter table public.faqs enable row level security;
alter table public.reviews enable row level security;
alter table public.applications enable row level security;
alter table public.application_events enable row level security;
alter table public.application_internal_notes enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_change_requests enable row level security;
alter table public.consent_records enable row level security;
alter table public.notifications enable row level security;
alter table public.page_drafts enable row level security;
alter table public.page_versions enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_settings_versions enable row level security;
alter table public.publish_jobs enable row level security;
alter table public.audit_events enable row level security;

revoke all on all tables in schema public from anon, authenticated;

grant select on public.pages, public.page_versions, public.media_assets,
  public.branch_versions, public.categories, public.brands,
  public.products, public.variants, public.product_media,
  public.offers, public.offer_versions, public.offer_version_variants,
  public.services, public.promotions, public.collections, public.collection_variants,
  public.articles, public.faqs, public.reviews, public.site_settings,
  public.site_settings_versions
to anon, authenticated;

grant select (id, slug, published_version_id, is_active, display_order)
  on public.branches to anon, authenticated;
grant select (branch_id, variant_id, availability_status, public_note, updated_at)
  on public.branch_availability to anon, authenticated;

grant select on public.customer_profiles, public.staff_profiles,
  public.staff_capabilities, public.applications, public.application_events,
  public.application_internal_notes, public.appointments,
  public.appointment_change_requests, public.consent_records, public.notifications,
  public.page_drafts, public.page_widgets, public.page_revisions,
  public.publish_jobs, public.audit_events
to authenticated;

grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

create policy pages_public_read on public.pages for select
  to anon
  using (status = 'published' and published_version_id is not null);
create policy pages_authenticated_read on public.pages for select
  to authenticated using (
    (status = 'published' and published_version_id is not null)
    or (select private.has_staff_capability('CMS_PREVIEW'))
  );

create policy page_versions_public_read on public.page_versions for select
  to anon
  using (exists (
    select 1 from public.pages as p
    where p.published_version_id = page_versions.id and p.status = 'published'
  ));
create policy page_versions_authenticated_read on public.page_versions for select
  to authenticated using (
    exists (
      select 1 from public.pages as p
      where p.published_version_id = page_versions.id and p.status = 'published'
    )
    or (select private.has_staff_capability('CMS_PREVIEW'))
  );
create policy page_drafts_staff_read on public.page_drafts for select
  to authenticated using ((select private.has_staff_capability('CMS_PREVIEW')));
create policy page_widgets_staff_read on public.page_widgets for select
  to authenticated using ((select private.has_staff_capability('CMS_PREVIEW')));
create policy page_revisions_staff_read on public.page_revisions for select
  to authenticated using ((select private.has_staff_capability('CMS_PREVIEW')));

create policy media_assets_public_read on public.media_assets for select
  to anon
  using (visibility = 'public' and archived_at is null);
create policy media_assets_authenticated_read on public.media_assets for select
  to authenticated using (
    (visibility = 'public' and archived_at is null)
    or (select private.has_staff_capability('MEDIA_MANAGE'))
    or (select private.has_staff_capability('CMS_PREVIEW'))
  );

create policy branches_public_read on public.branches for select
  to anon
  using (is_active and archived_at is null and published_version_id is not null);
create policy branches_authenticated_read on public.branches for select
  to authenticated using (
    (is_active and archived_at is null and published_version_id is not null)
    or (select private.is_hq_admin())
    or (select private.can_access_branch(id))
    or (select private.has_staff_capability('BRANCH_DRAFT_EDIT'))
  );
create policy branch_versions_public_read on public.branch_versions for select
  to anon
  using (exists (
    select 1 from public.branches as b
    where b.published_version_id = branch_versions.id
      and b.is_active and b.archived_at is null
  ));
create policy branch_versions_authenticated_read on public.branch_versions for select
  to authenticated using (
    exists (
      select 1 from public.branches as b
      where b.published_version_id = branch_versions.id
        and b.is_active and b.archived_at is null
    )
    or (select private.is_hq_admin())
    or (select private.can_access_branch(branch_id))
    or (select private.has_staff_capability('BRANCH_DRAFT_EDIT'))
  );

create policy customer_profiles_owner_read on public.customer_profiles for select
  to authenticated using ((select auth.uid()) = user_id);
create policy staff_profiles_authenticated_read on public.staff_profiles for select
  to authenticated using (
    (select auth.uid()) = user_id or (select private.is_hq_admin())
  );
create policy staff_capabilities_authenticated_read on public.staff_capabilities for select
  to authenticated using (
    (select auth.uid()) = staff_user_id or (select private.is_hq_admin())
  );

create policy categories_public_read on public.categories for select
  to anon using (status = 'published');
create policy brands_public_read on public.brands for select
  to anon using (status = 'published');
create policy products_public_read on public.products for select
  to anon using (status = 'published' and archived_at is null);
create policy variants_public_read on public.variants for select
  to anon using (
    status = 'published' and exists (
      select 1 from public.products as p
      where p.id = variants.product_id and p.status = 'published' and p.archived_at is null
    )
  );
create policy product_media_public_read on public.product_media for select
  to anon using (exists (
    select 1 from public.products as p
    where p.id = product_media.product_id and p.status = 'published' and p.archived_at is null
  ));
create policy availability_public_read on public.branch_availability for select
  to anon using (exists (
    select 1 from public.branches as b
    where b.id = branch_availability.branch_id and b.is_active and b.archived_at is null
  ));

create policy catalog_staff_read_categories on public.categories for select
  to authenticated using (
    status = 'published' or (select private.has_staff_capability('CATALOG_MANAGE'))
  );
create policy catalog_staff_read_brands on public.brands for select
  to authenticated using (
    status = 'published' or (select private.has_staff_capability('CATALOG_MANAGE'))
  );
create policy catalog_staff_read_products on public.products for select
  to authenticated using (
    (status = 'published' and archived_at is null)
    or (select private.has_staff_capability('CATALOG_MANAGE'))
  );
create policy catalog_staff_read_variants on public.variants for select
  to authenticated using (
    (
      status = 'published' and exists (
        select 1 from public.products as p
        where p.id = variants.product_id and p.status = 'published' and p.archived_at is null
      )
    )
    or (select private.has_staff_capability('CATALOG_MANAGE'))
  );
create policy catalog_staff_read_product_media on public.product_media for select
  to authenticated using (
    exists (
      select 1 from public.products as p
      where p.id = product_media.product_id and p.status = 'published' and p.archived_at is null
    )
    or (select private.has_staff_capability('CATALOG_MANAGE'))
  );
create policy catalog_staff_read_availability on public.branch_availability for select
  to authenticated using (
    exists (
      select 1 from public.branches as b
      where b.id = branch_availability.branch_id and b.is_active and b.archived_at is null
    )
    or (select private.has_staff_capability('CATALOG_MANAGE'))
  );

create policy offers_public_read on public.offers for select
  to anon
  using (status = 'published' and archived_at is null and current_version_id is not null);
create policy offer_versions_public_read on public.offer_versions for select
  to anon
  using (
    valid_from <= now()
    and (valid_until is null or valid_until > now())
    and exists (
      select 1 from public.offers as o
      where o.current_version_id = offer_versions.id
        and o.status = 'published' and o.archived_at is null
    )
  );
create policy offer_version_variants_public_read on public.offer_version_variants for select
  to anon
  using (exists (
    select 1 from public.offer_versions as ov
    join public.offers as o on o.current_version_id = ov.id
    where ov.id = offer_version_variants.offer_version_id
      and o.status = 'published' and o.archived_at is null
      and ov.valid_from <= now() and (ov.valid_until is null or ov.valid_until > now())
  ));
create policy offers_staff_read on public.offers for select
  to authenticated using (
    (status = 'published' and archived_at is null and current_version_id is not null)
    or (select private.has_staff_capability('CATALOG_MANAGE'))
  );
create policy offer_versions_staff_read on public.offer_versions for select
  to authenticated using (
    (
      valid_from <= now() and (valid_until is null or valid_until > now())
      and exists (
        select 1 from public.offers as o
        where o.current_version_id = offer_versions.id
          and o.status = 'published' and o.archived_at is null
      )
    )
    or (select private.has_staff_capability('CATALOG_MANAGE'))
  );
create policy offer_version_variants_staff_read on public.offer_version_variants for select
  to authenticated using (
    exists (
      select 1 from public.offer_versions as ov
      join public.offers as o on o.current_version_id = ov.id
      where ov.id = offer_version_variants.offer_version_id
        and o.status = 'published' and o.archived_at is null
        and ov.valid_from <= now() and (ov.valid_until is null or ov.valid_until > now())
    )
    or (select private.has_staff_capability('CATALOG_MANAGE'))
  );

create policy services_public_read on public.services for select
  to anon using (status = 'published');
create policy promotions_public_read on public.promotions for select
  to anon using (
    status = 'published'
    and (valid_from is null or valid_from <= now())
    and (valid_until is null or valid_until > now())
  );
create policy collections_public_read on public.collections for select
  to anon using (status = 'published');
create policy collection_variants_public_read on public.collection_variants for select
  to anon using (exists (
    select 1 from public.collections as c
    where c.id = collection_variants.collection_id and c.status = 'published'
  ));
create policy articles_public_read on public.articles for select
  to anon using (status = 'published');
create policy faqs_public_read on public.faqs for select
  to anon using (status = 'published');
create policy reviews_public_read on public.reviews for select
  to anon using (status = 'approved');

create policy content_staff_read_services on public.services for select
  to authenticated using (
    status = 'published' or (select private.has_staff_capability('CMS_PREVIEW'))
  );
create policy content_staff_read_promotions on public.promotions for select
  to authenticated using (
    (
      status = 'published'
      and (valid_from is null or valid_from <= now())
      and (valid_until is null or valid_until > now())
    )
    or (select private.has_staff_capability('CMS_PREVIEW'))
  );
create policy content_staff_read_collections on public.collections for select
  to authenticated using (
    status = 'published' or (select private.has_staff_capability('CMS_PREVIEW'))
  );
create policy content_staff_read_collection_variants on public.collection_variants for select
  to authenticated using (
    exists (
      select 1 from public.collections as c
      where c.id = collection_variants.collection_id and c.status = 'published'
    )
    or (select private.has_staff_capability('CMS_PREVIEW'))
  );
create policy content_staff_read_articles on public.articles for select
  to authenticated using (
    status = 'published' or (select private.has_staff_capability('CMS_PREVIEW'))
  );
create policy content_staff_read_faqs on public.faqs for select
  to authenticated using (
    status = 'published' or (select private.has_staff_capability('CMS_PREVIEW'))
  );
create policy content_staff_read_reviews on public.reviews for select
  to authenticated using (
    status = 'approved' or (select private.has_staff_capability('CMS_PREVIEW'))
  );

create policy applications_authenticated_read on public.applications for select
  to authenticated using (
    (select auth.uid()) = customer_id
    or (select private.can_access_branch(selected_branch_id))
  );
create policy application_events_authenticated_read on public.application_events for select
  to authenticated using (
    (
      customer_visible and exists (
        select 1 from public.applications as a
        where a.id = application_events.application_id
          and a.customer_id = (select auth.uid())
      )
    )
    or (select private.can_access_application(application_id))
  );
create policy application_notes_staff_read on public.application_internal_notes for select
  to authenticated using ((select private.can_access_application(application_id)));
create policy appointments_authenticated_read on public.appointments for select
  to authenticated using (
    exists (
      select 1 from public.applications as a
      where a.id = appointments.application_id and a.customer_id = (select auth.uid())
    )
    or (select private.can_access_application(application_id))
  );
create policy appointment_changes_authenticated_read on public.appointment_change_requests for select
  to authenticated using (
    (select auth.uid()) = customer_id
    or exists (
      select 1 from public.appointments as ap
      where ap.id = appointment_change_requests.appointment_id
        and (select private.can_access_application(ap.application_id))
    )
  );
create policy consent_records_owner_read on public.consent_records for select
  to authenticated using ((select auth.uid()) = customer_id);
create policy notifications_owner_read on public.notifications for select
  to authenticated using ((select auth.uid()) = recipient_user_id);

create policy site_settings_public_read on public.site_settings for select
  to anon using (published_version_id is not null);
create policy site_settings_versions_public_read on public.site_settings_versions for select
  to anon using (exists (
    select 1 from public.site_settings as s
    where s.published_version_id = site_settings_versions.id
  ));
create policy site_settings_staff_read on public.site_settings for select
  to authenticated using (
    published_version_id is not null or (select private.has_staff_capability('CMS_PREVIEW'))
  );
create policy site_settings_versions_staff_read on public.site_settings_versions for select
  to authenticated using (
    exists (
      select 1 from public.site_settings as s
      where s.published_version_id = site_settings_versions.id
    )
    or (select private.has_staff_capability('CMS_PREVIEW'))
  );
create policy publish_jobs_staff_read on public.publish_jobs for select
  to authenticated using ((select private.has_staff_capability('CMS_PUBLISH')));
create policy audit_events_admin_read on public.audit_events for select
  to authenticated using (
    (select private.is_hq_admin())
    or (select private.has_staff_capability('AUDIT_READ'))
  );

commit;
