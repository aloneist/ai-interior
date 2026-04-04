# Goal
Add the second practical runtime bridge batch for the AI-INTERIOR automation system so operators can verify and exercise the current automation runtime bridges more safely and consistently.

# Scope
This task is for automation/runtime integration only.

Primary target area:
- app/api/automation/*
- automation/orchestration/n8n/*
- automation/README.md
- automation/operator-runbook.md
- related automation/runtime helper files if strictly required

This is not product-feature work.
This is not risky execution resume yet.
This is not persistence or UI integration yet.

# Primary Objective
Bundle the next practical runtime step into one narrow batch:
1. add a real runtime route for outbound automation webhook delivery test
2. add a reusable runtime-safe sample request/response shape for the approval-response bridge
3. align operator docs for using the runtime bridges safely

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Reuse the existing outbound webhook sender path and current runtime bridge logic.
3. Keep routes narrow and explicitly scoped to automation verification only.
4. Any test/verify route must expose only safe summary-level results and must not leak secrets.
5. Keep the diff reviewable and avoid broad runtime integration.

# Allowed Changes
- Add one narrow runtime route for outbound webhook verification
- Add small shared helpers or typed examples if strictly required
- Small automation docs updates directly related to these runtime bridges
- Small request/response typing cleanup only if directly helpful

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No broad admin dashboard work
- No broad API framework expansion
- No unrelated refactor
- No secret value exposure in responses

# Critical Safety Rule
The new runtime route may verify/send the current automation handoff path, but it must not execute blocked risky work.
It must not expose raw secrets or broad internal state.

# Working Principles
- Prefer the smallest useful runtime-verification bridge
- Reuse existing automation modules instead of duplicating logic
- Keep send-side and receive-side boundaries explicit
- Preserve current automation behavior

# Batch Contents

## A. Outbound webhook verification runtime route
Add one narrow POST route under app/api/automation/webhook-test/route.ts (or similarly clear path) that:
- exercises the current outbound approval webhook sender path in a controlled way
- returns only structured send/result metadata
- does not trigger risky execution
- does not expose raw secret values
- clearly reports configured/not-configured/sent/failed state

## B. Approval-response bridge sample contract alignment
Add a small typed/example structure near the runtime bridge or docs so operators/devs know the exact safe request shape for:
- POST /api/automation/approval-response
including:
- required context fields
- auth requirement
- body expectations
without creating a broad external API spec system

## C. Small operator-doc alignment
Update only the minimum docs needed so operators know:
- when to use readiness route
- when to use outbound webhook test route
- how to prepare a valid approval-response POST
- what these routes explicitly do not do

# Required Behavior / Structure
The result should make it clear:
1. where the new runtime verification route lives
2. how it reuses the current outbound automation path
3. what safe result shape it returns
4. how operators should call the runtime bridges
5. that no risky execution resume exists

# Completion Criteria
Complete only when:
- the repo has one real outbound verification runtime route
- the approval-response runtime bridge has a clear safe request shape documented or typed
- current no-resume safety behavior remains unchanged
- docs are minimally aligned
- diff remains narrow and practical

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke
- if practical, route-level local verification consistent with current repository setup

# Required Result Format
Return:
1. Files changed
2. What runtime bridge batch-2 changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary