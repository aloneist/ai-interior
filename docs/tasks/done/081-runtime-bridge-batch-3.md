# Goal
Add the third practical runtime bridge batch for the AI-INTERIOR automation system so operators can inspect bridge metadata and validate bridge usage more directly from the app runtime.

# Scope
This task is for automation/runtime integration only.

Primary target area:
- app/api/automation/*
- automation/README.md
- automation/operator-runbook.md
- related automation/runtime helper files if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Bundle the next practical runtime step into one narrow batch:
1. add one route that exposes the current automation route/contract inventory in safe summary form
2. add one route that returns a safe sample payload/reference for the approval-response bridge
3. keep both routes narrow, reviewable, and aligned with existing runtime bridge behavior

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Reuse the existing runtime bridge contracts and route metadata where possible.
3. Keep routes narrow and explicitly scoped to automation inspection only.
4. Expose only safe summary-level information and sample structures.
5. Keep the diff reviewable and avoid broad runtime integration.

# Allowed Changes
- Add one narrow inventory/manifest route under app/api/automation/*
- Add one narrow sample/reference route under app/api/automation/*
- Small shared helper additions if strictly required
- Small automation docs updates directly related to the new runtime bridges

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No broad admin dashboard work
- No broad API framework expansion
- No unrelated refactor
- No secret value exposure in responses

# Critical Safety Rule
The new routes must not execute blocked work and must not expose secrets or unsafe internal payloads.
They are inspection/reference routes only.

# Working Principles
- Prefer the smallest useful runtime-inspection bridges
- Reuse existing route contract knowledge
- Make send-side and receive-side usage easier to inspect
- Preserve current automation behavior

# Batch Contents

## A. Automation route inventory route
Add one narrow GET route such as app/api/automation/routes/route.ts that returns safe summary metadata for the current automation runtime routes, for example:
- route path
- method(s)
- purpose
- auth required yes/no
- approval-only / read-only / inspection-only classification
- no-resume flag if applicable

Rules:
- no secret/config values
- no unsafe deep dumps
- summary only

## B. Approval-response sample route
Add one narrow GET route such as app/api/automation/approval-response/sample/route.ts that returns:
- the safe request shape for POST /api/automation/approval-response
- required context fields
- auth requirement description
- one safe example payload
- one safe example response skeleton if useful

Rules:
- do not create a full external API spec system
- do not expose secrets
- do not imply resume behavior

## C. Small operator-doc alignment
Update only the minimum docs needed so operators know:
- where to inspect current runtime bridge inventory
- where to fetch the safe approval-response sample shape
- what these routes are for
- what they explicitly do not do

# Required Behavior / Structure
The result should make it clear:
1. where the new inspection/reference routes live
2. how they help operators inspect the current runtime bridge surface
3. that no risky execution resume exists
4. how operators should use these routes

# Completion Criteria
Complete only when:
- the repo has one real automation route inventory bridge
- the repo has one real approval-response sample/reference bridge
- both routes are narrow and reviewable
- current no-resume safety behavior remains unchanged
- docs are minimally aligned
- diff remains narrow and practical

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke
- npm run automation:runtime:http:verify
- local route-level verification if practical and narrow

# Required Result Format
Return:
1. Files changed
2. What runtime bridge batch-3 changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary