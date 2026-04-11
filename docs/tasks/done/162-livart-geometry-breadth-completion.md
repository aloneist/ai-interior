# Goal
Complete the next deterministic geometry breadth pass for Livart under geometry contract v1.1, so the team can distinguish true parser gaps from true source-coverage absence on current Livart page patterns.

# Scope
This task is limited to:
- validating Livart on a broader geometry-focused real batch
- checking which Livart page patterns produce trustworthy canonical geometry
- identifying which geometry-null Livart patterns are fixable versus source-absent
- making only the smallest Livart-specific parser changes if a real narrow blocker appears
- rerunning intake -> audit -> publish -> verify on the sampled Livart batch
- ending with an evidence-based Livart geometry-support boundary update

This is not a UX task.
This is not a new seller-expansion task.
This is not an image-derived dimension extraction task.

# Primary Objective
Reduce uncertainty around Livart geometry completeness by explicitly mapping supported, partial, unsupported, and source-absent Livart page patterns under geometry contract v1.1.

# Allowed Changes
- Read broadly across relevant parser, shared helper, import, publish, validation, and geometry-contract layers
- Add or update small Livart-specific geometry/spec extraction logic only if a real narrow blocker appears
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
- Do not invent dimensions from vague, marketing-only, package-only, component-only, or image-only content
- Do not use IKEA as proof that Livart should support the same page shapes

# Critical Safety Rule
Livart geometry/spec values must come from trustworthy Livart PDP structures and must obey geometry contract v1.1. If overall dimensions are ambiguous, missing, mixed with component/package text, or only implied by images, leave canonical core fields null.

# Working Principles
- Read broadly, write narrowly
- Livart DOM/block selection remains Livart-specific
- Shared helpers may be reused, but DOM assumptions must not be borrowed from IKEA or Hanssem
- Geometry contract v1.1 remains the truth standard
- Core fields are:
  - `width_cm`
  - `depth_cm`
  - `height_cm`
- Core fields mean trustworthy outer envelope only
- Canonical unit is `cm`
- `mm` and `m` normalize into `cm`
- Overall range dimensions use the maximum value
- Diameter/non-rectangular semantics must remain safe and explicit
- Unsupported/source-absent patterns must be reported honestly

# Required Behavior / Structure

## 1. Build a broader Livart geometry-focused batch
Use a small but intentionally broader Livart batch than the already-proven core cases.

Try to include:
- categories that already showed mixed geometry outcomes
- page patterns likely to contain trustworthy overall-size text
- page patterns likely to remain geometry-null
- at least one likely round/diameter-relevant case if practical
- products that may reveal source-absence versus parser-gap differences

Keep the batch small enough to inspect carefully.

## 2. Reproduce the current Livart geometry gap
Using the sampled Livart batch, confirm:
- identity parsing still works
- which rows already produce geometry
- which rows remain null
- whether null cases are due to parser gap, page-pattern mismatch, or true source absence

Do not stay abstract.

## 3. Implement the smallest Livart-specific geometry hardening if needed
Add only the minimum Livart-specific change needed to improve trustworthy geometry extraction where the source clearly supports it.

Requirements:
- target real Livart PDP text blocks or trusted compact patterns
- preserve debug/source metadata
- support range handling through shared helpers
- keep diameter/non-rectangular handling consistent with geometry contract v1.1
- do not infer from images or weak marketing text

## 4. Re-run operational validation
On the sampled Livart batch:
- run intake
- inspect staged geometry/spec output
- run quality audit
- publish only truly ready new rows
- republish/reconcile already-linked rows only where appropriate
- verify representative newly improved rows

Track separately:
- identity results
- geometry/spec results
- parser-gap rows
- source-absent rows

## 5. Classify Livart page-pattern support explicitly
For the sampled Livart batch, distinguish:
- supported 3D geometry patterns
- partial but operationally usable geometry patterns
- diameter/round-compatible patterns
- unsupported patterns
- patterns lacking trustworthy source geometry entirely

Do not flatten all null cases into one bucket.

## 6. End with a real Livart geometry-support decision
Choose one honest conclusion:
- Livart remains `supported_operational only for limited categories/cases`, with materially improved geometry support
- Livart geometry/spec works only for limited page patterns
- Livart remains limited mainly due to source coverage gaps
- Livart geometry/spec is near broad operational support
- Livart should remain limited support for now

Support the conclusion with observed batch behavior.

## 7. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- geometry contract v1.1
- outbound URL review policy

# Completion Criteria
- A broader Livart geometry-focused batch was actually validated
- Livart geometry-null cases were split into parser-gap vs source-absent where possible
- Any hardening remained narrow and Livart-specific
- Intake -> audit -> publish -> verify was rerun on the sampled Livart batch
- Supported vs unsupported Livart geometry patterns were explicitly identified
- Final Livart geometry-support status was stated honestly
- No quality-gate loosening or product/runtime drift occurred
- Build/lint/type checks pass if code changed

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed

Also report:
- exact Livart URLs/batch used
- exact geometry/spec issues observed before changes
- exact changes made
- exact staged/canonical geometry outcomes
- final Livart geometry-support recommendation

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Livart batch and geometry/spec gap
3. What changed
4. Post-hardening intake / audit / publish / verify results
5. Supported vs unsupported Livart page patterns
6. Final Livart geometry-support conclusion
7. Deferred items and why
8. Validation results
9. Final approval recommendation