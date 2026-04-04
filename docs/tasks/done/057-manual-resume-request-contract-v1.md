# Goal
Define the first explicit manual resume request contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/orchestration/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not risky execution resume yet.
This is not persistence or UI integration yet.

# Primary Objective
Create a narrow contract that represents an explicit manual request to resume or replay a previously blocked automation run, without actually resuming execution now.

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Do not add persistence in this task.
3. The manual resume request contract must be derived from the existing resume eligibility contract and related receive-side approval metadata.
4. Keep the contract explicit, narrow, and reviewable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to orchestration manual-resume-request-related types/helpers
- Small demo/smoke updates required to surface and validate the manual resume request contract
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No inbound API/runtime surface
- No broad orchestration redesign
- No unrelated refactor

# Critical Safety Rule
Do not turn accepted approval responses into automatic execution.
This task is only about defining and surfacing the manual resume request contract.

# Working Principles
- Prefer the smallest useful manual resume request contract
- Reuse existing eligibility/application/intake metadata
- Make requestability vs non-requestability easy to inspect
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Manual Resume Request Direction
At minimum, the contract should make it clear:
- resumeRequestId
- requestedAt
- requestId
- reportId if available
- capabilityId
- source
- decision
- eligibilityStatus
- requestStatus
- isRequestable
- blockingReason
- nextActionHint

Suggested narrow request statuses:
- not_applicable
- request_blocked
- request_pending_manual_gate
- request_rejected_invalid

Rules for v1:
- blocked_still_requires_manual_gate -> request_pending_manual_gate
- blocked_rejected -> request_blocked
- blocked_deferred -> request_blocked
- blocked_needs_revision -> request_blocked
- blocked_invalid_response -> request_rejected_invalid
- not_applicable -> not_applicable

Even if a future system supports manual resume requests, v1 should not create any executable resume token or action. It should only make the request contract explicit.

# Required Behavior / Structure
The result should make it clear:
1. what a manual resume request object looks like
2. how it is derived from the resume eligibility contract
3. how safe request statuses map from current eligibility statuses
4. that no blocked operation is resumed
5. how smoke/demo proves the contract exists

# Completion Criteria
Complete only when:
- the automation system has an explicit manual resume request contract
- resume eligibility results can surface a manual resume request result
- current safe behavior remains unchanged
- no blocked operation is auto-resumed
- smoke/demo validation covers the contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What manual resume request contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary