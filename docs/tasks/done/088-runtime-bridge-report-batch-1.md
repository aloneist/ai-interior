# Goal
Add the first operator-friendly runtime bridge report flow for the AI-INTERIOR automation system.

# Scope
This task is for automation/runtime integration only.

Primary target area:
- automation/demo/*
- package.json
- automation/README.md
- automation/operator-runbook.md
- related helper files only if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Bundle the next practical runtime step into one narrow batch:
1. add one machine-readable runtime bridge report output for the local runtime inspection flow
2. add one concise human-readable final summary for that same local runtime inspection flow
3. keep both derived from the same shared inspection result instead of creating parallel reporting paths

# Required Design Direction
The design must follow these rules:

1. Do not change runtime bridge behavior in this task.
2. Do not change what the local inspection command checks.
3. Reuse the existing local inspection/runtime bridge helper setup.
4. Keep the diff narrow and reviewable.
5. Preserve current safe behavior.

# Allowed Changes
- Narrow updates to automation/demo/inspect-runtime-bridges.mjs
- Narrow updates to automation/demo/runtime-bridge-local.mjs only if strictly required
- Narrow updates to package.json if one extra operator-facing alias is clearly helpful
- Small automation docs updates directly related to the new runtime bridge report output

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
This task is only about improving reporting/output for the existing local runtime inspection flow.

# Working Principles
- Prefer one shared inspection result object
- Derive both human summary and machine-readable output from the same source
- Keep output concise and operator-friendly
- Preserve current no-secret / no-persistence / no-resume behavior

# Batch Contents

## A. Shared runtime inspection result shape
Refactor the current local inspection command so it builds one shared in-memory inspection result object that includes:
- inspected route list
- route HTTP status results
- readiness/overview/status consistency checks if already part of current flow
- overall pass/fail
- safety-related summary flags if already inferable

Do not broaden what is inspected. Just centralize the existing result shape.

## B. Human-readable final summary
Add one concise final summary block to the local inspection command that makes it easy to see:
- overall pass/fail
- inspection route coverage
- key route health
- safety posture summary
- no-resume summary

## C. Machine-readable runtime bridge report
Add one machine-readable JSON report block for the same inspection run, derived from the same shared result object.

At minimum include:
- generatedAt
- overallStatus
- inspectedRouteCount
- routes
- keySummary
- safetySummary

Prefer stdout output first.
Optional local file output is allowed only if it is truly small and clearly justified.

## D. Minimal doc alignment
Update only the minimum docs needed so operators know:
- which command produces the runtime bridge report
- where to read the final summary
- where to read the JSON block
- that route behavior itself is unchanged

# Required Behavior / Structure
The result should make it clear:
1. that the local inspection flow now produces one shared report source
2. how operators read the human summary
3. how machine-readable output can be consumed
4. that no risky execution resume exists

# Completion Criteria
Complete only when:
- the local inspection flow still checks the same runtime bridge surface
- one shared result object drives both human summary and JSON report
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

# Required Result Format
Return:
1. Files changed
2. What runtime bridge report changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary