# Goal
Refresh `docs/plan.md` using the actual connected Notion project source plus the currently approved repo/runtime truths, so the main living plan reflects both the business north star and the current engineering reality.

# Scope
This task is limited to:
- re-reading the current `docs/plan.md`
- incorporating the connected Notion project source into the top-level sections of the plan
- keeping only current approved truth in the plan
- keeping the plan short and high-signal
- reconciling the Notion business/product direction with the currently approved runtime/data/geometry contracts

This is not a UX implementation task.
This is not a parser task.
This is not a schema task.
This is not a feature-development task.

# Primary Objective
Turn `docs/plan.md` into the true first-read source of truth for future ChatGPT/Codex sessions by merging:
1. the business north star and product intent from Notion
2. the fixed engineering/runtime contracts already established in the repo and ops docs
3. the current execution state and next priorities

# Allowed Changes
- Read broadly across:
  - current `docs/plan.md`
  - current approved ops/docs
  - connected Notion source pages already identified as high-signal
- Update only `docs/plan.md`
- Add a tiny cross-reference only if clearly useful and still minimal

# Disallowed Changes
- Do not turn `docs/plan.md` into a long historical log
- Do not copy huge chunks of Notion prose verbatim
- Do not create multiple competing plan files
- Do not redesign product/runtime contracts in this step
- Do not change code, schema, parser behavior, or runtime behavior

# Critical Safety Rule
`docs/plan.md` must contain only current approved truth. It may absorb top-level business intent from Notion, but it must not import stale roadmap promises, aspirational scope, or speculative ideas as if they were current execution truth.

# Working Principles
- Short, high-signal, first-read document only
- Business north star first
- Current engineering truth second
- Current execution order third
- Evidence and historical detail stay in `docs/ops/*` and `docs/tasks/*`
- Keep “ultimate goal”, “current scope”, and “deferred lanes” clearly separated

# Required Updates for `docs/plan.md`

## 1. Strengthen the North Star section
It must explicitly capture the connected Notion business intent:
- this business is not a pretty image demo
- the goal is room photo + simple conditions -> actionable, purchasable furniture recommendation
- save / compare / outbound purchase are part of the core loop
- long-term direction includes placement realism and execution, but current MVP remains bounded

Also include the core product promise:
- reduce “Will this fit / Will this match / What if I fail?” anxiety for real buyers
- first target users: movers, first-time solo renters, newlyweds, remodeling-intent users

## 2. Add a compact product-journey section
Reflect the Notion MVP flow:
- image upload
- target area / furniture selection or condition input
- style selection
- recommendation/result generation
- furniture info + purchase link

Do not turn this into a long UX spec. Keep it one short section.

## 3. Add compact scope ladder: MVP / V1 / V2
This should be extremely short.
Use the already-aligned truth:
- MVP: analysis + recommendation + purchasable products + save/compare/outbound basics
- V1: stronger recommendation quality, persuasion, comparison, switching
- V2: deeper placement, partner/estimate/personalization loops

Do not let future scope overwhelm current focus.

## 4. Preserve and tighten the engineering constitution
Keep the already-fixed truths explicit:
- `furniture_products` is the canonical active product catalog
- `import_jobs` is staging/review only
- recommendation/save/click/compare identity is canonical product identity
- quality gate easing forbidden
- contract drift forbidden
- read broadly, write narrowly
- deterministic parser lane and future image-derived lane are separate
- current parser work only applies to trustworthy text-based pages

## 5. Refresh the current system snapshot
Ensure it reflects the current approved state:
- canonical-first runtime convergence
- scoring/vector coverage materially recovered
- geometry contract v1.1 fixed
- refreshed geometry completeness
- source-shape classification
- deterministic follow-up queue closed
- image-heavy/source-absence bucket isolated for future lane work

## 6. Refresh current seller status
Keep this compact and current:
- IKEA
- Livart
- Hanssem
- Todayhouse
- generic/experimental

Only current support level, not long history.

## 7. Refresh active execution order
It should now reflect the current lane truth:
- deterministic parser lane is largely closed
- image-heavy/source-absence lane is isolated
- future image-derived geometry is a separate experiment lane
- next work should follow the current queue/lane logic, not re-open closed deterministic targets

## 8. Keep the update rule strict
State clearly:
- update only after approved work
- keep current truth only
- use links for detailed evidence
- remove stale plan language when current truth changes

# Completion Criteria
- `docs/plan.md` is updated
- the top-level business goal from connected Notion is clearly visible
- the document still reflects current repo/runtime truth, not just business ambition
- the file remains short enough to be a real first-read document
- no code/runtime/schema changes are made

# Validation
Run and report:
- `git diff --check`

If anything other than docs changes, also run:
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