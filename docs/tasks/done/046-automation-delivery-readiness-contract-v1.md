# Goal
Define the first explicit automation delivery readiness contract inside the AI-INTERIOR automation system.

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
Create a narrow delivery-readiness contract that tells whether a single automation run is ready for external handoff, and if not, why not.

# Required Design Direction
The design must follow these rules:

1. Do not add persistence in this task.
2. Do not change current safe execution behavior.
3. The delivery readiness contract must be derived from the existing export envelope, serializer, transport receipt, and handoff summary.
4. Keep the contract explicit, narrow, and reviewable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to execution/orchestration readiness-related types
- Narrow helper additions for building a delivery readiness contract
- Small demo/smoke updates required to surface and validate the delivery readiness contract
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No DB writes
- No UI changes
- No real network delivery
- No broad orchestration redesign
- No unrelated refactor
- No risky execution behavior changes

# Critical Safety Rule
Do not broaden execution behavior or add real delivery side effects.
This task is only about defining and surfacing a delivery-readiness contract.

# Working Principles
- Prefer the smallest useful readiness contract
- Reuse the existing export envelope, serializer, receipt, and handoff summary
- Make the result easy for humans and future orchestration layers to inspect
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Delivery Readiness Direction
At minimum, the readiness contract should make it clear:
- readinessId
- evaluatedAt
- requestId
- capabilityId
- exportTarget if applicable
- readinessStatus
- isReady
- blockingReason if applicable
- handoffStatus reference if applicable
- envelopeId if applicable
- receiptId if applicable

Suggested narrow readiness states:
- not_applicable
- ready_for_handoff
- blocked_not_sent
- blocked_needs_attention

Avoid raw payload dumps, secrets, or large embedded objects.

# Required Behavior / Structure
The result should make it clear:
1. what a delivery readiness object looks like
2. when it is produced
3. how it relates to the existing handoff summary / receipt / serializer / envelope
4. how smoke/demo proves the readiness contract exists

# Completion Criteria
Complete only when:
- the automation system has an explicit delivery readiness contract
- approval-related flows can surface delivery readiness
- non-handoff flows are represented honestly and narrowly
- current safe behavior remains unchanged
- smoke/demo validation covers the readiness contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What delivery readiness contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary