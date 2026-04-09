# Livart Source Hardening Validation - 2026-04-09

## Batch Used

Validation batch:

- `https://mall.hyundailivart.co.kr/p/P200134640`
- `https://mall.hyundailivart.co.kr/p/P200145552`

## Failure Mode Before Changes

Observed before source hardening:

- Livart fetch succeeded
- staged `import_jobs` row was created
- required publish fields were missing:
  - `extracted_name`
  - `extracted_category`
  - `extracted_price`
  - primary image

Confirmed cause:

- not a fetch failure
- not a quality-gate mistake
- the import path returned `parserResult = null` for non-IKEA sources
- the Livart page already exposed usable product data in:
  - `og:title`
  - `meta[name="description"]`
  - `og:image`
  - visible price markup and hidden start-price input

Operational conclusion of the failure:

- this was a source-specific extraction gap
- the publish gates were behaving correctly by blocking the staged row

## Exact Changes Made

Added a minimal Livart-specific parser:

- [livart.ts](/workspaces/ai-interior/lib/parsers/sites/livart.ts)

Routing changes:

- [router.ts](/workspaces/ai-interior/lib/parsers/router.ts)
- [index.ts](/workspaces/ai-interior/lib/parsers/index.ts)
- [route.ts](/workspaces/ai-interior/app/api/import-product/route.ts)

Hardening scope was intentionally narrow:

- deterministic extraction of product name from Open Graph / meta fields
- deterministic extraction of category using existing category resolution
- deterministic extraction of price from Livart page price markup
- deterministic extraction of primary image from Open Graph / Twitter image

Not added:

- no generic parser rewrite
- no quality-gate loosening
- no outbound contract changes
- no broad architecture changes

## Post-Hardening Intake And Audit

Post-hardening intake result:

- both Livart URLs imported successfully
- both staged rows contained required publish fields

Rows:

- `de39c8a0-0ec9-4e30-8705-8c008bb8be0a`
- `8d03bcad-d4ca-47a1-8ed5-2d29287d784a`

Audit artifact:

- `/tmp/livart-batch-audit-post-hardening-2026-04-09.json`

Audit result:

- both Livart rows classified as `publish_ready`
- no blockers
- no warnings

## Publish And Verify Outcomes

Published rows:

- `de39c8a0-0ec9-4e30-8705-8c008bb8be0a`
  - canonical product: `08f8ea0c-e968-4829-bb33-c8ecb29ad7f1`
- `8d03bcad-d4ca-47a1-8ed5-2d29287d784a`
  - canonical product: `50211b25-5b4b-463b-a46a-30ce0a98e5ab`

Publish artifacts:

- `/tmp/livart-publish-de39c8a0-2026-04-09.json`
- `/tmp/livart-publish-8d03bcad-2026-04-09.json`

Verification result for both publishes:

- import job status published
- `published_product_id` present
- canonical row exists and is active
- canonical source URL matches staged source URL
- canonical name, category, price, image, and outbound URL present
- no verification warnings

Final post-publish audit artifact:

- `/tmp/livart-batch-post-publish-audit-2026-04-09.json`

Final state after validation:

- `import_jobs`: `31` total, all `published`
- Livart staged rows: `0` remaining pending
- Livart canonical rows: `2` active rows added

## Source-Status Decision

Decision:

- Livart improved but remains experimental

Reason:

- the source is no longer quality-blocked for the validated sample
- real intake, audit, publish, and post-publish verification all succeeded on two live Livart URLs
- but the evidence is still narrow:
  - only two URLs validated
  - category extraction is still metadata/title-driven and currently proven only for obvious sofa PDPs
  - price selection on Livart pages may still need refinement where sale/member/base prices differ

This is enough to justify more Livart validation batches.
It is not yet enough to declare the source fully `supported_operational`.

## Deferred Items

- validate additional Livart categories beyond sofa
- confirm whether `startPrice` or visible discounted price is the correct operational price source across more products
- add dimensions only if operational review actually requires them for Livart publish approval
