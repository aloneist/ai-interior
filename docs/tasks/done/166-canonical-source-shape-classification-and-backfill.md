# Goal
Classify the active canonical catalog by deterministic parser suitability and geometry source shape, then backfill that classification onto existing canonical rows so future geometry work is driven by source reality instead of mixed parser/noise failure.

# Scope
This task is limited to:
- defining a deterministic parser suitability classification for canonical products
- defining a geometry source-shape classification for canonical products
- classifying the current active canonical catalog using linked published staging evidence
- backfilling the resulting classification onto current canonical rows
- wiring the same classification path into future publish-time canonical metadata when feasible
- documenting the resulting catalog split and the next execution order

This is not a UX task.
This is not a recommendation-redesign task.
This is not a new seller-parser expansion task.
This is not an image-derived dimension extraction task.

# Primary Objective
Stop mixing deterministic parser failures with pages that were never good deterministic parser targets in the first place.

# Allowed Changes
- Read broadly across relevant parser outputs, staged `import_jobs`, canonical `furniture_products`, publish mapping, geometry metadata propagation, and current geometry audit docs
- Add or update the minimum necessary classification helper and publish/backfill path
- Store classification in canonical `metadata_json` rather than widening schema
- Add or update a focused ops/dev doc describing the classification model and current catalog split
- Add a small bounded backfill script/helper if needed
- Add tiny validation helpers/logging if useful

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not implement OCR/image-derived geometry extraction in this step
- Do not broaden into a generic parser-framework rewrite
- Do not redesign the DB schema
- Do not loosen geometry quality rules
- Do not change canonical identity semantics
- Do not turn this into a seller-parser hardening step

# Critical Safety Rule
Classification must describe source reality, not guess missing geometry. Do not classify a row as deterministic-parser-eligible unless the linked staged/source evidence actually supports that conclusion.

# Working Principles
- Read broadly, write narrowly
- Canonical product identity remains invariant
- Canonical core geometry meaning remains unchanged
- Classification is stored as bounded canonical metadata, not a new schema contract
- Existing active rows must be included, not just future rows
- Deterministic parser lane and future image-derived lane must remain clearly separate

# Required Behavior / Structure

## 1. Re-read the current source/geometry evidence path
Inspect all relevant layers, including as needed:
- active canonical `furniture_products`
- linked published `import_jobs`
- staged raw/parser evidence (`raw_payload`, `extraction_notes`, parser debug)
- current geometry provenance now preserved canonically
- recent Hanssem and Livart geometry outcomes
- current geometry contract v1.1 and refreshed audit docs

Do not limit analysis to one seller or one file.

## 2. Define the classification model
Define at minimum two explicit classification axes:

### A. Parser lane eligibility
- `eligible`
- `conditional`
- `ineligible`

### B. Geometry source shape
- `text_structured`
- `text_partial`
- `image_heavy_or_absent`

You may add a small bounded supporting field like:
- `geometry_source_reason`

But do not create a sprawling taxonomy.

## 3. Define evidence rules
State clearly what evidence qualifies a row for each class.

Examples:
- trustworthy overall-size text block or explicit compact dimension text -> `eligible` / `text_structured`
- weak or partial text evidence that may support some deterministic extraction but not reliable full envelope geometry -> `conditional` / `text_partial`
- image-heavy detail blocks, absent trustworthy text spec rows, component/package-only text, or only image-carried dimensions -> `ineligible` / `image_heavy_or_absent`

Do not guess from seller reputation alone.

## 4. Backfill the current active canonical catalog
Use current active canonical rows plus linked published staging evidence to classify all active rows.

Store the result in canonical `metadata_json`, with bounded fields such as:
- `parser_lane_eligibility`
- `geometry_source_shape`
- `geometry_source_reason`
- optional boolean support fields only if clearly justified

The goal is control and visibility, not blocking or deleting rows.

## 5. Wire future rows if feasible
If a narrow publish-path update is practical, ensure future canonical rows preserve the same classification automatically from staged evidence, so the catalog does not drift again.

Do not overbuild.
If a bounded backfill-only step is all that is safe in this turn, say so clearly.

## 6. Validate the result
Run focused validation on:
- active canonical row count before vs after classification
- representative Hanssem/Livart/IKEA rows
- before/after canonical `metadata_json`
- any publish/read/backfill commands actually used

The result should show that current canonical rows are now explicitly classified by deterministic parser suitability and source shape.

## 7. End with the next execution order
After classification lands, recommend the next order for:
- deterministic parser lane follow-up
- source-absence/image-heavy lane isolation
- future image-derived geometry experiment lane

# Completion Criteria
- The full active canonical catalog is included in the classification scope
- Classification model is explicit and bounded
- Current canonical rows are backfilled with classification
- Classification is evidence-based, not guessed
- Canonical core geometry meaning is unchanged
- No ranking/UX/schema sprawl occurs
- Validation is appropriate for the actual change scope

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed
- any focused audit/backfill/publish/read commands actually used

Also report:
- total active canonical rows classified
- breakdown by `parser_lane_eligibility`
- breakdown by `geometry_source_shape`
- representative seller/category examples
- whether future publish-path preservation was added
- the next execution order after classification

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Classification model and evidence rules
3. What changed
4. Focused validation results
5. Classification breakdown and examples
6. Deferred items and why
7. Validation results
8. Final approval recommendation