# Goal
Run a small feasibility spike for image-derived geometry on the officially separated experiment pool, so we can determine whether OCR/vision-based extraction is operationally promising before starting any production implementation.

# Scope
This task is limited to:
- selecting a very small first sample from the current image-derived geometry experiment pool
- prioritizing Hanssem first
- collecting and inspecting the relevant PDP detail/spec images for those rows
- testing whether OCR/vision can read candidate size/spec text from those images
- testing whether the extracted candidates can be safely classified as outer-envelope geometry vs component/package/accessory/ambiguous data
- documenting feasibility, rejection rate, false-positive risk, and whether the lane is worth implementing further
- updating `docs/plan.md` because the active lane changes from design/spec to feasibility spike

This is not a production OCR implementation task.
This is not a parser implementation task.
This is not a UX task.
This is not a schema redesign task.
This is not a broad multi-seller rollout task.

# Primary Objective
Answer one practical question with evidence:
Can image-derived geometry become a safe and useful lane for the current pool, starting with a tiny Hanssem-first spike?

# Allowed Changes
- Read broadly across:
  - `docs/plan.md`
  - current task doc
  - image-derived geometry experiment pool doc
  - image-derived geometry design/spec doc
  - geometry contract v1.1 doc
  - current canonical/staged evidence for the selected sample rows
- Add one focused ops artifact documenting the spike
- Update `docs/plan.md`
- Add a tiny bounded experiment script or notebook only if clearly necessary and isolated from production runtime
- Use temporary local experiment code if needed, but keep it out of production flow unless explicitly justified

# Disallowed Changes
- Do not wire OCR/vision into production routes
- Do not reopen deterministic parser hardening
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not redesign the DB schema
- Do not loosen geometry quality rules
- Do not overwrite any existing trustworthy text-derived geometry
- Do not generalize across all sellers before the small sample proves useful

# Critical Safety Rule
Reading numbers from an image is not enough. A candidate result is valid only if the spike can justify that it refers to trustworthy outer-envelope product geometry under geometry contract v1.1. Ambiguous, component-only, package-only, accessory-only, or layout-marketing imagery must be rejected.

# Working Principles
- Read broadly, write narrowly
- Spike first, productize later
- Hanssem first, Livart second
- Small sample only
- High rejection is acceptable; false confidence is not
- Preserve provenance and confidence thinking even in the spike
- Update `docs/plan.md` because the current active lane changes here

# Required Behavior / Structure

## 1. Re-read the current experiment truth
Inspect:
- `docs/plan.md`
- current task doc
- image-derived experiment pool doc
- image-derived design/spec doc
- geometry contract v1.1 doc
- minimal row evidence for the first sample

## 2. Select the first spike sample
Choose a very small sample from the current pool.
Preferred:
- Hanssem first
- 2–3 rows maximum for the first spike
- prioritize rows that visibly appear to have spec/size images rather than generic lifestyle imagery

Report exactly which rows were selected and why.

## 3. Collect the actual image evidence
For each sampled row:
- identify the candidate detail/spec images
- record whether the image contains:
  - explicit size diagram
  - table-like spec image
  - mixed marketing + size content
  - packaging/component ambiguity
  - unreadable/low-value content

Do not stay abstract.

## 4. Run the bounded extraction test
Using temporary experiment tooling only if needed:
- try to read candidate size/spec text
- extract candidate dimension labels and values
- map them into possible width/depth/height or diameter candidates
- explicitly track when extraction succeeds but geometry meaning remains ambiguous

## 5. Judge outer-envelope feasibility
For each sampled row, decide which of these is true:
- feasible: image-derived geometry is likely usable with bounded confidence
- partial: image text is readable but outer-envelope classification is still weak
- reject: image-derived path is not trustworthy for this row/pattern
- inconclusive: better tooling or better image quality is needed

At minimum report:
- readable text success
- outer-envelope classification success
- rejection correctness
- false-positive risk

## 6. State whether the lane is worth continuing
End with one honest conclusion:
- promising enough to continue with a slightly broader spike
- promising only for narrow image patterns
- too risky/noisy right now
- blocked by image quality or seller pattern issues

## 7. Update `docs/plan.md`
Reflect that:
- the active next lane is now the bounded feasibility spike
- production implementation is still deferred
- the current decision after this spike will determine whether the lane expands, narrows, or pauses

# Completion Criteria
- A very small Hanssem-first sample was actually tested
- Actual candidate images were inspected
- Extraction readability and outer-envelope feasibility were judged separately
- False-positive/rejection risk was explicitly discussed
- `docs/plan.md` was updated
- No production OCR/vision implementation was added

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if non-doc code changed
- `npm run lint` only if non-doc code changed
- `npm run build` only if non-doc code changed
- any focused experiment commands actually used

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Exact spike sample reviewed
3. What changed
4. Feasibility results
5. Lane decision and next order
6. Deferred items and why
7. Validation results
8. Final approval recommendation