# Livart Deterministic Breadth Completion - 2026-04-10

## Scope

Validate Livart on a broader but still controlled real batch under the current intake -> quality-gate -> publish -> verify workflow, and identify the real deterministic support boundary.

## Batch Used

- `https://mall.hyundailivart.co.kr/p/P200168513`
- `https://mall.hyundailivart.co.kr/p/P100033578`
- `https://mall.hyundailivart.co.kr/p/P100034241`
- `https://mall.hyundailivart.co.kr/p/P200196705`
- `https://mall.hyundailivart.co.kr/p/P100040015`
- `https://mall.hyundailivart.co.kr/p/P100024408`

Batch intent:

- reuse two previously validated reference patterns
- add new table, desk-set, dresser, and vanity-set patterns
- test identity success separately from geometry/spec success
- confirm whether any new Livart page pattern is truly blocked or only limited

## Findings Before The Narrow Fix

Initial batch intake showed:

- identity success and geometry success on:
  - `P100024408` (`table`)
  - `P100040015` (`storage`)
  - `P200196705` (`desk`)
- identity success but geometry absence on:
  - `P100033578` (`storage`, no trustworthy overall-size line on the active path)
- identity success but category failure on:
  - `P100034241` (`리타 ㄱ자 화장대세트(거울미포함)`)

The one real blocker was narrow and deterministic:

- `P100034241` staged with valid name, price, and image
- `extracted_category` stayed `null`
- audit classified it as `publish_blocked` for `missing_category`

This was a Livart category-coverage gap, not a fetch failure, not a publish-gate problem, and not a geometry-contract problem.

## Narrow Code Change

Updated [livart.ts](/workspaces/ai-interior/lib/parsers/sites/livart.ts).

Applied one Livart-only category fix:

- map `화장대|드레서` to canonical `desk` in `resolveLivartCategoryHint()`

No publish gates were loosened.
No shared parser architecture was changed.
No IKEA DOM or site assumptions were introduced.

## Staged Batch Results After The Fix

Representative staged outcomes:

- `P200168513`
  - category: `sofa`
  - geometry: `270 / 104 / 98`
  - pattern: trusted overall-size text block
- `P100033578`
  - category: `storage`
  - geometry: `null / null / null`
  - pattern: identity-supported, geometry-absent on active deterministic path
- `P100034241`
  - category: `desk`
  - geometry: `null / null / null`
  - pattern: identity-supported after narrow category mapping, no trustworthy overall-size line carried
- `P200196705`
  - category: `desk`
  - geometry: `140 / 60 / 72`
  - pattern: trusted overall-size text block
- `P100040015`
  - category: `storage`
  - geometry: `100 / 49.5 / 75.5`
  - pattern: trusted overall-size text block
- `P100024408`
  - category: `table`
  - geometry: `95 / 54.5 / 33.5`
  - pattern: trusted overall-size text block

## Audit Classification

Pre-fix batch audit:

- new ready rows: `3`
- blocked rows: `1`
- reconciliation-only reference rows: `2`

Post-fix batch audit:

- new ready rows: `4`
- blocked rows: `0`
- reconciliation-only reference rows: `2`

Artifacts:

- `/tmp/livart-breadth-completion-audit-2026-04-10.json`
- `/tmp/livart-breadth-completion-audit-post-fix-2026-04-10.json`

## Publish And Verification

Published only the truly ready new subset:

- `2216d0c8-65eb-46a2-b089-b944955e8ff9` -> `c3f7d402-8619-4a64-8b44-23a4c8714142`
  - URL: `P100024408`
- `53203f53-4b5a-4477-a019-ff0c3adcb87c` -> `927968fa-eaa4-40cc-9883-cf0d5362cd74`
  - URL: `P100040015`
- `3d3ae73f-e3cc-4faa-aad1-594fcd0b8307` -> `455fccd4-ccc1-4c38-977d-a91825cd3687`
  - URL: `P200196705`
- `81d13dfe-695b-4791-863b-ccf3ba16b505` -> `7d8ce88a-3605-4ec8-ac99-b76c7b5a2448`
  - URL: `P100034241`

Each publish returned HTTP `200` and passed post-publish verification with:

- canonical row present
- linkage correct
- name/category/price preserved
- outbound URL present and non-generic
- geometry retained when extracted

Artifacts:

- `/tmp/livart-publish-2216d0c8-2026-04-10.json`
- `/tmp/livart-publish-53203f53-2026-04-10.json`
- `/tmp/livart-publish-3d3ae73f-2026-04-10.json`
- `/tmp/livart-publish-81d13dfe-2026-04-10.json`

The two reference rows that were already linked canonical products were restored to clean published state through deterministic remediation:

- `/tmp/livart-breadth-completion-remediation-2026-04-10.json`

Final post-run baseline:

- `43` total jobs
- `43` published
- `43` `publish_ready`

Artifact:

- `/tmp/livart-breadth-completion-post-publish-audit-2026-04-10.json`

## Page-Pattern Boundary

### Supported

- Livart PDPs with trustworthy overall-size text lines in the validated Livart content block
- validated across:
  - sofa
  - table
  - desk-set
  - dresser/storage

### Limited But Usable

- Livart PDPs with strong identity fields but no trustworthy overall-size line on the active deterministic path
- example:
  - `P100033578`
  - publishable, but geometry remains null

### Narrowly Fixed

- Livart vanity/dresser naming pattern that previously lacked category mapping
- example:
  - `P100034241`
  - now operationally publishable as `desk`

### Still Not Proven Source-Wide

- broader Livart category/page-pattern coverage outside the sampled set
- any page that exposes only marketing copy, accessory/component dimensions, or otherwise weak size text

## Conclusion

Livart remains `supported_operational only for limited categories/cases`.

Why:

- the deterministic identity path is broader than before
- the active deterministic geometry path now covers more real Livart page patterns than the earlier sofa/storage-only sample
- one real new blocker was resolved with a narrow Livart-only category fix
- but geometry still depends on Livart exposing a trustworthy overall-size line, and source-wide breadth is still not proven

More specifically:

- Livart identity support is now stronger than its geometry support
- Livart geometry/spec still works only for limited page patterns
- remaining limits look like source-coverage limits, not current contract drift

## Deferred Items

- validate more Livart categories before calling the source fully operational
- expand geometry coverage only when a real page exposes a clearly trustworthy overall-size block
- keep geometry null when Livart does not expose trustworthy overall product dimensions on the deterministic path
