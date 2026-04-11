# Goal
Audit vector/scoring coverage for the canonical active catalog and harden the canonical-first recommendation runtime so scoring quality is no longer silently limited by incomplete legacy feature coverage.

# Scope
This task is limited to:
- measuring vector/scoring coverage across active `furniture_products`
- identifying where canonical products still lack usable scoring features
- classifying the remaining legacy dependency on `furniture_vectors`
- implementing the smallest safe hardening step for canonical-first scoring coverage
- validating that recommendation runtime still works after the coverage-hardening step

This is not a UX task and not a new seller-parser task.

# Primary Objective
Turn the current canonical-first runtime from “candidate inclusion converged” into “scoring coverage understood and operationally hardened,” without introducing contract drift or broad architecture changes.

# Allowed Changes
- Read broadly across recommendation runtime paths, scoring logic, catalog reads, publish paths, and legacy vector usage
- Add or update small audit/report logic for active canonical product scoring coverage
- Add or update the minimum necessary runtime/scoring compatibility logic
- Add or update a focused ops/dev doc describing scoring coverage state and any temporary compatibility rules
- Add or update tiny validation helpers/logging if useful

# Disallowed Changes
- Do not redesign recommendation ranking/scoring strategy
- Do not redesign the app UX
- Do not broaden into a generic architecture rewrite
- Do not loosen quality gates
- Do not redesign the DB schema in this step
- Do not blindly delete legacy tables
- Do not change canonical identity semantics

# Critical Safety Rule
`furniture_products` remains the canonical active product source. This task may harden scoring compatibility, but it must not reintroduce legacy-first candidate selection or create a hidden second identity contract.

# Working Principles
- Read broadly, write narrowly
- Candidate source stays canonical-first
- Legacy vector use must be explicit, measured, and bounded
- Missing scoring features must be surfaced, not hidden
- Runtime hardening is more important than cleanup optics
- Preserve recommendation/save/click/compare canonical identity semantics

# Required Behavior / Structure

## 1. Re-read the current canonical-first runtime
Inspect all relevant runtime/scoring paths, including as needed:
- recommendation APIs
- MVP route
- canonical catalog read helpers
- current vector compatibility layer
- ranking/scoring code that consumes vector-style fields
- publish/read coherence points for canonical products

## 2. Audit active scoring coverage
Measure active `furniture_products` against the current scoring-feature expectations.

At minimum report:
- total active canonical products
- how many have matching vector/scoring coverage
- how many do not
- coverage by source site
- coverage by category if useful
- whether missing coverage is concentrated in newly published canonical products

## 3. Identify the exact scoring-coverage risk
State clearly:
- what feature fields the runtime still expects from the vector layer
- what currently happens when those fields are null/missing
- whether current fallback behavior is acceptable, weak, or misleading
- whether missing coverage affects candidate ranking quality, only ranking order, or broader runtime correctness

Do not stay abstract.

## 4. Implement the smallest safe hardening step
Choose the narrowest safe step, such as:
- explicit scoring-coverage audit output in runtime responses/logs
- bounded null-handling hardening for missing vector features
- a small compatibility rule that prevents missing-vector rows from being scored misleadingly
- a small backfill/read-path improvement if clearly justified

Requirements:
- no candidate-source regression
- no identity regression
- no ranking redesign
- no hidden third contract

## 5. Validate runtime behavior
Run focused validation on:
- recommendation runtime path(s)
- canonical product resolution
- scoring behavior when vector coverage is present vs missing
- any relevant smoke/regression path actually used

The result should show that runtime still works and that scoring-coverage state is now explicit and safer.

## 6. Document the scoring-coverage state
Produce a focused note/doc that states:
- current vector/scoring coverage level
- where the biggest gaps remain
- what temporary compatibility rule exists, if any
- what the next cleanup or backfill step should be

# Completion Criteria
- Active canonical scoring coverage is explicitly measured
- The exact scoring-coverage gap is identified
- Runtime remains canonical-first
- Any compatibility behavior is explicit and bounded
- Focused runtime validation passes
- No ranking/UX/schema sprawl occurs

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed
- any focused runtime smoke/check actually used

Also report:
- active canonical count
- scoring/vector coverage count
- main uncovered segments
- what runtime/scoring hardening was added
- what still remains legacy-bound

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Scoring/vector coverage audit findings
3. What changed
4. Focused runtime validation results
5. Legacy scoring dependency still remaining
6. Deferred items and why
7. Validation results
8. Final approval recommendation