# Goal
Make the automation smoke JSON report use a single shared in-memory source for both stdout and optional file output, without changing smoke behavior.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/demo/run-smoke-test.ts
- automation/demo/README.md

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime integration.

# Primary Objective
Eliminate divergence between the stdout JSON report and the optional file-based JSON report by building the report object once and reusing it for both outputs.

# Required Design Direction
The design must follow these rules:

1. Do not change what smoke validates.
2. Do not remove current detailed logs, FINAL SUMMARY, JSON REPORT, or EXIT CODE CONTRACT.
3. Keep stdout behavior intact.
4. Reuse one single report object for both stdout and optional file output.
5. Keep the diff narrow and reviewable.

# Allowed Changes
- Narrow updates to automation/demo/run-smoke-test.ts
- Narrow updates to automation/demo/README.md
- Small helper extraction only if strictly required for report reuse

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No contract logic changes
- No broad refactor
- No unrelated cleanup

# Critical Safety Rule
Do not change automation behavior or smoke assertions.
This task is only about making report output deterministic across stdout and file output.

# Working Principles
- Prefer the smallest deterministic fix
- Reuse the same final report object everywhere
- Keep all current human-readable output intact
- Preserve current safe behavior

# Suggested V1 Direction
At minimum:
- build one final smoke report object
- stringify that exact object for stdout JSON REPORT
- write that exact same serialized content to file output when AUTOMATION_SMOKE_REPORT_PATH is set
- avoid rebuilding the report separately for stdout and file output

# Required Behavior / Structure
The result should make it clear:
1. that stdout JSON and file JSON come from the same report object
2. that generatedAt and other shared fields are identical across both outputs
3. that current human-readable output remains unchanged
4. how operators should interpret the behavior

# Completion Criteria
Complete only when:
- smoke still validates the same behavior
- stdout output remains intact
- optional file output remains intact
- stdout JSON and file JSON are derived from one shared report object
- README explains this briefly if needed
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke
- AUTOMATION_SMOKE_REPORT_PATH=/tmp/automation-smoke-report.json npm run automation:smoke
- compare stdout JSON block and file JSON for identical generatedAt/report identity semantics if practical

# Required Result Format
Return:
1. Files changed
2. What single-source report changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary