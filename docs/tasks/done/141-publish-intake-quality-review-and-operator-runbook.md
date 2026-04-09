# Goal
Lock the operational quality-review and publish-intake routine so new staged products can be reviewed and published with consistent quality standards, not just correct status transitions.

# Scope
This task is limited to operational quality review and publish-intake hardening around:
- `import_jobs`
- `furniture_products`
- outbound/product URL quality
- publish readiness rules
- operator-facing review and post-publish verification routine

This is not a recommendation redesign task, not a UX task, and not a broad admin-system task.

# Primary Objective
Define and operationalize the minimum repeatable quality gates for staged product intake so that future publish decisions produce usable canonical catalog rows, not just technically published rows.

# Allowed Changes
- Add or update small operational scripts, audit/report modes, or helpers
- Add or update runbooks/checklists/docs for intake review and post-publish verification
- Add small validation/reporting support for canonical product quality
- Add small code changes only if needed to support deterministic quality audit/reporting
- Add a small publish-intake checklist artifact or command output format

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not build a large admin panel
- Do not add speculative schema redesign
- Do not invent fuzzy/heuristic approval rules that are hard to audit
- Do not change canonical product identity or current publish semantics

# Critical Safety Rule
A row is not publish-worthy just because it can technically be published. Quality review must remain deterministic, explainable, and operationally auditable.

# Working Principles
- Canonical product source remains `furniture_products`
- `import_jobs` remains staging/review only
- Review and publish are separate concepts: "can publish" vs "should publish"
- Prefer small explicit quality gates over vague human judgment
- Preserve current publish helper/runtime contracts
- Output should be usable by an operator without guessing

# Required Behavior / Structure

## 1. Define publish-intake quality gates
Create explicit operator-facing rules for what makes a staged row:
- publish-ready
- publish-blocked
- publish-allowed but quality-warning
- manual-review-required

At minimum, cover:
- required identity fields
- required product presentation fields
- image availability
- price/category/name presence
- source/product URL quality
- outbound destination quality concerns
- obviously low-trust extracted content cases

## 2. Operationalize quality audit
Add the minimum operational tooling or report support needed to audit staged rows for quality, not just status.

Expected outputs should make it possible to see:
- which rows are clearly publish-ready
- which rows are blocked and why
- which rows can publish but should be reviewed because of warnings
- which canonical rows may need outbound/catalog quality follow-up

## 3. Add outbound URL review rules
Make explicit operator rules for URL quality.

At minimum:
- canonical product row should have the intended outbound URL policy clearly verifiable
- obvious non-PDP / generic / category-like destinations should be flagged
- redirect-risk notes from prior smoke should be reflected in the operator checklist
- do not auto-rewrite URLs speculatively in this step

## 4. Add post-publish verification routine
Define and operationalize the minimum post-publish check.

Should include:
- canonical row exists
- `published_product_id` linkage is correct
- expected product fields survived publish correctly
- outbound URL present and reviewable
- row should not remain in pending review after successful publish

## 5. Produce an operator runbook
Add or update a runbook that an operator can actually follow for future intake.

Should cover:
- review intake flow
- quality gate interpretation
- publish decision path
- post-publish verification
- when to reject
- when to leave in manual review
- when to raise catalog/outbound follow-up instead of blocking publish

## 6. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- save/click/recommendation identity model
- outbound URL preference contract

# Completion Criteria
- Publish-intake quality gates are explicit and usable
- Operators can distinguish blocked vs warning vs ready rows
- Outbound URL review is part of the publish-intake routine
- Post-publish verification is documented and repeatable
- Small required tooling/docs exist for actual operation
- No product/runtime contract drift
- Build/lint/type checks pass if code changes are made

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed

Also report:
- exact quality gates introduced
- exact tooling/report changes made
- exact runbook/docs added or updated
- what was intentionally deferred

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Quality gates defined
3. What changed
4. Outbound URL review rules added
5. Post-publish verification routine
6. Deferred items and why
7. Validation results
8. Final approval recommendation