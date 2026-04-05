# Goal
Add the fifth practical runtime bridge batch for the AI-INTERIOR automation system so operators can perform safe write-path simulation and inspect the current runtime bridge surface with less ambiguity.

# Scope
This task is for automation/runtime integration only.

Primary target area:
- app/api/automation/*
- automation/demo/verify-runtime-bridges-http.mjs
- automation/README.md
- automation/operator-runbook.md
- related automation/runtime helper files if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Bundle the next practical runtime step into one narrow batch:
1. add one safe route that simulates an approval-required write-path request through the current automation execution boundary
2. expose the result as an inspection/verification response only
3. extend the verifier so it covers that new route

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Do not execute real write/admin operations in this task.
3. Reuse the existing execution boundary and approval-required path instead of duplicating logic.
4. Keep routes narrow and explicitly scoped to automation verification only.
5. Keep the diff reviewable and avoid broad runtime integration.

# Allowed Changes
- Add one narrow runtime simulation route under app/api/automation/*
- Narrow updates to the verifier so it covers the new route
- Small shared helper additions only if strictly required
- Small automation docs updates directly related to the new route

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No broad admin dashboard work
- No broad API framework expansion
- No unrelated refactor
- No secret value exposure in responses

# Critical Safety Rule
The new route must not execute blocked risky work.
It must only run the current approval boundary and return the existing structured result.

# Working Principles
- Prefer the smallest useful simulation route
- Reuse the existing execution/approval chain
- Make the approval boundary inspectable through runtime
- Preserve current automation behavior

# Batch Contents

## A. Approval-boundary simulation route
Add one narrow POST route such as:
- app/api/automation/approval-boundary-test/route.ts

The route should:
- trigger one fixed safe simulation of an approval-required capability (for example `catalog.write.safe`)
- run through the current execution boundary
- return the existing structured approval-required result shape
- make it obvious that:
  - execution was blocked
  - approval metadata exists
  - no risky execution happened

Rules:
- do not accept arbitrary capability ids from callers
- do not expose a general execution surface
- use one fixed safe simulation only

## B. Extend runtime verifier coverage
Update the existing runtime HTTP verifier so it also checks:
- POST /api/automation/approval-boundary-test

The verifier should confirm:
- the route responds successfully
- it returns an approval-required path
- no execution resume happened
- no unsafe broad execution surface is implied

## C. Minimal doc alignment
Update only the minimum docs needed so operators know:
- what the new route is for
- that it is simulation-only
- that it proves the approval boundary from app runtime
- that it does not execute blocked work

# Required Behavior / Structure
The result should make it clear:
1. where the new simulation route lives
2. how it reuses the existing approval boundary
3. what safe result shape it returns
4. how the verifier checks it
5. that no risky execution resume exists

# Completion Criteria
Complete only when:
- the repo has one real safe approval-boundary simulation route
- the verifier covers it
- current no-resume and no-write safety behavior remains unchanged
- docs are minimally aligned
- diff remains narrow and practical

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke
- npm run automation:runtime:http:verify

# Required Result Format
Return:
1. Files changed
2. What runtime bridge batch-5 changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary