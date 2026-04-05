# Goal
Add the first machine-readable artifact flow for the local/runtime bridge inspection report in the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/demo/inspect-runtime-bridges.mjs
- package.json
- .github/workflows/ci.yml
- automation/demo/README.md
- automation/operator-runbook.md
- related helper files only if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Extend the runtime bridge local inspection flow so its existing shared JSON report can optionally be written to a file, and make CI preserve that file as an artifact, without changing route behavior or inspection scope.

# Required Design Direction
The design must follow these rules:

1. Do not change what the local inspection flow checks.
2. Do not change runtime route behavior.
3. Reuse the existing shared inspection result/report object.
4. Keep file output optional and explicit.
5. Keep the diff narrow and reviewable.

# Allowed Changes
- Narrow updates to automation/demo/inspect-runtime-bridges.mjs
- Narrow update to package.json only if one operator-facing alias is clearly helpful
- Narrow updates to .github/workflows/ci.yml
- Small automation docs updates directly related to the new report artifact flow

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No route behavior changes
- No broad test/tooling expansion
- No unrelated refactor
- No secret value exposure

# Critical Safety Rule
Do not broaden automation behavior.
This task is only about preserving the existing runtime inspection report as optional file output and CI artifact evidence.

# Working Principles
- Prefer one shared inspection result object
- Reuse the same JSON report for stdout and optional file output
- Keep current human-readable summary intact
- Preserve current safe behavior

# Batch Contents

## A. Optional runtime inspect report file output
Extend the current local runtime inspection command so it can optionally write its existing JSON report to a local file.

Preferred shape:
- use one explicit env toggle such as `AUTOMATION_RUNTIME_INSPECT_REPORT_PATH`
- if set, write the exact same JSON report to that path
- if unset, keep current behavior unchanged

Requirements:
- stdout FINAL SUMMARY stays
- stdout JSON REPORT stays
- file content comes from the same shared report object

## B. Optional operator-friendly npm alias if clearly helpful
If helpful and still narrow, add one operator-facing alias such as:
- `automation:runtime:inspect:report`

Only do this if it clearly improves operator usability and stays thin.

## C. CI artifact flow
Add one narrow CI step flow so CI can preserve the runtime inspect JSON report as an artifact.

Preferred direction:
- set `AUTOMATION_RUNTIME_INSPECT_REPORT_PATH` in the existing runtime inspect/verifier-related CI path if appropriate
- upload the generated file as one artifact such as:
  - `automation-runtime-inspect-report`

Keep behavior narrow:
- do not broadly restructure CI
- do not change smoke behavior
- do not change verifier semantics

## D. Minimal doc alignment
Update only the minimum docs needed so operators know:
- which command emits the runtime inspect report
- where to read the final summary
- where to read the JSON block
- how CI preserves the runtime inspect artifact
- that route behavior itself is unchanged

# Required Behavior / Structure
The result should make it clear:
1. that the local/runtime inspection flow still checks the same route surface
2. that one shared report object drives stdout and optional file output
3. that CI preserves the report as an artifact
4. that no risky execution resume exists

# Completion Criteria
Complete only when:
- the runtime inspection flow still checks the same route surface
- one shared report object drives stdout and optional file output
- CI preserves the runtime inspection report as an artifact
- current safe behavior remains unchanged
- docs are minimally aligned
- diff remains narrow and practical

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke
- npm run automation:runtime:http:verify
- npm run automation:runtime:inspect
- optional run with `AUTOMATION_RUNTIME_INSPECT_REPORT_PATH` set

# Required Result Format
Return:
1. Files changed
2. What runtime inspect report artifact changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary