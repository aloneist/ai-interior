# Goal
Recover scoring/vector coverage for the canonical active catalog so the canonical-first runtime is not held back by missing legacy scoring features on newly published canonical products.

# Scope
This task is limited to:
- identifying the active canonical products that still lack usable scoring/vector coverage
- defining and executing the minimum safe backfill path for those canonical products
- preserving canonical product identity and the current runtime convergence state
- validating that runtime scoring coverage measurably improves after backfill
- documenting what legacy scoring dependency still remains after the backfill step

This is not a UX task and not a new seller-parser task.

# Primary Objective
Move the canonical-first runtime from “safe but partially uncovered” to “materially better scoring coverage,” starting with the currently uncovered active canonical products.

# Allowed Changes
- Read broadly across runtime recommendation paths, scoring logic, vector generation paths, catalog reads, publish paths, and any legacy compatibility assumptions
- Add or update the minimum necessary backfill path, script, or runtime-safe helper for canonical products
- Add or update a focused ops/dev doc describing the backfill execution and resulting coverage improvement
- Add or update tiny validation helpers/logging if useful
- Use existing canonical identity and publish contracts as-is

# Disallowed Changes
- Do not redesign recommendation ranking/scoring strategy
- Do not redesign the app UX
- Do not broaden into a generic architecture rewrite
- Do not loosen quality gates
- Do not redesign the DB schema in this step
- Do not delete legacy tables blindly
- Do not change canonical identity semantics
- Do not mix this task with seller geometry hardening
- Do not regress geometry contract v1.1 or overwrite canonical geometry meaning

# Critical Safety Rule
Backfill must strengthen scoring coverage for canonical products without reintroducing legacy-first runtime behavior or creating a new identity contract. `furniture_products` remains the canonical source of active products.

# Working Principles
- Read broadly, write narrowly
- Candidate source stays canonical-first
- Backfill targets canonical product IDs
- Legacy vector use must remain explicit and bounded
- Missing scoring coverage must be reduced measurably, not hidden cosmetically
- Do not let scoring recovery mutate canonical geometry semantics
- Prefer the smallest operationally safe backfill path over larger refactors

# Required Behavior / Structure

## 1. Re-read the current scoring/runtime path
Inspect all relevant paths that affect scoring coverage, including as needed:
- recommendation APIs
- MVP route
- current ranking/scoring logic
- current vector compatibility layer
- any vector-generation or analyze-furniture paths
- canonical catalog reads
- publish/read coherence points for canonical products

Do not limit analysis to one file.

## 2. Identify the exact uncovered active set
Measure and report:
- total active canonical products
- total covered by usable scoring/vector rows
- total uncovered
- uncovered breakdown by source site
- uncovered breakdown by category if useful
- exact priority order for backfill (at minimum Livart first, then Hanssem, then remaining uncovered IKEA unless evidence suggests otherwise)

Do not stay abstract.

## 3. Define and execute the smallest safe backfill path
Implement the narrowest safe operational path to create or restore scoring/vector coverage for uncovered active canonical products.

Requirements:
- backfill keyed by canonical product ID
- no candidate-source regression
- no identity regression
- no hidden third contract
- no ranking redesign
- no geometry contract drift

If a temporary bounded compatibility mechanism is needed, name it explicitly and keep it narrow.

## 4. Preserve runtime semantics while improving coverage
Ensure:
- recommendation payload IDs remain canonical `furniture_products.id`
- recommendation/save/click/compare semantics remain canonical
- missing-coverage safety behavior from the previous step is preserved where still relevant
- improved coverage actually reduces the uncovered set rather than merely masking it

## 5. Validate runtime and coverage improvement
Run focused validation on:
- active canonical coverage before vs after
- recommendation runtime paths
- any relevant smoke/regression path actually used
- ranking behavior on rows previously uncovered, if applicable

The result should show measurable coverage recovery and confirm the runtime still works.

## 6. Document the post-backfill state
Produce a focused note/doc stating:
- coverage before
- coverage after
- what backfill path was used
- what sources/categories remain uncovered
- what legacy scoring dependency still remains
- what the next cleanup or geometry-completeness step should be

# Completion Criteria
- The uncovered active canonical scoring set is explicitly identified
- A real backfill path is executed or implemented for the uncovered set
- Active scoring/vector coverage improves measurably
- Runtime remains canonical-first
- Canonical identity semantics remain intact
- No ranking/UX/schema sprawl occurs
- Focused validation passes

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed
- any focused runtime smoke/check actually used

Also report:
- coverage before and after
- which canonical products/sources were backfilled
- what path produced the new vector/scoring rows
- what still remains uncovered
- what legacy dependency still remains

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Scoring/vector coverage findings before backfill
3. What changed
4. Focused runtime validation results
5. Coverage after backfill
6. Legacy scoring dependency still remaining
7. Deferred items and why
8. Validation results
9. Final approval recommendation