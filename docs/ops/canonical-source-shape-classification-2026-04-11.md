# Canonical Source-Shape Classification And Backfill - 2026-04-11

## Scope

Classify the active canonical catalog by deterministic parser suitability and geometry source shape, then backfill that classification onto active canonical rows.

This step is intentionally narrow:

- no new seller-parser implementation
- no OCR or image-derived geometry extraction
- no schema change
- no ranking or UX change

## Layers Reviewed

Files and layers reviewed for this step:

- `docs/ops/parser-geometry-contract-v1-1-2026-04-11.md`
- `docs/ops/hanssem-geometry-spec-hardening-2026-04-11.md`
- `docs/ops/livart-deterministic-breadth-completion-2026-04-10.md`
- `docs/ops/canonical-dimension-completeness-audit-2026-04-11.md`
- active canonical `furniture_products`
- linked published `import_jobs`
- staged `raw_payload`
- staged `extraction_notes`
- `app/api/import-product/route.ts`
- `lib/server/furniture-catalog.ts`

## Classification Model

Two bounded classification axes are now used.

### 1. Parser lane eligibility

- `eligible`
- `conditional`
- `ineligible`

### 2. Geometry source shape

- `text_structured`
- `text_partial`
- `image_heavy_or_absent`

### 3. Supporting reason field

Stored as:

- `geometry_source_reason`

Current bounded reasons:

- `trusted_dimension_text_block`
- `selected_dimension_line`
- `explicit_compact_dimension_text`
- `partial_width_class_text`
- `partial_dimension_text`
- `no_trustworthy_text_geometry`

## Evidence Rules

### Eligible / text_structured

Use this when the staged evidence shows trustworthy structured text geometry such as:

- a selected overall-size line with at least `2` trustworthy axes
- an explicit compact dimension text pattern such as `120x70cm`
- a trusted dimension text block that already supports:
  - at least `2` geometry axes
  - or diameter-based geometry
  - or trustworthy overall/backrest height semantics

This means the page is a real deterministic parser target.

### Conditional / text_partial

Use this when the staged evidence shows some trustworthy text geometry, but only partial support such as:

- a width-class storage title like `120cm`
- a selected dimension token that only supports one trustworthy envelope axis
- other partial text evidence that may support bounded deterministic extraction but not full envelope geometry

This means the page still belongs in the deterministic lane, but should not be confused with a strong full-envelope source shape.

### Ineligible / image_heavy_or_absent

Use this when the staged evidence does not carry trustworthy text geometry, including cases where:

- no trustworthy text block exists on the active path
- no selected dimension line exists
- detail content is effectively image-heavy or text-sparse on the active path
- the remaining size cues are absent, weak, ambiguous, component-only, package-only, or otherwise not valid outer-envelope evidence

This means the page should not be treated as a deterministic parser hardening target until new evidence proves otherwise.

## Backfill Outcome

Pre-backfill baseline:

- active canonical rows: `48`
- rows already carrying the new classification fields: `0`

Backfill result:

- active canonical rows updated with classification: `48`

The same classification path is now also preserved at future publish time through `lib/server/furniture-catalog.ts`.

## Active Canonical Catalog Split

### By parser lane eligibility

- `eligible`: `37`
- `conditional`: `2`
- `ineligible`: `9`

### By geometry source shape

- `text_structured`: `37`
- `text_partial`: `2`
- `image_heavy_or_absent`: `9`

### Pairing breakdown

- `eligible | text_structured`: `37`
- `conditional | text_partial`: `2`
- `ineligible | image_heavy_or_absent`: `9`

## Representative Examples

### Eligible / text_structured

- `MÖRBYLÅNGA`
  - source: `ikea`
  - reason: `trusted_dimension_text_block`
  - evidence: canonical `raw_dimension_text_preview` preserves `치수 / 높이 / 지름`

- `플롯 컴퓨터 책상 120x70cm`
  - source: `hanssem`
  - reason: `explicit_compact_dimension_text`
  - evidence: canonical `selected_dimension_line = 120x70cm`

### Conditional / text_partial

- `샘 책장 5단 120cm 수납형 시공`
  - source: `hanssem`
  - reason: `partial_width_class_text`
  - evidence: canonical `selected_dimension_line = 120cm`, only one trustworthy axis

- `디어 오보에 거실장 140cm (2종 택1)`
  - source: `hanssem`
  - reason: `partial_width_class_text`
  - evidence: canonical `selected_dimension_line = 140cm`, only one trustworthy axis

### Ineligible / image_heavy_or_absent

- `재크 철제 선반 5단 다용도랙 1100`
  - source: `hanssem`
  - reason: `no_trustworthy_text_geometry`
  - evidence: no canonical `raw_dimension_text_preview`, no selected line, no trustworthy staged text geometry

- `리타 ㄱ자 화장대세트(거울미포함)`
  - source: `livart`
  - reason: `no_trustworthy_text_geometry`
  - evidence: no trustworthy staged text geometry carried into canonical metadata

## Practical Reading

This classification does not change geometry truth.
It changes control and prioritization.

What it now makes explicit:

- not every geometry-null row is a parser bug
- the current deterministic parser lane should focus first on:
  - `eligible`
  - then `conditional`
- the `ineligible / image_heavy_or_absent` lane should be isolated from normal parser-gap counting

## Next Execution Order

### 1. Deterministic parser lane follow-up

Do this next.

Target order:

- `eligible` rows still lacking full envelope geometry
- then `conditional` rows with bounded deterministic upside

Current concentration:

- Hanssem remains the main deterministic follow-up lane
- especially storage, bed, and dining/table-set patterns

### 2. Source-absence / image-heavy lane isolation

Do this in parallel as an audit/triage lane, not as normal parser-failure counting.

Focus:

- the `9` rows now classified as `ineligible / image_heavy_or_absent`
- treat them as a separate bucket for future review and not as immediate parser-hardening proof points

### 3. Future image-derived geometry experiment lane

Keep this separate and later.

Why:

- this classification now gives a clean candidate pool for that future lane
- it prevents image-heavy/source-absent rows from distorting deterministic parser priorities today

## Commands Used

Live reads and writes used for this step:

- active canonical `furniture_products` classification baseline read
- representative linked published `import_jobs` staged evidence read
- active canonical classification backfill update
- active canonical post-backfill verification read

Static validation:

- `git diff --check`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
