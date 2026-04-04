# Goal
Add the first real runtime bridge batch for the AI-INTERIOR automation system so the current automation webhook/intake capabilities can be used through the main app runtime in a narrow, reviewable way.

# Scope
This task is for automation/runtime integration only.

Primary target area:
- app/api/automation/*
- automation/orchestration/n8n/*
- automation/demo/* only if a tiny alignment note is helpful
- related automation/runtime helper files if strictly required

This is still not risky execution resume.
This is not persistence or UI integration yet.

# Primary Objective
Bundle the next practical runtime step into one narrow batch:
1. add a real app runtime route for inbound approval-response webhook intake
2. add a real app runtime route for non-sensitive automation config/health readiness
3. keep both routes narrow, reviewable, and aligned with the existing automation contracts

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Reuse the existing inbound approval-response webhook intake module.
3. Keep routes narrow and explicitly scoped to automation.
4. Health/config readiness must expose only safe summary-level information, never secrets.
5. Keep the diff reviewable and avoid broad runtime integration.

# Allowed Changes
- Add one inbound runtime route for approval-response webhook intake
- Add one narrow automation health/readiness route
- Small helper additions if strictly required for request parsing or safe readiness summaries
- Small automation docs updates directly related to these new runtime bridges

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No broad admin dashboard work
- No broad API framework expansion
- No unrelated refactor
- No secret value exposure in responses

# Critical Safety Rule
The inbound route may normalize and classify approval responses, but it must not resume blocked execution.
The health/readiness route must not expose secrets or broad internal state.

# Working Principles
- Prefer the smallest useful runtime bridge
- Reuse the existing automation modules instead of duplicating logic
- Keep inbound auth explicit
- Keep readiness output safe and summary-only
- Preserve current automation behavior

# Batch Contents

## A. Inbound approval-response runtime route
Add one narrow POST route under app/api/automation/approval-response/route.ts (or similarly clear path) that:
- accepts the current webhook request shape
- forwards into the existing inbound approval-response webhook intake path
- returns structured classification results
- preserves the current auth boundary
- does not resume blocked execution

## B. Automation readiness runtime route
Add one narrow GET route under app/api/automation/readiness/route.ts (or similarly clear path) that returns safe summary-level readiness only, such as:
- outbound webhook config present/absent
- inbound webhook auth config present/absent
- smoke artifact/report capability available yes/no if easily inferable
- current route availability / contract version if useful

Rules:
- do not expose raw secret values
- do not expose full internal payloads
- do not expose unsafe config dumps

## C. Small docs alignment
Update only the minimum docs needed so operators know:
- where the inbound route lives
- where the readiness route lives
- what each route is for
- what they explicitly do not do

# Required Behavior / Structure
The result should make it clear:
1. where the new runtime bridge routes live
2. how the inbound route reuses the current receive-side chain
3. how the readiness route reports safe summary-level state
4. that no risky execution resume exists
5. how operators should use these routes

# Completion Criteria
Complete only when:
- the repo has one real inbound approval-response runtime route
- the repo has one real safe readiness runtime route
- both routes are narrow and reviewable
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
2. What runtime bridge changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary