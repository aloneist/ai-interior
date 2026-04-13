# IKEA Placement Control Baseline - 2026-04-12

## Scope

Establish a very small IKEA control baseline for placement eligibility using already manually vetted IKEA rows.

This step is intentionally narrow:

- no OCR or vision implementation
- no parser implementation
- no production geometry-overlay rendering
- no production room insertion
- no UX redesign
- no schema redesign

## Why This Control Exists

The current placement contract is already clear:

- `recommendable`, `overlay-ready`, and `insertion-ready` are different states
- geometry overlay is a valid fallback direction
- insertion requires stricter asset and interpretation quality than overlay

The remaining question is practical, not conceptual:

- what can the product safely do when geometry is already trustworthy and the product image is already a clean white-background single-product asset?

IKEA is the correct control source because it is the strongest deterministic geometry baseline and the current repo's cleanest operational reference source.

## Evidence Basis Used

This control sample only uses IKEA rows that were already manually vetted in prior repo work for:

- identity/name
- category
- price
- trustworthy geometry

Geometry evidence comes from the existing focused IKEA validation set:

- `LANDSKRONA` 3-seat sofa `s99415821`
- `LANDSKRONA` 3-seat sofa `s19270327`
- `MITTZON` conference table `s29533451`

Per current approved user context for this task, these rows also have:

- clean white-background product images
- single-product asset presentation

## Exact Control Rows Reviewed

Use the smallest evidence-backed sample already available in current docs.

| Row | Category | Why selected |
| --- | --- | --- |
| `LANDSKRONA` 3-seat sofa `s99415821` | `sofa` | high-confidence sofa baseline with trusted full `3d` geometry and simple single-object silhouette |
| `LANDSKRONA` 3-seat sofa `s19270327` | `sofa` | same product family in another vetted variant; useful for checking whether clean-asset judgment is stable across finish/color variation |
| `MITTZON` conference table `s29533451` | `table` | non-sofa rectangular footprint case; useful for checking placement meaning outside upholstered seating |

Why this sample stays narrow:

- these rows are explicitly evidenced in existing geometry validation docs
- all three already have trusted `width_cm`, `depth_cm`, and `height_cm`
- all three fit the clean-asset control condition for this task
- adding a chair or storage row without equally direct prior vetting would weaken the control

## Geometry Evidence For The Control Rows

Previously validated staged and canonical outcomes:

- `LANDSKRONA` `s99415821`
  - `W 204 / D 89 / H 78`
- `LANDSKRONA` `s19270327`
  - `W 204 / D 89 / H 78`
- `MITTZON` `s29533451`
  - `W 140 / D 108 / H 105`

Operational reading:

- all selected rows satisfy the geometry contract `v1.1` outer-envelope rule
- all selected rows are full `3d` geometry cases, not partial or image-derived guesses
- all selected rows have simple trustworthy footprint meaning for placement evaluation

## `overlay-ready` Evaluation

### 1. `LANDSKRONA` `s99415821`

- geometry trust: pass
- footprint interpretation: pass
  - rectangular sofa envelope with clear width/depth meaning
- silhouette clarity from the clean asset: pass
  - one dominant object with stable visible outline
- safe room-fit / occupied-area guidance: pass

Decision:

- `overlay-ready = yes`

Why:

- trusted outer-envelope geometry already exists
- the footprint meaning is stable
- the clean single-product asset is more than sufficient for honest occupied-area guidance
- no fake realism is required to communicate sofa footprint or placement span

### 2. `LANDSKRONA` `s19270327`

- geometry trust: pass
- footprint interpretation: pass
  - same overall sofa envelope semantics as the paired variant
- silhouette clarity from the clean asset: pass
- safe room-fit / occupied-area guidance: pass

Decision:

- `overlay-ready = yes`

Why:

- this variant confirms the overlay-ready decision is not dependent on one colorway or one hero image
- the placement meaning still comes primarily from trusted geometry, not from image detail tricks

### 3. `MITTZON` `s29533451`

- geometry trust: pass
- footprint interpretation: pass
  - rectangular conference-table envelope with clear plan-view occupied area
- silhouette clarity from the clean asset: pass
- safe room-fit / occupied-area guidance: pass

Decision:

- `overlay-ready = yes`

Why:

- table footprint and occupied span can be communicated honestly from the trusted outer envelope
- the clean product image helps operator confidence, but geometry is the real contract anchor

## `insertion-ready` Evaluation

The critical question is whether one clean white-background product image is enough to claim meaningful `insertion-ready`.

Current answer:

- enough for a narrow visual preview experiment: maybe
- enough for a general `insertion-ready` product contract: no

### What One Clean Image Is Sufficient For

A single clean white-background product image can support:

- stable product/background separation
- a simple visible outer silhouette
- basic object-isolation confidence
- a low-noise preview of one known front or angled product face

This is useful because it removes many of the noisy-seller problems that block insertion work elsewhere.

### What One Clean Image Is Not Sufficient For

A single clean image is still not enough to prove:

- viewpoint robustness across room camera angles
- hidden-side or back-side shape behavior
- depth realism under varied perspective
- occlusion behavior in real room scenes
- stable placement realism for products whose visible shape changes materially by angle

It also does not prove:

- that the room insertion will remain honest under scaling and perspective changes
- that one extracted silhouette can safely represent the product in arbitrary room compositions

## Row-Level Insertion Judgment

### `LANDSKRONA` `s99415821`

- clean isolation potential: yes
- general insertion-ready: no
- practical reading:
  - suitable as a narrow preview-only insertion candidate
  - not sufficient for broad insertion-ready classification

Why:

- sofa shape is fairly stable, but one image still under-specifies alternate viewpoints and room-perspective alignment

### `LANDSKRONA` `s19270327`

- clean isolation potential: yes
- general insertion-ready: no
- practical reading:
  - same narrow preview-only candidate logic as the paired variant
  - no basis yet for a stronger production insertion claim

Why:

- the second vetted variant supports repeatability of the preview judgment, not general insertion readiness

### `MITTZON` `s29533451`

- clean isolation potential: yes
- general insertion-ready: no
- practical reading:
  - rectangular table form is simpler than many products, but one image still does not establish reliable perspective behavior for real room insertion

Why:

- tables are especially sensitive to viewing angle, leg visibility, and top-plane perspective mismatch

## Control-Baseline Conclusion

### 1. Does IKEA validate the `overlay-ready` direction?

Yes.

This control baseline strongly validates the `overlay-ready` direction because:

- trusted outer-envelope geometry already exists
- footprint meaning is clear
- clean assets remove avoidable ambiguity
- honest room-fit and occupied-area guidance is clearly possible without pretending photorealism

### 2. Does IKEA validate general `insertion-ready`?

No.

Even with clean white-background single-product assets, general `insertion-ready` remains blocked by:

- viewpoint limitations
- shape understanding limits from one image
- perspective mismatch risk
- lack of proof that the same asset can support honest room-scene insertion beyond a narrow preview context

### 3. Is a narrow preview-only insertion state justified?

Only as an experiment surface, not as the main contract outcome.

Practical judgment:

- a narrow preview-only insertion experiment may be justified later on a tiny IKEA subset
- but it should not replace the current `insertion-ready` standard
- and it should not become the next main implementation lane before overlay value is proven first

## Next Step Decision

The practical next step after this control baseline should be:

- `geometry overlay prototype`

Why this is the best next step:

- the control baseline already validates the overlay-ready service direction on clean, trusted rows
- it tests real user value around fit, occupied area, and placement guidance without overclaiming realism
- it avoids prematurely collapsing a narrow preview-only insertion experiment into a product contract
- it keeps noisy seller OCR work out of the immediate critical path

Not the next step:

- broad OCR/image-derived expansion
- general insertion-ready implementation
- schema or UX redesign

## Operational Decision Locked

After this control baseline:

- IKEA clean assets validate `overlay-ready` as a real product direction
- one clean white-background product image does not justify broad `insertion-ready`
- the immediate next decision should be driven by overlay prototype value on trusted rows, not by noisy OCR expansion
