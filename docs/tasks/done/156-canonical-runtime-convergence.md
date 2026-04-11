# Goal
Converge the active recommendation runtime onto the canonical catalog path so the system reads `furniture_products` as the operational product source instead of continuing dual runtime operation with legacy `furniture + furniture_vectors`.

# Scope
This task is limited to:
- identifying the active recommendation/runtime paths that still depend on legacy `furniture` and `furniture_vectors`
- defining and implementing the smallest safe convergence step toward `furniture_products`
- preserving current recommendation/save/click/compare canonical identity semantics
- documenting any temporary compatibility layer if still needed
- validating that runtime behavior still works after convergence

This is not a UX task and not a new seller-parser task.

# Primary Objective
Reduce the current dual-runtime structure by making the recommendation runtime consume the canonical product catalog path, or by adding the minimum compatibility layer required to do so safely without contract drift.

# Allowed Changes
- Read broadly across runtime recommendation paths, catalog read paths, publish paths, and any legacy compatibility layers
- Update the minimum necessary runtime code to consume canonical product rows from `furniture_products`
- Add or update a small compatibility layer only if required for safe staged convergence
- Add or update a focused ops/dev doc describing the convergence step and any temporary legacy bridge
- Add or update tiny validation helpers/logging if useful

# Disallowed Changes
- Do not redesign ranking/scoring logic
- Do not redesign the app UX
- Do not broaden into a generic architecture rewrite
- Do not loosen quality gates
- Do not redesign the DB schema in this step
- Do not start deleting legacy tables blindly in this step
- Do not change canonical identity semantics

# Critical Safety Rule
`furniture_products` remains the canonical active product catalog. Any convergence step must move runtime toward that source of truth, not create a third contract or preserve legacy behavior by hiding drift.

# Working Principles
- Read broadly, write narrowly
- Canonical product identity must remain invariant
- Runtime convergence is more important than cosmetic cleanup
- Temporary compatibility is allowed only if explicitly named and bounded
- Do not break current recommendation/save/click/compare contracts
- Distinguish contract convergence from legacy-table deletion

# Required Behavior / Structure

## 1. Re-read the active runtime path
Inspect all relevant paths that still touch product runtime data, including as needed:
- recommendation APIs
- MVP route
- legacy `furniture` / `furniture_vectors` usage
- canonical catalog reads
- publish path from `import_jobs` to `furniture_products`
- any action/logging paths that assume legacy IDs

## 2. Identify the exact dual-runtime gap
State clearly:
- which runtime routes still read legacy tables
- which routes already use canonical product identity semantics
- what data the runtime still expects from `furniture` / `furniture_vectors`
- what is missing for the runtime to read `furniture_products` directly

Do not stay abstract.

## 3. Implement the smallest safe convergence step
Choose the narrowest safe path, such as:
- direct runtime read from `furniture_products` where feasible
- or a temporary explicit compatibility layer mapping canonical products into the runtime expectation

Requirements:
- no contract drift
- no hidden dual-source ambiguity
- no recommendation identity regression
- no UX scope expansion

## 4. Preserve recommendation/event identity
Ensure:
- recommendation rows still point to canonical product identity
- save/click/compare semantics remain canonical
- runtime does not silently reintroduce legacy-only IDs as the primary identity

## 5. Validate runtime behavior
Run focused validation on:
- recommendation runtime path(s)
- canonical product resolution
- publish/read coherence
- any existing relevant smoke/regression path

The goal is to confirm the runtime still works while reading from the canonical catalog path.

## 6. Document the convergence state
Produce a focused doc or run note that states:
- what still remains legacy
- what is now converged
- whether a temporary compatibility layer exists
- what the next cleanup step would be after this convergence lands

# Completion Criteria
- The active runtime dual-source gap is explicitly identified
- Runtime moves toward `furniture_products` as the canonical source
- Recommendation/save/click/compare identity remains canonical
- Any temporary compatibility layer is explicit and bounded
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
- which runtime paths were changed
- what legacy dependency still remains, if any
- what temporary compatibility was introduced, if any
- what validation proves the runtime still works

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Dual-runtime gap found
3. What changed
4. Focused runtime validation results
5. Legacy dependency still remaining
6. Deferred items and why
7. Validation results
8. Final approval recommendation