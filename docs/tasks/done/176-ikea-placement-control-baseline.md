# Goal
Establish a small IKEA control baseline for placement eligibility using manually vetted catalog rows, so we can test the product-placement contract on clean assets before spending more effort on noisy image-derived geometry cases.

# Scope
This task is limited to:
- selecting a very small IKEA control sample from already vetted rows
- verifying that the selected rows satisfy the current placement contract
- judging `overlay-ready` vs `insertion-ready` separately
- documenting what a single clean white-background product image is sufficient for, and what it is not sufficient for
- defining the practical next step after the control baseline
- updating `docs/plan.md` because the active next lane changes here

This is not an OCR implementation task.
This is not a parser implementation task.
This is not a room-insertion production implementation task.
This is not a schema redesign task.

# Primary Objective
Use high-trust IKEA rows as a control set to separate placement/rendering feasibility from noisy seller extraction problems.

# Allowed Changes
- Read broadly across:
  - `docs/plan.md`
  - current task doc
  - placement eligibility / geometry overlay contract
  - geometry contract v1.1
  - relevant IKEA parser/geometry docs only if needed
  - currently vetted IKEA canonical rows and their assets
- Add one focused ops artifact documenting the control-baseline result
- Update `docs/plan.md`
- Add tiny evaluation checklists in docs only

# Disallowed Changes
- Do not implement OCR/vision extraction
- Do not reopen noisy seller OCR work in this step
- Do not implement production overlay rendering
- Do not implement production room insertion
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not redesign the DB schema

# Critical Safety Rule
A clean product image plus trusted geometry is enough to judge `overlay-ready`, but not enough to assume general `insertion-ready`. Do not overclaim what one white-background image can support.

# Working Principles
- Read broadly, write narrowly
- Control baseline before noisy expansion
- Overlay-ready and insertion-ready are different
- One clean image may be sufficient for safe footprint/outline guidance, but not for full placement realism
- Use manually vetted IKEA rows only
- Update `docs/plan.md` because the active lane changes here

# Required Behavior / Structure

## 1. Re-read the current placement truth
Inspect:
- `docs/plan.md`
- current task doc
- placement eligibility / geometry overlay contract
- geometry contract v1.1
- any minimal IKEA evidence needed for the selected rows

## 2. Select the IKEA control sample
Choose a very small sample from already vetted IKEA rows.
Preferred:
- 3–5 rows maximum
- categories that help judge placement behavior (for example sofa / table / chair / storage)
- rows with trusted geometry already confirmed
- clean white-background product images only

Report exactly which rows were selected and why.

## 3. Evaluate `overlay-ready`
For each selected row, judge whether it is truly `overlay-ready`.
At minimum evaluate:
- trusted width/depth/height or diameter
- footprint shape meaning
- silhouette clarity from the available product image
- whether safe room-fit / occupied-area guidance is possible

## 4. Evaluate `insertion-ready`
For the same rows, judge whether a single clean white-background image is enough for any meaningful `insertion-ready` claim.
Be explicit about the limits:
- what is possible
- what is not possible
- whether the row is only `overlay-ready`
- whether a narrow preview-only insertion state is justified or not

Do not blur overlay with insertion.

## 5. Define the control-baseline conclusion
State clearly:
- whether IKEA clean assets validate the overlay-ready direction
- whether general insertion-ready is still blocked by viewpoint/shape limitations
- whether the next implementation step should be:
  - geometry overlay prototype
  - narrow preview-only insertion experiment
  - or further asset-contract refinement

## 6. Update `docs/plan.md`
Reflect that:
- the active next lane is now the IKEA placement control baseline
- noisy seller OCR work is not the current next implementation step
- the immediate next decision depends on overlay-ready validation on clean assets

# Completion Criteria
- A small IKEA control sample was actually reviewed
- `overlay-ready` and `insertion-ready` were judged separately
- The one-image limitation was addressed honestly
- A practical next step was chosen
- `docs/plan.md` was updated
- No production implementation was started

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if non-doc changes happen
- `npm run lint` only if non-doc changes happen
- `npm run build` only if non-doc changes happen

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Exact IKEA control rows reviewed
3. What changed
4. Control-baseline results
5. Lane decision and next order
6. Deferred items and why
7. Validation results
8. Final approval recommendation