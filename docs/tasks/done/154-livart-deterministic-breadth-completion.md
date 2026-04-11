# Goal
Complete the next breadth-validation pass for Livart under the current operational contracts, without assuming IKEA is fully complete or using IKEA as a source-wide truth model.

# Scope
This task is limited to:
- validating Livart on a broader but still controlled real batch
- checking how far Livart deterministic support currently reaches across more categories/page patterns
- identifying which Livart page patterns are truly supported, partially supported, or still unsupported
- publishing only truly ready rows and verifying them
- ending with an evidence-based Livart support boundary update

This is not a UX task and not a broad multi-seller task.

# Primary Objective
Determine the true deterministic support boundary for Livart under the current contracts, especially across broader categories, page patterns, and geometry/spec availability.

# Allowed Changes
- Read broadly across relevant parser, shared helper, import, publish, and validation layers
- Add or update small Livart-specific parsing/extraction logic only if a real, narrow blocker appears
- Reuse shared helpers where appropriate
- Add or update tiny source-specific tests/fixtures/logging if useful
- Add or update a small operational validation artifact/runbook note
- Use the existing intake, audit, publish, verify, and geometry-contract workflows

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser-framework rewrite
- Do not loosen publish-quality gates to improve throughput
- Do not assume IKEA is fully correct or fully complete
- Do not treat IKEA DOM structure as portable
- Do not redesign schema or canonical product contracts
- Do not force blocked or ambiguous rows through publish

# Critical Safety Rule
Use geometry contract v1 and current operational rules as the truth standard. IKEA may be the strongest currently validated reference path, but it must not be treated as proof that a different seller should behave the same way or that IKEA itself is already fully complete.

# Working Principles
- Read broadly, write narrowly
- Seller DOM/block selection remains seller-specific
- Canonical product/geometry meaning remains seller-invariant
- Deterministic support is evidence-based, not assumed
- Publish only what is truly ready
- Partial support must remain clearly labeled as partial
- Unsupported page patterns must be reported honestly

# Required Behavior / Structure

## 1. Build a broader Livart validation batch
Use a small but intentionally broader Livart batch than before.

Try to include:
- categories beyond the already-validated core cases
- page patterns that may or may not contain trustworthy overall-size text
- products with and without likely geometry/spec text
- a mix that can reveal true support boundaries rather than only happy-path pages

Keep the batch small enough to inspect carefully.

## 2. Revalidate Livart support on the real workflow
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

## 3. Explicitly classify page-pattern support
For the sampled Livart batch, distinguish:
- supported page patterns
- limited-but-usable page patterns
- unsupported page patterns
- patterns that appear to lack trustworthy source data entirely

Do not collapse all failures into one bucket.

## 4. Do not assume IKEA completeness
In the analysis and conclusion:
- do not use IKEA as proof that Livart should support the same shapes
- do not treat IKEA as fully complete across all furniture patterns
- use geometry contract v1 as the consistency target
- treat both IKEA and Livart as sources with validated coverage and possible remaining gaps

## 5. End with a real Livart support decision
Choose one honest conclusion:
- Livart is now `supported_operational`
- Livart is `supported_operational only for limited categories/cases`
- Livart geometry/spec works only for limited page patterns
- Livart remains partially blocked by source coverage gaps
- Livart should remain limited support for now

Support the conclusion with observed batch behavior.

## 6. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- geometry contract v1
- outbound URL review policy

# Completion Criteria
- A broader real Livart batch was validated
- Identity and geometry/spec outcomes were separately evaluated
- Supported vs unsupported Livart page patterns were explicitly identified
- The result did not assume IKEA completeness
- Final Livart support status was updated honestly
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
- exact page-pattern support findings
- exact intake/audit/publish/verify outcomes
- whether any narrow parser changes were needed
- final Livart support recommendation

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Livart batch and page-pattern coverage used
3. Intake / audit / publish / verify results
4. Supported vs unsupported Livart page patterns
5. Final Livart support-status conclusion
6. Deferred items and why
7. Validation results
8. Final approval recommendation