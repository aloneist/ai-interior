# Goal
Add the sixth practical runtime bridge batch for the AI-INTERIOR automation system so operators can inspect the current automation runtime surface through one concise status route and one concise verification summary route.

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
1. add one concise runtime status route that summarizes the current automation bridge surface for operators
2. add one concise verifier-summary route or response path that exposes the current runtime HTTP verification coverage/result shape without creating a broad diagnostics system
3. keep both safe, reviewable, and aligned with existing automation/runtime behavior

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Reuse the existing shared route metadata, readiness builders, and verifier knowledge instead of duplicating them.
3. Keep routes narrow and explicitly scoped to automation inspection only.
4. Expose only safe summary-level information.
5. Keep the diff reviewable and avoid broad runtime integration.

# Allowed Changes
- Add one narrow runtime status/summary route under app/api/automation/*
- Add one narrow verifier-summary route or a tightly scoped extension of an existing inspection route if clearly better
- Small shared helper additions if strictly required
- Small automation docs updates directly related to the new inspection surface

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No broad admin dashboard work
- No broad API framework expansion
- No unrelated refactor
- No secret value exposure in responses

# Critical Safety Rule
The new route(s) must not execute blocked work and must not expose secrets or unsafe internal payloads.
They are operator-facing inspection/status routes only.

# Working Principles
- Prefer the smallest useful operator-facing summary layer
- Reuse existing route contract knowledge
- Make runtime bridge status easier to inspect quickly
- Preserve current automation behavior

# Batch Contents

## A. Automation runtime status route
Add one narrow GET route such as:
- app/api/automation/status/route.ts

The route should return concise safe status information such as:
- current bridge route count
- readiness flags summary
- inspection route availability
- execution route availability
- simulation route availability
- verification support availability
- no-resume / no-secret-exposure / no-persistence safety flags

Rules:
- no secrets
- no deep payload dumps
- status only

## B. Verifier-summary inspection surface
Add one narrow inspection route or safe extension that tells operators:
- what the runtime verifier currently covers
- which runtime routes are included in verifier coverage
- whether trusted/untrusted approval-response behavior is covered
- whether approval-boundary simulation is covered

This should be summary-only. Do not expose raw logs, ports, or noisy diagnostics.

Prefer either:
- GET /api/automation/verifier-summary
or
- a small safe verifier coverage block added to the new status route
Choose the smaller safer diff.

## C. Minimal doc alignment
Update only the minimum docs needed so operators know:
- where to inspect concise runtime status
- where to inspect verifier coverage summary
- what these routes are for
- what they explicitly do not do

# Required Behavior / Structure
The result should make it clear:
1. where the new operator-facing summary route(s) live
2. how they reuse shared runtime metadata
3. that no risky execution resume exists
4. how operators should use them together with readiness/overview/routes/sample

# Completion Criteria
Complete only when:
- the repo has one concise runtime status route
- the repo has one concise verifier-coverage inspection surface
- both are narrow and reviewable
- current no-resume safety behavior remains unchanged
- docs are minimally aligned
- diff remains narrow and practical

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke
- npm run automation:runtime:http:verify
- narrow local route-level verification if practical and needed

# Required Result Format
Return:
1. Files changed
2. What runtime bridge batch-6 changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary