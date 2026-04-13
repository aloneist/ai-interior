# Image-Derived Geometry Experiment Pool - 2026-04-12

## Scope

Formally separate the remaining image-heavy/source-absence rows from deterministic parser backlog and define them as the official future image-derived geometry experiment pool.

This step is intentionally narrow:

- no OCR or computer-vision implementation
- no new seller parser work
- no schema change
- no ranking or UX change

## Rule

An active canonical row enters the official image-derived geometry experiment pool only when all of the following are true:

- active canonical row in `furniture_products`
- real seller row, not QA fixture
- `parser_lane_eligibility = ineligible`
- `geometry_source_shape = image_heavy_or_absent`

Current pool rule on geometry state:

- geometry should still be unresolved from a canonical operations standpoint
- in the current live pool, all rows are fully geometry-absent:
  - `width_cm = null`
  - `depth_cm = null`
  - `height_cm = null`

For this formalization step, no partial or operationally usable row is included in the pool.

## Why This Is Not Deterministic Parser Backlog

These rows are excluded from deterministic parser KPI tracking because the current canonical evidence already says:

- no trustworthy text-based geometry is present on the active deterministic path
- the rows are `ineligible`, not merely incomplete
- continuing to count them as parser misses would distort deterministic seller hardening progress

This pool is therefore a separate experiment lane, not an open deterministic backlog.

## Live Pool

Live derivation against active canonical rows produced:

- total pool: `8`
- seller breakdown:
  - `hanssem`: `5`
  - `livart`: `3`
- category breakdown:
  - `storage`: `3`
  - `bed`: `2`
  - `sofa`: `1`
  - `desk`: `1`
  - `table`: `1`

Representative rows:

- `재크 철제 선반 5단 다용도랙 1100`
  - source: `hanssem`
  - category: `storage`
  - reason: `no_trustworthy_text_geometry`

- `아임빅 수납침대 SS 조명헤드형 (매트별도)`
  - source: `hanssem`
  - category: `bed`
  - reason: `no_trustworthy_text_geometry`

- `(한샘몰pick) 씨엘로 헴스 W 확장형 식탁 세트 2인 4인 원목 900 1300`
  - source: `hanssem`
  - category: `table`
  - reason: `no_trustworthy_text_geometry`

- `리타 ㄱ자 화장대세트(거울미포함)`
  - source: `livart`
  - category: `desk`
  - reason: `no_trustworthy_text_geometry`

- `뉴트 저상형 퀸 침대 프레임 도어형`
  - source: `livart`
  - category: `bed`
  - reason: `no_trustworthy_text_geometry`

## Future Experiment Contract

Any future image-derived geometry work for this pool must stay bounded by these rules:

- recover only trustworthy overall outer-envelope geometry, not component, accessory, package, or internal dimensions
- reject ambiguous image text when the image cannot prove overall product-level meaning
- preserve provenance and confidence separately from the core canonical geometry fields
- never overwrite stronger existing trustworthy text-derived geometry with weaker image-derived guesses
- keep image-derived experiment KPIs separate from deterministic parser KPIs
- treat successful recovery as a publish-quality candidate only after the same outer-envelope and ambiguity rules are satisfied

## Metadata Decision

No new canonical metadata field was added.

Reason:

- the pool is already safely derivable from existing canonical metadata plus current active status
- adding a new pool label would duplicate an existing control surface without improving safety

## Next Execution Order

1. Use this `8`-row pool as the only approved starting set for future image-derived geometry experiment design/spec.
2. Keep deterministic parser follow-up closed unless new trustworthy text evidence appears on a real seller page.
3. Do not mix future image-derived experiment outcomes into deterministic parser KPI tracking.

## Commands Used

Live reads used for this step:

- active canonical pool derivation read from `furniture_products`

Static validation:

- `git diff --check`
