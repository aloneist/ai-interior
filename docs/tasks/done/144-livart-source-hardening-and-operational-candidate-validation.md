# Goal
Harden Livart intake just enough to determine whether it can become the next operationally supported seller source after IKEA.

# Scope
This task is limited to:
- inspecting Livart product-page intake behavior
- identifying why required fields fail today
- making small source-specific extraction/fetch improvements if justified
- rerunning intake -> audit -> publish -> verify on a small Livart batch
- documenting whether Livart can advance from `quality_blocked` toward operational support

This is not a broad multi-seller expansion task and not a UX task.

# Primary Objective
Determine whether Livart can become a practical next supported source by closing the specific extraction gaps that currently block publish-quality gates.

# Allowed Changes
- Add or update small Livart-specific parsing/extraction logic
- Add or update small fetch normalization or page parsing helpers if required
- Add or update small tests/fixtures/logging only if useful for this source-hardening step
- Add or update small operational docs/runbook notes for Livart intake validation
- Use the existing intake, audit, publish, and verify workflows

# Disallowed Changes
- Do not redesign recommendation ranking/scoring
- Do not redesign the app UX
- Do not broaden into a generic parser framework redesign
- Do not loosen publish-quality gates just to make Livart pass
- Do not add broad schema changes
- Do not jump to Todayhouse/Hanssem work in this step unless strictly needed for comparison
- Do not force publish blocked or ambiguous rows

# Critical Safety Rule
Do not declare Livart "supported" unless a small real batch can successfully go through intake, quality audit, publish, and post-publish verification to the current standard.

# Working Principles
- Smallest viable source hardening
- Preserve current quality gates
- Evidence over optimism
- Prefer source-specific correction over speculative generic heuristics
- End with an honest source status decision
- Keep canonical product and publish contracts unchanged

# Required Behavior / Structure

## 1. Reproduce the current Livart failure mode
Use a small Livart product batch and confirm the current failure pattern.
At minimum capture whether these fields are missing or unreliable:
- product name
- category
- price
- primary image
- outbound/product URL if relevant

## 2. Identify the actual cause
Determine whether Livart is currently blocked because of:
- fetch content shape
- HTML structure mismatch
- parser selector mismatch
- extraction normalization failure
- price/category parsing weakness
- image extraction weakness

Do not guess. Show the actual failure mode.

## 3. Apply only small Livart-specific hardening
Implement only the minimum changes needed to improve deterministic extraction for required publish fields.

Priority fields:
- name
- category
- price
- primary image

Nice-to-have fields may remain warning-level if the current rules allow.

## 4. Re-run operational validation on a small Livart batch
After the source-specific hardening:
- run intake
- run quality audit
- publish only rows that are truly ready
- run post-publish verification on anything published

The result should show whether Livart remains blocked, becomes warning-level, or becomes operationally usable.

## 5. Produce a source-status conclusion
End with one explicit recommendation:
- Livart is now `supported_operational`
- Livart is still `quality_blocked`
- Livart improved but remains `experimental`
- Livart should be deprioritized for now

Support that conclusion with observed batch results, not hopes.

## 6. Preserve current contracts
Do not regress:
- canonical product identity
- current publish helper semantics
- current quality-gate logic
- outbound URL review policy

# Completion Criteria
- Livart failure mode is concretely identified
- Any hardening remains small and source-specific
- A small Livart batch is revalidated through intake/audit/publish/verify
- Final Livart status is stated honestly
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
- exact field failures before changes
- exact changes made
- exact audit classification after changes
- exact publish/verify results
- final source-status recommendation

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Livart batch and failure mode observed
3. What changed
4. Post-hardening intake / audit / publish / verify results
5. Final Livart source-status conclusion
6. Deferred items and why
7. Validation results
8. Final approval recommendation