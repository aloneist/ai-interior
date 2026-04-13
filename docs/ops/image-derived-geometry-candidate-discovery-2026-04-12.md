# Image-Derived Geometry Candidate Discovery - 2026-04-12

## Scope

Re-check the full current image-derived geometry experiment pool and classify each row by actual visible image-surface usefulness before any OCR or vision follow-up is attempted.

This step stayed narrow:

- no OCR or vision implementation
- no parser implementation
- no schema change
- no ranking or UX change

## Pool Reviewed

The full current official pool was re-checked.

Exact `8` rows:

- `427df9c7-b4a0-4b93-bb69-e75e218a917f`
  - `livart`
  - `뉴트 저상형 퀸 침대 프레임 도어형`
  - `bed`

- `9cbdf8ac-3a4a-49ac-b17e-b8a134f6a419`
  - `livart`
  - `블루라벨 집과책나무 1200 수납책장`
  - `storage`

- `7d8ce88a-3605-4ec8-ac99-b76c7b5a2448`
  - `livart`
  - `리타 ㄱ자 화장대세트(거울미포함)`
  - `desk`

- `fb248cff-d860-4010-a620-f236117e9708`
  - `hanssem`
  - `아르떼 천연가죽 소파 3인`
  - `sofa`

- `acbc8515-869e-43a1-bf6c-e8eb501db4ba`
  - `hanssem`
  - `(한샘몰pick) 씨엘로 헴스 W 확장형 식탁 세트 2인 4인 원목 900 1300`
  - `table`

- `caf36679-d413-4eb4-aed3-892da68d968d`
  - `hanssem`
  - `키친온 렌지대 수납형 높은장`
  - `storage`

- `9f62ff89-985d-4e74-994f-d72439544fe3`
  - `hanssem`
  - `아임빅 수납침대 SS 조명헤드형 (매트별도)`
  - `bed`

- `395a57b5-d05e-470a-b361-0145b5d1a03f`
  - `hanssem`
  - `재크 철제 선반 5단 다용도랙 1100`
  - `storage`

## Surface Classification Model

Rows were classified using this bounded model:

- `size_diagram_visible`
- `spec_table_image_visible`
- `mixed_marketing_plus_size`
- `package_or_component_ambiguous`
- `no_usable_spec_surface`

Supporting field:

- `surface_discovery_reason`

## Row-By-Row Discovery Result

### 1. `뉴트 저상형 퀸 침대 프레임 도어형`

- source: `livart`
- surface class: `no_usable_spec_surface`
- surface discovery reason: detail and spec assets reviewed were product/lifestyle imagery with no visible measurement text or diagram
- readable enough for OCR later: `no`
- likely outer-envelope surface: `no`
- future OCR candidate: `pause`

### 2. `블루라벨 집과책나무 1200 수납책장`

- source: `livart`
- surface class: `no_usable_spec_surface`
- surface discovery reason: reviewed assets were product close-ups and promotional banner content, not size/spec surfaces
- readable enough for OCR later: `no`
- likely outer-envelope surface: `no`
- future OCR candidate: `pause`

### 3. `리타 ㄱ자 화장대세트(거울미포함)`

- source: `livart`
- surface class: `no_usable_spec_surface`
- surface discovery reason: reviewed assets showed product montage/detail use, but no visible measurements or size diagram
- readable enough for OCR later: `no`
- likely outer-envelope surface: `no`
- future OCR candidate: `pause`

### 4. `아르떼 천연가죽 소파 3인`

- source: `hanssem`
- surface class: `size_diagram_visible`
- surface discovery reason: product info image visibly shows overall size lines and readable dimensions such as overall width, depth, and height
- readable enough for OCR later: `yes`
- likely outer-envelope surface: `yes`, with some extra component dimensions also present and therefore requiring rule-based filtering
- future OCR candidate: `keep`

### 5. `(한샘몰pick) 씨엘로 헴스 W 확장형 식탁 세트 2인 4인 원목 900 1300`

- source: `hanssem`
- surface class: `mixed_marketing_plus_size`
- surface discovery reason: the reviewed image contains a readable “Detail Size” section with table and chair measurements, but the page is for a table set and the image mixes set composition, option content, and component-level dimensions
- readable enough for OCR later: `yes`
- likely outer-envelope surface: `partial`
- future OCR candidate: `keep, but only as a guarded ambiguity case`

### 6. `키친온 렌지대 수납형 높은장`

- source: `hanssem`
- surface class: `package_or_component_ambiguous`
- surface discovery reason: the readable `diningroom_realsize` asset is generic placement/clearance guidance, not product-specific outer-envelope geometry
- readable enough for OCR later: `yes`, but only for generic guidance text
- likely outer-envelope surface: `no`
- future OCR candidate: `pause`

### 7. `아임빅 수납침대 SS 조명헤드형 (매트별도)`

- source: `hanssem`
- surface class: `no_usable_spec_surface`
- surface discovery reason: reviewed detail images remained product/lifestyle imagery only; no visible labeled size surface was found
- readable enough for OCR later: `no`
- likely outer-envelope surface: `no`
- future OCR candidate: `pause`

### 8. `재크 철제 선반 5단 다용도랙 1100`

- source: `hanssem`
- surface class: `no_usable_spec_surface`
- surface discovery reason: reviewed accessible assets were plain product shots or unavailable/empty text assets, with no usable visible measurement surface
- readable enough for OCR later: `no`
- likely outer-envelope surface: `no`
- future OCR candidate: `pause`

## Live Discovery Result

### Candidate count

- plausible future OCR surfaces: `2`
- blocked before OCR: `6`

### Candidate breakdown

- `hanssem`: `2`
- `livart`: `0`

### Blocked breakdown

- `hanssem`: `3`
- `livart`: `3`

### Category reading

Plausible candidates:

- `sofa`: `1`
- `table`: `1`

Blocked rows:

- `bed`: `2`
- `storage`: `3`
- `desk`: `1`

## Representative Examples

### Positive discovery example

`아르떼 천연가죽 소파 3인`

- clear product info image
- readable overall dimensions:
  - overall width
  - overall depth
  - overall height
- still requires filtering because the same image also includes seat and arm measurements

### Guarded candidate example

`(한샘몰pick) 씨엘로 헴스 W 확장형 식탁 세트 2인 4인 원목 900 1300`

- readable “Detail Size” surface
- contains table and chair measurements
- still ambiguous for canonical product geometry because the row is a table set and the image mixes table-only and chair-only dimensions

### Blocked example

`키친온 렌지대 수납형 높은장`

- readable image exists
- but it is generic dining-room clearance guidance, not product-specific geometry
- correct outcome is reject/pause, not OCR follow-up

## Lane Decision

Current honest decision:

- continue only for one seller/pattern

More specifically:

- continue only on the discovered Hanssem candidates
- do not continue on Livart from the current pool
- keep the rest of the pool blocked unless a real size/spec surface is discovered first

Why:

- the full pool does contain some usable image surfaces
- but they are narrow and concentrated in Hanssem
- most of the pool is still blocked before OCR matters
- expanding the lane broadly now would create false optimism and high false-positive risk

## Next Order

1. If the lane continues, run the next OCR/vision spike only on:
   - `아르떼 천연가죽 소파 3인`
   - optionally the guarded Hanssem table-set row after the sofa case proves safe
2. Keep all other pool rows blocked until a visible size/spec surface is proven.
3. Do not reopen deterministic parser work.
4. Do not move to production implementation until a narrow OCR spike proves that readable image surfaces can also be mapped safely to outer-envelope geometry.

## Commands Used

Static reads used for this step:

- `docs/plan.md`
- `docs/tasks/174-image-derived-geometry-candidate-discovery-check.md`
- `docs/ops/image-derived-geometry-experiment-pool-2026-04-12.md`
- `docs/ops/image-derived-geometry-experiment-design-spec-2026-04-12.md`
- `docs/ops/image-derived-geometry-feasibility-spike-2026-04-12.md`
- `docs/ops/parser-geometry-contract-v1-1-2026-04-11.md`

Focused live/inspection commands used:

- live Supabase read deriving the full `8`-row pool and staged image URLs
- `curl -s -o` and `curl -s -L -o` downloads of candidate Hanssem and Livart images into `/tmp`
- direct local image inspection of those downloaded files

Static validation:

- `git diff --check`
