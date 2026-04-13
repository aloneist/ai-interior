# Goal
Realign the product promise, user UX flow, and data contracts around fit-confidence guidance instead of room-photo furniture insertion, so future development uses the right product definition and the right data requirements.

# Scope
This task is limited to:
- redefining the current product promise in `docs/plan.md`
- locking the primary UX flow around recommendation + fit confidence + geometry overlay
- defining the product/data contract split between `recommendable`, `overlay-ready`, and `insertion-ready`
- defining the room-side input contract needed for fit-confidence guidance
- clarifying how `furniture_products` and `import_jobs` should carry placement-related metadata
- documenting bundle and weak-asset treatment under the new product definition

This is not a parser task.
This is not an OCR task.
This is not a room-insertion implementation task.
This is not a broad schema migration task.

# Primary Objective
Replace the unstable “room-photo insertion” product assumption with a stable “recommendation + fit-confidence + geometry overlay” product contract.

# Allowed Changes
- Read broadly across:
  - `docs/plan.md`
  - current placement/overlay docs
  - geometry contract docs
  - recommendation/runtime contract docs
  - current seller/asset findings
- Update `docs/plan.md`
- Add one focused ops/product contract doc
- Add compact contract tables/checklists in docs only

# Disallowed Changes
- Do not implement OCR/vision extraction
- Do not implement real-image insertion
- Do not implement overlay rendering changes in this step
- Do not redesign ranking/scoring
- Do not redesign the DB schema broadly
- Do not reopen closed deterministic parser work

# Critical Safety Rule
The product promise must not claim more than the current system can honestly support. Recommendation and fit-confidence guidance may be first-class even when real-image insertion is deferred.

# Working Principles
- Product promise first
- UX flow second
- Data contract third
- Schema changes only after the contract is approved
- Overlay and insertion must remain separate
- Bundle and weak-asset rules must remain explicit

# Required Behavior / Structure

## 1. Re-read the current truth
Inspect:
- `docs/plan.md`
- current task doc
- placement eligibility / geometry overlay contract
- current overlay validation docs
- current recommendation/data contract docs

## 2. Redefine the current product promise
Make explicit that the current product promise is:
- recommendable furniture selection
- fit-confidence guidance
- geometry overlay visualization
- save / compare / purchase flow

Make explicit that real-image insertion remains a deferred long-term direction.

## 3. Lock the primary UX flow
Define the current target UX as:
- room photo upload
- room-context input
- recommendation result
- fit judgement
- geometry overlay
- save / compare / purchase

## 4. Define the product eligibility/data contract
At minimum define:
- `recommendable`
- `overlay-ready`
- `insertion-ready`
- `insertion-ineligible`
- optional `bundle-only`

Clarify how these states relate to:
- `furniture_products`
- `import_jobs`
- placement metadata
- geometry confidence
- asset quality

## 5. Define the room-side input contract
State what user-confirmed room inputs are needed for fit-confidence guidance, such as:
- known wall length
- reference line
- keep-out zone
- preferred placement wall
- usable width/depth

Do not turn this into a full schema task yet.

## 6. Clarify bundle and weak-asset handling
Lock the rule that:
- bundle furniture is recommendable but placement-excluded by default
- weak/noisy image assets may still be recommendable but not insertion-ready
- geometry overlay may still be allowed when geometry is trustworthy

## 7. Update `docs/plan.md`
Reflect the new current product truth and next development order.

# Completion Criteria
- The current product promise is explicitly redefined
- The UX flow is explicitly redefined
- The data contract is explicit
- Room-side input requirements are explicit
- `docs/plan.md` is updated
- No implementation work is started

# Validation
Run and report:
- `git diff --check`

If non-doc files change:
- `npm run typecheck`
- `npm run lint`
- `npm run build`

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Changed files
3. One-line reason per file
4. Commands run
5. Pass/fail
6. Deferred issues if any