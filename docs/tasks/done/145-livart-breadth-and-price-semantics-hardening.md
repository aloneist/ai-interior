# Goal
Push Livart intake closer to IKEA-level deterministic support by validating broader category coverage and tightening price semantics enough to make an honest source-support decision.

# Scope
This task is limited to:
- validating Livart across a broader but still small multi-category batch
- checking discounted vs non-discounted price semantics
- applying only small Livart-specific hardening where needed
- rerunning intake -> audit -> publish -> verify
- ending with a clear Livart support-status decision

This is not a broad multi-seller task and not a UX task.

# Primary Objective
Determine whether Livart can move from `experimental` to `supported_operational`, or whether support should remain limited by category or price-case uncertainty.

# Allowed Changes
- Add or update small Livart-specific parsing/extraction logic
- Add or update small normalization logic for deterministic Livart price extraction
- Add or update tiny source-specific tests/fixtures/logging if useful
- Add or update a small operational validation artifact/runbook note
- Use the existing intake, audit, publish, and verify workflows

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser-architecture rewrite
- Do not loosen publish-quality gates to make Livart pass
- Do not add broad schema changes
- Do not jump to Hanssem/Todayhouse expansion in this step
- Do not force publish blocked or ambiguous rows

# Critical Safety Rule
Do not declare Livart operationally supported unless a broader real batch—including price variation cases—can pass the current intake, audit, publish, and verify standard without hiding uncertainty.

# Working Principles
- Validate breadth, not just a happy-path pair
- Preserve current quality gates
- Prefer deterministic source-specific correction over vague heuristics
- Treat price semantics as a first-class publish-quality concern
- End with an honest support-status conclusion
- Keep canonical product and publish contracts unchanged

# Required Behavior / Structure

## 1. Build a broader Livart validation batch
Use a small but intentionally varied Livart batch.

Try to include:
- at least 2-3 categories beyond the already-tested sofa cases if practical
- discounted and non-discounted product pages
- pages that may expose base price / sale price / variant price differences
- pages that still represent realistic operator value

Keep the batch small enough to inspect carefully.

## 2. Reproduce and inspect Livart extraction behavior
For the batch, inspect how Livart currently extracts:
- product name
- category
- price
- primary image
- source/outbound URL
- any obvious product presentation fields relevant to publish quality

Show where price semantics are still unclear or wrong if they exist.

## 3. Harden Livart only where needed
Apply only the smallest Livart-specific changes needed to improve deterministic extraction across the broader batch.

Priority:
1. correct operational price field
2. category robustness
3. image reliability
4. any remaining product-name issues

Do not overbuild and do not loosen the gates.

## 4. Re-run operational validation
On the broadened Livart batch:
- run intake
- run quality audit
- publish only truly ready rows
- verify every published row

If some rows remain warning/block/manual-review, keep them that way honestly.

## 5. Make a support decision
End with one explicit recommendation:
- Livart is now `supported_operational`
- Livart is `supported_operational` only for limited categories/cases
- Livart remains `experimental`
- Livart should be deprioritized for now

Support the decision with observed results, especially around price semantics and category breadth.

## 6. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- outbound URL review policy

# Completion Criteria
- A broader Livart batch was actually validated
- Price semantics were explicitly checked, not assumed
- Any hardening remained small and Livart-specific
- Intake -> audit -> publish -> verify was re-run on the broadened batch
- Final Livart support status was stated honestly
- No quality-gate loosening or product/runtime drift
- Build/lint/type checks pass if code changed

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` if code changed
- `npm run lint` if code changed
- `npm run build` if code changed

Also report:
- exact Livart URLs/batch used
- exact price/category/image issues observed before changes
- exact changes made
- exact audit classifications after changes
- exact publish/verify outcomes
- final Livart support recommendation

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Livart batch and coverage used
3. Price/category/image issues observed
4. What changed
5. Post-hardening intake / audit / publish / verify results
6. Final Livart support-status conclusion
7. Deferred items and why
8. Validation results
9. Final approval recommendation