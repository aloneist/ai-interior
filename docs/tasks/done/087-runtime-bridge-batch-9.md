# Goal
Add the ninth practical runtime bridge batch for the AI-INTERIOR automation system so operators can exercise the current automation runtime routes through one simple local command set without changing route behavior.

# Scope
This task is for automation/runtime integration only.

Primary target area:
- package.json
- automation/demo/*
- automation/operator-runbook.md
- automation/README.md
- related automation/runtime helper files if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Bundle the next practical runtime step into one narrow batch:
1. add one operator-friendly local entrypoint for safe runtime bridge inspection routes
2. add one operator-friendly local entrypoint for the fixed approval-boundary simulation route
3. keep both entrypoints thin wrappers over the existing runtime routes and verifier/runtime setup

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Do not add new runtime route behavior in this task unless a tiny response-shape clarification is strictly required.
3. Reuse the current runtime route surface and current verifier/runtime helpers where practical.
4. Keep the diff narrow and reviewable.
5. Preserve current safe behavior.

# Allowed Changes
- Narrow updates to package.json
- Narrow additions under automation/demo/* for local operator scripts if strictly required
- Small automation docs updates directly related to the new local entrypoints
- Tiny route-response clarifications only if absolutely necessary for stable local operator usage

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No broad API framework expansion
- No unrelated refactor
- No secret value exposure
- No broad local tooling system

# Critical Safety Rule
The new entrypoints must not broaden automation behavior.
They must only exercise the current safe runtime bridge routes and fixed simulation route.

# Working Principles
- Prefer the smallest useful operator-facing command layer
- Reuse existing route surface and current runtime verification setup
- Keep commands practical and repeatable
- Preserve current no-secret / no-persistence / no-resume behavior

# Batch Contents

## A. Runtime inspection local entrypoint
Add one simple local command such as:
- npm run automation:runtime:inspect

It should help operators hit the current safe inspection surface, for example:
- /api/automation/readiness
- /api/automation/routes
- /api/automation/overview
- /api/automation/status
- /api/automation/snapshot
- /api/automation/check
- /api/automation/approval-response/sample

The command should produce concise local output only.
It must not create a broad framework.

## B. Approval-boundary simulation local entrypoint
Add one simple local command such as:
- npm run automation:runtime:approval-boundary:test

It should hit:
- POST /api/automation/approval-boundary-test

The command should make it obvious that:
- the route is fixed-scope
- approval-required is returned
- no risky execution happened
- no resume behavior exists

## C. Minimal doc alignment
Update only the minimum docs needed so operators know:
- which command to use for runtime inspection
- which command to use for approval-boundary simulation
- what each command is for
- what they explicitly do not do

# Required Behavior / Structure
The result should make it clear:
1. what operator commands exist for runtime bridge usage
2. how they map to the current runtime bridge routes
3. that they do not add new execution behavior
4. how operators should use them together with the existing runtime HTTP verifier

# Completion Criteria
Complete only when:
- the repo has one operator-friendly local inspection entrypoint
- the repo has one operator-friendly local approval-boundary simulation entrypoint
- current safe behavior remains unchanged
- docs are minimally aligned
- diff remains narrow and practical

# Validation
Use repository reality. Prefer:
- npm run lint if code changes require it
- npx tsc --noEmit if code changes require it
- npm run automation:smoke
- npm run automation:runtime:http:verify
- run the new local entrypoints if added

# Required Result Format
Return:
1. Files changed
2. What runtime bridge batch-9 changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary