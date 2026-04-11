# Hanssem Deterministic Breadth Completion - 2026-04-11

## Scope

Validate Hanssem on a broader but still controlled real batch under the current intake -> quality-gate -> publish -> verify workflow, and identify the real deterministic support boundary.

## Batch Used

- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=884223&wlp=00583197`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=817732&wlp=00644263`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=795503&wlp=00362424`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=913329&wlp=37999785`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=670885&wlp=00579436`
- `https://mall.hanssem.com/goods/goodsDetailMall.do?gdsNo=613223&wlp=00581221`

Batch intent:

- reuse one validated geometry-positive desk case
- reuse one validated identity-only sofa case
- add new bed, storage, and table-set patterns
- include variant/promo-sensitive and likely image-heavy PDPs

## Findings Before The Narrow Fix

Initial broader intake showed:

- identity success on all six rows
- geometry success on only one row:
  - `884223` (`플롯 컴퓨터 책상 120x70cm`) -> `120 / 70 / null`
- geometry absence on five rows
- one real semantic drift:
  - `795503` (`아임빅 수납침대 SS 조명헤드형 (매트별도)`)
  - staged as `storage` instead of `bed`

That drift was not a fetch failure and not a quality-gate failure. It was a Hanssem category-resolution issue caused by `수납` and `침대` tying in the generic keyword scoring.

## Narrow Code Change

Updated [hanssem.ts](/workspaces/ai-interior/lib/parsers/sites/hanssem.ts).

Applied one Hanssem-only category fix:

- if the joined Hanssem identity text matches `수납침대|침대 프레임|침대`, force canonical category `bed`

No quality gates were loosened.
No geometry-contract rules changed.
No shared parser framework rewrite was introduced.

## Staged Batch Results After The Fix

Representative staged outcomes:

- `884223`
  - name: `플롯 컴퓨터 책상 120x70cm`
  - category: `desk`
  - geometry: `120 / 70 / null`
  - pattern: supported deterministic geometry from product-name size
- `817732`
  - name: `아르떼 천연가죽 소파 3인`
  - category: `sofa`
  - geometry: `null / null / null`
  - pattern: identity-supported, geometry-absent
- `795503`
  - name: `아임빅 수납침대 SS 조명헤드형 (매트별도)`
  - category: `bed`
  - geometry: `null / null / null`
  - pattern: identity-supported after narrow bed-category fix, geometry absent
- `913329`
  - name: `디어 오보에 거실장 140cm (2종 택1)`
  - category: `storage`
  - geometry: `null / null / null`
  - pattern: identity-supported, only size label captured, no trustworthy overall geometry
- `670885`
  - name: `(한샘몰pick) 씨엘로 헴스 W 확장형 식탁 세트 2인 4인 원목 900 1300`
  - category: `table`
  - geometry: `null / null / null`
  - pattern: variant/promo-sensitive table-set page, identity-supported
- `613223`
  - name: `키친온 렌지대 수납형 높은장`
  - category: `storage`
  - geometry: `null / null / null`
  - pattern: image-heavy storage page, identity-supported

## Audit Classification

Post-fix audit on the broader batch:

- new ready rows: `4`
- reconciliation-only reference rows: `2`
- blocked rows: `0`
- warning rows: `0`

Artifacts:

- `/tmp/hanssem-breadth-completion-audit-2026-04-11.json`

The four ready rows were:

- `42419cab-0b29-41ad-9a6f-58d8216b0837`
- `12311f47-31f9-4831-9632-29f608b69a30`
- `4e47d334-8d04-433b-91ce-ad9d410a622f`
- `c1756afc-1b09-4dce-afbd-a524fe572778`

The two already-linked reference rows were:

- `64fff11a-6a97-40c0-beae-3d2e6742f132`
- `0a068970-29bf-45b5-82f6-265733437560`

## Publish And Verification

Published only the truly ready new subset:

- `42419cab-0b29-41ad-9a6f-58d8216b0837` -> `caf36679-d413-4eb4-aed3-892da68d968d`
  - URL: `613223`
- `12311f47-31f9-4831-9632-29f608b69a30` -> `acbc8515-869e-43a1-bf6c-e8eb501db4ba`
  - URL: `670885`
- `4e47d334-8d04-433b-91ce-ad9d410a622f` -> `b15ddcd1-bc47-4db3-be35-1bd44c239017`
  - URL: `913329`
- `c1756afc-1b09-4dce-afbd-a524fe572778` -> `9f62ff89-985d-4e74-994f-d72439544fe3`
  - URL: `795503`

Each publish returned HTTP `200` and passed post-publish verification with:

- canonical row present
- linkage correct
- name/category/price preserved
- outbound URL present and non-generic
- geometry retained where available

Artifacts:

- `/tmp/hanssem-publish-42419cab-2026-04-11.json`
- `/tmp/hanssem-publish-12311f47-2026-04-11.json`
- `/tmp/hanssem-publish-4e47d334-2026-04-11.json`
- `/tmp/hanssem-publish-c1756afc-2026-04-11.json`

The two reference rows were restored to clean published state through deterministic remediation:

- `/tmp/hanssem-breadth-completion-remediation-2026-04-11.json`

Final post-run baseline:

- `47` total jobs
- `47` published
- `47` `publish_ready`

Artifact:

- `/tmp/hanssem-breadth-completion-post-publish-audit-2026-04-11.json`

## Page-Pattern Boundary

### Supported

- Hanssem PDPs with strong JSON-LD/meta identity signals and no category ambiguity
- examples:
  - `795503` bed after the narrow category fix
  - `613223` storage
  - `670885` table-set
  - `913329` storage

### Limited But Usable

- Hanssem PDPs that are operationally publishable but still geometry-null
- examples:
  - `817732`
  - `795503`
  - `913329`
  - `670885`
  - `613223`

### Supported With Narrow Geometry

- Hanssem PDPs where the product name itself carries a trustworthy unit-bearing size pattern
- example:
  - `884223` -> `120 / 70 / null`

### Lacking Trustworthy Source Geometry

- the broader sampled Hanssem pages outside the desk case
- these pages still do not expose trustworthy deterministic overall dimensions on the active path
- the gap is mainly source/page-shape absence, not an active contract mismatch

## Conclusion

Hanssem remains `supported_operational only for limited categories/cases`.

Why:

- deterministic identity support is broader than before
- the broader batch stayed operational after one narrow Hanssem-only category fix
- live intake -> audit -> publish -> verify worked on the new rows
- but geometry/spec is still narrow and only works on limited page patterns

More specifically:

- Hanssem identity support is stronger than its geometry support
- Hanssem geometry/spec still works only for limited page patterns
- the current source boundary is driven mainly by trustworthy source-data absence on many PDPs, not by current publish-contract drift

## Deferred Items

- decide later whether Hanssem promo-prefix cleanup like `(한샘몰pick)` is worth a narrow identity cleanup pass
- expand Hanssem geometry only if future PDPs expose trustworthy text-based overall-size rows
- do not start image-derived dimension extraction in the deterministic Hanssem path
