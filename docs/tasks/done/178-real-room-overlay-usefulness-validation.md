# Goal
Validate the bounded geometry overlay prototype against real room-image contexts, so we can judge whether the current overlay is genuinely useful for room-fit guidance before expanding the placement lane further.

# Scope
This task is limited to:
- using the existing bounded overlay prototype
- testing it against a very small set of real room-image contexts
- evaluating usefulness, clarity, and misleading-risk in actual room-image situations
- documenting what the overlay communicates well and what it still cannot communicate safely
- deciding whether the next step should be prototype refinement, room-plane/scaling contract refinement, or pause
- updating `docs/plan.md` because the active lane becomes real-room usefulness validation

This is not a photoreal insertion task.
This is not an OCR implementation task.
This is not a parser task.
This is not a schema redesign task.
This is not a production UX rollout task.

# Primary Objective
Answer one practical question:
Does the current honest geometry overlay become meaningfully useful when shown on real room-image contexts, or does it remain too abstract / misleading to justify further expansion?

# Allowed Changes
- Read broadly across:
  - `docs/plan.md`
  - current task doc
  - placement eligibility / geometry overlay contract
  - geometry contract v1.1
  - IKEA placement control baseline doc
  - bounded geometry overlay prototype doc
  - only the direct implementation files needed for the prototype validation
- Add one focused ops artifact documenting the real-room usefulness validation
- Update `docs/plan.md`
- Make tiny bounded prototype refinements only if they are directly required to evaluate usefulness honestly
- Use only a very small number of real room-image contexts

# Disallowed Changes
- Do not implement photoreal room insertion
- Do not implement OCR/vision extraction
- Do not reopen noisy seller work
- Do not redesign ranking/scoring
- Do not redesign the DB schema
- Do not broaden into production UI polish
- Do not treat the overlay as collision-proof or camera-accurate placement
- Do not expand beyond a very small validation set

# Critical Safety Rule
The overlay must remain honest. If the real room-image context makes the current overlay misleading, the correct result is to say so and narrow or pause the lane—not to visually decorate it until it looks convincing.

# Working Principles
- Read broadly, write narrowly
- Real room usefulness before broader expansion
- Overlay-ready and insertion-ready remain separate
- Very small sample only
- Prefer clarity and honesty over visual impressiveness
- Explicitly document what the overlay means and what it does not mean
- Update `docs/plan.md` because the active lane changes here

# Required Behavior / Structure

## 1. Re-read the current placement truth
Inspect:
- `docs/plan.md`
- current task doc
- placement eligibility / geometry overlay contract
- geometry contract v1.1
- IKEA placement control baseline doc
- bounded geometry overlay prototype doc
- only the direct implementation files needed for validation

## 2. Select a very small real room-image validation set
Use a very small number of real room-image contexts.
Preferred:
- 2–3 room images maximum
- real room-image examples only
- contexts where the current prototype can be evaluated honestly
- no need for wide seller/category variety in this step

If the repository or workspace already contains suitable room-image examples, prefer those.
If not, use the smallest grounded set available to the user’s current workflow.
Report exactly which room-image contexts were used.

## 3. Define the usefulness-evaluation contract
At minimum evaluate:
- whether the occupied-area guidance is understandable
- whether anchor placement meaning is understandable
- whether the room-image context improves comprehension
- whether the overlay creates false confidence about actual final placement
- whether the current output is honest enough to continue

Keep the evaluation concrete.

## 4. Run the bounded validation
Use the current prototype and test it against the selected real room-image contexts.
Document:
- what was shown
- what users would likely understand correctly
- what users could misunderstand
- whether scaling/anchor assumptions are acceptable or too weak
- whether the prototype becomes more useful or more misleading in real room-image contexts

## 5. Make only tiny bounded refinements if required
Only if necessary for honest evaluation:
- small labeling changes
- explicit assumption text
- clearer footprint/outline semantics
- small anchor/legend improvements

Do not turn this into a broad redesign.

## 6. State the lane decision
End with one honest conclusion:
- continue with bounded overlay refinement
- refine room-plane / anchor / scaling contract first
- pause because current overlay is too misleading in real room-image contexts

## 7. Update `docs/plan.md`
Reflect that:
- the active next lane is real-room overlay usefulness validation
- further overlay expansion depends on usefulness and honesty in real room-image contexts
- photoreal insertion is still deferred

# Completion Criteria
- A very small real room-image set was actually used
- The current overlay prototype was evaluated in real room-image contexts
- Usefulness and misleading-risk were judged explicitly
- Any refinement remained tiny and bounded
- `docs/plan.md` was updated
- No photoreal insertion or OCR work was started

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed
- any focused prototype/validation command actually used

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Exact room-image contexts reviewed
3. What changed
4. Real-room usefulness results
5. Lane decision and next order
6. Deferred items and why
7. Validation results
8. Final approval recommendation