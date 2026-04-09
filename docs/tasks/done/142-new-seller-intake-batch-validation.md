# Goal
Validate the newly hardened intake quality-gate and publish workflow against a fresh seller-source batch that is more likely to produce warnings, blockers, and manual-review cases.

# Scope
This task is limited to:
- selecting a small but diverse new seller-source batch
- running the existing intake/import flow on those URLs
- auditing the resulting staged rows through the quality-gate workflow
- publishing only rows that pass
- verifying published rows
- documenting how the quality system behaved on the new batch

This is not a recommendation redesign task and not a UX task.

# Primary Objective
Prove that the intake quality-gate system can distinguish:
- publish-ready rows
- publish-allowed-with-warning rows
- publish-blocked rows
- manual-review-required rows

using a new real intake batch rather than the already-clean current baseline.

# Allowed Changes
- Add or update small operational scripts/helpers only if needed to support this batch validation
- Use the existing import, audit, publish, and verify workflows
- Add or update a small execution artifact documenting the batch and outcomes
- Make tiny contract-preserving fixes only if a real blocker appears during execution

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not redesign the app UX
- Do not build a large admin system
- Do not invent new statuses unless absolutely necessary
- Do not bypass the quality-gate workflow
- Do not force publish blocked or ambiguous rows
- Do not broaden schema/architecture unless a tiny execution blocker requires it

# Critical Safety Rule
The goal is to test the quality-gate system honestly, not to maximize publish count. Rows with blockers or ambiguity must remain blocked/manual-review if that is what the rules say.

# Working Principles
- New batch validation over clean-baseline comfort
- Preserve deterministic quality rules
- Publish only what should publish
- Keep blocked/warning/manual rows visible
- Prefer a small but diverse batch over a large noisy scrape
- End with a clear behavioral report of the gate system

# Required Behavior / Structure

## 1. Select a new seller-source batch
Choose a small intake batch from seller/product pages that are meaningfully different from the already-clean current dataset.

The batch should try to create variation such as:
- different seller/site structure
- weaker or missing affiliate links
- weaker image extraction
- inconsistent naming/category/price extraction
- pages likely to expose URL-quality warnings

Keep the batch size small enough to review carefully.

## 2. Run real intake
Run the existing intake/import flow on the selected URLs and create/update staged `import_jobs` rows.

## 3. Audit through quality gates
Run the existing intake audit and report how the new rows were classified:
- `publish_ready`
- `publish_allowed_with_warning`
- `publish_blocked`
- `manual_review_required`

The result must show whether the gate system is actually producing non-trivial separation on new data.

## 4. Publish only the valid subset
If any rows are truly publish-ready, publish them using the current publish workflow.
Do not force warning-only rows through if operator review is still required.
Do not publish blocked or ambiguous rows.

## 5. Verify published rows
Run post-publish verification on every row actually published from this batch.

## 6. Document operator conclusions
Produce a compact operational result describing:
- batch URLs/source type
- how many rows landed in each gate
- what kinds of warnings/blockers appeared
- what was published
- what stayed blocked/manual-review
- whether the gate system appears too strict, too loose, or reasonable

# Completion Criteria
- A fresh seller-source batch was actually ingested
- The quality-gate system produced a real classification result
- Only publish-ready rows were published
- Published rows were verified
- Warnings/blockers/manual-review rows were preserved honestly
- A useful batch-validation artifact exists
- Build/lint/type checks pass if code changes were needed

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed

Also report:
- exact batch source/URLs used
- exact quality-gate counts
- exact published rows
- exact blocked/manual rows and why
- whether any code/script adjustment was required

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Batch source and URLs used
3. Intake / audit results
4. Publish actions executed
5. Post-publish verification results
6. Gate-behavior conclusion
7. Deferred items and why
8. Validation results
9. Final approval recommendation