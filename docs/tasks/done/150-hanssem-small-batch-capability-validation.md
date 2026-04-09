# Goal
Validate whether Hanssem can become the next operational seller source by running a small real batch through the current intake, quality-gate, publish, verify, and geometry-contract path.

# Scope
This task is limited to:
- selecting a small Hanssem product-page batch
- running the existing intake/import workflow on that batch
- auditing the resulting staged rows through the current quality-gate workflow
- publishing only truly ready rows
- verifying published rows
- evaluating whether Hanssem is operationally viable, blocked, or still experimental

This is not a broad multi-seller task and not a UX task.

# Primary Objective
Determine, with real evidence, where Hanssem currently stands in the source capability ladder:
- supported_operational
- quality_blocked
- parse_blocked
- fetch_blocked
- experimental
- still effectively untested

# Allowed Changes
- Add or update small Hanssem-specific parsing/extraction logic only if a real and narrow execution blocker is identified
- Add or update tiny source-specific tests/fixtures/logging if useful
- Add or update a small operational validation artifact/runbook note
- Use the existing intake, audit, publish, verify, and geometry-contract workflows
- Make tiny contract-preserving fixes only if required by a real Hanssem execution blocker

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser-framework rewrite
- Do not loosen publish-quality gates just to improve throughput
- Do not expand into Todayhouse/Livart work in this step unless strictly required for comparison
- Do not redesign schema or canonical product contracts
- Do not force publish blocked or ambiguous rows

# Critical Safety Rule
The goal is to measure real Hanssem capability honestly, not to maximize publish count. If Hanssem fails at fetch, parse, quality, or publish, report that stage clearly instead of pushing rows through.

# Working Principles
- Small real batch over broad speculation
- Keep the current geometry contract intact
- Preserve current publish and canonical product semantics
- Use evidence to separate fetch issues, parse issues, and quality-gate issues
- Publish only what is truly ready
- End with a clear Hanssem source-status decision

# Required Behavior / Structure

## 1. Select a small Hanssem batch
Choose a small but useful Hanssem batch.

Try to include:
- at least 2-4 product pages
- more than one product category if practical
- at least one page likely to expose dimensions/specs
- at least one page that may reveal price/category extraction weaknesses if they exist

Keep the batch small enough to inspect carefully.

## 2. Run real intake
Run the current import/intake flow on the batch and record:
- whether fetch succeeds
- whether staging rows are created
- whether parser output is populated
- whether geometry-relevant fields appear when the source exposes them

## 3. Run the quality audit
Audit the staged rows and classify them into the current gate model:
- `publish_ready`
- `publish_allowed_with_warning`
- `publish_blocked`
- `manual_review_required`

Also identify whether any failure is really:
- fetch-blocked
- parse-blocked
- quality-blocked
- or a narrower source-specific issue

## 4. Publish only the truly ready subset
If any Hanssem rows are genuinely ready, publish them.
Do not force through warning/block/manual-review rows.

## 5. Verify every published row
Run post-publish verification on all newly published Hanssem rows, including:
- canonical row existence
- linkage correctness
- required fields survival
- outbound URL presence/reviewability
- geometry field retention if present

## 6. Evaluate geometry-contract compatibility
Check whether Hanssem, in the sampled batch:
- carries usable dimensions at all
- uses units/patterns that fit the geometry contract
- appears likely to require source-specific dimension hardening later

Do not overbuild geometry support here unless a tiny narrowly-scoped fix is clearly justified.

## 7. End with a source-status conclusion
Choose one honest conclusion:
- Hanssem is now `supported_operational`
- Hanssem is `supported_operational` only for limited categories/cases
- Hanssem is `experimental`
- Hanssem is `quality_blocked`
- Hanssem is `parse_blocked`
- Hanssem is `fetch_blocked`
- Hanssem should be deprioritized for now

Support the conclusion with observed batch behavior, not optimism.

# Completion Criteria
- A real Hanssem batch was actually ingested
- The current workflow classified Hanssem with evidence
- Only truly ready rows were published
- Published rows were verified
- Hanssem’s likely next blocker stage is clearly identified
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
- exact intake/audit outcomes
- exact publish/verify outcomes
- any geometry-related observations
- final Hanssem source-status recommendation

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Hanssem batch and intake outcomes
3. Audit classification and blocker stage
4. Publish / verify results
5. Geometry-contract observations
6. Final Hanssem source-status conclusion
7. Deferred items and why
8. Validation results
9. Final approval recommendation