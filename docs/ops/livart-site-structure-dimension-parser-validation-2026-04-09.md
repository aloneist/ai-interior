# Livart Site-Structure Dimension Parser Validation - 2026-04-09

## Scope

Validate Livart dimension extraction using Livart's own PDP structure, not IKEA DOM assumptions, and confirm canonical `width_cm`, `depth_cm`, and `height_cm` persistence after live intake and publish.

## Batch Used

- `https://mall.hyundailivart.co.kr/p/P200168513`
- `https://mall.hyundailivart.co.kr/p/P200136061`
- `https://mall.hyundailivart.co.kr/p/P100033578`
- `https://mall.hyundailivart.co.kr/p/P100023620`

Batch intent:

- one sofa page with overall dimensions and range height
- one storage page with complete overall dimensions
- one storage/bookshelf page with only marketing-sized copy
- one bed page without a trustworthy overall-size block in the sampled HTML

## Livart Structure Analysis

Trustworthy overall-size content was found in Livart PDP blocks shaped like:

- `.pitem-section-info .txtarea`
- containing a product subtitle/title line
- followed by a compact size line such as:
  - `가로 2700 x 세로 1040 x 높이 730~980 mm`
  - `가로2160 x 세로413 x 높이440mm`

Examples from the live-sampled HTML:

- `P200168513`
  - subtitle: `몰리세 3시트 w2700 패브릭 리클라이너 소파(4인용)`
  - dimension line: `가로 2700 x 세로 1040 x 높이 730~980 mm`
- `P200136061`
  - subtitle: `무드 모던 2200 거실장`
  - dimension line: `가로2160 x 세로413 x 높이440mm`

Untrustworthy nearby blocks that must be ignored:

- closet/configurator modal:
  - `붙박이장이 들어갈 벽의 치수를 기입해 주세요`
  - `너비(mm)`, `깊이(mm)`, `높이(mm)`
- seat/accessory-specific copy:
  - `좌방석 높이 465mm / 깊이 570mm`
- marketing-only copy:
  - `1200 수납책장의 폭은 295mm로 ...`

## Current Gap Before Fix

Before the parser change:

- Livart raw HTML already contained real dimension strings
- current Livart parsing still emitted:
  - `width_cm = null`
  - `depth_cm = null`
  - `height_cm = null`
- the generic whole-page dimension extractor failed because it selected the unrelated closet calculator block instead of the real PDP dimension block

This was a Livart-specific structure-selection gap first, and a unit-normalization gap second.

## Code Change

Updated [livart.ts](/workspaces/ai-interior/lib/parsers/sites/livart.ts).

Applied only Livart-specific changes:

1. Select trusted Livart dimension candidates only from `.pitem-section-info .txtarea`.
2. Ignore calculator/configurator and seat/accessory-specific lines.
3. Accept compact overall-size lines only when found in that trusted Livart block.
4. Convert `mm` source values into canonical `cm` with `toCm`.
5. Leave range-based values null instead of guessing a single number.

No IKEA DOM structure was copied into Livart.
No quality-gate logic was loosened.

## Live Intake Results

Intake artifact:

- `/tmp/livart-dimension-intake-2026-04-09.json`

Observed staged results:

- `P200168513`
  - parser version: `livart-meta-v2`
  - selected line: `가로 2700 x 세로 1040 x 높이 730~980 mm`
  - staged dimensions: `270 / 104 / null`
  - note: height remained null because source height is a range
- `P200136061`
  - parser version: `livart-meta-v2`
  - selected line: `가로2160 x 세로413 x 높이440mm`
  - staged dimensions: `216 / 41.3 / 44`
- `P100033578`
  - no trusted overall-size line selected
  - staged dimensions: `null / null / null`
- `P100023620`
  - no trusted overall-size line selected
  - staged dimensions: `null / null / null`

## Audit Result

Audit artifact:

- `/tmp/livart-dimension-audit-2026-04-09.json`

After re-import, the four Livart jobs were:

- `pending_review`: 4
- disposition: `deterministic_reconciliation_available`
- warning: `pending_review_already_linked`

This is expected because the rows were already linked to canonical products from previous Livart validation work and were re-imported for parser verification.

## Live Publish Result

Publish artifact:

- `/tmp/livart-dimension-publish-2026-04-09.json`

Republishing through the existing publish route returned canonical rows with these dimension outcomes:

- `c4b9f6fe-0c1c-4b32-b8dd-7d16edccc049` -> canonical `5f9cdd79-fb12-4ee6-8068-1e402e141fea`
  - canonical dimensions: `270 / 104 / null`
- `70f8ffc3-01b9-43b5-bb0d-52b81232c63e` -> canonical `f9a5d488-c63e-48a4-919c-15633b6b21c2`
  - canonical dimensions: `216 / 41.3 / 44`
- `fa18b6e5-fd5a-4c85-b52d-efe9f49e4077` -> canonical `9cbdf8ac-3a4a-49ac-b17e-b8a134f6a419`
  - canonical dimensions: `null / null / null`
- `d2f3a302-df2b-4709-a0f7-ca546bcaf5c5` -> canonical `427df9c7-b4a0-4b93-bb69-e75e218a917f`
  - canonical dimensions: `null / null / null`

## Conclusion

Livart dimensions work only for limited product/page patterns.

Why:

- the parser now carries trustworthy overall dimensions when Livart exposes them in the validated `pitem-section-info .txtarea` structure
- `mm -> cm` normalization is working correctly on those validated cases
- range values are handled safely by leaving the ambiguous field null
- some Livart pages in the sampled batch still do not expose a trustworthy overall-size block, so dimensions cannot yet be treated as source-wide reliable

## Deferred Items

- expand validation to more Livart categories before treating dimensions as broadly operational
- add more Livart-only patterns only when real blocked pages expose a clearly trustworthy overall-size block
- keep range-based dimensions null unless a deterministic single-value rule is explicitly defined
