# Goal
Harden Hanssem geometry/spec extraction so Hanssem can move beyond identity-only operational support and carry usable canonical geometry under geometry contract v1.

# Scope
This task is limited to:
- analyzing Hanssem product-page structure for trustworthy geometry/spec content
- implementing narrow Hanssem-specific geometry/spec extraction
- reusing shared normalization/helpers where appropriate
- rerunning intake -> audit -> publish -> verify on a small Hanssem batch
- documenting whether Hanssem geometry/spec is now operationally usable

This is not a broad multi-seller task and not a UX task.

# Primary Objective
Determine whether Hanssem can move from identity-only limited support to a geometry/spec-capable operational source by extracting trustworthy overall dimensions and minimal useful spec data.

# Allowed Changes
- Read broadly across relevant parser, shared helper, import, and publish mapping files
- Add or update small Hanssem-specific geometry/spec extraction logic
- Reuse shared helpers for normalization, range handling, and debug metadata where appropriate
- Add or update tiny source-specific tests/fixtures/logging if useful
- Add or update a small operational validation artifact/runbook note
- Use the existing intake, audit, publish, verify, and geometry-contract workflows

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser-framework rewrite
- Do not loosen publish-quality gates to hide missing geometry/spec
- Do not redesign schema or canonical product contracts
- Do not jump into more Livart/Todayhouse work in this step unless a tiny comparison is required
- Do not invent dimensions from vague or untrustworthy text

# Critical Safety Rule
Hanssem geometry/spec values must come from Hanssem-specific trustworthy PDP structures. If overall dimensions are ambiguous, range-based without a deterministic rule, packaging-only, component-only, or marketing-only, do not map them into canonical core fields.

# Working Principles
- Read broadly, write narrowly
- Hanssem DOM/block selection must be Hanssem-specific
- Shared helpers may be reused, but DOM assumptions must not be borrowed from IKEA or Livart
- Geometry contract v1 remains the canonical rule
- Core fields are overall outer product dimensions only
- Canonical storage unit is `cm`
- Overall-dimension ranges use the maximum value
- Sub-dimensions and component dimensions must not populate core fields
- End with an honest Hanssem geometry-support conclusion

# Required Behavior / Structure

## 1. Analyze Hanssem geometry/spec structure first
Inspect a small real Hanssem batch and identify where trustworthy values for these live:
- overall product dimensions
- useful spec text blocks
- image/spec areas that may contain size data
- unit conventions (`mm`, `cm`, mixed forms)

Also identify nearby false positives such as:
- package size
- option/component size
- interior shelf size
- marketing copy
- banner/spec summary text not tied to the product's overall outer size

## 2. Reproduce the current Hanssem geometry gap
Using a small Hanssem batch, confirm:
- identity parsing now works
- geometry/spec values are still absent or unreliable
- whether source HTML actually contains overall size data
- whether the blocker is section-selection, parsing, normalization, or simple source absence

## 3. Implement minimal Hanssem-specific geometry/spec extraction
Add only the smallest Hanssem-specific logic needed to populate:
- `width_cm`
- `depth_cm`
- `height_cm`

Optionally capture additional useful source-grounded spec/debug metadata only if clearly justified.

Requirements:
- target trustworthy Hanssem PDP blocks
- ignore packaging/component/marketing dimensions
- support source-specific compact patterns only in trusted overall-size context
- reuse shared normalization when appropriate

## 4. Normalize units into canonical centimeters
Ensure:
- `mm` and `m` values normalize into canonical `cm`
- range-based overall dimensions use the maximum value
- ambiguous values remain null
- partial output is allowed when only some dimensions are trustworthy

## 5. Re-run operational validation
On a small Hanssem batch:
- run intake
- inspect staged geometry/spec values
- run quality audit
- publish only truly ready rows
- verify canonical rows retain correct geometry/spec fields

## 6. End with a source-status conclusion
Choose one honest conclusion:
- Hanssem is now `supported_operational`
- Hanssem is `supported_operational only for limited categories/cases`
- Hanssem geometry/spec works only for limited page patterns
- Hanssem remains identity-only operational
- Hanssem geometry/spec remains too weak for operational reliance

Support the conclusion with observed batch behavior, not optimism.

## 7. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- geometry contract v1
- outbound URL review policy

# Completion Criteria
- Hanssem structure was analyzed first
- Hanssem geometry/spec gap was concretely identified
- Any hardening remains narrow and Hanssem-specific
- Intake -> audit -> publish -> verify was rerun on a small Hanssem batch
- Final Hanssem geometry-support status is stated honestly
- No quality-gate loosening or product/runtime drift occurred
- Build/lint/type checks pass if code changed

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed

Also report:
- exact Hanssem URLs/batch used
- exact geometry/spec issues observed before changes
- exact changes made
- exact staged/canonical geometry outcomes
- final Hanssem geometry-support recommendation

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Hanssem structure analysis and geometry/spec gap
3. What changed
4. Post-hardening intake / audit / publish / verify results
5. Final Hanssem geometry-support conclusion
6. Deferred items and why
7. Validation results
8. Final approval recommendation