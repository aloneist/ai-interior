# Parser Geometry Contract v1.1

Date: 2026-04-11

## Scope

This document extends geometry contract v1 so canonical product geometry can safely represent:

- non-rectangular outer footprints
- diameter-based products
- dimension completeness as critical product-completeness data

This is still narrow:

- not a parser-framework rewrite
- not a schema redesign
- not a new seller implementation batch
- not image-derived dimension extraction work

## Geometry Layers Reviewed

Files reviewed for this v1.1 update:

- `docs/ops/parser-geometry-contract-v1-2026-04-09.md`
- `docs/ops/geometry-contract-v1-parser-alignment-validation-2026-04-09.md`
- `lib/parsers/router.ts`
- `lib/parsers/index.ts`
- `lib/parsers/shared/types.ts`
- `lib/parsers/shared/dimensions.ts`
- `lib/parsers/shared/debug.ts`
- `lib/parsers/dimensions.ts`
- `lib/parsers/sites/ikea.ts`
- `lib/parsers/sites/livart.ts`
- `lib/parsers/sites/hanssem.ts`
- `lib/parsers/categories/table.ts`
- `app/api/import-product/route.ts`
- `lib/server/furniture-catalog.ts`
- `app/api/admin/import-jobs/[jobId]/publish/route.ts`
- `scripts/import-jobs-operations.mjs`

## Current Geometry Path State

### 1. Canonical geometry fields are still only three core columns

Current staged and canonical paths persist:

- `extracted_width_cm -> width_cm`
- `extracted_depth_cm -> depth_cm`
- `extracted_height_cm -> height_cm`

No publish-layer reinterpretation happens today. That is correct and should remain true.

### 2. Diameter handling already exists, but only as parser-level convention

Current table parsing already supports:

- `diameter_cm`
- `derived_width_from_diameter`
- `derived_depth_from_diameter`

Current behavior is directionally correct:

- when a round overall product exposes trustworthy diameter, width/depth may be filled from that diameter

But this behavior is not yet locked as a cross-parser canonical contract.

### 3. Geometry metadata is preserved, but not yet normalized enough for future placement work

Current parser/debug metadata already preserves useful signals such as:

- `raw_dimension_text_preview`
- `selected_dimension_line`
- `selected_dimension_unit`
- `range_policy_applied`
- `diameter_cm`

However:

- `footprint_shape` is not yet a contract-level expected metadata field
- diameter-origin semantics are not yet standardized under shared names
- quality-review logic does not yet elevate geometry completeness explicitly

### 4. Quality-review/publish logic does not currently gate on geometry completeness

Current `import_jobs` operations logic checks identity/presentation/outbound quality, but not staged geometry completeness.

That is acceptable for now, but it means geometry completeness is operationally important while still under-surfaced.

## Geometry Contract v1.1

Geometry contract v1.1 keeps the v1 core and extends it with explicit outer-envelope semantics for round and non-rectangular products.

### Canonical core fields

Canonical core fields remain:

- `width_cm`
- `depth_cm`
- `height_cm`

### Canonical meaning

These fields always mean the trustworthy overall outer envelope of the product in centimeters.

For plan-view geometry:

- `width_cm` = overall maximum left-right outer span
- `depth_cm` = overall maximum front-back outer span
- `height_cm` = overall maximum bottom-top outer span

This is an outer-envelope contract, not a component-size contract.

### Canonical unit

Canonical storage unit remains `cm`.

Rules:

- source `cm` stays `cm`
- source `mm` converts to `cm`
- source `m` converts to `cm`
- raw source `mm` or `m` values must never be written directly into canonical `*_cm` fields

### Range rule

If a trustworthy overall dimension is expressed as a range, v1.1 keeps the v1 rule:

- use the maximum value for that overall dimension

Examples:

- `높이 730~980 mm` -> `height_cm = 98`
- `지름 800~900 mm` -> `width_cm = 90`, `depth_cm = 90` when the line is clearly overall diameter

If the range meaning is unclear, the canonical field remains `null`.

### Ambiguity rule

Core fields must stay `null` when the dimension text could plausibly refer to:

- packaging or shipping size
- internal/storage usable size
- seat/cushion/backrest/accessory/component size
- configurable calculator inputs
- installation-only clearance
- variant-only option dimensions without clear overall-product meaning

### Sub-dimension exclusion rule

The following must not populate canonical core fields unless the parser can prove they are the overall outer envelope:

- seat width / seat depth / seat height
- backrest height
- arm height
- storage interior width/depth/height
- mattress-only size for a bed frame
- tabletop-only diameter when the seller separately gives full assembled outer dimensions
- module-only dimensions for a sectional when the seller does not provide the full assembled footprint

## Non-Rectangular and Diameter Representation

### Core rule

Canonical core fields still represent the safe outer envelope, even when the product is not rectangular.

That means non-rectangular products are represented as an axis-aligned envelope in core fields, with shape semantics preserved in metadata.

### Round / diameter-based products

For a trustworthy overall round footprint, the v1.1 rule is:

- `width_cm = diameter_cm`
- `depth_cm = diameter_cm`
- `height_cm = overall outer height_cm`

This is the safest bounded rule for downstream collision, placement, and room-fit work because it preserves the full occupied footprint envelope rather than leaving one axis null.

### Required metadata/debug semantics for diameter cases

For trustworthy diameter-derived cases, parser metadata should preserve:

- `footprint_shape = "round"`
- `diameter_cm`
- `width_is_diameter = true`
- `depth_is_diameter = true`

### Transitional compatibility

Current code already emits:

- `derived_width_from_diameter`
- `derived_depth_from_diameter`

Until the metadata surface is normalized, treat these current fields as legacy-compatible aliases of:

- `width_is_diameter`
- `depth_is_diameter`

Do not reinterpret the canonical numeric values. This is a metadata normalization issue, not a core-field rewrite.

### Other non-rectangular footprints

For other trustworthy non-rectangular products:

- `oval`: use overall major/minor outer axes as `width_cm` / `depth_cm`, preserve `footprint_shape = "oval"`
- `l_shaped` or sectional corner products: use seller-provided overall assembled outer envelope only, preserve `footprint_shape = "l_shaped"` when trustworthy
- `irregular`: populate core fields only when the seller exposes a trustworthy outer bounding envelope; otherwise leave ambiguous axes `null`

Do not derive an outer envelope by guessing from module/component sizes.

## Dimension Completeness Importance

Dimensions are not optional decoration. Under v1.1 they are critical product-completeness data for:

- room-fit reasoning
- safe geometry interpretation
- future furniture placement and image-composition work
- distinguishing geometry-complete products from identity-only products

### Operational stance

Dimensions should now be treated as a critical completeness axis, but not as an immediate universal publish blocker in this step.

That means:

- geometry completeness should be surfaced and auditable
- geometry-missing products may still publish when identity/outbound requirements are otherwise satisfied
- but geometry absence should no longer be treated as low-importance metadata drift

### Practical completeness tiers

For future operational audits, geometry completeness should be measured at least as:

- `geometry_complete_3d`
  - trustworthy `width_cm`, `depth_cm`, `height_cm`
- `geometry_envelope_2d`
  - trustworthy `width_cm`, `depth_cm`, missing or unknown `height_cm`
- `geometry_partial`
  - only one trustworthy envelope axis or ambiguous case-specific data
- `geometry_missing`
  - no trustworthy overall geometry

These are audit/reporting concepts for future quality-review work, not new persisted statuses in this step.

## Expected Metadata Under v1.1

Minimum source-grounded debug metadata remains:

- `raw_dimension_text_preview`
- `selected_dimension_line`
- `selected_dimension_unit`
- `range_policy_applied`

Recommended geometry semantics metadata under v1.1:

- `footprint_shape`
- `diameter_cm`
- `width_is_diameter`
- `depth_is_diameter`
- `selected_dimension_context`
- `selected_dimension_pattern`
- `site_metadata`

Current implementation note:

- `diameter_cm`, `derived_width_from_diameter`, and `derived_depth_from_diameter` already exist on some parser paths
- `footprint_shape`, `width_is_diameter`, and `depth_is_diameter` are the v1.1 target names for future normalization

## Implementation Implications

### What remains seller-specific

These responsibilities remain seller-specific:

- where trustworthy overall-size content lives
- which DOM blocks are geometry-valid
- which nearby blocks are false positives
- when compact dimension strings are trustworthy
- whether a seller expresses round/oval/sectional geometry with stable wording

IKEA DOM assumptions must not be copied into Livart, Hanssem, Todayhouse, or future sellers.

### What should be shared

These responsibilities should be shared:

- `mm` / `m` -> `cm` normalization
- overall range -> max handling
- outer-envelope semantics for width/depth/height
- round-footprint diameter-to-envelope rule
- debug metadata naming and preservation expectations
- completeness auditing terminology

### What future parser work must do

Future parser hardening should:

- extract seller-specific trustworthy overall geometry blocks
- map non-rectangular shapes into safe outer-envelope core fields
- preserve shape semantics in metadata
- distinguish overall-product geometry from component/module geometry

### Import/publish boundary implications

Import and publish layers should continue to:

- trust parser output for core geometry
- persist canonical `width_cm`, `depth_cm`, `height_cm` unchanged
- preserve raw parser/debug metadata for auditability

They should not:

- re-guess shape semantics
- recompute envelopes from free text
- silently erase diameter-origin semantics when metadata is available

### Quality-review implications

Future review tooling should add explicit geometry completeness reporting, but this step does not make geometry absence a universal publish blocker.

The immediate need is audit visibility, not a blanket block rule that would over-penalize partially supported sellers.

### Image-derived dimension extraction lane

Image-derived dimension extraction remains a separate future lane.

If introduced later, it must:

- produce geometry under the same outer-envelope semantics
- mark provenance distinctly from deterministic parser extraction
- never be reported as deterministic parser support

It is not part of current operational support.

## Practical Next Execution Order

### 1. Scoring coverage/backfill first

The most urgent live runtime risk is still scoring coverage, not geometry semantics.

Next practical step:

- backfill or generate scoring/vector coverage for active canonical products, especially `livart` and `hanssem`

### 2. Canonical geometry completeness audit second

After scoring coverage, run a focused audit of active canonical products to classify:

- geometry-complete
- geometry-envelope-2d
- geometry-partial
- geometry-missing
- diameter-derived / round-footprint rows

This should be measured by source and category.

### 3. Metadata normalization for diameter cases third

After the audit, normalize parser metadata toward v1.1 terms:

- add or align `footprint_shape`
- add `width_is_diameter`
- add `depth_is_diameter`
- keep backward compatibility with current `derived_*` flags where needed

### 4. Seller-specific geometry breadth after that

Then continue deterministic seller geometry hardening only where trustworthy source text exists:

- broader Livart shape/dimension coverage
- Hanssem only on text-grounded page patterns

### 5. Image-derived geometry research last

Keep image-derived dimension extraction as a separate research track after deterministic audit visibility exists.

Do not mix that future lane into current deterministic support claims.

## What Changed In This Step

Added:

- `docs/ops/parser-geometry-contract-v1-1-2026-04-11.md`

No parser code, schema, publish logic, or quality-gate logic changed in this step.

## Honest Deferred Items

- metadata field normalization for `footprint_shape`, `width_is_diameter`, and `depth_is_diameter` is not implemented yet
- quality-review tooling still does not audit geometry completeness explicitly
- no seller parser was updated in this step to emit new v1.1 metadata names
- no image-derived geometry workflow exists yet
