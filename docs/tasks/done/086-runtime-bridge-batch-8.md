# Goal
Add the eighth practical runtime bridge batch for the AI-INTERIOR automation system so operators can perform one narrow runtime bridge check from the app runtime and get a concise result over the current inspection surface.

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
1. add one operator-facing runtime bridge check route that performs a concise safe check over the existing inspection/runtime bridge surface
2. reuse the current shared builders and route inventory instead of duplicating route logic
3. extend the runtime HTTP verifier so it covers the new route too

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Reuse the existing shared runtime metadata/builders wherever possible.
3. Keep the new route narrow, summary-only, and operator-facing.
4. Expose only safe status/check information.
5. Keep the diff reviewable and avoid broad runtime integration.

# Allowed Changes
- Add one narrow runtime bridge check route under app/api/automation/*
- Narrow updates to shared runtime builders if strictly required
- Narrow updates to automation/demo/verify-runtime-bridges-http.mjs
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
The new route must not execute blocked work and must not expose secrets or unsafe internal payloads.
It is a summary-only operator check route.

# Working Principles
- Prefer the smallest useful operator-facing check layer
- Reuse current readiness/routes/overview/status/snapshot knowledge
- Make current runtime bridge posture faster to verify
- Preserve current automation behavior

# Batch Contents

## A. Automation runtime bridge check route
Add one narrow GET route such as:
- app/api/automation/check/route.ts

The route should return one concise operator-facing check result derived from existing sources such as:
- readiness summary
- status summary
- snapshot summary
- verifier coverage summary
- route inventory summary

The result should make it easy to answer:
- are the current automation runtime inspection routes available
- are send-side and receive-side bridge summaries present
- is verifier coverage present for the current bridge surface
- do the main safety flags still hold

Rules:
- no secrets
- no deep payload dumps
- no broad internal state
- summary/check only

## B. Extend runtime verifier coverage
Update the existing runtime HTTP verifier so it also checks:
- GET /api/automation/check

The verifier should confirm:
- the route responds successfully
- the route returns safe concise status/check data only
- the route is consistent enough with status/snapshot data
- no unsafe behavior is introduced

## C. Minimal doc alignment
Update only the minimum docs needed so operators know:
- where the check route lives
- when to use it vs readiness/status/snapshot
- what it is for
- what it explicitly does not do

# Required Behavior / Structure
The result should make it clear:
1. where the new check route lives
2. how it reuses existing shared runtime metadata/builders
3. that no risky execution resume exists
4. how operators should use it with the other inspection routes

# Completion Criteria
Complete only when:
- the repo has one concise runtime check route
- the verifier covers it
- current no-secret / no-persistence / no-resume safety behavior remains unchanged
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
2. What runtime bridge batch-8 changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary