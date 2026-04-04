# Goal
Define the first explicit automation transport receipt contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/execution/*
- automation/orchestration/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not persistence, UI integration, or real workflow/runtime integration yet.

# Primary Objective
Create a narrow transport receipt contract that represents the result of attempting to hand off a serialized automation export payload to an external transport boundary.

# Required Design Direction
The design must follow these rules:

1. Do not add persistence in this task.
2. Do not change current safe execution behavior.
3. The receipt must be derived from the existing export serializer and placeholder sender path, not create a parallel system.
4. Keep the receipt explicit, narrow, and reviewable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to execution/orchestration receipt-related types
- Narrow helper additions for building a transport receipt
- Small demo/smoke updates required to surface and validate the receipt
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No DB writes
- No UI changes
- No real network transport integration
- No broad orchestration redesign
- No unrelated refactor
- No risky execution behavior changes

# Critical Safety Rule
Do not broaden execution behavior or add real delivery side effects.
This task is only about defining and surfacing a transport receipt contract.

# Working Principles
- Prefer the smallest useful receipt shape
- Reuse the existing export serializer and placeholder sender result
- Keep the receipt easy to inspect and review
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Receipt Direction
At minimum, the receipt should make it clear:
- receiptId
- issuedAt
- envelopeId
- exportTarget
- contentType
- attempted
- delivered
- deliveryMode
- status
- reason if applicable
- payloadByteLength or safe payload size marker if practical

Avoid raw payload dumps, secrets, and network-specific complexity.

# Required Behavior / Structure
The result should make it clear:
1. what a transport receipt looks like
2. when it is produced
3. how it relates to the serializer and placeholder sender
4. how smoke/demo proves the receipt exists

# Completion Criteria
Complete only when:
- the automation system has an explicit transport receipt contract
- both auto-run and approval-related flows can surface a receipt if applicable
- current safe behavior remains unchanged
- smoke/demo validation covers the receipt
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What transport receipt contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary