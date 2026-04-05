# Goal
Add the first structured reporting flow for the runtime HTTP verifier in the AI-INTERIOR automation system.

# Scope
This task is for automation/runtime integration only.

Primary target area:
- automation/demo/verify-runtime-bridges-http.mjs
- .github/workflows/ci.yml
- automation/demo/README.md
- automation/operator-runbook.md
- related helper files only if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Bundle the next practical runtime step into one narrow batch:
1. make the runtime HTTP verifier build one shared in-memory verification result object
2. derive both a concise human-readable final summary and a machine-readable JSON report from that same shared result
3. allow optional file output for that JSON report
4. preserve that JSON report in CI as an artifact

# Required Design Direction
The design must follow these rules:

1. Do not change what the runtime HTTP verifier verifies.
2. Do not change runtime route behavior.
3. Reuse one shared in-memory verifier result object for all verifier outputs.
4. Keep the diff narrow and reviewable.
5. Preserve current safe behavior.

# Allowed Changes
- Narrow updates to automation/demo/verify-runtime-bridges-http.mjs
- Narrow updates to .github/workflows/ci.yml
- Small updates to automation/demo/README.md
- Small updates to automation/operator-runbook.md
- Small helper extraction only if strictly required for shared verifier reporting

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No route behavior changes
- No broad test/tooling redesign
- No unrelated refactor
- No secret value exposure

# Critical Safety Rule
Do not broaden automation behavior.
This task is only about improving output/reporting for the existing runtime HTTP verifier.

# Working Principles
- Prefer one shared verifier result object
- Derive human summary and JSON report from the same source
- Keep verifier focused on correctness/safety assertions
- Preserve current no-secret / no-persistence / no-resume behavior

# Batch Contents

## A. Shared runtime verifier result object
Refactor the current verifier so it builds one shared in-memory result object that includes:
- generatedAt
- overallStatus
- verifiedRouteCount
- verifiedRoutes
- keySummary
- safetySummary
- assertionSummary
- trusted/untrusted approval-response coverage
- approval-boundary simulation coverage

Do not broaden what is verified.
Only centralize the existing verification result shape.

## B. Human-readable final summary
Add one concise final summary block to the verifier output that makes it easy to see:
- overall pass/fail
- verified route coverage
- key assertion results
- safety posture summary
- no-resume summary

## C. Machine-readable JSON report
Add one machine-readable JSON report block for the same verifier run, derived from the same shared result object.

At minimum include:
- generatedAt
- overallStatus
- verifiedRouteCount
- routes
- keySummary
- assertionSummary
- safetySummary

Prefer stdout output first.

## D. Optional file output
Add optional local file output for the same verifier JSON report.

Preferred shape:
- use one explicit env toggle such as `AUTOMATION_RUNTIME_VERIFY_REPORT_PATH`
- if set, write the exact same verifier JSON report to that path
- if unset, keep current behavior unchanged

Requirements:
- stdout summary stays
- stdout JSON report stays
- file content comes from the same shared verifier result object

## E. CI artifact flow
Add one narrow CI artifact flow so CI preserves the verifier JSON report as an artifact.

Preferred direction:
- set `AUTOMATION_RUNTIME_VERIFY_REPORT_PATH` in the existing verifier CI step
- upload the generated file as one artifact such as:
  - `automation-runtime-http-verify-report`

Keep behavior narrow:
- do not change verifier semantics
- do not change smoke behavior
- do not remove the existing verifier text-log artifact unless there is a very strong reason

## F. Minimal doc alignment
Update only the minimum docs needed so operators know:
- `verify` now emits a final human summary and JSON report
- optional file output exists
- CI preserves the verifier JSON report artifact
- verifier remains the assertion/safety tool, not the report-only tool

# Required Behavior / Structure
The result should make it clear:
1. that the runtime HTTP verifier still checks the same bridge surface
2. that one shared result object drives summary, JSON stdout, and optional file output
3. that CI preserves the verifier JSON report as an artifact
4. that no risky execution resume exists

# Completion Criteria
Complete only when:
- the runtime HTTP verifier still checks the same bridge surface
- one shared verifier result object drives summary and JSON report output
- optional file output exists
- CI preserves the verifier JSON report as an artifact
- current safe behavior remains unchanged
- docs are minimally aligned
- diff remains narrow and practical

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke
- npm run automation:runtime:http:verify
- optional run with `AUTOMATION_RUNTIME_VERIFY_REPORT_PATH` set

# Required Result Format
Return:
1. Files changed
2. What runtime verifier report changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary