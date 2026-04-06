# Controlled MVP Fixture Path And End-To-End QA

Date: 2026-04-06

## Current Position

Recommendation ranking, sofa coverage, sofa style-fit, and explanation validation/fallback are stable. The remaining QA gap was full `/api/mvp` repeatability: the production route couples image analysis, persistence, ranking, recommendation logging, explanation generation, validation, grouping, and response shaping.

This batch adds a controlled fixture path for end-to-end QA without changing normal production behavior.

## Controlled QA Strategy

`/api/mvp` now supports an explicit QA-only mode:

- request body: `qaMode: "controlled_fixture"`
- authorization: `x-admin-token` must match `ADMIN_TOKEN`
- room analysis: supplied through `qaRoomAnalysis`
- image analysis: bypassed only in controlled fixture mode
- persistence: skipped by default with `qaSkipPersistence: true`
- ranking: real route logic
- product hydration: real `furniture_products` / `furniture_vectors` path
- explanation generation: real prompt and model call
- explanation validation/fallback: real runtime validation helper
- grouping and response shaping: real route logic

This keeps the QA path realistic enough for recommendation/explanation review while removing the two noisiest pieces: image-analysis variance and repeat-run database writes.

## Fixtures

Fixture file:

- `data/qa/controlled-mvp-fixtures-v1.json`

Cases:

1. `controlled-mvp-normal-living-table`
   - normal pass case
   - living room, warm/calm, low budget, table preference

2. `controlled-mvp-constrained-workspace-chair`
   - constrained case
   - workspace, minimal/bright, low budget, chair preference

3. `controlled-mvp-weak-workspace-sofa`
   - intentionally weak case
   - small workspace, minimal, low budget, sofa preference
   - expected to preserve `weak_category_match`

## Runner

Command:

```bash
npm run qa:controlled-mvp
```

The runner validates:

- status `200`
- `success=true`
- QA mode is active
- persistence is skipped
- top-level response shape
- recommendations exist
- grouped recommendations exist
- ranking context exists
- explanation text exists
- explanation/fallback diagnostics are present
- no explanation/ranking alignment failures
- weak-result signaling matches fixture expectations

## QA Evidence

Final result:

- pass: 2
- weak: 1
- fail: 0
- explanation fallback: 1

Case results:

- `controlled-mvp-normal-living-table`: pass
  - top3 preferred category: 3
  - top3 within budget: 3
  - top3 style fit: 3
  - top3 room fit: 3
  - fallback: 0

- `controlled-mvp-constrained-workspace-chair`: pass
  - top3 preferred category: 3
  - top3 within budget: 3
  - top3 style fit: 3
  - top3 room fit: 3
  - fallback: 1
  - fallback reason: missing item/category evidence in generated text

- `controlled-mvp-weak-workspace-sofa`: weak
  - weak result: true
  - weak reasons: `weak_category_match`
  - top3 preferred category: 1
  - top3 within budget: 3
  - top3 style fit: 3
  - top3 room fit: 2
  - fallback: 0

## Side-Effect Policy

Default controlled QA behavior:

- does not call image analysis
- does not insert into `spaces`
- does not insert into `recommendations`
- returns a synthetic `space.id` equal to the request id
- returns `qa.persistence="skipped"`

If `qaSkipPersistence` is explicitly set to `false`, the route can persist rows and tags recommendation rows with `event_source="qa_controlled_fixture"`. That mode is not used by the default QA runner.

Cleanup expectation:

- default `npm run qa:controlled-mvp` requires no cleanup
- persisted QA mode, if manually enabled, should be reviewed and cleaned by event source

## Validation

Passed:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run qa:controlled-mvp`

## Decision

`CONTROLLED MVP QA PATH READY`

The route now has a repeatable fixture path that meaningfully exercises ranking, explanation, validation/fallback, grouping, and response contract while avoiding image-analysis variance and default DB write noise.
