# Goal
Finalize the DB contract hardening step by fixing the migration so it is safe to apply, while preserving the already-correct application-side contract changes.

# Scope
This task is limited to reviewing and correcting the DB hardening migration and any minimal code/documentation adjustments strictly required to keep the migration aligned with the current runtime contract.

# Primary Objective
Make the DB migration safe for staged application by removing over-strict or redundant schema operations, while keeping the intended contract:

- `furniture_products` is canonical
- `import_jobs` is staging/review
- `furniture` remains frozen legacy compatibility storage
- `recommendations.furniture_id` remains legacy naming but points to canonical product IDs
- application-side material normalization remains in code

# Allowed Changes
- Edit `docs/sql/2026-04-08-db-contract-hardening.sql`
- Make small supporting code or comments changes only if required for migration/runtime consistency
- Remove redundant or risky constraints/index operations
- Clarify migration comments and intent
- Keep compatibility-safe guarded FK creation where appropriate

# Disallowed Changes
- Do not redesign recommendation ranking
- Do not expand UX
- Do not introduce new publish workflow architecture
- Do not rename broad runtime concepts
- Do not delete legacy tables in this step
- Do not move `furniture_vectors` fully to a new schema contract in this step

# Critical Safety Rule
Prefer the smallest safe migration that matches the current runtime contract. Do not add schema constraints that are stricter than the actual ingestion quality guarantees unless they are clearly necessary and proven safe.

# Working Principles
- Runtime contract first, then schema hardening
- Canonical product table remains singular
- Migration must be safe to apply on a DB that may already contain prior constraints/indexes
- Avoid duplicate constraints and duplicate indexes
- App-level normalization is preferred over brittle regex-heavy DB rejection for noisy parser/vision fields
- Keep legacy freeze explicit, but only where current write paths no longer depend on the legacy table

# Required Behavior / Structure

## 1. Keep what is already correct
Preserve these intended outcomes:
- `furniture_products` comment and canonical semantics
- `affiliate_url` support if still needed by schema state
- `metadata_json` normalized to non-null default `{}`
- `import_jobs.status` default aligned to `pending_review`
- guarded FK for `import_jobs.published_product_id -> furniture_products.id`
- guarded FK for `recommendations.furniture_id -> furniture_products.id`
- legacy `furniture` freeze trigger, if still consistent with current code paths

## 2. Fix migration problems
Review the existing migration and correct these issues:

### A. Remove redundant status contract duplication
If the DB already has an equivalent `import_jobs` status check, do not stack an unnecessary second check constraint with a new name.
Use one clear contract path only.

### B. Relax or remove brittle DB-level material regex checks
The business meaning is:
- `material` means material
- dimensions belong in dimension fields

But contamination is caused by parser/vision extraction noise.
The app already normalizes this via code.
Therefore:
- avoid aggressive DB regex constraints that may reject legitimate material strings
- keep the app-level normalization as primary protection
- use DB constraint only if it is extremely narrow, clearly safe, and worth the operational risk

### C. Remove redundant `furniture_vectors` uniqueness hardening if it duplicates existing uniqueness
If current PK/unique structure already guarantees one row per `furniture_id`, do not add another differently-named unique index with the same effective meaning.

### D. Make migration idempotence cleaner
Ensure guarded DDL really behaves safely on DBs that may already contain related constraints/indexes.

## 3. Preserve current runtime direction
Do not undo the already-correct runtime moves:
- runtime catalog hydration from `furniture_products`
- import staging into `import_jobs`
- test/manual save paths writing to `furniture_products`
- outbound URL preference using `affiliate_url`

## 4. Legacy freeze validation
Confirm current code paths do not write to `public.furniture` anymore in the main analyzed flows.
If true, keep the freeze trigger.
If any hidden write path still exists in repo, do not silently keep a trigger that will break it.

# Completion Criteria
- Migration is smaller, safer, and free from unnecessary duplication
- No obviously brittle DB regex constraint remains unless strongly justified
- No redundant vector uniqueness index remains
- `import_jobs.status` contract is clear without duplicate semantics
- Legacy `furniture` freeze remains only if consistent with current code paths
- App-level material normalization remains intact
- Validation still passes

# Validation
Run and report:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Also report:
- exactly what was removed from the migration
- exactly what was kept
- whether the `furniture` freeze trigger is still included
- whether any DB-level material constraint remains, and why

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. What changed
3. Migration risks removed
4. What was intentionally kept
5. Deferred items and why
6. Validation results
7. Final approval recommendation