# Goal
Retire the unused `recommendations.purchased` field from the active MVP contract by confirming it has no real runtime dependency, removing code/document ambiguity around it, and producing a safe schema-cleanup artifact.

# Scope
This batch is limited to:
- Verifying that `recommendations.purchased` has no active runtime dependency
- Removing any remaining code/document references that imply it is an active MVP field
- Producing a safe SQL artifact for schema cleanup if removal is confirmed
- Re-running targeted QA after contract cleanup
- Keeping current exposure/click/save behavior stable

# Primary Objective
Finish recommendation action contract cleanup so the MVP runtime contract includes only real active fields.

# Allowed Changes
- Update docs/ops contract files
- Remove or narrow code references to `purchased` if any remain
- Add or update QA scripts/checks for post-cleanup verification
- Add explicit SQL artifact for column removal if safe
- Update runtime-safe helpers if needed to keep the contract consistent

# Disallowed Changes
- Do not redesign recommendation scoring
- Do not add purchase/order/checkout features
- Do not expand product scope beyond recommendation action cleanup
- Do not break existing click/save behavior
- Do not execute destructive schema changes in app code

# Critical Safety Rule
Only remove `purchased` if there is clear evidence that no active runtime, QA, or reporting path depends on it. Destructive schema cleanup must be provided as an explicit SQL artifact only.

# Working Principles
- MVP contract should contain only real active behavior
- Remove ambiguity before adding new features
- Prefer explicit cleanup over carrying speculative fields
- Preserve click/save behavior exactly
- Keep changes narrow, direct, and reversible

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what is already stable in recommendation actions
- why `purchased` cleanup is the next correct step
- what risk this cleanup removes

## 2. Purchased Dependency Audit
Verify and document:
- whether any runtime route updates `purchased`
- whether any UI path depends on `purchased`
- whether any QA path depends on `purchased`
- whether any ops/reporting artifact still treats `purchased` as active

## 3. Contract Cleanup
Make the recommendation action contract explicit:
- `clicked` = active
- `saved` = active
- `purchased` = out of MVP contract

Remove or update any misleading references accordingly.

## 4. Schema Cleanup Decision
State one of:
- REMOVE NOW
- HOLD FOR ONE MORE BATCH

If removal is safe, provide an explicit SQL artifact for dropping `recommendations.purchased`.

## 5. Validation
Show that after cleanup:
- exposure insert still works
- click update still works
- save update still works
- no active path expects `purchased`

## 6. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Purchased dependency findings
4. Contract cleanup summary
5. Schema cleanup decision
6. Validation results
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- `purchased` is no longer ambiguous
- contract/docs/code align on recommendation actions
- SQL artifact is provided if removal is safe
- click/save runtime remains stable

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- targeted recommendation action QA
- post-cleanup verification

# Required Result Format
Your final response must include:
- whether `purchased` can be removed now
- the exact SQL artifact if yes
- whether recommendation action contract is now final for MVP
- what should come next immediately after cleanup