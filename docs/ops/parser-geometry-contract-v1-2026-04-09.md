# Parser Geometry Contract v1

Date: 2026-04-09

## Purpose

This document locks the canonical meaning of furniture geometry fields before more seller-specific parser hardening is added.

The goal is narrow:

- keep DOM and content-block extraction seller-specific
- keep canonical geometry meaning shared
- prevent loose or inconsistent dimension writes into `import_jobs` and `furniture_products`

This is not a parser-framework rewrite and not a schema redesign.

## Parser Layers Reviewed

Files reviewed for this contract:

- `lib/parsers/router.ts`
- `lib/parsers/index.ts`
- `lib/parsers/sites/ikea.ts`
- `lib/parsers/sites/livart.ts`
- `lib/parsers/categories/sofa.ts`
- `lib/parsers/categories/chair.ts`
- `lib/parsers/categories/table.ts`
- `lib/parsers/shared/snapshot.ts`
- `lib/parsers/shared/types.ts`
- `lib/parsers/shared/dimensions.ts`
- `lib/parsers/shared/debug.ts`
- `lib/parsers/shared/text.ts`
- `lib/parsers/shared/category.ts`
- `lib/parsers/dimensions.ts`
- `app/api/import-product/route.ts`
- `lib/server/furniture-catalog.ts`
- `app/api/admin/import-jobs/[jobId]/publish/route.ts`

## Current Responsibility Boundaries

### 1. Site parsers

Site parsers are responsible for seller-specific source handling:

- fetch payload shape interpretation
- seller-specific HTML or metadata extraction
- trustworthy section or block selection for dimensions
- seller-specific exclusion rules for bad dimension context
- preserving source-grounded debug metadata

Current examples:

- IKEA site parsing stops at snapshot extraction in `lib/parsers/sites/ikea.ts`
- Livart currently parses geometry directly in `lib/parsers/sites/livart.ts`

That structural difference is acceptable. The contract applies to the output, not to a forced internal architecture.

### 2. Category parsers

Category parsers are responsible for shared semantic normalization once trustworthy dimension text already exists:

- mapping seller wording into canonical `width_cm`, `depth_cm`, `height_cm`
- excluding seat, internal, packaging, and accessory dimensions
- applying category-specific fallbacks such as diameter or length handling

Current examples:

- `lib/parsers/categories/sofa.ts`
- `lib/parsers/categories/chair.ts`
- `lib/parsers/categories/table.ts`

### 3. Shared helpers

Shared helpers should do source-agnostic normalization work:

- text cleanup
- unit normalization
- labeled-value extraction
- compact dimension string normalization
- shared debug payload shaping

Current main shared geometry helper:

- `lib/parsers/shared/dimensions.ts`

The older `lib/parsers/dimensions.ts` is a broader whole-page extractor. It is useful as legacy/helper context, but it should not define canonical geometry semantics.

### 4. Import mapping

`app/api/import-product/route.ts` is the staging boundary.

At this layer:

- parser output becomes staged `extracted_width_cm`, `extracted_depth_cm`, `extracted_height_cm`
- parser debug metadata is preserved in `extraction_notes` and `raw_payload.parser_result`
- geometry meaning should already be canonical by this point

This layer should not reinterpret seller geometry.

### 5. Publish mapping

`lib/server/furniture-catalog.ts` is the canonical persistence boundary.

At this layer:

- `extracted_width_cm -> width_cm`
- `extracted_depth_cm -> depth_cm`
- `extracted_height_cm -> height_cm`

The publish path should trust staged geometry and not re-parse or re-guess dimensions.

## Geometry Contract v1

### Canonical core fields

All seller parsers must treat these fields as the canonical furniture geometry contract:

- `width_cm`
- `depth_cm`
- `height_cm`

### Canonical meaning

These fields mean:

- overall outer product width
- overall outer product depth
- overall outer product height

These fields do not mean:

- seat width, seat depth, seat height
- backrest-only height
- armrest height
- internal cabinet size
- drawer internal size
- packaging or shipping dimensions
- accessory or component dimensions
- configurable installation or calculator inputs

If the source only exposes sub-dimensions, the core canonical fields must remain `null`.

### Canonical unit

Canonical storage unit is centimeters.

Rules:

- source `cm` stays `cm`
- source `mm` must convert to `cm`
- source `m` must convert to `cm`
- raw source `mm` values must never be written into canonical `*_cm` fields

### Overall-dimension range rule

If the source provides an overall product dimension as a range, geometry contract v1 uses the maximum value of that overall dimension.

Examples:

- `높이 730~980 mm` -> `height_cm = 98`
- `가로 1200~1600 mm` -> `width_cm = 160`

This rule applies only when the range clearly refers to the overall product dimension.

If the range meaning is unclear, the field remains `null`.

### Ambiguity rule

A canonical geometry field must stay `null` when any of the following is true:

- the text may refer to packaging or shipping size
- the text may refer to internal or usable space only
- the text may refer to seat, cushion, ottoman, accessory, or component size
- the dimension labels are missing and the compact pattern is not in a trustworthy overall-size context
- unit meaning is unclear
- the axis mapping is unclear

### Compact-pattern rule

Compact patterns like `2160 x 413 x 440 mm` or `가로2160 x 세로413 x 높이440mm` are allowed only when:

- the parser has already selected a trustworthy overall-size context for that seller
- the axes are explicit or seller-consistent enough to map deterministically

Compact patterns from loosely selected whole-page text must not populate canonical geometry.

### Category-specific geometry guidance

Category parsers may apply narrow shared rules as long as they preserve the core contract:

- chair/table diameter may derive width and depth when the source clearly represents a round overall footprint
- table `length` may help resolve width/depth when the category semantics are deterministic
- sofa backrest or cushion-related heights may be retained as debug metadata but must not silently replace the canonical meaning unless the parser can justify that it is the overall height

## Expected Parser Debug Metadata

Every seller parser that attempts geometry extraction should preserve source-grounded debug metadata.

Minimum expected keys:

- `raw_dimension_text_preview`
- `selected_dimension_line`
- `selected_dimension_unit`

Recommended optional keys when useful:

- `selected_dimension_context`
- `selected_dimension_pattern`
- `selected_dimension_block_hint`
- `range_policy_applied`
- `derived_width_from_diameter`
- `derived_depth_from_diameter`
- category-specific secondary geometry such as `overall_height_cm`, `backrest_height_cm`, or `diameter_cm`

Rules for debug metadata:

- preserve the seller-selected source line or block that justified the canonical geometry
- keep debug metadata source-grounded, not model-inferred
- nested seller details may live under `site_metadata`
- debug metadata is for auditability and operator review, not for changing canonical meaning after publish

## What Stays Source-Specific

These responsibilities stay seller-specific:

- where overall-size content lives in the DOM
- which blocks are trustworthy
- which nearby sections are false positives
- source wording such as `가로/세로/높이`, `폭/깊이/높이`, or seller-specific labels
- site-specific context exclusions such as calculator modules or configurators
- when a compact dimension string is trustworthy on that seller

This is why IKEA DOM assumptions must not be copied into Livart, Todayhouse, Hanssem, or future sellers.

## What Should Be Shared

These responsibilities should converge across sellers:

- canonical meaning of `width_cm`, `depth_cm`, `height_cm`
- canonical centimeter storage
- unit conversion rules
- ambiguity and nullability rules
- range handling policy for overall dimensions
- debug metadata keys and expectations
- category-level semantic fallbacks when they are truly source-agnostic

## What Must Never Be Guessed Loosely

Do not populate canonical geometry from:

- marketing copy that mentions space use or lifestyle fit
- partial component measurements
- packaging or shipping dimensions
- calculator/configurator inputs
- unrelated whole-page keyword windows
- inferred unit assumptions when the seller page does not support them

If the parser cannot justify the source line and axis mapping, the field stays `null`.

## Current Implementation Implications

This contract matches the current publish boundary, but not every parser fully aligns with it yet.

Important implications:

- IKEA already follows the intended split well:
  - site parser selects dimension section
  - category parser normalizes canonical geometry
- Livart now follows source-specific structure selection correctly, but it currently computes geometry inside the site parser rather than through category helpers
- that is acceptable for now, but the output still must follow geometry contract v1
- current debug metadata is not yet fully standardized in shared types
- current range handling is not yet fully standardized across sellers

In particular, any seller implementation that currently leaves a clearly overall range dimension as `null` will need a follow-up alignment pass if the source meaning is deterministic enough to apply the v1 maximum-value rule.

## Recommended Next Step

The next practical implementation step is not another broad parser rewrite.

It is:

1. align shared parser typing and debug metadata to geometry contract v1
2. apply a narrow contract-alignment pass to current geometry-producing sellers, starting with the sellers already in active use
3. only then harden the next seller-specific parser against this fixed contract

The most practical immediate follow-up is a contract-alignment pass on current IKEA and Livart geometry outputs, especially:

- standardizing `selected_dimension_line` and `selected_dimension_unit` in parser metadata
- standardizing the overall-dimension range rule where the source context is trustworthy
- keeping sub-dimensions in debug metadata instead of leaking them into canonical fields

## Deferred Items

- No schema changes are proposed here.
- No multi-seller parser refactor is proposed here.
- No publish helper behavior change is proposed here.
- Seller-specific DOM hardening remains separate work after this contract is accepted.
