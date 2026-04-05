# Goal
Stabilize the runtime after legacy `furniture` removal and clean up the remaining data-contract ambiguity in recommendation logging, publish/review policy, and vector operations.

# Scope
This batch is limited to:
- Verifying the post-drop environment after legacy `furniture` removal
- Hardening runtime checks so no hidden dependency on `furniture` remains
- Cleaning up dead or unwired fields in `recommendations`
- Clarifying the operational contract for `import_jobs` review/publish flow
- Clarifying the operational contract for `furniture_vectors` generation/update behavior
- Producing decision-ready recommendations for any remaining hold fields

# Primary Objective
Move the project from transition mode into stable published-catalog operations with explicit, minimal runtime data contracts.

# Allowed Changes
- Update QA scripts and runtime validation for post-drop verification
- Remove or deprecate dead analytics fields if clearly unwired and safe to handle now
- Add explicit documentation for publish/review status rules
- Add explicit documentation for vector generation/update rules
- Add minimal runtime-safe guards or validation where contract ambiguity still exists
- Add docs/ops artifacts summarizing final post-drop behavior

# Disallowed Changes
- Do not redesign recommendation scoring logic
- Do not add unrelated product features
- Do not reintroduce legacy `furniture`
- Do not broaden workflow states beyond the approved MVP contract
- Do not mix major refactors into this batch

# Critical Safety Rule
This batch must preserve the current published-catalog runtime path and must not reintroduce hidden data sources or transitional fallbacks.

# Working Principles
- Keep runtime contracts explicit and minimal
- Remove ambiguity before adding new features
- Prefer operational clarity over speculative flexibility
- Treat `furniture_products` as the only published product source of truth
- Treat `import_jobs` as staging/review only
- Treat `furniture_vectors` as recommendation feature data attached to published products
- Do not keep unused fields alive without a reason

# Required Behavior / Structure
The implementation must include:

## 1. Current Position Summary
A short Korean summary of:
- what changed after the legacy table drop
- why this stabilization batch is next
- what operational risk this batch removes

## 2. Post-Drop Verification
Verify and document:
- recommendation routes still work
- publish route still works
- log-click still works
- no code path depends on legacy `furniture`
- no QA script still assumes legacy `furniture`

## 3. Recommendations Contract Review
Audit `recommendations` and classify fields:
- actively used
- operationally useful but not yet wired
- dead / removable candidate

Focus especially on:
- `clicked`
- `saved`
- `purchased`
- `request_id`
- `event_source`

If removal is not yet safe, mark fields as HOLD with exact reasons.

## 4. Import Review/Publish Contract Review
Make the `import_jobs` operational rules explicit:
- what `pending_review` means
- what `published` means
- what `rejected` means
- what minimum fields are required before publish
- whether repeated publish is allowed and how it behaves

## 5. Vector Operations Contract Review
Document and tighten:
- when vectors are created
- when vectors are updated
- what `vector_version` means operationally
- whether re-analysis overwrites or versions data
- whether any current fields are unused or unstable

## 6. Decision Output
For each remaining ambiguous field or behavior, classify:
- KEEP
- KEEP WITH CLARIFICATION
- HOLD
- REMOVE CANDIDATE

## 7. Required Result Format
Final response must include:
1. Current position summary
2. Approval judgment
3. Post-drop verification findings
4. Recommendations contract findings
5. Import publish contract findings
6. Vector operations contract findings
7. Classification results
8. Exact files changed

# Completion Criteria
This batch is complete only if:
- post-drop runtime is explicitly verified
- no legacy dependency remains
- `recommendations` field status is classified
- `import_jobs` publish contract is explicit
- `furniture_vectors` operational contract is explicit
- the project is left in a clearer operating state than before

# Validation
- npm run lint
- npx tsc --noEmit
- npm run build
- post-drop targeted runtime QA
- any updated QA or contract-check script

# Required Result Format
Your final response must include:
- whether post-drop runtime is stable
- which fields/contracts are now explicit
- which fields remain hold or remove-candidate
- what should be the next build-driving batch after stabilization