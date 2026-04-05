# Goal
Add the fourth practical runtime bridge batch for the AI-INTERIOR automation system so the current runtime bridge surface can be verified and inspected as one coherent operator-facing bundle.

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
1. extend runtime HTTP verification so it covers the two new inspection/reference routes
2. add one narrow route that returns a safe runtime bridge overview bundle
3. keep all of this reviewable and aligned with existing runtime bridge behavior

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Reuse the existing runtime bridge metadata and contracts instead of duplicating them.
3. Keep routes narrow and explicitly scoped to automation inspection only.
4. Expose only safe summary-level information and reference structures.
5. Keep the diff reviewable and avoid broad runtime integration.

# Allowed Changes
- Narrow updates to automation/demo/verify-runtime-bridges-http.mjs
- Add one narrow runtime overview route under app/api/automation/*
- Small shared helper additions if strictly required
- Small automation docs updates directly related to the new verification and overview route

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No broad admin dashboard work
- No broad API framework expansion
- No unrelated refactor
- No secret value exposure in responses

# Critical Safety Rule
The new route and verifier updates must not execute blocked work and must not expose secrets or unsafe internal payloads.
They are inspection/verification only.

# Working Principles
- Prefer the smallest useful runtime-inspection bundle
- Reuse existing route contract knowledge
- Make runtime bridge verification less ad hoc
- Preserve current automation behavior

# Batch Contents

## A. Extend the runtime HTTP verifier
Update the existing verifier so it also checks:
- GET /api/automation/routes
- GET /api/automation/approval-response/sample

This should replace the current ad hoc local verification done outside the verifier.

Rules:
- keep the same script-based narrow approach
- do not broaden into a general e2e framework
- keep the current three verified routes and add only these two

## B. Add one safe runtime overview bundle route
Add one narrow GET route such as:
- app/api/automation/overview/route.ts

The route should return a safe bundle of current bridge surface information, derived from existing sources such as:
- readiness summary
- route inventory summary
- approval-response sample summary/reference pointers

It should be:
- safe summary only
- secret-free
- reviewable
- useful for operators who want one inspection endpoint

Rules:
- do not duplicate unsafe deep payloads
- do not create a broad API spec system
- do not imply resume behavior

## C. Minimal doc alignment
Update only the minimum docs needed so operators know:
- the verifier now covers all current runtime bridge endpoints
- where the overview route lives
- what it is for
- what it explicitly does not do

# Required Behavior / Structure
The result should make it clear:
1. that runtime verification now covers the current bridge surface more completely
2. where the overview route lives
3. how the overview route reuses safe existing metadata
4. that no risky execution resume exists
5. how operators should use the verifier and overview route together

# Completion Criteria
Complete only when:
- the runtime HTTP verifier covers the current main runtime bridge routes, including the new inspection/reference routes
- the repo has one real safe automation overview endpoint
- both verification and route behavior remain narrow and reviewable
- current no-resume safety behavior remains unchanged
- docs are minimally aligned
- diff remains practical

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke
- npm run automation:runtime:http:verify
- local route-level verification only if still needed after verifier expansion

# Required Result Format
Return:
1. Files changed
2. What runtime bridge batch-4 changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary