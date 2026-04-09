# Goal
Purge deterministic QA fixture data from the live operational tables, then rerun the operational audit so the team has a trustworthy post-clean production baseline.

# Scope
This task is limited to:
- identifying deterministic QA fixture rows
- deleting only those QA fixture rows and their directly linked operational artifacts
- preserving real operational data
- rerunning the post-clean audit
- documenting the resulting clean baseline

This is not a redesign task and not a new workflow-design task.

# Primary Objective
Remove QA/test contamination from the current operational dataset so that the remaining audit numbers represent real operating state, not mixed real+fixture state.

# Allowed Changes
- Add or update a small operational cleanup script or extend the existing operational script narrowly
- Delete deterministic QA fixture rows from live data
- Delete directly linked canonical product rows and related operational artifacts only when the linkage is explicit and safe
- Add or update a small run artifact documenting the cleanup and resulting audit
- Add or update runbook notes if needed

# Disallowed Changes
- Do not guess which rows are QA fixtures
- Do not delete ambiguous rows
- Do not redesign the review/publish workflow
- Do not redesign recommendation/runtime behavior
- Do not broaden schema or architecture
- Do not perform generic data cleanup beyond the explicit QA fixture set

# Critical Safety Rule
Only purge rows that are provably QA fixtures by deterministic identifiers such as known QA URL schemes, explicit QA-only names, or exact linkage to those known QA records. If the row could plausibly be real operational data, do not delete it.

# Working Principles
- Deterministic purge only
- Preserve real operating data
- Remove linked QA artifacts together, not partially
- Re-audit immediately after cleanup
- End with a trustworthy baseline
- Keep the cleanup explainable and reversible in reasoning, even if not database-reversible

# Required Behavior / Structure

## 1. Define the deterministic QA fixture match set
Identify rows that are unquestionably QA fixtures using explicit rules such as:
- `source_url` with `qa://...`
- known QA-only test names
- exact canonical rows created from those QA fixture source URLs
- exact linked recommendation/log artifacts if they exist

Document the exact match rules used.

## 2. Purge QA fixture rows live
Delete only the QA fixture set and directly linked artifacts.

At minimum consider:
- `import_jobs`
- linked `furniture_products`
- linked `recommendations` or other operational/log rows if they point to those QA canonical products

Do not delete unrelated real rows.

## 3. Preserve operational integrity
Ensure the purge does not leave dangling references or partially cleaned QA artifacts.

If there is uncertainty about a linked row, keep it and report it.

## 4. Run post-clean audit
Immediately rerun the operational audit after purge and report:
- total jobs
- `pending_review`
- `published`
- deterministic reconciliation candidates
- true publish-ready candidates
- manual-review-required candidates

This becomes the new real operational baseline.

## 5. Update the operational record
Add a small execution artifact documenting:
- the deterministic QA fixture rules used
- rows deleted
- rows intentionally preserved
- post-clean audit numbers
- any remaining manual-review items

# Completion Criteria
- QA fixture rows are removed only through deterministic rules
- real operational rows remain intact
- directly linked QA artifacts are not left half-cleaned
- post-clean audit snapshot exists
- the resulting counts can be treated as the true operational baseline
- build/lint/type checks pass only if code changed

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if code changed
- `npm run lint` only if code changed
- `npm run build` only if code changed

Also report:
- exact fixture match rules
- exact rows/artifacts deleted
- exact post-clean audit snapshot
- any rows intentionally left untouched

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Deterministic QA fixture rules used
3. Live purge actions executed
4. Post-clean audit snapshot
5. Rows intentionally left untouched
6. Docs / execution record
7. Validation results
8. Final approval recommendation