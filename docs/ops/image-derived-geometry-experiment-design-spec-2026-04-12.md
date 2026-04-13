# Image-Derived Geometry Experiment Design Spec - 2026-04-12

## Scope

Define the bounded experiment contract for future image-derived geometry work on the already isolated image-heavy/source-absence pool.

This step is intentionally narrow:

- no OCR or vision implementation
- no new parser implementation
- no schema change
- no ranking or UX change

## Purpose

### Why this experiment exists

The current active canonical catalog still has `8` real-seller rows with no trustworthy text-derived geometry on the active deterministic path.

Those rows were already reviewed and isolated because:

- deterministic text parsing no longer has trustworthy upside on the current path
- continuing deterministic parser work would misclassify source-absence or image-heavy pages as parser failure

The experiment exists to test whether some of those rows can recover trustworthy overall outer-envelope geometry from seller-provided product detail images that visibly carry size diagrams or spec tables.

### Business problem solved

The product needs more geometry-complete canonical rows for safe room-fit and placement reasoning.

For this pool, the missing geometry problem is no longer mainly text parsing.
It is whether seller image assets contain trustworthy product-level size evidence that can be safely interpreted without lowering geometry quality.

### First-stage success meaning

First-stage success is not “read many numbers from images.”

First-stage success means:

- correctly identify a small subset of pool images that visibly contain trustworthy overall-size evidence
- recover only safe outer-envelope geometry from those images
- reject ambiguous images correctly
- preserve enough provenance and confidence that future publish decisions remain auditable

## Bounded First-Scope Input Set

### In scope

Only use the current official experiment pool:

- active canonical row
- real seller row, not QA
- `parser_lane_eligibility = ineligible`
- `geometry_source_shape = image_heavy_or_absent`

Only test image inputs such as:

- PDP detail images that visibly contain explicit size diagrams
- PDP detail images that visibly contain seller-rendered size tables
- PDP detail images that visibly label overall `W x D x H` or diameter/height semantics

Only test current sellers/patterns in this pool:

- `hanssem`
- `livart`

### Out of scope

- lifestyle-only images
- ambient room photos with no explicit size diagram
- ambiguous image collages mixing marketing text and partial measurements
- package, shipping, assembly-part, internal-storage, mattress-only, or accessory-only diagrams
- multi-seller generalization outside the current `8`-row pool
- implementation-time automation choices beyond what this contract requires

## Geometry Decision Contract

Image-derived geometry has two separate stages and must not collapse them.

### Stage 1: visual reading

The system may read candidate text, numbers, arrows, labels, and table cells from an image.

This stage only proposes candidates such as:

- `1200 x 600 x 750 mm`
- `W 1400 / D 400 / H 820`
- `지름 900 / 높이 730`

Reading a candidate is not enough to update geometry.

### Stage 2: geometry decision

The system must then decide whether the candidate is trustworthy overall outer-envelope geometry under geometry contract `v1.1`.

Only this stage may approve a geometry candidate for future publish consideration.

### Accept conditions

Accept only when all of the following are true:

- the image is a product-spec or size-diagram image, not a lifestyle or promotional image
- the measured object is clearly the full product, not a component or package
- the image labeling clearly indicates overall dimensions such as:
  - `W / D / H`
  - `가로 / 깊이 / 높이`
  - `폭 / 깊이 / 높이`
  - trustworthy overall `지름` plus overall height for round items
- the unit is explicit or can be seller-safely inferred from the same image context
- the axes can be mapped to canonical outer-envelope fields without ambiguity
- the result does not conflict with stronger existing trustworthy text-derived geometry

### Reject conditions

Reject when any of the following is true:

- the image appears to show packaging or shipping dimensions
- the measurement clearly refers to an internal compartment, shelf bay, drawer, tabletop only, headboard only, mattress only, seat only, arm only, or other sub-component
- the image mixes multiple products/modules without proving the assembled overall footprint
- the image text is too blurry, cropped, partially occluded, or visually inconsistent
- units are absent and cannot be safely inferred
- the same image can plausibly support multiple incompatible geometry interpretations
- the image only proves a single weak number with no trustworthy outer-envelope context

### Fallback conditions

Fallback means:

- keep canonical `width_cm`, `depth_cm`, `height_cm` unchanged
- keep the row in the image-derived experiment lane
- record rejection or insufficiency reasons for later audit

Fallback is the default when acceptance is not clearly justified.

### Partial acceptance

Partial geometry may be accepted only when:

- the image clearly proves one or two outer-envelope axes
- the missing axis cannot be safely proven
- provenance explicitly records which axes were image-derived and which remain unknown

Partial acceptance is allowed for experiment evaluation, but must still obey the same ambiguity rules.

### No-overwrite rule

Trustworthy text-derived geometry must never be overwritten by weaker image-derived results.

Image-derived geometry is only for rows currently lacking trustworthy text-based geometry, or for filling still-null axes where image evidence is stronger and clearly trustworthy.

## Future Provenance And Confidence Requirements

Any future implementation should preserve separate provenance for image-derived outcomes.

Minimum future provenance fields needed:

- image source identifier or stable image reference
- extracted image text snippet or structured candidate values
- axis-level provenance:
  - `width_from_image`
  - `depth_from_image`
  - `height_from_image`
  - `diameter_from_image`
- decision reason:
  - accepted overall diagram
  - rejected package-only
  - rejected component-only
  - rejected ambiguous multi-module
  - rejected unreadable/low-clarity
- confidence level

### Confidence semantics

Use confidence as decision support, not as a replacement for rules.

Recommended compact semantics:

- `high`
  - image clearly shows overall product dimensions with explicit labels and units
- `medium`
  - image is mostly clear and the outer-envelope meaning is strong, but one interpretation step still needs review
- `low`
  - candidate text may be readable, but product-level outer-envelope meaning is weak

Low confidence should never auto-promote geometry into canonical fields.

## Seller And Page-Pattern Prioritization

### First seller

Start with `hanssem`.

Why:

- larger share of the pool: `5 / 8`
- prior Hanssem review already showed image-heavy PDP bodies on the active path
- the seller pool spans several useful page-pattern types:
  - storage
  - bed
  - table
  - sofa

### Second seller

Then `livart`.

Why:

- smaller pool: `3 / 8`
- still useful for validating whether the contract holds beyond one seller
- includes `bed`, `storage`, and `desk` patterns

### First page-pattern types

Test in this order:

1. Seller-rendered size diagram images with explicit axis labels and arrows
2. Seller-rendered product spec tables embedded as images
3. Round/diameter-style diagrams only if overall product context is explicit

Avoid first:

- lifestyle collages
- montage-style gallery images
- images mixing option callouts with no full-product dimension context

### Representative first candidates

Highest-value first candidates from the current pool:

- `재크 철제 선반 5단 다용도랙 1100`
  - `hanssem`
  - `storage`
  - useful for testing storage spec-image vs component-only rejection

- `키친온 렌지대 수납형 높은장`
  - `hanssem`
  - `storage`
  - useful for rejecting internal/storage-only diagram confusion

- `아임빅 수납침대 SS 조명헤드형 (매트별도)`
  - `hanssem`
  - `bed`
  - useful for mattress-only vs full-frame distinction

- `뉴트 저상형 퀸 침대 프레임 도어형`
  - `livart`
  - `bed`
  - useful as cross-seller bed-frame pattern validation

- `리타 ㄱ자 화장대세트(거울미포함)`
  - `livart`
  - `desk`
  - useful for multi-component or sectional/L-shape ambiguity rejection

## Evaluation Rubric

Use this compact rubric for future experiment runs.

### 1. Candidate image type

- did the image contain an explicit spec diagram or size table
- or was it only a lifestyle / marketing image

### 2. OCR / vision extraction quality

- were the numbers, labels, and units read correctly
- were the candidate axes complete enough to evaluate

### 3. Outer-envelope correctness

- did the accepted candidate refer to the full product outer envelope
- or did it accidentally capture component/package/internal dimensions

### 4. Axis correctness

- were `width_cm`, `depth_cm`, `height_cm`, or `diameter_cm` mapped correctly
- were range or unit conversions handled safely

### 5. Rejection correctness

- did the experiment correctly reject ambiguous or unsafe images
- false-positive rejection is acceptable; false-positive acceptance is the key failure

### 6. Confidence usefulness

- did the assigned confidence help explain which candidates were safe to review or defer
- or did it add noise without improving judgment

### 7. False-positive risk

- how likely was the method to accept package/component dimensions as overall geometry
- this is the primary safety risk to minimize

### 8. Downstream placement safety usefulness

- if accepted, is the result safe enough to improve room-fit or bounded placement reasoning
- if not, the candidate should remain rejected or partial only

## Next Execution Order

1. Approve this design/spec before any OCR or vision implementation starts.
2. Run future experiments only on the current `8`-row pool.
3. Start with Hanssem spec-diagram or size-table image patterns.
4. Expand to Livart only after the contract works on Hanssem without unsafe false positives.
5. Revisit deterministic parsing only if a new trustworthy text path appears on a real source page.

## Commands Used

Static reads used for this step:

- `docs/plan.md`
- `docs/tasks/172-image-derived-geometry-experiment-design-spec.md`
- `docs/ops/image-derived-geometry-experiment-pool-2026-04-12.md`
- `docs/ops/parser-geometry-contract-v1-1-2026-04-11.md`
- `docs/ops/canonical-source-shape-classification-2026-04-11.md`
- `docs/ops/hanssem-deterministic-followup-queue-execution-2026-04-11.md`

Static validation:

- `git diff --check`
