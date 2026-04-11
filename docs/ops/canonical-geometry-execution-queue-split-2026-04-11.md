# Canonical Geometry Execution Queue Split - 2026-04-11

## Scope

Split the active classified canonical catalog into explicit execution queues so deterministic parser follow-up work and image-heavy/source-absence work stop being mixed together.

This step is intentionally narrow:

- no new seller parser implementation
- no OCR or image-derived geometry extraction
- no schema change
- no ranking or UX change

## Layers Reviewed

Files and layers reviewed for this step:

- active canonical `furniture_products`
- linked published `import_jobs`
- current canonical classification fields:
  - `parser_lane_eligibility`
  - `geometry_source_shape`
  - `geometry_source_reason`
- current canonical geometry provenance metadata
- `docs/ops/canonical-dimension-completeness-audit-2026-04-11.md`
- `docs/ops/canonical-source-shape-classification-2026-04-11.md`
- `docs/ops/hanssem-geometry-spec-hardening-2026-04-11.md`
- `docs/ops/livart-deterministic-breadth-completion-2026-04-10.md`

## Execution Queue Model

Keep the operational lanes small.

### 1. Deterministic parser follow-up queue

Rows that still belong in the deterministic text-based parser lane.

Include:

- `eligible`
- `conditional`

But only when geometry is still incomplete:

- `2d` only
- one-axis partial
- absent, if the classification still says text-based follow-up is realistic

### 2. Image-heavy / source-absence queue

Rows that should stop being counted as normal deterministic parser failures.

Include:

- `ineligible`
- `image_heavy_or_absent`

These are not necessarily bad rows.
They are the separate backlog lane for:

- source-absence isolation
- future image-derived geometry experiments
- explicit “not a deterministic parser KPI miss” handling

### 3. Resolved / no-action-needed bucket

Rows with already-usable geometry and no immediate queueing need.

### 4. QA fixture bucket

Keep QA rows out of the real seller backlog.

## Assignment Rules

### Deterministic parser follow-up queue

Assign a row here when:

- `parser_lane_eligibility` is `eligible` or `conditional`
- and canonical geometry is still incomplete

Examples:

- full text-structured page with only `2d` geometry
- width-class text support that is real but only partial

### Image-heavy / source-absence queue

Assign a row here when:

- `parser_lane_eligibility = ineligible`
- and `geometry_source_shape = image_heavy_or_absent`

These rows should not be mixed into normal deterministic parser-gap counting.

### Resolved / no-action-needed

Assign a row here when:

- geometry is already operationally usable
- and no immediate deterministic follow-up is needed

### QA fixture bucket

Assign QA rows here even if their classification looks similar to a real seller row.

## Current Active Queue Split

Live active canonical rows:

- total active rows: `48`
- deterministic parser follow-up queue: `3`
- image-heavy / source-absence queue: `8`
- resolved / no-action-needed: `36`
- QA fixture bucket: `1`

## Source Breakdown

### Deterministic parser follow-up queue

- `hanssem`: `3`

### Image-heavy / source-absence queue

- `hanssem`: `5`
- `livart`: `3`

### Resolved / no-action-needed

- `ikea`: `29`
- `livart`: `7`

### QA fixture bucket

- `qa`: `1`

## Category Breakdown

### Deterministic parser follow-up queue

- `storage`: `2`
- `desk`: `1`

### Image-heavy / source-absence queue

- `storage`: `3`
- `bed`: `2`
- `sofa`: `1`
- `desk`: `1`
- `table`: `1`

### Resolved / no-action-needed

- `sofa`: `18`
- `table`: `9`
- `chair`: `6`
- `storage`: `2`
- `desk`: `1`

## Representative Examples

### Deterministic parser follow-up queue

- `플롯 컴퓨터 책상 120x70cm`
  - source: `hanssem`
  - queue reason: `eligible`, `text_structured`, but still only `2d`

- `샘 책장 5단 120cm 수납형 시공`
  - source: `hanssem`
  - queue reason: `conditional`, `text_partial`, width-only follow-up still makes deterministic sense

- `디어 오보에 거실장 140cm (2종 택1)`
  - source: `hanssem`
  - queue reason: `conditional`, `text_partial`, width-only follow-up still makes deterministic sense

### Image-heavy / source-absence queue

- `재크 철제 선반 5단 다용도랙 1100`
  - source: `hanssem`
  - queue reason: `ineligible`, `image_heavy_or_absent`

- `리타 ㄱ자 화장대세트(거울미포함)`
  - source: `livart`
  - queue reason: `ineligible`, `image_heavy_or_absent`

- `뉴트 저상형 퀸 침대 프레임 도어형`
  - source: `livart`
  - queue reason: `ineligible`, `image_heavy_or_absent`

### Resolved / no-action-needed

- `MÖRBYLÅNGA`
  - source: `ikea`
  - already full usable geometry

- `JÄTTEBO 예테보 1인용 모듈+수납`
  - source: `ikea`
  - already full usable geometry

## Operational Reading

This queue split changes how the backlog should be managed:

- deterministic parser KPI tracking should only look at the `3` real follow-up rows
- the `8` image-heavy/source-absence rows should be isolated and not counted as ordinary parser misses
- the `36` resolved rows should not stay in the active geometry backlog

## Queue Metadata Decision

No extra queue label was added to canonical `metadata_json`.

Reason:

- the queue split is already cleanly derivable from the existing canonical fields:
  - `parser_lane_eligibility`
  - `geometry_source_shape`
  - current canonical geometry completeness
- adding another queue field would duplicate an already derivable control surface without materially improving safety or visibility

## Next Execution Order

### 1. Deterministic parser follow-up first

Work only the deterministic follow-up queue next.

Current target set:

- `3` Hanssem rows

Priority order:

- partial `storage`
- `2d` `desk`
- then any bounded next deterministic Hanssem follow-up with similar evidence patterns

### 2. Keep image-heavy / source-absence rows out of deterministic parser KPIs

Do not count the `8` ineligible rows as parser hardening misses.

These should be tracked as a separate operational lane.

### 3. Later image-derived geometry experiment lane

If and when image-derived work begins, start from the isolated image-heavy/source-absence queue rather than the full catalog.

This is the correct future experiment pool.

## Commands Used

Live reads used for this step:

- active canonical queue derivation read from `furniture_products`

Static validation:

- `git diff --check`

No canonical metadata backfill was performed in this step because the queue split is already derivable from existing canonical classification and geometry state.
