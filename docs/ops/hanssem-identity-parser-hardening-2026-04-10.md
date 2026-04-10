# Hanssem Identity Parser Hardening - 2026-04-10

## Scope

This run covered:

- Hanssem PDP structure analysis for core identity fields
- first narrow Hanssem parser implementation
- live intake rerun on the existing Hanssem batch
- live audit, publish, and post-publish verification

This was not a geometry-hardening step.

## Batch Used

- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=817732&wlp=00644263`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=884223&wlp=00583197`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=857489&wlp=0615004`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=425879&wlp=0536610`

## Structure Analysis

Observed trustworthy Hanssem identity sources in the sampled PDP HTML:

- product name:
  - JSON-LD `Product.name`
  - `meta[property="og:title"]`
  - `<title>`
- product image:
  - JSON-LD `Product.image`
  - `meta[property="og:image"]`
- operational price:
  - `meta[property="eg:salePrice"]`
  - fallback `meta[property="eg:price"]`
  - script-level `couponPrc` / `dcPrc` only as fallback
- category hint:
  - resolved from cleaned product name + description + source URL using the shared category resolver

Observed false positives to avoid:

- page banners and non-product promotional images
- raw option-selection suffixes like `(옵션 택1)` and `(2종/택1)` in product names
- non-operational price text outside the Hanssem sale/price meta path

## Previous Gap

Before this step, Hanssem fetch and staging worked, but `parseProductPayload()` returned `null` for `sourceSite = hanssem`.

That caused every staged Hanssem row to miss:

- `extracted_name`
- `extracted_category`
- `extracted_price`
- `extracted_image_urls`

The source was not fetch-blocked. It was parse-blocked.

## Parser Change

Added:

- `lib/parsers/sites/hanssem.ts`

Updated:

- `lib/parsers/router.ts`

Parser behavior added:

- JSON-LD/OG/title extraction for product identity
- Hanssem sale-price meta extraction for operational price
- product-name cleanup to remove promo prefixes and option-selection suffixes
- shared category resolution from Hanssem-specific identity text
- parser debug metadata for:
  - parser version
  - name source
  - image source
  - selected price source
  - Hanssem price signal values

## Live Intake Result

All four Hanssem URLs imported successfully and updated the existing staged rows:

- `0a068970-29bf-45b5-82f6-265733437560`
  - `아르떼 천연가죽 소파 3인`
  - category `sofa`
  - price `1079000`
- `64fff11a-6a97-40c0-beae-3d2e6742f132`
  - `플롯 컴퓨터 책상 120x70cm`
  - category `desk`
  - price `189000`
- `d085965f-4fd2-41ba-9f59-446afac3c9a4`
  - `샘 책장 5단 120cm 수납형 시공`
  - category `storage`
  - price `202900`
- `db6dd556-70b9-4b28-ae3a-1142ed06eab0`
  - `재크 철제 선반 5단 다용도랙 1100`
  - category `storage`
  - price `109900`

Each row now had:

- parsed name
- parsed category
- parsed price
- one primary image
- brand `한샘`

## Audit Result

Pre-publish Hanssem audit outcome:

- `publish_ready`: `4`
- `publish_allowed_with_warning`: `0`
- `publish_blocked`: `0`
- `manual_review_required`: `0`

There were no blockers and no warnings on the Hanssem rows.

## Live Publish And Verification

All four publish-ready Hanssem rows were published successfully through the existing publish workflow.

Published canonical products:

- `0a068970-29bf-45b5-82f6-265733437560` -> `fb248cff-d860-4010-a620-f236117e9708`
- `64fff11a-6a97-40c0-beae-3d2e6742f132` -> `6536144d-0da7-4e22-ae10-06f06adef332`
- `d085965f-4fd2-41ba-9f59-446afac3c9a4` -> `ed102d38-5e5f-41c5-9657-7f717bc81b83`
- `db6dd556-70b9-4b28-ae3a-1142ed06eab0` -> `395a57b5-d05e-470a-b361-0145b5d1a03f`

Post-publish verification:

- all four rows returned HTTP `200`
- all four post-publish verification checks passed
- no verification failures
- no verification warnings

## Post-Publish Baseline

Post-publish audit summary:

- total jobs: `39`
- `published`: `39`
- quality-gate `publish_ready`: `39`

Hanssem-specific final state:

- `import_jobs.status = published` on all four validated rows
- canonical `furniture_products.status = active` on all four linked products
- canonical name/category/price matched the staged parsed values
- canonical affiliate URL was present on all four rows

## Geometry Observation

Hanssem moved beyond parse-blocked without geometry work.

For the validated batch:

- `width_cm = null`
- `depth_cm = null`
- `height_cm = null`

That is expected in this step. Geometry remains a later Hanssem-specific hardening track, not a blocker for identity/publish viability.

## Source Status Decision

Hanssem is now `supported_operational only for limited categories/cases`.

Reason:

- real intake succeeded
- parser output now populated trustworthy identity fields
- quality audit classified the rows correctly as publish-ready
- live publish and post-publish verification both succeeded

Why not full `supported_operational` yet:

- evidence is still limited to four validated PDPs
- geometry extraction is still absent
- wider Hanssem category coverage has not been validated yet

## Artifacts

- `/tmp/hanssem-intake-rerun-2026-04-10.json`
- `/tmp/import-jobs-hanssem-audit-2026-04-10.json`
- `/tmp/hanssem-publish-summary-2026-04-10.json`
- `/tmp/hanssem-publish-0a068970-29bf-45b5-82f6-265733437560-2026-04-10.json`
- `/tmp/hanssem-publish-64fff11a-6a97-40c0-beae-3d2e6742f132-2026-04-10.json`
- `/tmp/hanssem-publish-d085965f-4fd2-41ba-9f59-446afac3c9a4-2026-04-10.json`
- `/tmp/hanssem-publish-db6dd556-70b9-4b28-ae3a-1142ed06eab0-2026-04-10.json`
- `/tmp/import-jobs-hanssem-post-publish-audit-2026-04-10.json`
