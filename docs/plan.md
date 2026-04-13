# 1. North Star

Build an operational AI interior curation product, not a pretty demo.

The business goal is:

- room photo + user-confirmed room context
- actionable furniture recommendation
- fit-confidence guidance
- geometry overlay when placement is eligible
- real purchasable products
- save / compare / outbound purchase flow

The core customer problem is decision anxiety before purchase:

- "Will this fit?"
- "Will this match my room?"
- "What if I buy the wrong thing?"

The first target users are real buyers with near-term intent, especially movers, first-time solo renters, newlyweds, and remodeling-intent users. The current product promise is to reduce fit/match/failure anxiety and move the user from uncertainty to a purchaseable next step through honest fit-confidence guidance, not fake room realism.

Core product journey:

- upload room photo
- provide simple room-context inputs for fit judgement
- receive recommendation results on canonical products
- review fit judgement and geometry overlay when eligible
- review product info, save/compare options, and follow outbound purchase links

Scope ladder:

- MVP: analysis + recommendation + purchasable products + save/compare/outbound basics
- V1: stronger recommendation quality, persuasion, compare/switch confidence, and cleaner purchase handoff
- V2: deeper placement realism, partner/estimate loops, and more personalized execution support

Current rule: the north star is broader than the current execution lane. Do not blur future ambition into present support claims. Real-image insertion remains deferred and is not the present product promise.

Business source grounding from Notion:

- project strategy and north star page
- business direction page
- MVP structure page
- MVP customer-flow page

# 2. Development Constitution / Non-Negotiables

- CTO judgment standard: protect recommendation quality, operational data structure, and QA/regression safety before speed, cleanup, or presentation polish.
- Data before UI: product trust depends on real catalog, publish, runtime, and audit truth before interface expansion.
- `furniture_products` is the only canonical active product catalog.
- `import_jobs` is staging/review only; `published_product_id` is the official staging -> canonical link.
- Recommendation/save/click/compare identity stays canonical product identity.
- Quality gate easing is forbidden.
- Contract drift is forbidden.
- Read broadly, write narrowly.
- Deterministic parser work only applies to trustworthy text-based pages.
- The deterministic parser lane and the future image-derived lane must stay separate.

Primary contract references:

- [Import jobs review and publish runbook](./ops/import-jobs-review-and-publish-runbook-2026-04-09.md)
- [Recommendation action contract](./ops/recommendation-action-contract-2026-04-05.md)
- [Parser geometry contract v1.1](./ops/parser-geometry-contract-v1-1-2026-04-11.md)
- [Fit-confidence product / UX / data contract](./ops/fit-confidence-product-ux-data-contract-2026-04-12.md)
- [Placement eligibility and geometry overlay contract](./ops/placement-eligibility-and-geometry-overlay-contract-2026-04-12.md)
- [IKEA placement control baseline](./ops/ikea-placement-control-baseline-2026-04-12.md)
- [Bounded geometry overlay prototype](./ops/bounded-geometry-overlay-prototype-2026-04-12.md)
- [Real-room overlay usefulness validation](./ops/real-room-overlay-usefulness-validation-2026-04-12.md)

# 3. Current System Snapshot

- Canonical-first runtime convergence is done: active recommendation candidate truth, hydration, and runtime IDs now come from `furniture_products`.
- Scoring/vector coverage has been materially recovered: active canonical coverage is `47 / 48` (`97.9%`), with the only uncovered row being a QA fixture.
- Geometry contract `v1.1` is fixed: canonical geometry remains outer-envelope `width_cm`, `depth_cm`, `height_cm`, with round/diameter semantics preserved in metadata.
- The current product promise is now explicitly recommendation + fit-confidence guidance + geometry overlay + save/compare/purchase handoff, not room-photo furniture insertion.
- Placement eligibility is now explicitly split: `recommendable`, `overlay-ready`, `insertion-ready`, `insertion-ineligible`, and optional `bundle-only` are different operational meanings, and recommendable inventory must not be treated as insertion-ready inventory.
- IKEA clean-control review now confirms that trusted geometry plus clean single-product assets is enough to validate `overlay-ready`, but not enough to claim broad `insertion-ready`.
- A bounded IKEA overlay prototype now exists on the vetted clean-control subset and shows anchor-based occupied-area guidance without claiming insertion realism.
- Real-room validation now shows that room-image context improves comprehension of occupied-area guidance, but also raises false-confidence risk unless room-plane, anchor, and scale assumptions stay explicit.
- Fit-confidence guidance now depends on user-confirmed room context such as target zone, reference measurement, usable span, and keep-out constraints; camera-only inference is not the current contract.
- Current active canonical geometry completeness is `36` full `3d`, `1` usable `2d`, `2` partial, `9` absent out of `48`.
- Source-shape classification is already in place: `37` `eligible | text_structured`, `2` `conditional | text_partial`, `9` `ineligible | image_heavy_or_absent`.
- Execution-queue split is already in place. The deterministic follow-up queue is closed; the remaining unresolved geometry backlog is the official `8`-row image-derived geometry experiment pool (`5` Hanssem, `3` Livart), kept out of deterministic parser KPI counting.
- `furniture_vectors` still exists as a scoring compatibility surface, but it is no longer the runtime catalog truth.
- `furniture_products` remains the canonical owner of active recommendation identity and placement-related meaning used by runtime; `import_jobs` remains staging/review only, with placement evidence there treated as provisional until publish.
- Geometry overlay is an approved honest fallback direction for placement guidance when insertion trust conditions are not met, and the current lane is to define that fit-confidence contract cleanly before broader placement work continues.
- The current next decision is no longer whether to make the overlay prettier; it is whether the product promise, room-side input contract, and placement-readiness semantics are explicit enough to keep the product honest.

Supporting ops docs:

- [Canonical runtime convergence](./ops/canonical-runtime-convergence-2026-04-11.md)
- [Canonical scoring coverage backfill](./ops/canonical-scoring-coverage-backfill-2026-04-11.md)
- [Canonical dimension completeness audit refresh](./ops/canonical-dimension-completeness-audit-2026-04-11.md)
- [Canonical source-shape classification](./ops/canonical-source-shape-classification-2026-04-11.md)
- [Hanssem deterministic follow-up queue execution](./ops/hanssem-deterministic-followup-queue-execution-2026-04-11.md)

# 4. Current Seller Status

- IKEA: `supported_operational`; strongest deterministic geometry baseline and regression reference.
- Livart: `supported_operational only for limited categories/cases`; identity/publish path is operational, geometry works only where trustworthy overall-size text exists.
- Hanssem: `supported_operational only for limited categories/cases`; identity/publish path is operational, but deterministic geometry support remains narrow and many PDPs are image-heavy.
- Todayhouse: `fetch_blocked`; not an active parser or geometry lane until fetch/access becomes real.
- Generic / fallback hosts: `experimental`; do not prioritize without real staged validation.

Reference:

- [Seller capability matrix refresh](./ops/seller-capability-matrix-refresh-2026-04-10.md)

# 5. Active Execution Order

1. Keep the core loop grounded in canonical truth: room input -> recommendation -> save/compare/click on canonical product IDs -> outbound purchase handoff.
2. Keep the current publish/runtime/data contracts stable; do not reopen canonical convergence, identity semantics, or quality gates without an explicit approved change.
3. Keep deterministic parser follow-up closed unless new trustworthy text evidence appears on a real source page.
4. Treat the isolated image-heavy/source-absence rows as the official image-derived geometry experiment pool, not as ordinary deterministic parser misses.
5. Treat the primary UX as: room photo upload -> room-context input -> recommendation result -> fit judgement -> geometry overlay when eligible -> save/compare/purchase.
6. Treat placement readiness as a stricter contract than recommendation readiness: use geometry overlay when trustworthy geometry exists but insertion trust does not.
7. Bundle furniture and weak/noisy/lifestyle-heavy product assets are excluded from room insertion by default unless a strict exception is proven.
8. The active next product-definition lane is contract realignment around fit-confidence guidance rather than room-photo insertion.
9. The immediate next clarification after that contract is the room-side input requirement for honest fit guidance, not broader visual rendering.
10. Only after those contracts are explicit should bounded overlay refinement continue on the current non-insertion prototype path.
11. Broad `insertion-ready` remains blocked; a narrow preview-only insertion experiment is secondary and should not outrank fit-confidence contract clarity.
12. Production image-derived implementation remains deferred and outside the immediate next step.
13. Continue seller support expansion only where deterministic, text-grounded evidence justifies it.

Do not do yet:

- no quality-gate easing
- no contract reinterpretation
- no recommendation ranking redesign
- no broad UX redesign
- no product promise drift back toward fake room insertion
- no speculative schema cleanup
- no image-derived geometry work inside the deterministic lane
- no treating clean recommendation inventory as insertion-ready by default
- no noisy seller OCR expansion as the immediate next placement step
- no presenting the current overlay prototype as insertion-ready output
- no treating current real-room overlays as camera-accurate or collision-proof

# 6. Deferred / Separate Lanes

- Image-derived geometry extraction remains deferred as an implementation lane; current approved work is a bounded candidate-discovery check against the isolated `8` active real-seller rows with `parser_lane_eligibility = ineligible` and `geometry_source_shape = image_heavy_or_absent`.
- Future OCR or vision work remains subordinate to placement eligibility rules; it may help prove `overlay-ready` geometry, but it does not by itself make a product `insertion-ready`.
- Geometry overlay is a valid fallback service direction for room-fit and occupied-area guidance when insertion is not trustworthy.
- Fit-confidence guidance depends on user-confirmed room context; broad camera-only room understanding remains deferred.
- The current clean-control path is IKEA-only and intentionally small; use it to evaluate overlay value before any noisy image-derived expansion.
- The current prototype path is still bounded and anchor-assumption-based; any continuation depends on usefulness of the occupied-area guidance rather than visual realism.
- Real room-image context makes overlay usefulness clearer, but it also increases false-confidence risk; tightening the room-plane / anchor / scaling contract is the current next requirement.
- Broad insertion realism remains a later-stage, high-trust lane; bundle furniture and weak product imagery stay excluded from room insertion by default.
- Legacy cleanup behind `furniture_vectors` remains separate from the active canonical runtime contract.
- Broad schema expansion, recommendation redesign, and UX-led planning remain outside the current approved lane.

# 7. Source-of-Truth Reading Order

1. Read this file first.
2. Read the current active task doc in `docs/tasks/`.
3. Read only the direct supporting ops docs for that active lane.
4. Use Notion for top-level business intent and repo docs for current approved execution truth.
5. Use older ops/tasks only when the active task or current snapshot requires supporting evidence.

# 8. Update Rule

- Update `docs/plan.md` only after approved work changes current truth.
- Keep it short, current, and first-read friendly.
- Link to detailed evidence instead of copying it.
- Remove stale plan language when current truth changes.
- Do not promote speculative future ideas, stale roadmap promises, or rejected directions into this file.
