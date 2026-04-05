# Goal
Finalize the retirement of legacy `furniture` runtime dependency by removing the remaining fallback path, locking the `import_jobs` publish-status contract to the simplified MVP flow, and producing the final removal-ready decision for the legacy table.

# Scope
This batch is limited to:
- Removing the remaining runtime fallback from `furniture_products` hydration to legacy `furniture`
- Simplifying and aligning the `import_jobs.status` contract to the approved MVP flow
- Verifying that recommendation/runtime behavior still works with no legacy fallback
- Preparing the final safe removal step for the legacy `furniture` table
- Producing any required SQL artifact for the final table drop, but only if removal readiness is confirmed

# Primary Objective
Make the runtime fully independent from legacy `furniture`.

# Allowed Changes
- Remove the explicit legacy fallback path in runtime hydration
- Update publish-status validation and related helpers
- Add or update targeted QA scripts and docs
- Add a final SQL artifact for dropping `furniture` if and only if readiness is confirmed
- Update related runtime-safe types/utilities

# Disallowed Changes
- Do not redesign recommendation scoring
- Do not introduce unrelated admin/product features
- Do not broaden workflow states beyond the simplified MVP contract
- Do not perform destructive DB deletion inside application code
- Do not mix unrelated refactors into this batch

# Critical Safety Rule
Only remove legacy runtime dependency if validation proves the published-catalog path is sufficient. Any destructive SQL must be delivered as an explicit artifact, not silently executed by application code.

# Working Principles
- Keep the status contract minimal
- Prefer explicit simplicity over speculative workflow complexity
- Remove legacy dependency only after verification
- Make final removal evidence-based
- Keep changes direct, narrow, and production-minded

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- why runtime no longer needs legacy fallback
- why this is the correct next step
- what risk is removed by completing retirement

## 2. Status Contract Alignment
Align `import_jobs.status` usage to the MVP-approved contract:
- `pending_review`
- `published`
- `rejected`

Remove any code expectation that requires `reviewed` unless there is hard evidence it must remain.

## 3. Legacy Fallback Removal
Remove the remaining fallback from runtime hydration:
- no primary or secondary runtime read from legacy `furniture`
- keep behavior stable for current consumers
- fail explicitly if hydration is broken instead of silently using legacy data

## 4. Validation
Show that:
- recommendation routes still return hydrated product rows
- publish route still works correctly
- log-click still works correctly
- no legacy fallback path remains
- lint / typecheck / build pass

## 5. Final Retirement Output
Provide:
- readiness judgment for dropping `furniture`
- explicit SQL artifact for dropping `furniture` if approved
- any caution note if one tiny blocker remains

## 6. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Status-contract decision
4. Legacy fallback removal summary
5. Validation results
6. Furniture drop readiness
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- runtime no longer depends on legacy `furniture`
- status contract is simplified and explicit
- validation proves runtime still works
- a final drop decision for `furniture` is produced

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- targeted runtime/publish/logging QA
- confirm no legacy fallback path remains

# Required Result Format
Your final response must include:
- whether runtime is now fully independent from `furniture`
- whether `furniture` can be dropped now
- the exact SQL artifact if it can be dropped
- what should come next immediately after this batch