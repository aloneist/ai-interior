# Goal
Complete the next breadth-validation pass for Hanssem under the current operational contracts, without assuming any existing seller path is fully complete.

# Scope
This task is limited to:
- validating Hanssem on a broader but still controlled real batch
- checking how far Hanssem deterministic support currently reaches across more categories/page patterns
- identifying which Hanssem page patterns are truly supported, partially supported, or still unsupported
- publishing only truly ready rows and verifying them
- ending with an evidence-based Hanssem support boundary update

This is not a UX task and not a broad multi-seller task.

# Primary Objective
Determine the true deterministic support boundary for Hanssem under the current contracts, especially across broader categories, page patterns, and geometry/spec availability.

# Allowed Changes
- Read broadly across relevant parser, shared helper, import, publish, and validation layers
- Add or update small Hanssem-specific parsing/extraction logic only if a real, narrow blocker appears
- Reuse shared helpers where appropriate
- Add or update tiny source-specific tests/fixtures/logging if useful
- Add or update a small operational validation artifact/runbook note
- Use the existing intake, audit, publish, verify, and geometry-contract workflows

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser-framework rewrite
- Do not loosen publish-quality gates to improve throughput
- Do not treat IKEA as a source-wide truth model
- Do not redesign schema or canonical product contracts
- Do not force blocked or ambiguous rows through publish
- Do not start image-derived dimension extraction in this step

# Critical Safety Rule
Use geometry contract v1 and the current operational contracts as the truth standard. No seller, including IKEA, should be treated as fully complete by default. Hanssem support must be decided by evidence from the sampled Hanssem batch.

# Working Principles
- Read broadly, write narrowly
- Seller DOM/block selection remains seller-specific
- Canonical product and geometry meaning remains seller-invariant
- Deterministic support is evidence-based, not assumed
- Publish only what is truly ready
- Partial support must remain clearly labeled as partial
- Unsupported page patterns must be reported honestly
- Keep image-derived dimension extraction out of the current deterministic path

# Required Behavior / Structure

## 1. Build a broader Hanssem validation batch
Use a small but intentionally broader Hanssem batch than before.

Try to include:
- categories beyond the already-validated core cases
- page patterns with and without likely trustworthy overall-size text
- products that may reveal identity success but geometry absence
- products that may expose source-coverage gaps
- if practical, at least one likely discounted or variant-sensitive page

Keep the batch small enough to inspect carefully.

## 2. Revalidate Hanssem support on the real workflow
For the batch:
- run intake
- inspect staged parser output
- run quality audit
- publish only truly ready rows
- verify any newly published rows

Track separately:
- identity success/failure
- geometry/spec success/failure
- whether failures are due to source absence, page-pattern mismatch, or parser gap

## 3. Explicitly classify Hanssem page-pattern support
For the sampled Hanssem batch, distinguish:
- supported page patterns
- limited-but-usable page patterns
- unsupported page patterns
- patterns that appear to lack trustworthy source data entirely

Do not collapse all failures into one bucket.

## 4. Keep current standards explicit
In the analysis and conclusion:
- do not use IKEA as proof that Hanssem should support the same shapes
- do not assume IKEA itself is fully complete either
- use geometry contract v1 as the consistency target
- treat both Hanssem and the other sellers as sources with validated coverage and possible remaining gaps

## 5. Make only narrow Hanssem changes if necessary
Only if a real narrow blocker appears, apply the smallest Hanssem-specific fix needed.
Do not overbuild.
Do not loosen gates.

## 6. End with a real Hanssem support decision
Choose one honest conclusion:
- Hanssem is now `supported_operational`
- Hanssem is `supported_operational only for limited categories/cases`
- Hanssem geometry/spec works only for limited page patterns
- Hanssem remains limited due to source coverage gaps
- Hanssem should remain limited support for now

Support the conclusion with observed batch behavior.

## 7. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- geometry contract v1
- outbound URL review policy

# Completion Criteria
- A broader real Hanssem batch was validated
- Identity and geometry/spec outcomes were separately evaluated
- Supported vs unsupported Hanssem page patterns were explicitly identified
- The result did not assume seller completeness
- Final Hanssem support status was updated honestly
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
- exact page-pattern support findings
- exact intake/audit/publish/verify outcomes
- whether any narrow parser changes were needed
- final Hanssem support recommendation

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Hanssem batch and page-pattern coverage used
3. Intake / audit / publish / verify results
4. Supported vs unsupported Hanssem page patterns
5. Final Hanssem support-status conclusion
6. Deferred items and why
7. Validation results
8. Final approval recommendation