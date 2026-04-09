# Goal
Align the current geometry-producing parser path to geometry contract v1 so IKEA and Livart produce consistent canonical dimension semantics through intake and publish.

# Scope
This task is limited to:
- reviewing current geometry-producing paths for IKEA and Livart
- aligning their outputs to geometry contract v1
- aligning shared normalization/debug behavior where necessary
- checking intake -> publish mapping for geometry consistency
- validating the aligned behavior on small representative batches

This is not a new seller-expansion task and not a UX task.

# Primary Objective
Make sure the existing geometry-producing paths (especially IKEA and Livart) follow the same canonical contract for:
- `width_cm`
- `depth_cm`
- `height_cm`
- unit normalization
- range handling
- sub-dimension exclusion
- debug/source-grounded metadata

# Allowed Changes
- Read all relevant parser, shared helper, import, and publish mapping files
- Update the minimum necessary parser/shared/helper code for IKEA and Livart alignment
- Update small comments or docs if needed to reflect the contract
- Add tiny source-specific or shared tests/fixtures/logging if useful
- Re-run small validation batches for IKEA and Livart

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not expand to Hanssem/Todayhouse/new sellers in this step
- Do not perform a generic parser-framework rewrite
- Do not loosen quality gates
- Do not redesign DB schema
- Do not introduce new geometry core fields in this step

# Critical Safety Rule
Read broadly, write narrowly. Review all relevant geometry-related layers, but only modify the minimum files required to make IKEA and Livart conform to the same contract.

# Working Principles
- Canonical geometry meaning must be seller-invariant
- DOM/block selection remains seller-specific
- Shared helpers should own shared normalization semantics
- Core fields are overall outer dimensions only
- Canonical storage unit is `cm`
- Overall-dimension ranges use the maximum value
- Ambiguous/sub-dimension/component/packaging/calculator measurements must not populate the core fields
- Debug/source-grounded metadata should be consistent enough for future troubleshooting

# Required Behavior / Structure

## 1. Review current contract-relevant layers
Inspect all relevant layers that affect geometry output and propagation, including as needed:
- IKEA site parser
- Livart site parser
- category parsers that normalize dimensions
- shared dimension helpers
- parser router / entrypoints
- import-product mapping into staged fields
- publish mapping into canonical rows

Do not limit review to one site file.

## 2. Compare IKEA and Livart against geometry contract v1
Check whether each currently conforms to:
- overall outer dimensions only
- canonical `cm` storage
- `mm -> cm` and `m -> cm` handling
- overall range -> max rule
- sub-dimension exclusion
- debug metadata expectations

Identify any contract drift explicitly.

## 3. Align parser behavior where needed
Implement only the minimum changes needed so IKEA and Livart follow the same contract.

Typical alignment areas may include:
- range handling consistency
- unit normalization consistency
- debug metadata consistency
- partial-dimension output behavior
- prevention of sub-dimensions leaking into core fields

Do not overbuild.

## 4. Confirm intake and publish propagation
Verify that aligned parser output survives:
- site parser output
- staged import fields
- canonical publish fields

There should be no hidden reinterpretation that breaks the contract between parser and canonical row.

## 5. Re-run focused validation
Run a small representative validation on:
- at least one IKEA case with dimensions
- at least one IKEA range/complex case if available
- at least one Livart case with valid overall dimensions
- at least one Livart case where dimensions should remain partial or null

Show the final staged/canonical outcomes.

## 6. End with an alignment conclusion
State clearly whether:
- IKEA and Livart are now aligned to geometry contract v1
- any seller-specific exceptions still remain
- any remaining geometry gaps are source-specific coverage issues rather than contract inconsistencies

# Completion Criteria
- Relevant geometry layers were reviewed broadly
- IKEA and Livart outputs are aligned to geometry contract v1
- intake -> publish propagation preserves the contract
- validation shows the aligned behavior on representative cases
- no seller expansion or framework rewrite occurred
- build/lint/type checks pass if code changed

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed

Also report:
- which files/layers were reviewed
- what contract drift was found
- what exact changes were made
- representative staged/canonical geometry outcomes
- whether any seller-specific exceptions remain

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Parser layers reviewed and contract drift found
3. What changed
4. Focused validation results
5. Final geometry-alignment conclusion
6. Deferred items and why
7. Validation results
8. Final approval recommendation