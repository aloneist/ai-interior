# Hanssem Geometry / Spec Hardening - 2026-04-11

## Scope

This run focused on a narrow Hanssem geometry/spec hardening step under geometry contract v1.1.

Included:

- broader Hanssem PDP structure inspection
- reproduction of the live geometry gap on the active workflow
- one narrow Hanssem-only geometry extraction change
- real intake rerun on the active Hanssem batch
- real publish and post-publish verification

Not included:

- no OCR or image-derived geometry
- no schema change
- no ranking/runtime redesign
- no generic parser-framework rewrite

## Batch Used

- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=425879&wlp=0536610`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=613223&wlp=00581221`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=670885&wlp=00579436`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=795503&wlp=00362424`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=817732&wlp=00644263`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=857489&wlp=0615004`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=884223&wlp=00583197`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=913329&wlp=37999785`

This is the full active Hanssem canonical set at the time of the run.

## Structure Analysis

### What is trustworthy

Observed across the sampled Hanssem PDPs:

- identity fields remain trustworthy in JSON-LD and meta tags
- the main detailed PDP body is carried in Next.js state under:
  - `goodsDetail.storedGoods.<gdsNo>.detailInfo.goodsDetailInfo.goodsDetailHtml`
- the existing desk-positive case still has a trustworthy explicit compact size in the product name:
  - `플롯 컴퓨터 책상 120x70cm`

### What is not trustworthy

Across the sampled geometry-negative pages:

- `goodsDetailHtml` is dominated by image tags and banner-like image sequences
- `goodsDetailEditor` is empty on the sampled pages
- `goodsDetailNoticeInfos` is empty on the sampled pages
- no trustworthy text rows with:
  - `가로`
  - `세로`
  - `깊이`
  - `높이`
  - `치수`
  - `규격`
  were found in the active Hanssem payload on this batch

### Real false positives observed

- image-heavy product detail sections
- product marketing copy such as `사이즈, 가격을 확인해 보세요`
- unitless numeric width-class looking titles such as `1100`
- unitless multi-number titles such as `900 1300`
- product-family and option text that does not prove overall outer-envelope geometry

## Reproduced Geometry Gap

Before the new change, the active Hanssem state was:

- `8` active canonical rows
- `0` full `3d`
- `1` envelope-only
- `7` absent

The live inspection confirms the gap is still mainly deterministic extraction coverage, not canonical propagation loss:

- geometry-negative sampled rows had no trustworthy text-based overall-size line on the active path
- the detail payload was mostly image-only
- there was no structured notice/spec table available in the sampled Next.js state

## Narrow Code Change

Updated:

- [hanssem.ts](/workspaces/ai-interior/lib/parsers/sites/hanssem.ts)

Added one bounded Hanssem-only rule:

- for `storage` category titles only
- when the product name contains exactly one explicit unit-bearing single dimension such as `120cm` or `140cm`
- and the title contains strong storage nouns such as:
  - `거실장`
  - `책장`
  - `수납장`
  - `선반`
  - `랙`
  - `렌지대`
  - `장식장`
  - `캐비닛`
- and the title does not contain axis or sub-dimension words such as:
  - `높이`
  - `깊이`
  - `세로`
  - `지름`
  - `좌면`
  - `등받이`
  - `팔걸이`
  - `헤드`
  - `매트`
  - `내부`

Then:

- populate `width_cm` only
- keep `depth_cm` and `height_cm` null
- preserve parser debug metadata
- mark source as `product_name_storage_width_class`

Not added:

- no rule for unitless storage widths like `1100`
- no rule for unitless expandable table titles like `900 1300`
- no rule from image-only detail blocks
- no speculative height or depth inference

## Live Intake Results

Real intake rerun through `/api/import-product` on the dev server produced:

- `425879`
  - `재크 철제 선반 5단 다용도랙 1100`
  - geometry: `null / null / null`
- `613223`
  - `키친온 렌지대 수납형 높은장`
  - geometry: `null / null / null`
- `670885`
  - `(한샘몰pick) 씨엘로 헴스 W 확장형 식탁 세트 2인 4인 원목 900 1300`
  - geometry: `null / null / null`
- `795503`
  - `아임빅 수납침대 SS 조명헤드형 (매트별도)`
  - geometry: `null / null / null`
- `817732`
  - `아르떼 천연가죽 소파 3인`
  - geometry: `null / null / null`
- `857489`
  - `샘 책장 5단 120cm 수납형 시공`
  - geometry: `120 / null / null`
  - selected line: `120cm`
  - unit: `cm`
  - source: `product_name_storage_width_class`
- `884223`
  - `플롯 컴퓨터 책상 120x70cm`
  - geometry: `120 / 70 / null`
  - selected line: `120x70cm`
  - unit: `cm`
  - source: `product_name_explicit_2d_dimensions`
- `913329`
  - `디어 오보에 거실장 140cm (2종 택1)`
  - geometry: `140 / null / null`
  - selected line: `140cm`
  - unit: `cm`
  - source: `product_name_storage_width_class`

## Audit Results

After intake rerun:

- all eight Hanssem rows returned to `pending_review`
- all eight remained linked to existing canonical products
- operational audit classified all eight as deterministic reconciliation candidates
- no new publish blockers were introduced

Relevant live audit result:

- `pending_review_already_linked` warning on all eight rerun rows
- no geometry-related quality-gate blocker was introduced by the new rule

Artifact:

- `/tmp/hanssem-geometry-audit-2026-04-11.json`

## Publish And Verification

Republished all eight Hanssem rows through the admin publish route to push the staged geometry changes into canonical `furniture_products`.

Results:

- all eight returned HTTP `200`
- all eight were `repeated_publish = true`

Canonical geometry after republish:

- `395a57b5-d05e-470a-b361-0145b5d1a03f`
  - `425879`
  - `null / null / null`
- `caf36679-d413-4eb4-aed3-892da68d968d`
  - `613223`
  - `null / null / null`
- `acbc8515-869e-43a1-bf6c-e8eb501db4ba`
  - `670885`
  - `null / null / null`
- `9f62ff89-985d-4e74-994f-d72439544fe3`
  - `795503`
  - `null / null / null`
- `fb248cff-d860-4010-a620-f236117e9708`
  - `817732`
  - `null / null / null`
- `ed102d38-5e5f-41c5-9657-7f717bc81b83`
  - `857489`
  - `120 / null / null`
- `6536144d-0da7-4e22-ae10-06f06adef332`
  - `884223`
  - `120 / 70 / null`
- `b15ddcd1-bc47-4db3-be35-1bd44c239017`
  - `913329`
  - `140 / null / null`

Verified representative post-publish rows:

- `857489` bookshelf width-only row
- `884223` desk envelope-only row
- `913329` living-room cabinet width-only row

All three post-publish verification runs passed.

Artifacts:

- `/tmp/hanssem-verify-857489-2026-04-11.json`
- `/tmp/hanssem-verify-884223-2026-04-11.json`
- `/tmp/hanssem-verify-913329-2026-04-11.json`

## Post-Hardening Hanssem Geometry State

Hanssem active canonical completeness after this run:

- total active rows: `8`
- full `3d`: `0`
- envelope-only: `1`
- partial: `2`
- absent: `5`

Delta from before:

- before: `1` row with any usable geometry (`1` envelope-only, `0` partial)
- after: `3` rows with at least partial/envelope geometry (`1` envelope-only, `2` partial)

This is a real improvement, but still not broad geometry support.

## Page-Pattern Support Classification

### Supported geometry page pattern

- product-name explicit compact dimensions with unit
- example:
  - `플롯 컴퓨터 책상 120x70cm`
- result:
  - reliable `2d` envelope

### Limited-but-usable geometry page pattern

- storage titles with exactly one explicit unit-bearing width class and strong storage nouns
- examples:
  - `샘 책장 5단 120cm 수납형 시공`
  - `디어 오보에 거실장 140cm (2종 택1)`
- result:
  - `width_cm` only
  - `depth_cm` and `height_cm` remain null

### Unsupported page pattern

- titles with unitless size-like numbers
- examples:
  - `재크 철제 선반 5단 다용도랙 1100`
  - `씨엘로 헴스 W 확장형 식탁 세트 2인 4인 원목 900 1300`

These remain unsafe because the number may be width-class-like, but the axis or unit is not deterministic enough.

### Lacking trustworthy source geometry entirely

- image-heavy Hanssem PDP detail pages with no parseable text spec rows
- examples from this run:
  - `키친온 렌지대 수납형 높은장`
  - `아임빅 수납침대 SS 조명헤드형 (매트별도)`
  - `아르떼 천연가죽 소파 3인`

These pages remain geometry-null because the active deterministic path exposes no trustworthy text-based overall-size line.

## Conclusion

Hanssem remains `supported_operational only for limited categories/cases`, with materially improved geometry support.

That conclusion is supported by the live outcome:

- geometry improved from `1` usable Hanssem row to `3`
- the new improvement is real and propagated into canonical rows
- but Hanssem still has:
  - `0` full `3d`
  - `5` fully absent rows
- the main remaining blocker is still Hanssem source/page-shape limitation, not canonical propagation

More narrowly:

- Hanssem geometry/spec now works on:
  - explicit compact-dimension titles
  - a narrow storage width-class title pattern
- Hanssem geometry/spec does not yet work broadly across:
  - bed
  - sofa
  - image-heavy storage pages
  - unitless or ambiguous size-like naming patterns

