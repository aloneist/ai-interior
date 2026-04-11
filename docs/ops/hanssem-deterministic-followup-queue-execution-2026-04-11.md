# Hanssem Deterministic Follow-Up Queue Execution - 2026-04-11

## Scope

Execute the remaining Hanssem deterministic geometry follow-up queue by re-reading the exact `3` canonical rows, checking their linked staged evidence directly, and deciding whether more trustworthy text-based geometry extraction is still possible.

This step stayed narrow:

- no new seller expansion
- no OCR or image-derived geometry
- no schema change
- no ranking or UX change
- no generic parser-framework rewrite

## Rows Reviewed

The full deterministic follow-up queue before this step was:

- `플롯 컴퓨터 책상 120x70cm`
  - canonical product: `6536144d-0da7-4e22-ae10-06f06adef332`
  - source: `hanssem`
  - category: `desk`
  - canonical geometry: `120 / 70 / null`
  - canonical classification:
    - `parser_lane_eligibility = eligible`
    - `geometry_source_shape = text_structured`
    - `geometry_source_reason = explicit_compact_dimension_text`

- `샘 책장 5단 120cm 수납형 시공`
  - canonical product: `ed102d38-5e5f-41c5-9657-7f717bc81b83`
  - source: `hanssem`
  - category: `storage`
  - canonical geometry: `120 / null / null`
  - canonical classification:
    - `parser_lane_eligibility = conditional`
    - `geometry_source_shape = text_partial`
    - `geometry_source_reason = partial_width_class_text`

- `디어 오보에 거실장 140cm (2종 택1)`
  - canonical product: `b15ddcd1-bc47-4db3-be35-1bd44c239017`
  - source: `hanssem`
  - category: `storage`
  - canonical geometry: `140 / null / null`
  - canonical classification:
    - `parser_lane_eligibility = conditional`
    - `geometry_source_shape = text_partial`
    - `geometry_source_reason = partial_width_class_text`

## Evidence Read

For each row, the linked published `import_jobs` staging evidence was re-read directly.

Fields checked:

- staged parser geometry
- staged parser/debug metadata
- `raw_dimension_text_preview`
- `selected_dimension_line`
- `selected_dimension_unit`
- staged `full_html` text stripped for dimension keywords and compact dimension patterns

## Row-By-Row Decision

### 1. `플롯 컴퓨터 책상 120x70cm`

What exists today:

- staged parser source: `product_name_explicit_2d_dimensions`
- staged selected line: `120x70cm`
- staged geometry: `120 / 70 / null`
- stripped staged HTML contains repeated `120x70cm` title/alt text copies
- stripped staged HTML does not expose any trustworthy height line
- the only keyword hit was marketing copy containing `사이즈`, not a spec row

Decision:

- no further trustworthy text-based deterministic improvement remains on the active path
- keep the current `2d` envelope geometry
- do not attempt speculative height recovery
- remove this row from the deterministic follow-up queue
- treat it as resolved for current operations because it already has bounded usable geometry and no remaining deterministic upside

### 2. `샘 책장 5단 120cm 수납형 시공`

What exists today:

- staged parser source: `product_name_storage_width_class`
- staged selected line: `120cm`
- staged geometry: `120 / null / null`
- stripped staged HTML does not expose trustworthy `가로/세로/깊이/높이/치수/규격` text
- the only dimension-bearing text on the active path is repeated title/alt/option text carrying the same `120cm` width class already captured

Decision:

- only the existing bounded width-class evidence is trustworthy
- no further trustworthy text-based deterministic improvement remains on the active path
- keep the current width-only canonical geometry
- do not fabricate depth or height from option families or image-heavy detail sections
- remove this row from the deterministic follow-up queue
- treat it as resolved for current operations because it already preserves the full trustworthy text geometry currently available

### 3. `디어 오보에 거실장 140cm (2종 택1)`

What exists today:

- staged parser source: `product_name_storage_width_class`
- staged selected line: `140cm`
- staged geometry: `140 / null / null`
- stripped staged HTML does not expose trustworthy `가로/세로/깊이/높이/치수/규격` text
- the only dimension-bearing text on the active path is repeated title/alt text carrying the same `140cm` width class already captured

Decision:

- only the existing bounded width-class evidence is trustworthy
- no further trustworthy text-based deterministic improvement remains on the active path
- keep the current width-only canonical geometry
- do not fabricate depth or height from absent spec rows or image-heavy detail blocks
- remove this row from the deterministic follow-up queue
- treat it as resolved for current operations because it already preserves the full trustworthy text geometry currently available

## What Changed

No parser code changed.

No staged data was republished.

No canonical metadata backfill was required.

Reason:

- the current canonical geometry and classification already match the best trustworthy staged evidence
- the remaining issue was operational queue assignment, not parser loss or publish loss

## Canonical Classification Decision

Canonical classification fields were left unchanged:

- `parser_lane_eligibility`
- `geometry_source_shape`
- `geometry_source_reason`

Why:

- these fields still describe the source evidence truthfully
- the queue mistake was treating incomplete-but-exhausted rows as still-open deterministic parser work
- changing `conditional` or `eligible` to `ineligible` would have been false for these rows because trustworthy text evidence does exist

## Updated Queue Outcome

After this direct row review:

- deterministic parser follow-up queue: `0`
- image-heavy / source-absence queue: `8`
- resolved / no-action-needed: `39`
- QA fixture bucket: `1`

Updated operational reading:

- the deterministic Hanssem follow-up lane is now closed
- the remaining real backlog is the already-isolated `8` image-heavy/source-absence rows
- future deterministic parser KPI tracking should not continue counting the reviewed Hanssem rows as open misses

## Next Execution Order

### 1. Keep deterministic parser work closed until new text evidence appears

Do not reopen deterministic Hanssem parser follow-up for these rows unless a newly observed staged source path exposes stronger trustworthy text geometry than the current title-based evidence.

### 2. Keep the `8` image-heavy / source-absence rows isolated

These rows remain the real unresolved geometry backlog:

- `hanssem`: `5`
- `livart`: `3`

They should stay out of deterministic parser KPI tracking.

### 3. Use the isolated bucket later for image-derived experiments

If image-derived geometry work starts later, use the current image-heavy/source-absence queue as the experiment pool instead of reopening the now-closed deterministic Hanssem lane.

## Honest Out Of Scope

Still intentionally out of scope here:

- OCR or image-derived geometry extraction
- speculative inference from option families, package sizes, or marketing copy
- new Hanssem parser expansion beyond these `3` reviewed rows
- schema changes or new canonical queue fields
- changing core geometry contract v1.1 semantics

## Commands Used

Live reads used for this step:

- active canonical `furniture_products` read for the `3` Hanssem queue rows
- linked published `import_jobs` read for the same `3` rows
- stripped staged HTML text inspection for the same `3` rows

Static validation:

- `git diff --check`
