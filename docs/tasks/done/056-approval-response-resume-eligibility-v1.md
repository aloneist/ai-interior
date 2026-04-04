# Goal
Define the first explicit approval response resume eligibility contract inside the AI-INTERIOR automation system.

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
Create a narrow contract that evaluates whether a blocked automation run is eligible for a future manual resume/replay step, without actually resuming execution now.

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Do not add persistence in this task.
3. The eligibility contract must be derived from the existing approval response application contract.
4. Keep the contract explicit, narrow, and reviewable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to orchestration resume-eligibility-related types/helpers
- Small demo/smoke updates required to surface and validate the eligibility contract
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
This task is only about defining and surfacing a resume eligibility contract.

# Working Principles
- Prefer the smallest useful eligibility contract
- Reuse existing application metadata
- Make eligible vs not-eligible easy to inspect
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Eligibility Direction
At minimum, the eligibility contract should make it clear:
- eligibilityId
- evaluatedAt
- requestId
- reportId if available
- capabilityId
- source
- decision
- applicationStatus
- eligibilityStatus
- isEligible
- blockingReason
- nextActionHint

Suggested narrow eligibility statuses:
- not_applicable
- eligible_for_manual_resume
- blocked_rejected
- blocked_deferred
- blocked_needs_revision
- blocked_invalid_response
- blocked_still_requires_manual_gate

Rules for v1:
- remain_blocked -> blocked_still_requires_manual_gate
- mark_rejected -> blocked_rejected
- mark_deferred -> blocked_deferred
- mark_needs_revision -> blocked_needs_revision
- invalid_response -> blocked_invalid_response
- no_action -> not_applicable

Even if a future system might manually resume after approval, v1 should not mark approved responses as directly executable. Keep them blocked behind a future manual resume gate.

# Required Behavior / Structure
The result should make it clear:
1. what a resume eligibility object looks like
2. how it is derived from the application contract
3. how safe eligibility statuses map from current application statuses
4. that no blocked operation is resumed
5. how smoke/demo proves the eligibility contract exists

# Completion Criteria
Complete only when:
- the automation system has an explicit resume eligibility contract
- application results can surface a resume eligibility result
- current safe behavior remains unchanged
- no blocked operation is auto-resumed
- smoke/demo validation covers the eligibility contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What resume eligibility contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary