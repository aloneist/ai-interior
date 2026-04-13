# Goal
Run a bounded candidate-discovery check across the current image-derived geometry experiment pool, so we can determine whether any rows actually expose usable size/spec-image surfaces before attempting further OCR/vision work.

# Scope
This task is limited to:
- re-reading the current living plan and the approved image-derived geometry lane docs
- re-checking the current 8-row image-derived geometry experiment pool
- identifying whether each row actually exposes a usable image surface for future geometry extraction
- classifying rows by image-surface usefulness, not by OCR success yet
- documenting the candidate-discovery result and the next lane decision
- updating `docs/plan.md` because the active lane changes from feasibility spike to candidate-discovery check

This is not an OCR implementation task.
This is not a parser implementation task.
This is not a UX task.
This is not a schema redesign task.
This is not a broad multi-seller rollout task.

# Primary Objective
Answer one practical question:
Does the current 8-row pool contain any real size/spec-image surfaces worth continuing with, or is the lane currently blocked before OCR/vision even matters?

# Allowed Changes
- Read broadly across:
  - `docs/plan.md`
  - current task doc
  - image-derived geometry experiment pool doc
  - image-derived geometry design/spec doc
  - image-derived geometry feasibility spike doc
  - geometry contract v1.1 doc
  - current canonical/staged evidence for the 8 pool rows
- Add one focused ops artifact documenting the candidate-discovery check
- Update `docs/plan.md`
- Use temporary local inspection steps only if needed
- Add a tiny bounded helper script only if clearly necessary and isolated from production runtime

# Disallowed Changes
- Do not implement OCR/vision extraction yet
- Do not reopen deterministic parser hardening
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not redesign the DB schema
- Do not loosen geometry quality rules
- Do not overwrite any existing trustworthy text-derived geometry
- Do not generalize beyond the current 8-row pool in this step

# Critical Safety Rule
A row is a valid future OCR/vision candidate only if it visibly exposes a plausible size/spec-image surface. Rows with only lifestyle imagery, unreadable mixed marketing imagery, or unresolvable package/component ambiguity must not be promoted into OCR follow-up just to keep the lane alive.

# Working Principles
- Read broadly, write narrowly
- Candidate-discovery comes before OCR
- Image-surface usefulness and geometry validity are not the same thing
- High rejection is acceptable; false optimism is not
- Hanssem and Livart should both be judged from actual row evidence
- Update `docs/plan.md` because the active lane changes here

# Required Behavior / Structure

## 1. Re-read the current lane truth
Inspect:
- `docs/plan.md`
- current task doc
- image-derived geometry experiment pool doc
- image-derived geometry design/spec doc
- image-derived geometry feasibility spike doc
- geometry contract v1.1 doc

## 2. Re-check the full 8-row pool
Use the current officially separated pool:
- real seller rows only
- current `8` rows only
- no QA fixture rows

Report exactly which rows are included.

## 3. Define the image-surface classification model
Use a small bounded model such as:
- `size_diagram_visible`
- `spec_table_image_visible`
- `mixed_marketing_plus_size`
- `package_or_component_ambiguous`
- `no_usable_spec_surface`

You may add one small supporting field like:
- `surface_discovery_reason`

Do not create a sprawling taxonomy.

## 4. Inspect the actual image surfaces
For each pool row, inspect the real available images and classify the row by visible surface type.
At minimum record:
- whether a size/spec image exists at all
- whether text appears readable enough to justify future OCR
- whether the visible image is likely product outer-envelope vs package/component/accessory
- whether the row should remain a future OCR candidate or be paused

## 5. Produce the live candidate-discovery result
Report:
- how many rows have plausible future OCR surfaces
- how many rows are blocked before OCR
- seller breakdown
- category breakdown if useful
- representative examples

## 6. State the next lane decision
End with one honest decision:
- continue with a narrower OCR/vision spike on only the discovered candidates
- continue only for one seller/pattern
- pause the lane because the current pool lacks usable image surfaces
- keep the pool but mark it as blocked pending better source patterns

## 7. Update `docs/plan.md`
Reflect that:
- the active lane is now candidate-discovery check
- OCR/vision implementation is still deferred
- the next action depends on whether usable image surfaces actually exist in the current pool

# Completion Criteria
- The full current 8-row pool was re-checked
- Each row was classified by actual visible image surface usefulness
- A live candidate count was produced
- The next lane decision is explicit
- `docs/plan.md` was updated
- No OCR/vision production work was started

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if non-doc code changed
- `npm run lint` only if non-doc code changed
- `npm run build` only if non-doc code changed
- any focused inspection/report commands actually used

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Exact pool rows reviewed
3. What changed
4. Candidate-discovery results
5. Lane decision and next order
6. Deferred items and why
7. Validation results
8. Final approval recommendation