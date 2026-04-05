# Goal
Align the report contracts for the current automation runtime flows so inspect, verify, and combined check outputs are easier to consume consistently by operators and CI.

# Scope
This task is for automation/runtime integration only.

Primary target area:
- automation/demo/*
- package.json only if strictly required
- .github/workflows/ci.yml only if a very small artifact-name/path alignment is clearly needed
- automation/demo/README.md
- automation/operator-runbook.md
- related helper files only if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Bundle the next practical runtime step into one narrow batch:
1. define a small shared report-envelope shape for runtime inspect / runtime verify / runtime check
2. align the three runtime report producers to reuse that envelope shape
3. keep inspect/report, verify/assertion, and check/combined responsibilities distinct
4. keep CI artifacts and operator interpretation easier and more consistent

# Required Design Direction
The design must follow these rules:

1. Do not change what inspect checks.
2. Do not change what verify checks.
3. Do not change what check combines.
4. Do not change runtime route behavior.
5. Prefer alignment of report structure over adding new behavior.
6. Keep the diff narrow and reviewable.

# Allowed Changes
- Narrow updates to automation/demo/inspect-runtime-bridges.mjs
- Narrow updates to automation/demo/verify-runtime-bridges-http.mjs
- Narrow updates to automation/demo/run-runtime-check.mjs
- Small shared helper additions only if strictly required for report-envelope reuse
- Very small CI artifact-name/path alignment only if clearly justified
- Small automation docs updates directly related to the aligned report contract

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
This task is only about making existing runtime reports more consistent and easier to consume.

# Working Principles
- Prefer one shared runtime report-envelope pattern
- Keep inspect = report-oriented
- Keep verify = assertion-oriented
- Keep check = combined result
- Align only the outer contract shape, not the substantive role of each report
- Preserve current no-secret / no-persistence / no-resume behavior

# Batch Contents

## A. Shared runtime report envelope
Introduce one small shared runtime report-envelope pattern used by:
- inspect
- verify
- check

At minimum, align fields such as:
- generatedAt
- command
- purpose
- overallStatus
- reportKind
- sourceMode or sourceSummary if useful
- summary block name conventions
- safetySummary block presence

Do not force identical inner payloads where their responsibilities differ.
The goal is aligned outer structure, not artificial sameness.

## B. Inspect / Verify / Check alignment
Refine the three runtime report producers so they expose a clearer common top-level contract while preserving:
- inspect current-state/report-only character
- verify assertion/safety character
- check combined-result character

A good result should make it easier to consume the three reports together in CI or scripts.

## C. Optional tiny CI alignment
Only if clearly helpful, align artifact naming/path conventions or comments so the three runtime artifacts are easier to understand together.

Do not broadly restructure CI.

## D. Minimal doc alignment
Update only the minimum docs needed so operators know:
- inspect / verify / check still have different purposes
- their report envelopes are now more consistent
- CI artifacts remain distinct but easier to compare
- no route or execution behavior changed

# Required Behavior / Structure
The result should make it clear:
1. that inspect, verify, and check still have different responsibilities
2. that their runtime report envelopes are now more consistent
3. that operators and CI can compare/use them more easily
4. that no risky execution resume exists

# Completion Criteria
Complete only when:
- inspect, verify, and check keep their current behavioral roles
- their report contracts are more consistent at the outer envelope level
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

# Required Result Format
Return:
1. Files changed
2. What runtime report contract-alignment changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary