# Goal
Define the first explicit approval response intake contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/orchestration/*
- automation/execution/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not risky execution resume/replay yet.
This is not persistence or UI integration yet.

# Primary Objective
Create a narrow contract for receiving an approval response from an external orchestration layer such as n8n, without yet resuming or executing the blocked operation.

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Do not add persistence in this task.
3. The intake contract must be explicit, narrow, and easy to validate.
4. The intake shape must align with the existing decision envelope, review summary, run report, and request/report identifiers.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to orchestration/execution response-intake-related types
- Narrow helper additions for parsing/normalizing approval response payloads
- Small demo/smoke updates required to surface and validate the intake contract
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No broad orchestration redesign
- No generic inbound API framework
- No unrelated refactor

# Critical Safety Rule
Do not turn approval responses into automatic risky execution.
This task is only about defining and surfacing the approval response intake contract.

# Working Principles
- Prefer the smallest useful response-intake contract
- Reuse existing identifiers and decision concepts
- Make acceptance/rejection/defer response shapes explicit
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Intake Direction
At minimum, the intake contract should make it clear:
- intakeId
- receivedAt
- requestId
- reportId if available
- capabilityId
- source
- decision
- note if provided
- nextAction hint
- validity status

Suggested narrow decisions:
- approved
- rejected
- deferred
- needs_revision

Suggested narrow intake validity states:
- accepted
- rejected_invalid
- ignored_not_applicable

# Required Behavior / Structure
The result should make it clear:
1. what an approval response intake object looks like
2. what raw input shape is accepted
3. how the payload is normalized/validated
4. how it relates to the existing decision envelope / report / request ids
5. how smoke/demo proves the intake contract exists

# Completion Criteria
Complete only when:
- the automation system has an explicit approval response intake contract
- approval response payloads can be normalized/validated
- current safe behavior remains unchanged
- no blocked operation is auto-resumed
- smoke/demo validation covers the intake contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What approval response intake contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary