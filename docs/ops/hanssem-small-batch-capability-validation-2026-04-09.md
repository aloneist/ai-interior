# Hanssem Small-Batch Capability Validation - 2026-04-09

## Scope

This run validated Hanssem against the current live path:

- intake
- quality audit
- publish decision
- geometry contract compatibility check

This was not a seller parser implementation step.

## Pre-Run Baseline

Live baseline before intake:

- `import_jobs` rows with `source_site = hanssem`: `0`
- `furniture_products` rows with `source_site = hanssem`: `0`

## Batch Used

- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=817732&wlp=00644263`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=884223&wlp=00583197`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=857489&wlp=0615004`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=425879&wlp=0536610`

The batch was chosen to cover more than one likely category and at least one PDP whose title suggested size/spec content.

## Intake Outcomes

All 4 URLs succeeded at the route level:

- HTTP fetch worked
- staging rows were created
- `source_site` was correctly recorded as `hanssem`

New import jobs:

- `0a068970-29bf-45b5-82f6-265733437560`
- `64fff11a-6a97-40c0-beae-3d2e6742f132`
- `d085965f-4fd2-41ba-9f59-446afac3c9a4`
- `db6dd556-70b9-4b28-ae3a-1142ed06eab0`

But every staged row had the same extraction result:

- `parser_result_present = false`
- `parser_version = null`
- `extracted_name = null`
- `extracted_category = null`
- `extracted_price = null`
- `extracted_width_cm = null`
- `extracted_depth_cm = null`
- `extracted_height_cm = null`
- `extracted_image_urls = []`

Operational meaning:

- Hanssem is not fetch-blocked in the current environment
- Hanssem is currently parse-blocked on the active deterministic parser path

## Quality Audit Result

Post-intake audit added 4 new non-published rows:

- `pending_review`: `4`
- `published`: `35`

Hanssem-only classification:

- `publish_ready`: `0`
- `publish_allowed_with_warning`: `0`
- `publish_blocked`: `4`
- `manual_review_required` quality-gate rows: `0`

Row-level disposition on all 4 rows:

- `quality_gate = publish_blocked`
- `disposition = manual_review_required`

Shared blockers on all 4 rows:

- `missing_name`
- `missing_category`
- `missing_price`

Shared warnings on all 4 rows:

- `missing_image`
- `missing_brand`

This means the quality gate is behaving correctly, but the real blocker stage is upstream parsing.

## Publish / Verify Outcome

No Hanssem rows were published.

Reason:

- there were no `publish_ready` rows
- forcing publish would have violated the current operator contract

Post-run live canonical state:

- `furniture_products` rows with `source_site = hanssem`: `0`

Because no rows were published, no post-publish verification run was applicable.

## Geometry Contract Observations

Observed current-state geometry compatibility:

- no Hanssem row produced any geometry fields
- no Hanssem row produced any parser geometry metadata
- current Hanssem path does not reach geometry contract evaluation at all because it never reaches parsed identity

However, the imported HTML does suggest Hanssem PDPs are not geometry-empty in principle:

- product HTML included structured product titles
- at least some pages exposed title text containing size strings such as `120x70cm`
- the HTML also contained `상품정보` sections

That means:

- Hanssem is not currently blocked by geometry-contract strictness
- Hanssem is blocked earlier because there is no source-capable parser on the active path
- if Hanssem is prioritized later, source-specific parsing should likely be able to recover at least name, category, price, image, and then geometry/spec handling can be evaluated separately

## Source Status Decision

Hanssem is `parse_blocked`.

Reason:

- fetch works
- staging works
- parser output is absent on every validated row
- downstream quality blocking is a consequence of missing parsed identity, not a gate-design problem

This is stronger and more useful than calling Hanssem merely `experimental`.

## Deferred Items

- do not loosen publish gates for Hanssem
- do not attempt manual publish on null-identity rows
- if Hanssem is prioritized next, the smallest useful follow-up is a source-capable parser for:
  - name
  - price
  - category hint
  - primary image
- only after that should Hanssem geometry handling be evaluated under geometry contract v1

## Artifacts

- `/tmp/hanssem-import-batch-2026-04-09.json`
- `/tmp/import-jobs-hanssem-pre-audit-2026-04-09.json`
- `/tmp/import-jobs-hanssem-post-audit-2026-04-09.json`

## Validation

- `git diff --check`
