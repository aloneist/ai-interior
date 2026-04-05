# Goal
Align the runtime code with the new published product source of truth by switching runtime reads from `furniture` to `furniture_products`, adding the missing publish flow from `import_jobs` to `furniture_products`, and removing the most immediate schema drift in the vector path without deleting legacy tables yet.

# Scope
This batch is limited to:
- Updating runtime recommendation read paths to use `furniture_products` instead of `furniture`
- Adding an explicit admin-safe publish/approve path from `import_jobs` into `furniture_products`
- Aligning `furniture_vectors` read/write behavior with the current live schema direction
- Updating related types, joins, and minimal validation paths
- Updating docs/artifacts if needed

# Primary Objective
Make `furniture_products` the actual runtime source of truth in code, not only in schema intent.

# Allowed Changes
- Update API routes that currently read from `furniture`
- Update joins from `furniture_vectors -> furniture` to `furniture_vectors -> furniture_products`
- Add a publish/approve route or service that promotes reviewed `import_jobs` rows into `furniture_products`
- Add helper mapping logic for promotion
- Update type definitions and minimal runtime-safe utilities
- Add small validation/reporting artifacts if needed

# Disallowed Changes
- Do not drop the `furniture` table in this batch
- Do not perform destructive DB cleanup
- Do not redesign recommendation scoring logic
- Do not expand product features beyond the required alignment work
- Do not introduce n8n or any unrelated workflow layer
- Do not rewrite the whole admin UI unless absolutely required for the publish flow

# Critical Safety Rule
This batch must preserve current runtime behavior while changing the source table underneath the joins. No destructive migration. Legacy fallback may remain temporarily if needed, but the primary runtime path must move to `furniture_products`.

# Working Principles
- Published product source of truth is now `furniture_products`
- `import_jobs` is staging/review input only
- `furniture_vectors` remains a separate recommendation-feature surface
- Legacy `furniture` may remain temporarily only as a transition surface
- Prefer minimal, explicit, reversible changes
- If a field mismatch exists, fix it at the mapping/join layer instead of introducing hidden assumptions

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what changed in DB already
- why this code batch is next
- what will be safer after this batch

## 2. Runtime Read Alignment
Update current runtime recommendation paths so that:
- recommendation reads use `furniture_products`
- recommendation joins still work with `furniture_vectors`
- result payloads remain stable for current UI/API consumers

Relevant paths likely include:
- `app/api/recommend/route.ts`
- `app/api/recommend-space/route.ts`
- `app/api/mvp/route.ts`

## 3. Publish Flow
Add the missing explicit promotion path:
- reviewed `import_jobs` row
- validated mapping into `furniture_products`
- publish result persisted
- `import_jobs.status` updated appropriately
- `import_jobs.published_product_id` linked if available

This path must be admin-safe and explicit.

## 4. Vector Path Drift Alignment
Resolve the immediate `furniture_vectors` drift at the code layer:
- use the schema fields that now exist
- avoid code assuming fields that are still not guaranteed unless they are part of the migration already applied
- keep the writer/read path internally consistent

## 5. Transitional Safety
Do not remove legacy table usage unless replacement is verified.
If temporary fallback is necessary, make it explicit and narrow.

## 6. Validation
Demonstrate that:
- recommendation routes still return product rows
- publish path writes into `furniture_products`
- no product logic regression was introduced
- lint / typecheck pass
- if possible, smoke validation for the aligned runtime path is updated

## 7. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. What runtime paths were switched
4. What publish path was added
5. Any temporary legacy dependency still left
6. Validation results
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- Runtime recommendation reads no longer depend primarily on `furniture`
- A concrete publish path from `import_jobs` to `furniture_products` exists
- `furniture_vectors` integration is not left in known-broken drift state
- Legacy table deletion is deferred, not mixed into this batch
- Validation is included

# Validation
- `npm run lint`
- `tsc --noEmit`
- any existing smoke or targeted route validation that covers recommendation/runtime alignment
- confirm no destructive SQL or drop operation is included

# Required Result Format
Your final response must include:
- What was aligned
- What still remains transitional
- Whether this is safe to approve
- What should be next immediately after approval