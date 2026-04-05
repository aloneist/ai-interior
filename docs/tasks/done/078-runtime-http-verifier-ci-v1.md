# Goal
Add the first narrow CI path for the automation runtime HTTP verifier in the AI-INTERIOR main repository.

# Scope
This task is for automation infrastructure only.

Primary target area:
- .github/workflows/ci.yml
- automation/operator-runbook.md only if a very small note is helpful
- automation/demo/README.md only if a very small note is helpful

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime redesign.

# Primary Objective
Make the new runtime HTTP verifier usable in CI in a narrow, controlled way, without changing the existing smoke or runtime bridge behavior.

# Required Design Direction
The design must follow these rules:

1. Do not change what smoke validates.
2. Do not change runtime bridge behavior.
3. Keep the CI addition narrow and practical.
4. Prefer one optional or clearly scoped verifier step over broad workflow expansion.
5. Keep the diff reviewable.

# Allowed Changes
- Narrow updates to .github/workflows/ci.yml
- Very small doc notes only if clearly helpful
- Small script/path alignment only if strictly required for CI execution

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No smoke assertion changes
- No broad CI redesign
- No unrelated cleanup

# Critical Safety Rule
Do not broaden automation behavior.
This task is only about letting CI run the existing runtime HTTP verifier in a controlled way.

# Working Principles
- Prefer the smallest useful CI hook
- Reuse the existing `npm run automation:runtime:http:verify`
- Keep current smoke and build flow intact
- Make failures easy to interpret
- Preserve current safe behavior

# Suggested V1 Direction
A good v1 implementation should:
- add one CI step for `npm run automation:runtime:http:verify`
- place it after the existing automation smoke step
- keep failure behavior explicit
- avoid broad matrix/concurrency/workflow restructuring

If needed:
- scope it to one job only
- keep logs/artifacts minimal
- do not change the existing smoke artifact path

# Required Behavior / Structure
The result should make it clear:
1. where the runtime HTTP verifier runs in CI
2. that it reuses the existing npm entrypoint
3. that existing smoke/build behavior remains intact
4. how operators should interpret verifier failures

# Completion Criteria
Complete only when:
- CI can run the runtime HTTP verifier
- current smoke behavior remains unchanged
- runtime verifier behavior remains unchanged
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint if code/workflow changes require it
- npx tsc --noEmit if code/workflow changes require it
- npm run automation:smoke
- npm run automation:runtime:http:verify
- inspect workflow diff carefully

# Required Result Format
Return:
1. Files changed
2. What CI runtime-verifier changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary