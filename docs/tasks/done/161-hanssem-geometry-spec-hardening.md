# Goal
Harden Hanssem geometry/spec extraction so Hanssem can move beyond identity-only limited support and carry more trustworthy canonical geometry under geometry contract v1.1.

# Scope
This task is limited to:
- analyzing Hanssem product-page structure for trustworthy geometry/spec content
- implementing narrow Hanssem-specific geometry/spec extraction
- reusing shared normalization/helpers where appropriate
- rerunning intake -> audit -> publish -> verify on a small Hanssem batch
- documenting whether Hanssem geometry/spec support improves meaningfully

This is not a UX task.
This is not a new seller-expansion task.
This is not an image-derived dimension extraction task.

# Primary Objective
Reduce Hanssem’s current geometry completeness gap by extracting trustworthy overall dimensions where Hanssem pages actually expose them, without weakening the current deterministic geometry contract.

# Allowed Changes
- Read broadly across relevant parser, shared helper, import, publish, and validation layers
- Add or update small Hanssem-specific geometry/spec extraction logic
- Reuse shared helpers for normalization, range handling, and debug metadata where appropriate
- Add or update tiny source-specific tests/fixtures/logging if useful
- Add or update a small operational validation artifact/runbook note
- Use the existing intake, audit, publish, verify, and geometry-contract workflows

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser-framework rewrite
- Do not loosen publish-quality gates
- Do not redesign schema or canonical product contracts
- Do not start OCR or image-derived dimension extraction in this step
- Do not invent dimensions from vague, unitless, marketing-only, package-only, or component-only text

# Critical Safety Rule
Hanssem geometry/spec values must come from Hanssem-specific trustworthy PDP structures. If overall dimensions are ambiguous, missing, package-only, component-only, or image-only, leave canonical core fields null.

# Working Principles
- Read broadly, write narrowly
- Hanssem DOM/block selection must be Hanssem-specific
- Shared helpers may be reused, but DOM assumptions must not be borrowed from IKEA or Livart
- Geometry contract v1.1 remains the truth standard
- Core fields are:
  - `width_cm`
  - `depth_cm`
  - `height_cm`
- Core fields mean trustworthy outer envelope only
- Canonical unit is `cm`
- `mm` and `m` normalize into `cm`
- Overall range dimensions use the maximum value
- Diameter/non-rectangular semantics must follow geometry contract v1.1 when trustworthy
- Sub-dimensions and component dimensions must not populate core fields

# Required Behavior / Structure

## 1. Analyze Hanssem geometry/spec structure first
Inspect a small but broader real Hanssem batch and identify where trustworthy values for these actually live:
- overall product dimensions
- text-based spec rows
- product-detail HTML blocks
- any explicit unit-bearing compact dimension patterns
- any trustworthy diameter/round patterns if they exist

Also identify false positives such as:
- package size
- option/component/accessory size
- interior/storage sub-dimensions
- marketing copy
- image-only detail content
- unitless single numbers

## 2. Reproduce the current Hanssem geometry gap
Using the sampled Hanssem batch, confirm:
- identity parsing still works
- geometry/spec values are absent or partial on most rows
- source HTML does or does not contain trustworthy overall-size text
- the blocker is section-selection, parsing, normalization, or true source absence

Do not stay abstract.

## 3. Implement minimal Hanssem-specific geometry/spec extraction
Add only the smallest Hanssem-specific logic needed to improve:
- `width_cm`
- `depth_cm`
- `height_cm`

Requirements:
- target trustworthy Hanssem PDP text blocks
- support explicit compact dimension patterns only in trustworthy overall-size context
- support range handling through shared helpers
- preserve useful geometry debug metadata
- do not infer from images or from weak/unitless text

## 4. Re-run operational validation
On a small Hanssem batch:
- run intake
- inspect staged geometry/spec output
- run quality audit
- publish only truly ready rows
- verify any newly published rows

Track separately:
- identity success/failure
- geometry/spec success/failure
- whether failures are due to source absence, page-pattern mismatch, or parser gap

## 5. Classify Hanssem page-pattern support
For the sampled Hanssem batch, distinguish:
- supported geometry page patterns
- limited-but-usable page patterns
- envelope-only page patterns
- unsupported page patterns
- patterns that appear to lack trustworthy source geometry entirely

Do not flatten all missing cases into one category.

## 6. End with a real Hanssem geometry-support decision
Choose one honest conclusion:
- Hanssem is now `supported_operational only for limited categories/cases` with materially improved geometry support
- Hanssem geometry/spec works only for limited page patterns
- Hanssem remains mostly identity-only operational
- Hanssem geometry/spec remains too weak for broader operational reliance

Support the conclusion with observed batch behavior, not optimism.

## 7. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- geometry contract v1.1
- outbound URL review policy

# Completion Criteria
- Hanssem structure was analyzed first
- Hanssem geometry/spec gap was concretely identified
- Any hardening remains narrow and Hanssem-specific
- Intake -> audit -> publish -> verify was rerun on a meaningful Hanssem batch
- Supported vs unsupported Hanssem geometry patterns were explicitly identified
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
5. Supported vs unsupported Hanssem page patterns
6. Final Hanssem geometry-support conclusion
7. Deferred items and why
8. Validation results
9. Final approval recommendation