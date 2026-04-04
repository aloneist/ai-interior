# Goal
Add the first CI artifact flow for the automation smoke JSON report in the AI-INTERIOR main repository.

# Scope
This task is for automation infrastructure only.

Primary target area:
- .github/workflows/ci.yml
- automation/demo/run-smoke-test.ts only if truly needed for path alignment
- automation/demo/README.md if a tiny note is helpful

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime redesign.

# Primary Objective
Make CI preserve the machine-readable automation smoke report as a build artifact so operators can inspect the exact report from CI runs.

# Required Design Direction
The design must follow these rules:

1. Do not change what smoke validates.
2. Do not remove current stdout behavior, FINAL SUMMARY, JSON REPORT, or EXIT CODE CONTRACT.
3. Reuse the existing optional file output path for the JSON smoke report.
4. Keep the CI change narrow and practical.
5. Keep the diff reviewable.

# Allowed Changes
- Narrow updates to .github/workflows/ci.yml
- Narrow updates to automation/demo/README.md only if a short note is helpful
- Narrow updates to smoke runner only if a fixed stable output path is truly needed

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No smoke assertion changes
- No broad CI redesign
- No unrelated cleanup

# Critical Safety Rule
Do not change automation behavior.
This task is only about preserving the existing smoke JSON report from CI.

# Working Principles
- Prefer the smallest useful CI artifact flow
- Reuse AUTOMATION_SMOKE_REPORT_PATH
- Keep current smoke stdout behavior intact
- Make CI evidence easier to inspect after a run
- Preserve current safe behavior

# Suggested V1 Direction
A good v1 implementation should:
- set `AUTOMATION_SMOKE_REPORT_PATH` during the smoke step in CI
- keep `npm run automation:smoke` as the smoke command
- upload the generated JSON file as a CI artifact
- fail normally if smoke fails
- avoid broad workflow restructuring

# Required Behavior / Structure
The result should make it clear:
1. where CI writes the smoke JSON report
2. how CI uploads it
3. that smoke exit behavior remains the same
4. how operators can inspect the artifact later

# Completion Criteria
Complete only when:
- CI still runs smoke the same way
- the JSON smoke report is written in CI using the existing file-output path
- the report is uploaded as an artifact
- current smoke behavior remains unchanged
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint if code changed
- npx tsc --noEmit if code changed
- npm run automation:smoke
- inspect workflow diff carefully

# Required Result Format
Return:
1. Files changed
2. What CI smoke-report artifact changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary