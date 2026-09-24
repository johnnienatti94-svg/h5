# MeePro Data Ownership and Persistence Boundary v1

Date: 24 September 2026  
Authority: `docs/MeePro_Full_Stack_Build_Prompt.md`

## Purpose

This document defines which subsystem owns each production fact. UI state, fixture arrays, CMS JSON, and client storage are never authoritative for protected identity, inventory, pricing, publication, or applications.

## Identity and authorization

| Concern | Authority | Notes |
|---|---|---|
| Customer/staff credentials | Supabase Auth | Auth owns password/phone credentials, OTP challenges, refresh tokens, and sessions. Do not create a second plaintext OTP or custom token store. |
| Customer application profile | `customer_profiles` | One row per `auth.users.id`; normalized E.164 phone is unique. |
| Staff role and branch scope | `staff_profiles` | Never accept role, user ID, capability, or branch scope from request headers. |
| Exceptional staff permissions | `staff_capabilities` | PC Staff has no application/CMS access unless a persisted capability explicitly grants it. |
| Route authorization | Request-scoped verified Supabase identity plus persisted staff records | Service-role clients may execute only after the route has verified the session and authorization. |

`user_metadata` is not an authorization source. Staff role and branch assignment live in database records; JWT/app metadata can be a cache hint only and cannot replace a fresh authorization check for sensitive actions.

## Public business domains

| Domain | Mutable authority | Published/history authority |
|---|---|---|
| Branches | `branches` draft fields and `draft_revision` | Immutable `branch_versions`; `branches.published_version_id` selects the public version. |
| Catalog | `categories`, `brands`, `products`, `variants`, `product_media` | Published status controls discovery; records are archived rather than deleted when historical references exist. |
| Availability | `branch_availability` | Public callers receive status/note only; internal quantity is service-only. |
| Offers | `offers` | Immutable `offer_versions`; `offers.current_version_id` selects the active authority. CMS must reference an offer version and may not copy trusted prices. |
| Services/promotions/editorial | Their normalized domain tables | Publication state and timestamps govern public visibility. A later CMS phase must add immutable publication versions before enabling editing of already-published records. |

Money is stored in integer minor units. `offer_versions.total_payable_minor` is derived from down payment, installment schedule, and mandatory fees. Application submission must reload and validate the selected current offer version server-side.

## Applications

- `applications` owns the current workflow state and optimistic `revision`.
- `offer_snapshot`, `branch_snapshot`, and `terms_snapshot` preserve the exact accepted facts even if source records are later archived or republished.
- `application_events` is append-only customer-safe/internal event history.
- `application_internal_notes` is staff-only and is never mixed with customer-visible events.
- `appointments` and `appointment_change_requests` persist scheduling and customer change requests.
- `consent_records` independently records privacy, terms, and optional marketing choices.
- `notifications` is the mandatory persisted in-app delivery channel. Provider messages are secondary delivery attempts, not the source of truth.

All submission, transition, appointment, and review mutations must run through transactional server services/RPCs with an expected revision and idempotency key. Direct browser writes are intentionally not granted.

## CMS and publication

| Concern | Authority |
|---|---|
| Current editor document | `page_drafts` plus draft `page_widgets` compatibility rows |
| Public page | Immutable `page_versions` selected by `pages.published_version_id` |
| Historical snapshots | `page_versions` and legacy `page_revisions` until the latter is retired |
| Site settings | `site_settings` draft plus immutable `site_settings_versions` |
| Scheduled publication | `publish_jobs` with a pinned immutable version ID |
| CMS files | `media_assets` metadata plus a configured public Storage bucket |
| Applicant documents | A separate private Storage bucket and private metadata domain, disabled until a real business requirement authorizes it |

Publishing must validate references, create an immutable version, append an audit event, and switch the published pointer atomically. Public rendering reads only the published pointer. Saving a draft never changes public output.

## API/client boundaries

Use three explicit Supabase client contexts:

1. Public/publishable client — public published reads and Supabase Auth entry only.
2. Request-scoped authenticated client — identity-bound reads protected by RLS.
3. Server-only privileged client — repository/service implementation after verified authorization; never imported into client components.

API routes must not trust `x-staff-role`, `x-staff-id`, token prefixes, client prices, publication status, or branch assignment. Errors use safe typed responses and must not log phone numbers, OTP codes, applicant data, or secrets.

## Fixtures and retired authorities

The following current modules are fixtures/prototypes and must not be imported by production repositories:

- `src/lib/branchesData.ts`
- `src/lib/productsData.ts`
- `src/lib/customerDatabase.ts`
- `src/lib/homepageWidgets.ts` localStorage persistence
- `src/lib/commerceRules.ts` in-memory quotes/orders/idempotency
- The removed `src/lib/smsService.ts` prototype (in-memory OTP state and embedded gateway fallback)
- `src/lib/supabase-schema.sql` and `src/lib/cms-schema-v2.1.sql` duplicate SQL drafts

Fixture mode must be explicit and development-only. Production startup must fail closed when required Supabase, OTP, storage, or signing configuration is missing.

## Migration and deployment state

The authoritative forward migration is:

`supabase/migrations/20260924073909_authoritative_domain_v1.sql`

It has been created and parsed locally but is not applied to the live project. Before deployment:

1. Review the migration and rotate any credentials previously committed to source.
2. Apply it to a disposable/local database or Supabase development branch.
3. Run RLS allow/deny tests for anon, customer, PC Staff, Branch Manager, HQ, and Admin.
4. Run Supabase security/performance advisors and resolve actionable findings.
5. Generate TypeScript database types from the verified schema.
6. Deploy request-scoped authentication and transactional repositories before exposing write routes.
