# Goal
Define the first explicit manual resume gate contract inside the AI-INTERIOR automation system.

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
Create a narrow contract that represents the manual gate decision boundary between:
- a non-executing manual resume request
- a future explicit resume/replay action

This task should not execute or resume anything.

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Do not add persistence in this task.
3. The manual resume gate contract must be derived from the existing manual resume request contract.
4. Keep the contract explicit, narrow, and reviewable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to orchestration manual-gate-related types/helpers
- Small demo/smoke updates required to surface and validate the manual gate contract
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No inbound API/runtime surface
- No broad orchestration redesign
- No unrelated refactor

# Critical Safety Rule
Do not turn approved responses or manual resume requests into actual execution.
This task is only about defining and surfacing the manual resume gate contract.

# Working Principles
- Prefer the smallest useful manual gate contract
- Reuse existing manual resume request metadata
- Make gate-open vs gate-blocked easy to inspect
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Manual Gate Direction
At minimum, the contract should make it clear:
- manualGateId
- evaluatedAt
- requestId
- reportId
- capabilityId
- source
- requestStatus
- gateStatus
- canOpenResumePath
- blockingReason
- nextActionHint

Suggested narrow gate statuses:
- gate_not_applicable
- gate_blocked
- gate_open_for_future_resume_contract
- gate_rejected_invalid

Rules for v1:
- request_pending_manual_gate -> gate_open_for_future_resume_contract
- request_blocked -> gate_blocked
- request_rejected_invalid -> gate_rejected_invalid
- not_applicable -> gate_not_applicable

Even when the gate is open for a future resume contract, v1 must not create any executable resume action.

# Required Behavior / Structure
The result should make it clear:
1. what a manual resume gate object looks like
2. how it is derived from the manual resume request contract
3. how gate states map from current request statuses
4. that no blocked operation is resumed
5. how smoke/demo proves the contract exists

# Completion Criteria
Complete only when:
- the automation system has an explicit manual resume gate contract
- manual resume request results can surface a gate result
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
2. What manual resume gate contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary