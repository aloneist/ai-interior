# Goal
Define the placement-eligibility contract for catalog products, explicitly separate real-image insertion from geometry-overlay fallback, and set strict exclusion rules for bundle furniture and weak product image assets.

# Scope
This task is limited to:
- defining product eligibility states for recommendation vs geometry overlay vs real-image room insertion
- defining the minimum asset/geometry contract for `overlay-ready` products
- defining the minimum asset/geometry contract for `insertion-ready` products
- explicitly excluding bundle furniture from room insertion by default
- explicitly excluding weak/noisy product image assets from room insertion by default
- documenting geometry-overlay fallback as a valid service direction when real-image insertion is not trustworthy
- updating `docs/plan.md` because this changes the product/placement execution contract

This is not an OCR implementation task.
This is not a parser implementation task.
This is not a room-insertion implementation task.
This is not a schema redesign task.

# Primary Objective
Prevent the project from treating all recommendable products as insertable products, and lock a safer fallback path where trustworthy geometry can still produce useful room-fit guidance even without clean product image assets.

# Allowed Changes
- Read broadly across:
  - `docs/plan.md`
  - current task doc
  - geometry contract docs
  - image-derived lane docs
  - current seller/image-asset findings
  - current runtime/product contract docs
- Add or update focused ops docs
- Update `docs/plan.md`
- Add compact decision tables/checklists in docs only

# Disallowed Changes
- Do not implement OCR/vision extraction
- Do not implement room insertion
- Do not implement geometry overlay rendering
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not redesign the DB schema in this step
- Do not loosen geometry quality rules
- Do not reopen closed deterministic parser work

# Critical Safety Rule
A product being recommendable does not make it placement-ready. Real-image room insertion requires stricter asset conditions than recommendation or geometry-overlay guidance.

# Working Principles
- Read broadly, write narrowly
- Separate product recommendation eligibility from placement eligibility
- Geometry overlay is a legitimate fallback, not a degraded mistake
- Real-image insertion must remain high-trust only
- Bundle furniture is excluded from room insertion by default
- Weak/noisy image assets are excluded from room insertion by default
- Update `docs/plan.md` because the product/placement contract changes here

# Required Behavior / Structure

## 1. Re-read the current placement-relevant truth
Inspect:
- `docs/plan.md`
- current task doc
- geometry contract v1.1 doc
- image-derived experiment pool / spec / spike / candidate-discovery docs
- current product/runtime contract docs

## 2. Define product eligibility classes
At minimum define:
- `recommendable`
- `overlay-ready`
- `insertion-ready`
- `insertion-ineligible`

You may define one bounded bundle-related state if needed, such as:
- `bundle-only`

Keep the model small and operational.

## 3. Define the minimum contract for `overlay-ready`
State the minimum requirements for a product to be eligible for geometry overlay guidance.
Examples may include:
- trustworthy width/depth/height or diameter
- known footprint interpretation
- enough placement meaning to show occupied area safely
- no need for clean cutout imagery

## 4. Define the minimum contract for `insertion-ready`
State stricter requirements for real-image room insertion.
Examples may include:
- clean separable product image asset
- stable visible outer silhouette
- sufficient viewpoint/shape understanding
- trustworthy geometry
- low ambiguity for placement

## 5. Define exclusion rules
Explicitly state default exclusion rules for:
- bundle furniture
- cluttered/noisy/lifestyle-heavy images
- partially occluded products
- low-resolution assets
- single-angle assets that do not support safe insertion interpretation
- images whose product/background boundary is not stable

## 6. Define the bundle-furniture rule
Make the default rule explicit:
- bundle furniture is excluded from room insertion by default
- bundle furniture is excluded from placement-ready inventory by default unless a strict exception rule is met
- recommendation/purchase-link use may remain allowed

## 7. Define geometry-overlay fallback value
Document why geometry overlay is still useful:
- room-fit guidance
- occupied area visualization
- collision/dongseon risk communication
- honest placement guidance without fake realism

## 8. Update `docs/plan.md`
Reflect that:
- recommendable, overlay-ready, and insertion-ready are different states
- geometry overlay is a valid fallback service direction
- bundle furniture and weak image assets are excluded from room insertion by default
- future OCR/vision work is still subordinate to these placement contracts

# Completion Criteria
- Eligibility classes are explicit
- Overlay-ready and insertion-ready contracts are separated
- Bundle exclusion is explicit
- Weak image asset exclusion is explicit
- Geometry overlay fallback is formally recognized
- `docs/plan.md` is updated
- No implementation work is started

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if non-doc changes happen
- `npm run lint` only if non-doc changes happen
- `npm run build` only if non-doc changes happen

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Eligibility model and exclusion rules
3. What changed
4. Focused validation results
5. Contract impact and next order
6. Deferred items and why
7. Validation results
8. Final approval recommendation