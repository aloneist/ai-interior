# Goal
Analyze the current parser structure and lock a geometry contract v1 that all seller parsers must follow for canonical furniture dimensions.

# Scope
This task is limited to:
- reading the existing parser-related files that affect dimension extraction and canonical product mapping
- documenting the current parser structure and responsibility boundaries
- defining a geometry contract v1 for canonical furniture dimensions
- mapping that contract onto the current parser architecture
- identifying the minimum implementation implications for current and future seller parsers

This is not a broad schema redesign task and not a UX task.

# Primary Objective
Create a clear, source-agnostic canonical geometry contract so all seller-specific parsers can implement dimensions consistently, even though each website exposes dimensions differently.

# Allowed Changes
- Read all relevant parser-related files, not just one site parser
- Add or update one focused contract/spec/runbook-style document
- Add tiny clarifying code comments only if truly helpful and tightly scoped
- Add a small parser responsibility map if useful

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not perform broad schema redesign
- Do not rewrite the parser framework
- Do not implement multiple seller patches in this step
- Do not constrain analysis to only one file such as `livart.ts` or only `shared/*`

# Critical Safety Rule
Read broadly, write narrowly. Analyze all relevant parser and mapping layers, but do not make broad code changes in this contract-writing step.

# Working Principles
- Canonical meaning first, source-specific extraction second
- Site structure may differ, but canonical geometry semantics must be consistent
- Overall product dimensions only in core fields
- Canonical dimension unit is `cm`
- Range-based overall dimensions use the maximum value
- Sub-dimensions must not be mixed into canonical overall fields
- Preserve current publish and canonical product contracts

# Required Behavior / Structure

## 1. Read the relevant parser structure broadly
Inspect all relevant files that influence geometry extraction and canonical dimension handling, including as applicable:
- site parsers
- category parsers
- shared parser helpers
- parser router / parser entrypoints
- import/publish mapping paths
- any dimension normalization helpers already in use

Do not limit analysis to only one seller file.

## 2. Document the current parser responsibility split
Explain the current structure clearly:
- what site parsers are responsible for
- what category/shared helpers are responsible for
- where canonical dimension fields are populated
- where unit normalization currently happens
- where debug/source metadata is preserved or lost

## 3. Define geometry contract v1
The contract must explicitly define at minimum:
- canonical core fields:
  - `width_cm`
  - `depth_cm`
  - `height_cm`
- semantic meaning:
  - overall outer product dimensions only
- unit policy:
  - canonical storage in `cm`
  - source `mm` converted to `cm`
- range policy:
  - overall dimension ranges use the maximum value
- ambiguity policy:
  - ambiguous values remain null
- sub-dimension policy:
  - seat/accessory/internal/component dimensions do not populate the core fields

## 4. Define debug/source-grounded metadata expectations
Specify what parser/debug metadata should exist to support future review and troubleshooting, such as:
- `raw_dimension_text_preview`
- `selected_dimension_line`
- `selected_dimension_unit`
- optional extraction-pattern metadata if useful

## 5. Map the contract to implementation implications
Explain, at a practical level:
- what should remain source-specific
- what should be shared
- what seller parsers must provide
- what shared helpers should normalize
- what should never be inferred loosely

## 6. End with a practical next-step recommendation
State what the next implementation step should be after the contract is locked.

# Completion Criteria
- The parser structure was analyzed broadly enough to avoid a narrow site-only view
- Geometry contract v1 is explicit and operationally usable
- The contract distinguishes core dimensions from sub-dimensions clearly
- `mm -> cm` and range-max policy are explicitly documented
- Implementation implications are clear for future seller parsers
- No broad code or schema drift occurred

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if code comments or code were changed
- `npm run lint` only if code comments or code were changed
- `npm run build` only if code comments or code were changed

Also report:
- which parser layers/files were inspected
- the final geometry contract rules
- the implementation implications identified
- the recommended next implementation step

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Parser structure layers reviewed
3. Geometry contract v1
4. Implementation implications
5. What changed
6. Deferred items and why
7. Validation results
8. Final approval recommendation