# Goal
Define and implement the first explicit auth boundary for inbound approval-response webhook intake inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/orchestration/n8n/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not risky execution resume yet.
This is not persistence or UI integration yet.

# Primary Objective
Add a narrow authentication/authorization boundary to the real inbound approval-response webhook intake path so the system can distinguish trusted from untrusted inbound responses.

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Do not add persistence in this task.
3. Reuse the current fixed env-variable naming policy if auth config is needed.
4. Keep the auth boundary narrow, explicit, and easy to review.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions under automation/orchestration/n8n/*
- Narrow demo/smoke updates required to prove the auth boundary works
- Small documentation updates directly related to the inbound approval-response auth path
- Small helper additions if strictly required for auth checking

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No product runtime route integration
- No broad inbound API framework
- No broad orchestration redesign
- No unrelated refactor

# Critical Safety Rule
Do not turn inbound approval responses into automatic risky execution.
This task is only about adding a trusted inbound auth boundary.

# Working Principles
- Prefer the smallest useful auth boundary
- Keep the request contract narrow
- Explicitly classify trusted vs untrusted inbound requests
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Auth Direction
Use a single narrow shared-secret style boundary for inbound webhook requests.

The inbound path should make it clear:
- what auth input it expects
- how it validates that auth input
- what result is returned on auth failure
- how auth success proceeds to the existing intake chain

Preferred shape:
- one header-like auth value in the webhook request input
- compare against `ADMIN_TOKEN`
- if missing or mismatched, return a structured unauthorized/invalid result
- do not proceed into the existing intake normalization chain on auth failure

Do not add OAuth, JWT frameworks, or broad auth infrastructure.

# Required Behavior / Structure
The result should make it clear:
1. what auth field the inbound webhook intake expects
2. how trusted vs untrusted requests are classified
3. how auth failure is represented in the webhook result
4. that approved responses still do not resume blocked execution
5. how smoke/demo proves the auth boundary works

# Completion Criteria
Complete only when:
- the inbound approval-response webhook path has an explicit auth boundary
- trusted requests can still reach the existing intake chain
- untrusted requests are blocked before intake normalization
- current safe behavior remains unchanged
- no blocked operation is auto-resumed
- smoke/demo validation covers the auth boundary
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What inbound auth-boundary changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary