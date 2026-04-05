# Goal
Improve the stability of the automation runtime HTTP verifier without changing what it verifies.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/demo/verify-runtime-bridges-http.mjs
- automation/operator-runbook.md only if a tiny note is clearly helpful
- automation/demo/README.md only if a tiny note is clearly helpful

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime redesign.

# Primary Objective
Reduce the risk of flaky runtime-HTTP verification by tightening local server startup, port handling, and readiness checks while preserving the exact same verification scope.

# Required Design Direction
The design must follow these rules:

1. Do not change what the verifier verifies.
2. Do not change runtime bridge behavior.
3. Prefer narrow stability improvements over broader test-framework changes.
4. Keep the diff reviewable and practical.
5. Preserve current safe behavior.

# Allowed Changes
- Narrow updates to automation/demo/verify-runtime-bridges-http.mjs
- Very small doc notes only if clearly helpful
- Small helper extraction only if strictly required for startup/readiness stability

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No smoke assertion changes
- No broad e2e framework introduction
- No unrelated refactor

# Critical Safety Rule
Do not broaden automation behavior.
This task is only about making the existing verifier more reliable.

# Working Principles
- Prefer the smallest useful stability fix
- Keep the same three verified routes
- Make startup failures easier to diagnose
- Reduce avoidable port/startup flake
- Preserve current verification meaning

# Suggested V1 Direction
Focus on narrow stability issues such as:
- avoid brittle fixed-port assumptions if a safer approach is practical
- add explicit readiness polling for the Next dev server
- add explicit readiness polling for the webhook capture server
- improve failure messages for startup timeout / port conflict cases
- keep the verifier script-based and narrow

Do not expand into a general test harness.

# Required Behavior / Structure
The result should make it clear:
1. how the verifier waits for local servers to be ready
2. how port/startup failures are handled
3. that the same route checks still run
4. that no-resume behavior remains unchanged

# Completion Criteria
Complete only when:
- the verifier still checks the same three runtime bridges
- startup/readiness behavior is more stable or diagnosable
- current safe behavior remains unchanged
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run automation:runtime:http:verify
- npm run automation:smoke
- npm run lint if code style requires it
- npx tsc --noEmit if code changes require it

# Required Result Format
Return:
1. Files changed
2. What verifier-stability changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary