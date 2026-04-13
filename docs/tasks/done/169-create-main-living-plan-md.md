# Goal
Create a single living `docs/plan.md` file that acts as the main development source of truth for the AI interior curation business, so future ChatGPT/Codex work can recover the current direction, fixed contracts, progress level, and next priorities without re-reading a large pile of historical ops/task artifacts.

# Scope
This task is limited to:
- creating `docs/plan.md`
- consolidating the business north star, fixed product/data/runtime contracts, current execution lanes, current progress snapshot, and next priority order
- referencing existing detailed ops/task/docs as supporting evidence, without duplicating all historical prose
- defining an update rule so `docs/plan.md` stays short, current, and reliable

This is not a UX task.
This is not a recommendation-redesign task.
This is not a schema-change task.
This is not a new parser implementation task.

# Primary Objective
Make `docs/plan.md` the single current-state document that a future ChatGPT/Codex session can read first to recover:
- the ultimate business goal
- the fixed operating contracts
- the current development level
- the active execution lanes
- the next priorities
- what is intentionally deferred

# Allowed Changes
- Read broadly across the existing rules/constitution docs, ops docs, and approved execution outcomes
- Create `docs/plan.md`
- Add a very small “read this first” reference from another obvious entrypoint only if clearly useful
- Link out to existing ops/task docs rather than copying their full contents

# Disallowed Changes
- Do not rewrite history into a long diary
- Do not dump every past task result into `docs/plan.md`
- Do not create multiple competing plan files
- Do not redesign product/runtime contracts in this step
- Do not change code, schema, or runtime behavior in this step unless a tiny cross-link is clearly necessary

# Critical Safety Rule
`docs/plan.md` must contain only current approved truth, not speculative ideas. Rejected ideas, stale plans, and unapproved future guesses must not become part of the main plan.

# Working Principles
- Keep `docs/plan.md` short and high-signal
- Current truth only; detailed evidence stays in `docs/ops/*` and `docs/tasks/*`
- Use it as the first-read entrypoint for future ChatGPT/Codex sessions
- Distinguish:
  - business north star
  - fixed contracts
  - current progress
  - active lanes
  - next execution order
  - deferred lanes
- Update only after approved steps

# Required Structure for `docs/plan.md`

## 1. North Star
Must include the top-level business goal:
- room photo + simple conditions -> purchasable furniture combination recommendation -> save / compare / outbound purchase flow
- state explicitly that the business output is not a “pretty demo” but an operational recommendation system with real purchasable products

## 2. Development Constitution / Non-Negotiables
Summarize the fixed principles only:
- CTO judgment standard
- data before UI
- `furniture_products` as the canonical active product catalog
- `import_jobs` as staging/review only
- recommendation/save/click/compare identity is canonical product identity
- quality gate easing forbidden
- contract drift forbidden
- read broadly, write narrowly
- deterministic parser lane and future image-derived lane are separate

## 3. Current System Snapshot
Short current-state summary only:
- runtime/canonical convergence state
- scoring/vector coverage state
- geometry contract v1.1 state
- geometry completeness state
- current source-shape classification state
- deterministic queue closed / image-heavy bucket status if still current

## 4. Current Seller Status
Keep this compact:
- IKEA
- Livart
- Hanssem
- Todayhouse
- generic/experimental
For each, state current support level only, not long history.

## 5. Active Execution Order
State only the live order, for example:
- current active lane
- next 2–4 priorities
- what not to do yet

## 6. Deferred / Separate Lanes
Examples:
- image-derived geometry
- non-round shape semantics beyond current evidence
- broader schema expansion
- anything intentionally outside the current deterministic lane

## 7. Source-of-Truth Reading Order
A very short section:
- read `docs/plan.md` first
- then read the current task doc
- then only the direct supporting ops docs for the active lane

## 8. Update Rule
Must state:
- update only after approved work
- keep current truth only
- link to detailed evidence instead of copying it
- remove stale plan language when the current truth changes

# Content Requirements
`docs/plan.md` must incorporate and reconcile the following already-established truths:
- the business north star and development constitution
- data-first and canonical catalog principles
- current runtime/scoring/geometry state
- current geometry/source-shape lane split
- current recommendation/product identity rules
- current next-lane priority

# Completion Criteria
- `docs/plan.md` exists
- it contains the top-level business objective
- it contains the current fixed contracts
- it contains the current progress snapshot
- it contains the current next execution order
- it stays compact enough to be a true first-read entrypoint
- it does not become a historical dump

# Validation
Run and report:
- `git diff --check`

If any code or cross-link file changes:
- `npm run typecheck`
- `npm run lint`
- `npm run build`

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Changed files
3. One-line reason per file
4. Commands run
5. Pass/fail
6. Deferred issues if any