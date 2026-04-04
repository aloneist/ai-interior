# Goal
Define the first explicit manual resume contract inside the AI-INTERIOR automation system.

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
Create a narrow contract that represents a future manual resume artifact for a previously blocked automation run, without actually resuming execution now.

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Do not add persistence in this task.
3. The manual resume contract must be derived from the existing manual resume gate contract.
4. Keep the contract explicit, narrow, and reviewable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to orchestration manual-resume-contract-related types/helpers
- Small demo/smoke updates required to surface and validate the manual resume contract
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No inbound API/runtime surface
- No broad orchestration redesign
- No unrelated refactor

# Critical Safety Rule
Do not turn gate-open states into actual execution.
This task is only about defining and surfacing the manual resume contract.

# Working Principles
- Prefer the smallest useful manual resume contract
- Reuse existing gate metadata
- Make contract-present vs contract-absent easy to inspect
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Manual Resume Contract Direction
At minimum, the contract should make it clear:
- manualResumeContractId
- generatedAt
- requestId
- reportId
- capabilityId
- source
- gateStatus
- contractStatus
- canIssueFutureResumeArtifact
- blockingReason
- nextActionHint

Suggested narrow contract statuses:
- contract_not_applicable
- contract_blocked
- contract_available_for_future_resume_artifact
- contract_rejected_invalid

Rules for v1:
- gate_open_for_future_resume_contract -> contract_available_for_future_resume_artifact
- gate_blocked -> contract_blocked
- gate_rejected_invalid -> contract_rejected_invalid
- gate_not_applicable -> contract_not_applicable

Even when the contract is available for a future resume artifact, v1 must not create any executable resume token or action.

# Required Behavior / Structure
The result should make it clear:
1. what a manual resume contract object looks like
2. how it is derived from the manual resume gate contract
3. how safe contract statuses map from current gate statuses
4. that no blocked operation is resumed
5. how smoke/demo proves the contract exists

# Completion Criteria
Complete only when:
- the automation system has an explicit manual resume contract
- manual resume gate results can surface a manual resume contract result
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
2. What manual resume contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary