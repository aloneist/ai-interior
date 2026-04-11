# Goal
Normalize diameter/round geometry provenance in the canonical catalog so products already represented safely by outer-envelope dimensions also retain explicit round-shape semantics under geometry contract v1.1.

# Scope
This task is limited to:
- re-reading the current geometry path for diameter/round-compatible products
- identifying where diameter/round semantics currently exist only in parser/debug data but are not preserved canonically
- implementing the minimum normalization path needed to retain round-shape provenance in canonical metadata
- validating that canonical geometry remains contract-safe and that no identity/runtime drift is introduced
- documenting the post-normalization state and remaining gaps

This is not a UX task.
This is not a new seller-parser expansion task.
This is not an image-derived dimension extraction task.

# Primary Objective
Make diameter/round semantics explicit and consistent in the canonical layer for products already represented safely as outer-envelope geometry, without changing core canonical fields or broadening the schema.

# Allowed Changes
- Read broadly across relevant site parsers, shared geometry helpers, parser debug metadata, import-product mapping, publish mapping, canonical metadata handling, and geometry-contract docs
- Update the minimum necessary parser/shared/import/publish path to preserve round-shape metadata consistently
- Add or update a focused ops/dev doc describing the normalization step and post-state
- Add or update tiny validation helpers/logging if useful

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser-framework rewrite
- Do not redesign the DB schema in this step
- Do not loosen geometry quality rules
- Do not implement OCR or image-derived dimension extraction
- Do not introduce speculative round-shape inference where trustworthy diameter provenance does not already exist
- Do not change the meaning of canonical core fields

# Critical Safety Rule
Core canonical geometry remains:
- `width_cm`
- `depth_cm`
- `height_cm`

These fields continue to mean trustworthy outer envelope. Diameter/round normalization must add provenance, not reinterpret weak or ambiguous source data as valid round geometry.

# Working Principles
- Read broadly, write narrowly
- Geometry contract v1.1 remains the truth standard
- Canonical core fields stay seller-invariant
- Round/diameter provenance should be explicit where trustworthy
- No hidden third contract
- Preserve canonical product identity and current publish semantics
- Prefer bounded metadata normalization over schema expansion

# Required Behavior / Structure

## 1. Re-read the current diameter/round path
Inspect all relevant geometry-related layers, including as needed:
- site parsers that already derive diameter-like geometry
- shared geometry helpers
- parser debug metadata structures
- import-product mapping into staged extracted geometry/debug fields
- publish mapping into canonical product rows/metadata
- any current geometry audit/report docs referencing round/diameter semantics

Do not limit analysis to one seller file.

## 2. Identify the exact normalization gap
State clearly:
- where diameter/round semantics already exist today
- where they are lost before reaching canonical `metadata_json`
- whether the current gap is parser-side, staging-side, publish-side, or metadata-normalization-side
- which currently active rows are already safe candidates for normalization

Do not stay abstract.

## 3. Implement the smallest safe normalization step
Normalize round/diameter provenance for trustworthy cases only.

Target metadata semantics:
- `footprint_shape = "round"`
- `diameter_cm`
- `width_is_diameter = true`
- `depth_is_diameter = true`

Requirements:
- preserve current safe numeric envelope
- no geometry core-field reinterpretation
- no speculative inference from weak text
- no seller-agnostic DOM assumptions
- no schema change

## 4. Validate canonical behavior
Run focused validation on:
- staged/debug geometry provenance before vs after
- canonical `metadata_json` before vs after for representative round/diameter-compatible rows
- publish/read coherence for any updated rows
- any relevant geometry audit/report command actually used

The result should show that round/diameter provenance is now preserved canonically where it is already trustworthy.

## 5. State what still remains outside scope
Be explicit about what is still not solved:
- sellers with no trustworthy round/diameter candidate in current inventory
- rows that only have ambiguous component/package dimensions
- image-derived geometry
- future schema expansion, if ever needed

## 6. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- geometry contract v1.1
- runtime canonical-first behavior

# Completion Criteria
- The diameter/round normalization gap is explicitly identified
- A minimal canonical metadata normalization path is implemented
- Core geometry semantics remain unchanged
- Representative round/diameter-compatible rows retain safe canonical provenance
- No ranking/UX/schema sprawl occurs
- Validation is appropriate for the actual change scope

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed
- any focused publish/read/audit command actually used

Also report:
- which rows/patterns were normalized
- what metadata fields are now preserved
- what still remains unnormalized
- what the next geometry-hardening priority becomes after this step

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Diameter/round normalization gap found
3. What changed
4. Focused validation results
5. What still remains outside scope
6. Deferred items and why
7. Validation results
8. Final approval recommendation