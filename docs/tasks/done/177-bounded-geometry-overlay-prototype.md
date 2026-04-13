# Goal
Build a bounded geometry overlay prototype on top of the vetted IKEA clean-control set, so we can validate honest room-fit guidance before attempting any real-image insertion work.

# Scope
This task is limited to:
- using a very small IKEA control set already judged overlay-ready
- defining and implementing a minimal geometry overlay prototype
- showing occupied area / footprint guidance on a room image
- keeping the prototype explicitly non-photoreal and non-production
- documenting the assumptions, limits, and next decision
- updating `docs/plan.md` because the active lane changes from control-baseline evaluation to overlay prototype work

This is not a real-image insertion task.
This is not an OCR implementation task.
This is not a parser task.
This is not a schema redesign task.
This is not a production UX polish task.

# Primary Objective
Validate whether simple, honest geometry overlays can provide useful placement guidance with trusted geometry and one clean product image, without pretending to be real product insertion.

# Allowed Changes
- Read broadly across:
  - `docs/plan.md`
  - current task doc
  - placement eligibility / geometry overlay contract
  - geometry contract v1.1
  - IKEA control-baseline doc
  - the directly relevant implementation files for a small prototype path
- Implement a small isolated overlay prototype
- Add one focused ops artifact documenting the prototype result
- Update `docs/plan.md`
- Add tiny utility/helper code only if directly needed by the prototype

# Disallowed Changes
- Do not implement photoreal room insertion
- Do not implement OCR/vision extraction
- Do not reopen noisy seller image-derived work
- Do not redesign ranking/scoring
- Do not redesign the DB schema
- Do not broaden into full production UI polish
- Do not fake perspective-correct realism
- Do not treat this prototype as insertion-ready output

# Critical Safety Rule
The prototype must present geometry guidance honestly. It should render footprint / occupied-area / outline information, not a fake realistic placed product. Geometry overlay is valid only when it clearly communicates “space usage guidance” rather than pretending to be the final inserted furniture.

# Working Principles
- Read broadly, write narrowly
- Control set first, noisy data later
- Overlay-ready and insertion-ready remain separate
- Start with a tiny sample only
- Prefer honest rectangle/footprint overlays over false realism
- Keep assumptions explicit
- Update `docs/plan.md` because the active lane changes here

# Required Behavior / Structure

## 1. Re-read the current placement truth
Inspect:
- `docs/plan.md`
- current task doc
- placement eligibility / geometry overlay contract
- geometry contract v1.1
- IKEA placement control baseline doc
- only the direct implementation path needed for a prototype

## 2. Select the prototype sample
Use only the already-vetted IKEA clean-control rows.
Preferred:
- 2–3 rows maximum
- categories with clear footprint meaning (for example sofa, table, chair)
- trusted geometry already confirmed
- no bundle products

Report exactly which rows are used.

## 3. Define the overlay prototype contract
The prototype should explicitly show:
- anchor point or placement origin assumption
- occupied width/depth area
- simple footprint/outline shape
- category-appropriate labeling
- optional dimension labels

The prototype should explicitly not claim:
- realistic insertion
- true perspective matching
- exact final placement correctness
- full collision-proof automation

## 4. Implement the bounded prototype
Create the smallest workable prototype path.
Possible acceptable forms:
- room image with drawn footprint rectangle / outline
- category-aware outline overlay
- dimension annotation overlay
- simple occupied-area visualization

Keep it isolated and minimal.
Do not build a large UI surface.

## 5. Document prototype assumptions and limits
At minimum state:
- how scale is assumed or approximated
- how anchor placement is chosen
- what the overlay means
- what the overlay does not mean
- why this is still useful to users

## 6. Evaluate usefulness honestly
Judge whether the prototype is useful enough to continue.
At minimum discuss:
- clarity of occupied-area guidance
- whether users can understand room-fit better
- whether the output is more honest than fake insertion
- what is missing before broader rollout

## 7. Update `docs/plan.md`
Reflect that:
- the active next lane is now the bounded geometry overlay prototype
- this is still not real-image insertion
- further expansion depends on prototype usefulness, not visual impressiveness

# Completion Criteria
- A small IKEA control sample is actually used
- A bounded overlay prototype exists
- Overlay assumptions and limits are explicit
- Overlay-ready and insertion-ready remain clearly separated
- `docs/plan.md` is updated
- No photoreal insertion or OCR work is started

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed
- any focused prototype run command actually used

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Exact IKEA prototype rows used
3. What changed
4. Prototype result and limits
5. Lane decision and next order
6. Deferred items and why
7. Validation results
8. Final approval recommendation