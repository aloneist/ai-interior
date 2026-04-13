# Goal
Define the bounded experiment design/spec for image-derived geometry extraction from the officially separated image-heavy/source-absence pool, so future OCR/vision work is judged by explicit safety and usefulness rules instead of ad hoc guesses.

# Scope
This task is limited to:
- reading the current living plan and the newly formalized image-derived geometry experiment pool
- defining the experiment purpose, scope, success criteria, and rejection criteria
- defining the evaluation contract for image-derived geometry extraction
- defining the seller/page-pattern prioritization inside the current 8-row pool
- documenting how image-derived geometry must interact with existing trustworthy text-derived geometry
- updating `docs/plan.md` because this creates the next active execution lane contract

This is not an OCR implementation task.
This is not a parser implementation task.
This is not a UX task.
This is not a schema redesign task.

# Primary Objective
Prevent future image-derived geometry work from becoming unsafe or vague by locking a small, explicit experiment contract before any OCR/vision implementation starts.

# Allowed Changes
- Read broadly across:
  - `docs/plan.md`
  - current task doc
  - image-derived geometry experiment pool doc
  - geometry contract v1.1 doc
  - source-shape classification doc
  - queue split / deterministic closure docs
  - any minimal seller evidence needed for prioritization
- Add or update focused ops docs
- Update `docs/plan.md`
- Add tiny evaluation tables/checklists in docs only

# Disallowed Changes
- Do not implement OCR, vision, or extraction code yet
- Do not reopen deterministic parser hardening
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not redesign the DB schema
- Do not loosen geometry quality rules
- Do not overwrite current trustworthy text-derived geometry
- Do not turn this into a broad research dump

# Critical Safety Rule
Image-derived geometry is experimental until proven trustworthy. It must never overwrite already trustworthy text-derived geometry, and it must be rejected whenever outer-envelope meaning cannot be distinguished from component, package, accessory, or marketing image content.

# Working Principles
- Read broadly, write narrowly
- Keep the experiment small and seller-aware
- Separate “can read numbers from image” from “can derive trustworthy outer-envelope geometry”
- Explicitly define rejection criteria
- Confidence and provenance must be first-class
- Update `docs/plan.md` because the active next lane becomes image-derived experiment design

# Required Behavior / Structure

## 1. Re-read the current lane truth
Inspect:
- `docs/plan.md`
- current task doc
- image-derived geometry experiment pool doc
- geometry contract v1.1 doc
- source-shape classification doc
- deterministic lane closure doc

## 2. Define the experiment purpose
State clearly:
- why the experiment exists
- what business problem it solves
- why deterministic text parsing is no longer the right lane for these rows
- what “success” means at MVP experiment level

## 3. Define the bounded experiment input scope
Specify what source images are in scope, for example:
- PDP detail images that visibly contain size/spec tables or labeled size diagrams
- static product-spec images on current pool rows
- image-heavy pages from current Hanssem/Livart pool only

Also specify what is out of scope for the first experiment:
- lifestyle images without explicit measurements
- ambiguous collage images
- images where product vs package dimensions are not distinguishable
- full multi-seller generalization

## 4. Define the geometry decision contract
Separate these layers explicitly:
- OCR/vision can read candidate numbers/text
- experiment must determine whether the candidate refers to overall outer-envelope geometry
- component/package/accessory/installation dimensions must be rejected
- partial geometry may be accepted only with explicit provenance
- confidence must be recorded
- no overwrite of trustworthy text-derived geometry

At minimum define:
- accept conditions
- reject conditions
- fallback conditions
- provenance fields needed in a future implementation
- confidence semantics

## 5. Define seller/page-pattern prioritization
Using the current 8-row pool, define the recommended first experiment order.
Be explicit about:
- first seller
- why
- page-pattern types
- representative candidate rows
- which rows are likely highest-value first

## 6. Define the evaluation rubric
Create a compact evaluation rubric for future experiment runs, including at minimum:
- candidate image type
- OCR/vision extraction quality
- outer-envelope correctness
- width/depth/height or diameter correctness
- rejection correctness
- confidence usefulness
- false-positive risk
- whether the result is usable for downstream placement safety

## 7. Update `docs/plan.md`
Reflect that:
- deterministic parser lane is closed
- image-derived geometry is now the active next design/spec lane
- implementation is still deferred until the experiment contract is approved

# Completion Criteria
- The experiment purpose is explicit
- The first-scope input set is bounded
- Accept/reject rules are explicit
- Future provenance/confidence requirements are explicit
- Seller/page-pattern prioritization is explicit
- `docs/plan.md` is updated
- No OCR/vision code is implemented

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if non-doc changes happen
- `npm run lint` only if non-doc changes happen
- `npm run build` only if non-doc changes happen

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Experiment purpose and scope
3. What changed
4. Focused validation results
5. Prioritization and evaluation contract
6. Deferred items and why
7. Validation results
8. Final approval recommendation