# Goal
Decide and implement the MVP action contract for `recommendations.saved` and `recommendations.purchased` by either wiring them into real runtime behavior or explicitly classifying them for removal/deprecation, while keeping the current recommendation exposure/click path stable.

# Scope
This batch is limited to:
- Auditing the real product need for `saved` and `purchased` in the current MVP
- Wiring minimal safe runtime endpoints/logic if the fields should remain active
- Or explicitly marking them as remove/deprecate candidates if they should not remain in the MVP contract
- Keeping `clicked`, `request_id`, `furniture_id`, and `compatibility_score` stable
- Producing a decision-ready operational contract for recommendation action fields

# Primary Objective
Eliminate ambiguity around recommendation action fields so the runtime data contract matches real product behavior.

# Allowed Changes
- Update recommendation action routes or add minimal new action routes if needed
- Add minimal persistence logic for `saved` and/or `purchased` if approved for MVP use
- Add validation/helpers for recommendation action updates
- Add or update QA scripts for recommendation action flows
- Add docs/ops artifacts that define the recommendation action contract
- Add SQL artifact only if a field is explicitly recommended for later removal, but do not execute destructive SQL in app code

# Disallowed Changes
- Do not redesign recommendation scoring
- Do not add broad wishlist, checkout, or order-management features
- Do not introduce unrelated UI feature work
- Do not reintroduce legacy catalog paths
- Do not expand beyond MVP-safe action semantics

# Critical Safety Rule
Do not keep dead fields in the runtime contract without an explicit decision. Either wire them minimally and safely, or classify them clearly as hold/remove candidates.

# Working Principles
- MVP must favor explicit, minimal behavior
- Only keep fields that support a real current user flow
- Avoid speculative analytics fields
- Preserve current exposure/click behavior
- If a field remains unwired after this batch, explain exactly why and what the next decision is
- Prefer one-step actionable outcomes over vague future flexibility

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what is already stable
- why `saved` / `purchased` is the next decision point
- what risk this batch removes

## 2. Action Contract Decision
For each field:
- `clicked`
- `saved`
- `purchased`

State one of:
- ACTIVE MVP FIELD
- HOLD
- REMOVE CANDIDATE

And explain why in direct operational terms.

## 3. If `saved` Is Kept
Implement the smallest safe runtime behavior needed so it becomes a real field.
Expected minimum:
- explicit route or update path
- validated request shape
- update only intended recommendation rows
- QA coverage

## 4. If `purchased` Is Kept
Implement only if there is a real current MVP use case.
If not, explicitly classify it as HOLD or REMOVE CANDIDATE and explain why.

## 5. Recommendation Action QA
Validate and document:
- exposure row exists
- click update still works
- save update works if implemented
- purchased update works if implemented
- missing-row behavior remains explicit (e.g. 404)
- repeated updates behave safely

## 6. Contract Output
Produce a final recommendation action contract that defines:
- what each field means
- which route/path updates it
- whether it is user-facing, analytics-only, or dormant
- whether it should remain in MVP

## 7. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Action contract decision
4. Implemented runtime changes
5. QA findings
6. Keep / hold / remove classification
7. Exact files changed

# Completion Criteria
This batch is complete only if:
- `saved` and `purchased` are no longer ambiguous
- any kept field has a real runtime update path
- recommendation action QA is documented
- the project is left with a clearer MVP data contract than before

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- targeted QA for recommendation action routes
- any new action script or smoke check added in this batch

# Required Result Format
Your final response must include:
- whether `saved` is now real or still dormant
- whether `purchased` stays or should be retired
- whether the recommendation action contract is now MVP-safe
- what the next build-driving batch should be after this decision