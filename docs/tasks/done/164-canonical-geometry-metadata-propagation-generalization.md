# Goal
Generalize canonical geometry metadata propagation/backfill so trustworthy geometry provenance already present in staged/parser data is preserved consistently in canonical `furniture_products.metadata_json`, without changing core geometry fields or widening the schema.

# Scope
This task is limited to:
- auditing active canonical products and linked published `import_jobs` for geometry provenance that exists upstream but is missing canonically
- identifying which geometry provenance patterns are currently safe to propagate beyond the already-fixed narrow diameter/round cases
- implementing the minimum bounded propagation/backfill path needed
- validating representative before/after canonical metadata results
- documenting what provenance is now normalized, what still remains deferred, and why

This is not a UX task.
This is not a recommendation-redesign task.
This is not a new seller-parser expansion task.
This is not an image-derived dimension extraction task.

# Primary Objective
Move canonical geometry metadata from “narrow special-case preservation” to a broader but still contract-safe propagation path, while keeping canonical core fields unchanged and preserving geometry contract v1.1.

# Allowed Changes
- Read broadly across relevant site parsers, shared geometry helpers, parser metadata/debug structures, import-product mapping, publish mapping, canonical metadata handling, and geometry audit docs
- Add or update the minimum necessary parser/shared/import/publish path to preserve trustworthy geometry provenance consistently
- Add or update a focused ops/dev doc describing the generalized propagation/backfill step
- Add or update a tiny bounded backfill helper/script if truly needed
- Add tiny validation helpers/logging if useful

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser-framework rewrite
- Do not redesign the DB schema in this step
- Do not loosen geometry quality rules
- Do not implement OCR or image-derived geometry extraction
- Do not invent provenance where trustworthy source evidence does not already exist
- Do not change the meaning of canonical core fields

# Critical Safety Rule
Canonical core geometry remains:
- `width_cm`
- `depth_cm`
- `height_cm`

These fields continue to mean trustworthy outer envelope only. This task may propagate trustworthy provenance metadata, but must not reinterpret weak, ambiguous, package-only, component-only, or image-only source signals as canonical geometry truth.

# Working Principles
- Read broadly, write narrowly
- Geometry contract v1.1 remains the truth standard
- Canonical core fields stay seller-invariant
- Provenance should be preserved only when source-grounded and trustworthy
- Temporary backfill is allowed only if explicit and bounded
- No hidden third contract
- Preserve canonical product identity and current publish semantics

# Required Behavior / Structure

## 1. Re-read the current geometry provenance path
Inspect all relevant layers, including as needed:
- site parsers that emit geometry metadata/debug fields
- shared geometry helpers and metadata typing
- parser debug metadata structures
- import-product mapping into staged raw/extracted geometry metadata
- publish mapping into canonical `metadata_json`
- existing geometry audit docs and the recent diameter/round normalization step

Do not limit the analysis to one seller or one shape pattern.

## 2. Audit the broader propagation gap
Measure and report:
- how many active canonical rows already have trustworthy geometry provenance in linked published `import_jobs`
- how many of those rows are still missing equivalent canonical `metadata_json` provenance
- which provenance patterns are involved (for example diameter-derived flags, explicit footprint-shape semantics, other safe geometry provenance already emitted upstream)
- whether the gap is mostly publish-side, staging-shape mismatch, or metadata-normalization-side

Do not stay abstract.

## 3. Define the bounded generalization target
State clearly what provenance is safe to generalize now.

At minimum consider:
- `diameter_cm`
- `width_is_diameter`
- `depth_is_diameter`
- `derived_width_from_diameter`
- `derived_depth_from_diameter`
- `footprint_shape = "round"` when both diameter-origin flags support it

Optionally include other safe, already-source-grounded geometry provenance only if the audit proves it already exists upstream and is unambiguous.

## 4. Implement the smallest safe propagation/backfill step
Apply the minimum code and/or bounded backfill needed so canonical `metadata_json` consistently preserves the chosen trustworthy provenance.

Requirements:
- preserve current safe numeric envelope
- do not reinterpret weak or ambiguous geometry
- do not change core field meaning
- do not add schema
- do not create a hidden contract separate from parser/staged/canonical paths

## 5. Validate representative before/after behavior
Run focused validation on:
- staged/debug provenance before vs after
- canonical `metadata_json` before vs after for representative rows
- any publish/read coherence needed
- any bounded backfill/read command actually used

The result should prove that canonical geometry provenance is now preserved more consistently than in the previous narrow step.

## 6. State what still remains deferred
Be explicit about what is still outside scope, such as:
- sellers with no trustworthy current provenance candidate
- ambiguous component/package-only cases
- non-round shape semantics like `oval` or `l_shaped` if evidence is not yet strong enough
- image-derived geometry
- future schema expansion ideas, if any

## 7. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- runtime canonical-first behavior
- geometry contract v1.1
- scoring/runtime behavior

# Completion Criteria
- The broader canonical geometry provenance gap is explicitly measured
- A bounded generalized propagation/backfill path is implemented or executed
- Canonical metadata preserves more trustworthy geometry provenance than before
- Core geometry semantics remain unchanged
- No ranking/UX/schema sprawl occurs
- Validation is appropriate for the actual change scope

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed
- any focused publish/read/audit/backfill commands actually used

Also report:
- coverage of staged provenance vs canonical provenance before and after
- which provenance patterns were generalized
- which rows/sellers benefited
- what still remains unnormalized
- what the next geometry-hardening priority becomes after this step

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Broader geometry metadata propagation gap found
3. What changed
4. Focused validation results
5. What still remains outside scope
6. Deferred items and why
7. Validation results
8. Final approval recommendation