# Hanssem Geometry / Spec Hardening - 2026-04-10

## Scope

This run covered:

- Hanssem PDP geometry/spec structure analysis
- reproduction of the current Hanssem geometry gap
- minimal Hanssem-specific geometry extraction
- live intake rerun
- live republish and post-publish verification

This was not a broad Hanssem parser rewrite.

## Batch Used

- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=817732&wlp=00644263`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=884223&wlp=00583197`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=857489&wlp=0615004`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=425879&wlp=0536610`

## Structure Analysis

Observed Hanssem structure in the sampled PDPs:

- core identity fields are available in JSON-LD and meta tags
- detailed product content is carried in `goodsDetail.detailInfo.goodsDetailInfo.goodsDetailHtml`
- in the sampled pages, that detail HTML is dominated by image-based content, not parseable text tables

Trustworthy geometry/spec signals found:

- explicit size pattern in the product name:
  - `플롯 컴퓨터 책상 120x70cm`

Nearby false positives or weak signals:

- image-only product detail blocks
- banner and recommendation images inside `goodsDetailHtml`
- variant titles in group goods carousels
- unitless numbers like `1100`
- partial size words in marketing copy like `사이즈, 가격을 확인해 보세요`
- product family naming like `책장 5단 120cm`, which may imply width but does not provide trustworthy overall depth/height

Observed source absence on this batch:

- no sampled page exposed a clean text-based overall size table with labels like `가로`, `세로`, `높이`
- no sampled page exposed parseable overall-dimension rows in the visible DOM outside the product name

## Previous Gap

Before this step:

- Hanssem identity parsing worked
- Hanssem intake, audit, publish, and verify worked
- but `width_cm`, `depth_cm`, and `height_cm` stayed null on all four validated rows

The blocker was not import/publish propagation. It was lack of trustworthy Hanssem text geometry on the active parser path.

## Parser Change

Updated:

- `lib/parsers/sites/hanssem.ts`

Added narrow geometry logic:

- trust explicit unit-bearing compact size patterns only from the cleaned Hanssem product name
- allow 3D patterns generally
- allow 2D patterns only for `desk` / `table` categories
- normalize units through shared dimension conversion
- preserve debug metadata:
  - `raw_dimension_text_preview`
  - `selected_dimension_line`
  - `selected_dimension_unit`
  - `range_policy_applied`
  - `site_metadata.dimension_source`

Not added:

- no inference from image-only detail blocks
- no inference from unitless numbers
- no inference from partial single-dimension storage titles

## Live Intake Result

Re-importing the same Hanssem batch produced:

- `0a068970-29bf-45b5-82f6-265733437560`
  - `아르떼 천연가죽 소파 3인`
  - geometry `null / null / null`
- `64fff11a-6a97-40c0-beae-3d2e6742f132`
  - `플롯 컴퓨터 책상 120x70cm`
  - geometry `120 / 70 / null`
  - selected dimension line `120x70cm`
  - unit `cm`
  - dimension source `product_name_explicit_2d_dimensions`
- `d085965f-4fd2-41ba-9f59-446afac3c9a4`
  - `샘 책장 5단 120cm 수납형 시공`
  - geometry `null / null / null`
- `db6dd556-70b9-4b28-ae3a-1142ed06eab0`
  - `재크 철제 선반 5단 다용도랙 1100`
  - geometry `null / null / null`

## Audit Result

Immediately after re-intake:

- the four Hanssem rows returned to `pending_review`
- all four rows were already linked to valid canonical products
- operational audit classified them as deterministic reconciliation candidates, not blocked rows

This was expected because re-intake reused existing canonical links.

## Live Republish And Verification

I republished the same four Hanssem rows through the admin publish route so the updated geometry values would actually flow into canonical `furniture_products`.

Republish result:

- all four rows returned HTTP `200`
- all four were `repeated_publish = true`

Canonical geometry after republish:

- `fb248cff-d860-4010-a620-f236117e9708`
  - source `817732`
  - `null / null / null`
- `6536144d-0da7-4e22-ae10-06f06adef332`
  - source `884223`
  - `120 / 70 / null`
- `ed102d38-5e5f-41c5-9657-7f717bc81b83`
  - source `857489`
  - `null / null / null`
- `395a57b5-d05e-470a-b361-0145b5d1a03f`
  - source `425879`
  - `null / null / null`

Post-publish verification:

- all four `verify-publish` runs passed
- no failures
- no warnings

## Post-Publish Baseline

Post-republish audit summary:

- total jobs: `39`
- `published`: `39`
- quality-gate `publish_ready`: `39`

Hanssem ended in a clean published state after the rerun.

## Geometry Decision

Hanssem geometry/spec works only for limited page patterns.

Reason:

- the source can carry trustworthy geometry when the PDP product name explicitly contains a unit-bearing compact size pattern like `120x70cm`
- that geometry now survives intake, canonical publish, and verification
- but the sampled Hanssem PDP detail blocks are mostly image-based, not text spec tables
- the other three validated pages still do not expose trustworthy overall dimensions on the active parser path

This is stronger than `identity-only operational`, but not strong enough for broad operational geometry reliance.

## Deferred

- broader Hanssem geometry support needs source-specific work only if future PDPs expose trustworthy text-based spec rows
- no safe rule was added for unitless numbers like `1100`
- no safe rule was added for single-dimension storage titles like `120cm`
- image OCR or image-derived dimension inference is out of scope and would not meet the current deterministic contract

## Artifacts

- `/tmp/hanssem-geometry-intake-rerun-2026-04-10.json`
- `/tmp/import-jobs-hanssem-geometry-audit-2026-04-10.json`
- `/tmp/hanssem-geometry-direct-publish-2026-04-10.json`
- `/tmp/hanssem-verify-summary-2026-04-10.json`
- `/tmp/import-jobs-hanssem-geometry-post-publish-audit-2026-04-10.json`
