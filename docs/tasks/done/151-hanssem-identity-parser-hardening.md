# Goal
Build the first narrow Hanssem source parser so Hanssem can move from `parse_blocked` to a real staged-and-auditable seller source.

# Scope
This task is limited to:
- analyzing Hanssem product-page structure
- implementing a Hanssem-specific parser for core identity fields
- rerunning intake -> audit -> publish -> verify on a small Hanssem batch
- documenting whether Hanssem can advance beyond `parse_blocked`

This is not a geometry-hardening task yet and not a UX task.

# Primary Objective
Get Hanssem past the current parser-absence failure by extracting the minimum operational identity fields needed for staged quality review and possible publish.

# Allowed Changes
- Add or update a small Hanssem-specific parser
- Update parser router/entrypoint wiring as needed
- Reuse shared helpers where appropriate, but keep DOM extraction Hanssem-specific
- Add or update tiny source-specific tests/fixtures/logging if useful
- Add or update a small operational validation artifact/runbook note
- Use the existing intake, audit, publish, and verify workflows

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser-framework rewrite
- Do not loosen publish-quality gates just to make Hanssem pass
- Do not jump into geometry-first work in this step
- Do not redesign schema or canonical product contracts
- Do not force publish blocked or ambiguous rows

# Critical Safety Rule
Do not declare Hanssem usable just because HTML fetches. Hanssem is only improved if real parser output populates trustworthy identity fields and the current workflow can classify the rows honestly.

# Working Principles
- Hanssem DOM selection must be Hanssem-specific
- Shared helpers may be reused, but DOM assumptions must not be borrowed from IKEA/Livart
- Identity comes before geometry
- Publish only truly ready rows
- End with an honest Hanssem source-status decision
- Keep canonical product and publish contracts unchanged

# Required Behavior / Structure

## 1. Analyze Hanssem product-page structure
Inspect a small real Hanssem batch and identify where trustworthy values for these fields actually live:
- product name
- price
- category hint
- primary image

Also identify nearby false positives such as:
- marketing bundles
- option/variant labels that are not the base product name
- unrelated thumbnails or banners
- non-operational price text

## 2. Implement minimal Hanssem parser coverage
Add only the smallest Hanssem-specific extraction needed to populate:
- `extracted_name`
- `extracted_category`
- `extracted_price`
- `extracted_image_urls` / primary image
- parser metadata/debug fields as useful

Do not attempt full seller completeness in this step.

## 3. Re-run Hanssem small-batch validation
On a small Hanssem batch:
- run intake
- inspect staged parser output
- run quality audit
- publish only truly ready rows
- verify any newly published rows

## 4. Evaluate blocker stage after parser hardening
End by stating clearly whether Hanssem is now:
- `supported_operational`
- `supported_operational only for limited categories/cases`
- `experimental`
- `quality_blocked`
- still `parse_blocked`

Support the decision with observed outcomes, not optimism.

## 5. Geometry note only as observation
Do not implement geometry hardening here unless a tiny clearly-safe step is unavoidable.
Only record whether Hanssem appears likely to need later dimension-specific work.

## 6. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- current outbound URL review policy
- geometry contract v1

# Completion Criteria
- Hanssem structure was actually analyzed
- Hanssem parser now produces real identity output on a small batch
- The workflow can classify Hanssem rows with evidence
- Only truly ready rows are published
- Final Hanssem source status is stated honestly
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
- exact identity-field failures before changes
- exact changes made
- exact intake/audit/publish/verify outcomes
- final Hanssem source-status recommendation

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Hanssem structure analysis and previous parser gap
3. What changed
4. Post-hardening intake / audit / publish / verify results
5. Final Hanssem source-status conclusion
6. Deferred items and why
7. Validation results
8. Final approval recommendation