# Image-Derived Geometry Feasibility Spike - 2026-04-12

## Scope

Run a very small Hanssem-first feasibility spike for the image-derived geometry lane without wiring any OCR or vision logic into production code.

This step stayed narrow:

- no production OCR implementation
- no parser implementation
- no schema change
- no ranking or UX change

## Sample Selected

The first spike used `3` Hanssem rows from the official image-derived geometry experiment pool.

Selected rows:

- `키친온 렌지대 수납형 높은장`
  - canonical product: `caf36679-d413-4eb4-aed3-892da68d968d`
  - category: `storage`
  - selected because storage pages are one of the highest-value missing geometry segments and the row exposed a small detail-image set that might have included spec content

- `아임빅 수납침대 SS 조명헤드형 (매트별도)`
  - canonical product: `9f62ff89-985d-4e74-994f-d72439544fe3`
  - category: `bed`
  - selected because bed pages are high-risk for mattress-only vs frame-level ambiguity and therefore a strong feasibility test

- `(한샘몰pick) 씨엘로 헴스 W 확장형 식탁 세트 2인 4인 원목 900 1300`
  - canonical product: `acbc8515-869e-43a1-bf6c-e8eb501db4ba`
  - category: `table`
  - selected because the table-set pattern is a likely source of mixed marketing imagery and multi-object ambiguity

Why these three:

- Hanssem first, per the approved lane order
- `3` rows maximum
- category spread across `storage`, `bed`, and `table`
- each row exposed multiple candidate detail images, making them a fair first feasibility sample

## Actual Image Evidence Reviewed

Downloaded and inspected local copies of these Hanssem detail images:

- `613223_B1`
- `795503_B1`
- `795503_B2`
- `670885_B1`
- `670885_B2`
- `670885_B3`
- `670885_B4`

Additional confirmation images checked:

- `425879_A1`
- one shared Hanssem display-area asset referenced from the same pool

## Image Pattern Classification

### `키친온 렌지대 수납형 높은장`

- candidate image reviewed: `613223_B1`
- pattern found: clean product image
- not found:
  - explicit size diagram
  - table-like spec image
  - visible measurement text
- classification: low-value product shot, not a spec image

### `아임빅 수납침대 SS 조명헤드형 (매트별도)`

- candidate images reviewed: `795503_B1`, `795503_B2`
- pattern found: clean product images
- not found:
  - explicit size diagram
  - table-like spec image
  - visible measurement text
- classification: lifestyle/product imagery only; no readable size evidence

### `(한샘몰pick) 씨엘로 헴스 W 확장형 식탁 세트 2인 4인 원목 900 1300`

- candidate images reviewed: `670885_B1` through `670885_B4`
- pattern found:
  - lifestyle room scene
  - close-up product crop
  - no visible labeled measurement content
- not found:
  - explicit size diagram
  - table-like spec image
  - visible measurement text
- classification: mixed marketing/product imagery, but still no size/spec surface

## Bounded Extraction Test

This spike used direct visual inspection of the downloaded detail images as isolated local experiment work.

### Readability result

Across the sampled Hanssem images:

- candidate size/spec text readable from image: `none`
- candidate labels such as `W / D / H`, `가로 / 깊이 / 높이`, `폭 / 깊이 / 높이`: `none`
- candidate diameter/height labels: `none`

Practical reading:

- OCR or vision cannot help if the sampled images do not visibly contain size/spec text in the first place
- the first failure on this sample is image-surface availability, not text-reading quality

### Outer-envelope classification result

Because no trustworthy candidate size/spec text was available:

- outer-envelope classification success: `0 / 3`
- accepted width/depth/height candidates: `none`
- accepted diameter candidates: `none`

Geometry decision reading:

- no sampled row reached the “candidate text readable and overall product geometry classifiable” threshold
- all `3` rows stayed at reject or inconclusive before any geometry mapping step

## Row-Level Feasibility Judgment

### `키친온 렌지대 수납형 높은장`

- readable text success: `no`
- outer-envelope classification success: `no`
- result: `reject`
- reason: no spec-image surface found
- false-positive risk if forced: high, because any future image-only guess would likely come from product silhouette or storage-component interpretation rather than explicit overall geometry

### `아임빅 수납침대 SS 조명헤드형 (매트별도)`

- readable text success: `no`
- outer-envelope classification success: `no`
- result: `reject`
- reason: no spec-image surface found
- false-positive risk if forced: very high, because bed imagery is especially vulnerable to frame-vs-mattress ambiguity

### `(한샘몰pick) 씨엘로 헴스 W 확장형 식탁 세트 2인 4인 원목 900 1300`

- readable text success: `no`
- outer-envelope classification success: `no`
- result: `reject`
- reason: no spec-image surface found
- false-positive risk if forced: very high, because table-set imagery mixes chairs, extension states, and scene composition without explicit overall size labeling

## Feasibility Conclusion

Current honest conclusion:

- blocked by seller pattern issues on this Hanssem-first sample

Why:

- the sampled Hanssem pool rows did not expose usable size-diagram or spec-table imagery
- this means the first bottleneck is not OCR quality
- it is whether the seller page pattern actually includes extractable geometry-bearing images at all

Operational reading:

- the lane is not ready for production implementation from this sample
- continuing may still be justified only if the next spike stays narrow and focuses on rows that can first prove real spec-image presence
- without that precondition, the image-derived lane will mostly produce empty reads or unsafe guesses

## Rejection Correctness And False-Positive Risk

High rejection in this spike is the correct outcome.

Why rejection was correct:

- no explicit size text was visible
- no diagram arrows or labeled axes were present
- no table-like spec image surface was present

Primary false-positive risks if the lane were forced prematurely:

- mistaking product silhouette for measured geometry
- accepting mattress-only or component-only visual cues as full bed-frame geometry
- accepting table-set scene composition as table outer-envelope geometry
- inferring dimensions from marketing image composition rather than seller-provided measurement evidence

## Next Order

1. Do not start production OCR or vision implementation from this sample.
2. If the lane continues, keep it narrow and add a preconditioned candidate-discovery step:
   a row should only enter the next spike if its PDP actually exposes a visible size-diagram or spec-table image.
3. Keep deterministic parser follow-up closed.
4. If a second spike happens, use it to test spec-image presence first, not OCR quality first.

## Commands Used

Static reads used for this step:

- `docs/plan.md`
- `docs/tasks/173-image-derived-geometry-feasibility-spike.md`
- `docs/ops/image-derived-geometry-experiment-pool-2026-04-12.md`
- `docs/ops/image-derived-geometry-experiment-design-spec-2026-04-12.md`
- `docs/ops/parser-geometry-contract-v1-1-2026-04-11.md`

Focused live/experiment commands used:

- live Supabase read to derive Hanssem pool image URLs
- `curl -s -o` downloads of selected Hanssem detail images into `/tmp`
- direct local image inspection of the downloaded files

Static validation:

- `git diff --check`
