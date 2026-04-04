# Goal
Define the first explicit approval response application contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/orchestration/*
- automation/execution/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Create a narrow contract that interprets a normalized approval response as an internal application result, without yet resuming or executing the blocked operation.

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Do not add persistence in this task.
3. The application contract must be derived from the existing approval response intake result and review summary.
4. Keep the contract explicit, narrow, and reviewable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to orchestration/execution application-related types/helpers
- Small demo/smoke updates required to surface and validate the application contract
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No inbound API framework
- No broad orchestration redesign
- No unrelated refactor

# Critical Safety Rule
Do not turn accepted approval responses into automatic execution.
This task is only about defining and surfacing the approval response application contract.

# Working Principles
- Prefer the smallest useful application contract
- Reuse existing intake and review-summary metadata
- Make accepted / rejected / deferred / needs_revision easy to interpret internally
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Application Direction
At minimum, the application contract should make it clear:
- applicationId
- evaluatedAt
- requestId
- reportId if available
- capabilityId
- source
- decision
- validityStatus
- applicationStatus
- nextActionHint
- reasonSummary
- issueCount

Suggested narrow application statuses:
- no_action
- remain_blocked
- mark_rejected
- mark_deferred
- mark_needs_revision
- invalid_response

Rules for v1:
- accepted + approved => remain_blocked
- accepted + rejected => mark_rejected
- accepted + deferred => mark_deferred
- accepted + needs_revision => mark_needs_revision
- invalid => invalid_response
- not applicable => no_action

# Required Behavior / Structure
The result should make it clear:
1. what an approval response application object looks like
2. how it is derived from intake/review data
3. how decisions map to safe internal statuses
4. that no blocked operation is resumed
5. how smoke/demo proves the application contract exists

# Completion Criteria
Complete only when:
- the automation system has an explicit approval response application contract
- accepted / invalid / not-applicable intake results can all surface an application result
- current safe behavior remains unchanged
- no blocked operation is auto-resumed
- smoke/demo validation covers the application contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What approval response application contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary