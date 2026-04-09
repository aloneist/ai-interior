# Geometry Contract v1 Parser Alignment Validation

Date: 2026-04-09

## Scope

This run aligned the active IKEA and Livart geometry-producing path to geometry contract v1.

The alignment scope was narrow:

- shared unit and range normalization
- canonical height semantics
- consistent dimension debug metadata
- staged and canonical geometry propagation

This was not a seller-expansion step and not a parser-framework rewrite.

## Contract Drift Found

Before alignment, the active path still had three meaningful contract drifts:

- overall-dimension ranges were not handled consistently
  - Livart range values such as `730~980 mm` were being nulled
  - shared labeled extraction did not normalize ranges into max values
- backrest-only height could still leak into canonical IKEA chair/sofa `height_cm`
- debug metadata was inconsistent across sellers
  - Livart had selected dimension line and unit
  - IKEA category outputs did not preserve equivalent metadata consistently

## Code Alignment Applied

Files changed:

- `lib/parsers/shared/types.ts`
- `lib/parsers/shared/debug.ts`
- `lib/parsers/shared/dimensions.ts`
- `lib/parsers/categories/sofa.ts`
- `lib/parsers/categories/chair.ts`
- `lib/parsers/categories/table.ts`
- `lib/parsers/sites/livart.ts`
- `app/api/import-product/route.ts`
- `app/api/test-parser/route.ts`

Alignment changes:

- shared labeled-dimension parsing now supports range values and applies the contract v1 `max` rule
- shared compact-dimension parsing now supports ranges too
- shared debug metadata now carries:
  - `selected_dimension_line`
  - `selected_dimension_unit`
  - `range_policy_applied`
- IKEA category outputs now preserve those debug fields in parser metadata
- Livart now converts trusted overall ranges like `730~980 mm` into canonical max `cm`
- IKEA sofa/chair height no longer falls back to backrest-only height for canonical `height_cm`
- import staging notes now preserve the aligned geometry debug fields

## Focused Live Validation

Primary report:

- `/tmp/geometry-alignment-validation-2026-04-09.json`

Extra IKEA compact-dimension spot check:

- `/tmp/geometry-alignment-ikea-extra-2026-04-09.json`

### Focused set

- IKEA sofa
  - `https://www.ikea.com/kr/ko/p/landskrona-3-seat-sofa-djuparp-dark-blue-metal-s99415821/`
- IKEA sofa
  - `https://www.ikea.com/kr/ko/p/landskrona-3-seat-sofa-gunnared-light-green-wood-s19270327/`
- Livart overall-size range case
  - `https://mall.hyundailivart.co.kr/p/P200168513`
- Livart null/partial negative control
  - `https://mall.hyundailivart.co.kr/p/P100033578`

Extra IKEA non-sofa compact-dimension spot check:

- `https://www.ikea.com/kr/ko/p/mittzon-conference-table-birch-veneer-black-s29533451/`

### Staged and canonical outcomes

#### IKEA `s99415821`

- staged: `W 204 / D 89 / H 78`
- canonical: `W 204 / D 89 / H 78`
- selected line: `폭: 204 cm`
- unit: `cm`
- range policy: none

#### IKEA `s19270327`

- staged: `W 204 / D 89 / H 78`
- canonical: `W 204 / D 89 / H 78`
- selected line: `폭: 204 cm`
- unit: `cm`
- range policy: none

#### Livart `P200168513`

- staged: `W 270 / D 104 / H 98`
- canonical: `W 270 / D 104 / H 98`
- selected line: `가로 2700 x 세로 1040 x 높이 730~980 mm`
- unit: `mm`
- range policy: `max`

#### Livart `P100033578`

- staged: `W null / D null / H null`
- canonical: `W null / D null / H null`
- selected line: none
- unit: none
- range policy: none

#### Extra IKEA `s29533451`

- staged: `W 140 / D 108 / H 105`
- canonical: `W 140 / D 108 / H 105`
- selected line: `높이: 105 cm`
- unit: `cm`
- range policy: none

## Conclusion

IKEA and Livart are now aligned to geometry contract v1 for the active validated path:

- canonical geometry fields mean the same thing across both sellers
- `mm -> cm` normalization is consistent
- trusted overall ranges now resolve with the contract `max` rule
- partial or untrustworthy cases still remain `null`
- staged and canonical values match without hidden reinterpretation in publish

Remaining gaps are now primarily source coverage issues, not contract inconsistency:

- IKEA focused validation did not include a true live overall-dimension range case
- Livart still only carries dimensions on the specific page patterns where trustworthy overall-size content exists

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
