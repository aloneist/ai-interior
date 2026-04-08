# Goal
Close the real operating path from `import_jobs` to `furniture_products` and lock interaction identity to canonical product IDs across the current MVP flow.

# Scope
This task covers the publish/review flow, canonical product identity handling in interaction paths, and minimal supporting runtime/documentation updates required to make the DB contract operational.

# Primary Objective
Implement or finalize a real publish path from reviewed import rows into the canonical catalog, and ensure recommendation-related interaction records are explicitly and consistently based on canonical `furniture_products.id`.

# Allowed Changes
- Add or update API/server code for publish/review actions
- Add or update small internal server helpers
- Add or update tightly scoped scripts/tests if needed
- Add or update minimal docs/comments that clarify the canonical interaction contract
- Add small validation or guardrails for publish eligibility and canonical linking
- Add or update migrations only if a truly necessary small schema adjustment is discovered

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not expand UX surface beyond what is required for backend flow completion
- Do not redesign the ingestion architecture
- Do not delete legacy tables in this step
- Do not attempt full legacy retirement of `furniture_vectors`
- Do not add broad admin dashboard features

# Critical Safety Rule
Publishing must never create ambiguous ownership of product identity. Every published row must resolve to exactly one canonical `furniture_products.id`, and the link back from `import_jobs` must remain auditable.

# Working Principles
- `furniture_products` is the only canonical active product table
- `import_jobs` is staging/review only
- Publish is a controlled promotion, not a blind copy
- Interaction records must use canonical product identity
- Prefer the smallest safe implementation that closes the real operating loop
- Keep deferred legacy compatibility explicit rather than pretending it is complete

# Required Behavior / Structure

## 1. Real publish path
Implement or finalize a real reviewed publish path for `import_jobs`.

Expected behavior:
- Read a specific `import_jobs` row
- Validate publish eligibility
- Build canonical product payload
- Upsert into `furniture_products`
- Persist `published_product_id`
- Mark import row as published
- Return enough structured result to audit what happened

At minimum, the publish path must reject:
- non-publishable status
- missing required canonical product fields
- ambiguous or broken canonical linkage

## 2. Canonical link integrity
Make the publish flow explicitly treat `published_product_id` as the canonical link.

Expected behavior:
- If a canonical row already exists for the source URL, reuse/upsert deterministically
- Do not create duplicate canonical ownership for the same source URL
- Keep the operation idempotent when re-run on the same import row where possible

## 3. Interaction identity contract
Lock recommendation-related interaction identity to canonical product IDs.

Expected behavior:
- Recommendation records must continue to store canonical `furniture_products.id`
- Any code comments, helper names, or runtime-level semantics that still imply legacy `furniture` identity should be clarified where necessary
- If save/click/compare-related paths exist, verify they do not drift away from canonical product identity
- If compare/save paths do not yet exist, document the contract in the relevant backend area so the next UX step cannot attach to the wrong identity model

## 4. Runtime compatibility audit
Confirm current recommendation/runtime paths still work with the canonical identity contract.

Expected behavior:
- Do not break MVP recommendation output
- Do not break outbound URL behavior
- Keep the current `affiliate_url` preference intact
- Do not force full `furniture_vectors` FK migration in this step

## 5. Minimal QA / validation support
Add only the smallest useful validation support needed to verify:
- a reviewed import row can be published
- `published_product_id` is written back
- the resulting canonical product is readable by current runtime paths
- recommendation inserts still reference canonical product IDs

# Completion Criteria
- There is a real publish path in code, not just schema support
- `import_jobs -> furniture_products` promotion is deterministic and auditable
- `published_product_id` is written and used as the official canonical link
- Interaction identity is explicitly canonicalized to `furniture_products.id`
- No broad architecture drift
- Build/lint/type checks pass

# Validation
Run and report:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Also show:
- publish path entry point(s) added or updated
- canonical link writeback behavior
- whether any save/click/compare contract note or code adjustment was needed
- whether any schema change was necessary, and why

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. What changed
3. Publish flow decisions applied
4. Canonical interaction contract decisions applied
5. Deferred items and why
6. Validation results
7. Final approval recommendation