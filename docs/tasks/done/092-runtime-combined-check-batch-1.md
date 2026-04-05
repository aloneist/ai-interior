# Goal
Add the first combined runtime-check flow for the AI-INTERIOR automation system so operators and CI can review one consolidated runtime result without changing current route behavior.

# Scope
This task is for automation/runtime integration only.

Primary target area:
- automation/demo/*
- package.json
- .github/workflows/ci.yml
- automation/README.md
- automation/operator-runbook.md
- related helper files only if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Bundle the next practical runtime step into one narrow batch:
1. add one combined local runtime-check command that runs the existing runtime inspect and runtime verify flows
2. build one combined in-memory report from the existing inspect/verify JSON reports
3. emit one concise human summary and one combined JSON report
4. preserve that combined report as one CI artifact

# Required Design Direction
The design must follow these rules:

1. Do not change what inspect checks.
2. Do not change what verify checks.
3. Do not change runtime route behavior.
4. Reuse the existing inspect and verify report flows instead of duplicating their logic.
5. Keep the diff narrow and reviewable.

# Allowed Changes
- Narrow additions under automation/demo/*
- Narrow update to package.json
- Narrow update to .github/workflows/ci.yml
- Small automation docs updates directly related to the combined runtime-check flow
- Small helper extraction only if strictly required for combining existing report artifacts

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No route behavior changes
- No broad tooling redesign
- No unrelated refactor
- No secret value exposure

# Critical Safety Rule
Do not broaden automation behavior.
This task is only about combining existing inspect/verify results into one operator/CI-friendly runtime-check output.

# Working Principles
- Prefer reuse over reimplementation
- Keep inspect as report-oriented
- Keep verify as assertion-oriented
- Build the combined result from their existing JSON reports
- Preserve current no-secret / no-persistence / no-resume behavior

# Batch Contents

## A. Combined local runtime-check command
Add one operator-facing command such as:
- npm run automation:runtime:check

This command should:
- run the existing runtime inspect flow
- run the existing runtime verify flow
- not add new route checks
- produce one combined final human summary

Important:
- do not duplicate inspect/verify route logic
- orchestrate existing commands or shared report-producing helpers

## B. Combined machine-readable JSON report
Build one combined JSON report from the existing inspect and verify report outputs.

At minimum include:
- generatedAt
- overallStatus
- inspect:
  - overallStatus
  - inspectedRouteCount
  - keySummary
  - safetySummary
- verify:
  - overallStatus
  - verifiedRouteCount
  - keySummary
  - assertionSummary
  - safetySummary
- combinedSummary:
  - inspectOk
  - verifyOk
  - runtimeSurfaceCovered
  - safetyBoundariesHeld

The combined report should come from existing inspect/verify JSON results, not a parallel runtime check system.

## C. Optional file output
Add optional local file output for the combined runtime-check JSON report.

Preferred shape:
- use one explicit env toggle such as `AUTOMATION_RUNTIME_CHECK_REPORT_PATH`
- if set, write the exact combined JSON report to that path
- if unset, keep current behavior unchanged

## D. CI artifact flow
Add one narrow CI flow so CI preserves the combined runtime-check report as an artifact.

Preferred direction:
- after the existing inspect and verify CI steps/artifacts, generate one combined report from their JSON outputs
- upload it as one artifact such as:
  - `automation-runtime-check-report`

Keep behavior narrow:
- do not rerun route checks unnecessarily
- do not change smoke behavior
- do not remove existing inspect/verify artifacts unless there is a very strong reason

## E. Minimal doc alignment
Update only the minimum docs needed so operators know:
- which command produces the combined runtime check
- how to read the final summary
- how to read the combined JSON report
- how CI preserves the combined artifact
- that inspect/verify responsibilities remain distinct

# Required Behavior / Structure
The result should make it clear:
1. that inspect and verify still keep distinct roles
2. that the combined runtime-check flow reuses their existing outputs
3. that one combined human summary and one combined JSON report now exist
4. that CI preserves the combined report as an artifact
5. that no risky execution resume exists

# Completion Criteria
Complete only when:
- the repo has one combined local runtime-check command
- the combined report is built from existing inspect/verify outputs
- optional local file output exists
- CI preserves the combined runtime-check report as an artifact
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
- npm run automation:runtime:check
- optional run with `AUTOMATION_RUNTIME_CHECK_REPORT_PATH` set

# Required Result Format
Return:
1. Files changed
2. What combined runtime-check changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary