# Goal
Lock the database operating contract around a single canonical product source, remove contract ambiguity, and prepare the legacy tables for safe retirement without breaking the current runtime.

# Scope
This task covers database schema cleanup, contract clarification, safe constraints/index updates, and minimal code changes required to align runtime behavior with the DB contract.

# Primary Objective
Make `furniture_products` the only canonical product table, keep `import_jobs` as staging/review, treat `furniture` as legacy compatibility only, and align recommendation-related tables to canonical product identity.

# Allowed Changes
- Add or adjust database constraints, defaults, foreign keys, and indexes
- Add migration files
- Update server-side code paths that write/read DB tables when needed to match the contract
- Add internal documentation comments where useful
- Add small validation/normalization guards related to product publishing and field hygiene

# Disallowed Changes
- Do not redesign the recommendation scoring logic
- Do not expand the UX surface
- Do not introduce new product ingestion architecture
- Do not add broad new features unrelated to DB contract hardening
- Do not delete legacy tables in this step
- Do not change runtime behavior beyond what is required to enforce the new DB contract

# Critical Safety Rule
Preserve all existing usable product data. Prefer additive or compatibility-safe changes first. Legacy paths may be frozen, but must not be destructively removed in this step.

# Working Principles
- Canonical product source must be singular
- Staging and canonical publication must remain separate
- Any current runtime dependency on legacy tables must be made explicit
- Favor compatibility-safe migrations over destructive cleanup
- Backfill links only when the mapping is provable and deterministic
- Keep naming and status semantics explicit and auditable

# Required Behavior / Structure

## 1. Canonical table contract
- `furniture_products` must be treated as the single canonical product source
- New writes for active/usable products must target `furniture_products`
- `product_url` remains the source product page
- `affiliate_url` remains the preferred outbound purchase URL when present
- `material` means material only, never dimensions
- `width_cm`, `depth_cm`, `height_cm` remain the only dimension fields
- `metadata_json` should be normalized to non-null default `{}` for all rows

## 2. Staging/review contract
- `import_jobs` remains the staging/review queue
- Fix status default mismatch so default is `pending_review`
- Keep allowed statuses explicit and valid
- `published_product_id` is the official canonical link to `furniture_products.id`
- Preserve `review_note`, `reviewed_at`, `reviewed_by`

## 3. Legacy table handling
- `furniture` must be treated as legacy compatibility only
- Freeze new writes to `furniture` if possible in current scope
- Do not delete `furniture` yet
- Add comments or docs indicating retirement intent and replacement path

## 4. Recommendation identity alignment
- `recommendations.furniture_id` is legacy naming only; operationally it should point to canonical product identity
- Add a foreign key from `recommendations.furniture_id` to `furniture_products.id` if safe with current data
- Keep current column name in this step unless rename would be fully safe and low-risk
- If code comments or local type aliases are needed to clarify meaning, add them

## 5. Vector table alignment
- `furniture_vectors` should be treated as recommendation feature storage for canonical products
- Assess whether current foreign key can be safely moved from `furniture.id` to `furniture_products.id`
- If immediate FK migration is risky, document the temporary compatibility state clearly
- Do not attempt full vector-version architecture expansion in this step
- Keep a single current vector row per product as the effective operating model

## 6. Field hygiene guard
- Add a minimal validation/normalization guard so dimension-like strings do not get treated as `material`
- This must be small, deterministic, and non-magical
- If invalid `material` content is detected, either clear it or redirect only when safe and obvious

## 7. Index / constraint cleanup
- Remove obvious duplicate indexes if safe
- Preserve useful lookup indexes
- Ensure constraints match actual allowed runtime states

# Completion Criteria
- `furniture_products` is documented and enforced as canonical
- `import_jobs.status` default and constraint semantics are aligned
- `published_product_id` is treated as the official publication link
- `recommendations.furniture_id` is explicitly aligned to canonical product identity and protected by FK if safe
- Legacy `furniture` is frozen or clearly marked as compatibility-only
- No destructive data loss
- Migrations are reversible or clearly scoped
- Build/lint/type checks pass

# Validation
- Show the migration files added/updated
- Show the exact schema changes made
- Confirm whether FK addition for `recommendations.furniture_id -> furniture_products.id` was applied
- Confirm whether `furniture_vectors` FK was changed now or intentionally deferred
- Run lint
- Run build if reasonable in current repo
- Run `tsc --noEmit`
- If any validation cannot run, say so explicitly

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. What changed
3. DB contract decisions applied
4. Deferred items and why
5. Validation results
6. Risk notes
7. Final approval recommendation