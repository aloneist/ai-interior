# Goal
Improve CI diagnostics for the automation runtime HTTP verifier without changing what it verifies.

# Scope
This task is for automation infrastructure only.

Primary target area:
- .github/workflows/ci.yml
- automation/demo/verify-runtime-bridges-http.mjs only if a tiny diagnostic-output adjustment is truly needed
- automation/operator-runbook.md only if a very small note is clearly helpful

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime redesign.

# Primary Objective
Make CI failures from the runtime HTTP verifier easier to diagnose by preserving useful verifier output and, if needed, a small structured diagnostic artifact.

# Required Design Direction
The design must follow these rules:

1. Do not change what the verifier verifies.
2. Do not change runtime bridge behavior.
3. Prefer narrow diagnostic preservation over broader CI redesign.
4. Keep the diff reviewable and practical.
5. Preserve current safe behavior.

# Allowed Changes
- Narrow updates to .github/workflows/ci.yml
- Very small updates to verify-runtime-bridges-http.mjs only if required to emit a cleaner diagnostic artifact or clearly delimited output
- Very small operator doc note only if clearly helpful

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
This task is only about preserving better CI diagnostics for verifier failures.

# Working Principles
- Prefer the smallest useful diagnostic improvement
- Reuse existing verifier output if possible
- Keep CI behavior easy to interpret
- Preserve existing smoke and verifier meaning

# Suggested V1 Direction
A good v1 implementation should do one or more of:
- preserve verifier stdout/stderr more clearly in CI logs
- upload a small verifier diagnostic artifact on failure
- delimit verifier output clearly in CI
- keep artifact generation narrow and local to verifier failures

If a diagnostic artifact is added, keep it small and text/JSON only.

# Required Behavior / Structure
The result should make it clear:
1. how CI preserves verifier diagnostics
2. when an artifact is uploaded, if applicable
3. that verifier behavior itself is unchanged
4. how operators should inspect failures

# Completion Criteria
Complete only when:
- CI makes verifier failures easier to diagnose
- current verifier behavior remains unchanged
- diff remains narrow and reviewable
- no runtime behavior was broadened

# Validation
Use repository reality. Prefer:
- npm run automation:runtime:http:verify
- npm run automation:smoke
- inspect workflow diff carefully
- npm run lint / npx tsc --noEmit only if code changed

# Required Result Format
Return:
1. Files changed
2. What verifier CI-diagnostic changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary