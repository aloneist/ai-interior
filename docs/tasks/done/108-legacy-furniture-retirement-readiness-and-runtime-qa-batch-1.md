# Goal
Verify that the system is ready to retire the legacy `furniture` table by auditing transitional fallback usage, hardening publish/runtime QA, and preparing a safe final removal plan without dropping the table in this batch.

# Scope
This batch is limited to:
- Auditing whether runtime still depends on legacy `furniture`
- Measuring and documenting remaining fallback usage
- Hardening QA around `import_jobs -> furniture_products` publish flow
- Hardening QA around recommendation exposure/logging flow
- Preparing a decision-ready removal plan for `furniture`
- Adding minimal observability or validation helpers if needed

# Primary Objective
Reach a state where the team can confidently decide whether the legacy `furniture` table can be removed in the next batch.

# Allowed Changes
- Add or update runtime-safe logging, counters, or diagnostics around legacy fallback usage
- Add or update smoke/integration validation for publish flow
- Add or update smoke/integration validation for recommendation/result logging flow
- Add docs or audit artifacts summarizing fallback usage and removal readiness
- Add small read-only helper scripts for QA or transition validation
- Tighten code paths if needed to make legacy dependency explicit and measurable

# Disallowed Changes
- Do not drop the `furniture` table in this batch
- Do not perform destructive SQL
- Do not redesign recommendation scoring logic
- Do not introduce unrelated feature work
- Do not add broad admin UI work beyond what is necessary for validation
- Do not introduce hidden fallback behavior

# Critical Safety Rule
This batch must not remove the legacy table. It must only verify whether removal is safe and strengthen the runtime QA needed before removal.

# Working Principles
- Prefer evidence over assumption
- Transitional fallback must be explicit, narrow, and measurable
- If fallback still fires, document why
- If recommendation/result logging is incomplete, surface the gap clearly
- If publish flow has weak validation, tighten it before removal work
- Keep changes minimal, direct, and reversible

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what has already been aligned
- why this batch is next
- what risk this batch removes

## 2. Legacy Fallback Audit
Identify and document:
- where `furniture` fallback still exists
- when it can still be triggered
- whether it is hit in current validation
- whether it is safe to remove now or still needs one more transition step

If helpful, add temporary explicit diagnostics/logging/counters.

## 3. Publish Flow QA
Validate and document:
- publish succeeds for valid reviewed `import_jobs`
- publish updates status correctly
- publish links `published_product_id` when available
- invalid or incomplete publish input fails safely
- duplicate publish/upsert behavior is stable

## 4. Recommendation / Result Logging QA
Validate and document:
- recommendation routes still return hydrated product rows through `furniture_products`
- `recommendations` rows are inserted as expected
- click logging still updates the intended rows
- identify any dead fields like `saved` / `purchased` if still not wired

## 5. Removal Readiness Judgment
Produce a clear judgment for legacy `furniture`:
- READY FOR REMOVAL
- NOT YET
- READY AFTER ONE SMALL FIX

Must include exact reasons.

## 6. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Legacy fallback findings
4. Publish QA findings
5. Recommendation/logging QA findings
6. Furniture removal readiness judgment
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- remaining legacy `furniture` dependency is explicitly identified
- publish flow QA is exercised and documented
- recommendation/result logging QA is exercised and documented
- a decision-ready removal judgment is produced
- no destructive change is made

# Validation
- npm run lint
- tsc --noEmit
- build if needed
- targeted QA/smoke checks for publish flow and recommendation/logging flow
- any fallback diagnostics added must be verified

# Required Result Format
Your final response must include:
- whether `furniture` is still needed
- what still blocks removal if anything
- whether publish/runtime QA is now sufficient
- what exact next batch should do