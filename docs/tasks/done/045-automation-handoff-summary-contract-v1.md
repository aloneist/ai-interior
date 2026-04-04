# Goal
Define the first explicit automation handoff summary contract inside the AI-INTERIOR automation system.

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
Create a narrow handoff summary contract that presents the essential external-handoff state of a single automation run in a simpler, reviewer-friendly form than the transport receipt and export envelope.

# Required Design Direction
The design must follow these rules:

1. Do not add persistence in this task.
2. Do not change current safe execution behavior.
3. The handoff summary must be derived from the existing export envelope, serializer, and transport receipt.
4. Keep the summary explicit, narrow, and reviewable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to execution/orchestration handoff-summary-related types
- Narrow helper additions for building a handoff summary
- Small demo/smoke updates required to surface and validate the handoff summary
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
This task is only about defining and surfacing a reviewer-facing handoff summary contract.

# Working Principles
- Prefer the smallest useful handoff summary
- Reuse the existing export envelope, serializer, and transport receipt
- Make the result easy for humans to inspect
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Handoff Summary Direction
At minimum, the handoff summary should make it clear:
- handoffSummaryId
- generatedAt
- requestId
- capabilityId
- exportTarget
- handoffStatus
- deliveryMode if applicable
- attempted
- delivered
- payloadByteLength if applicable
- short reason if applicable
- envelopeId
- receiptId if present

Suggested narrow summary states:
- not_applicable
- prepared
- attempted_not_sent
- sent
- needs_attention

Avoid raw payload dumps, secrets, or large embedded objects.

# Required Behavior / Structure
The result should make it clear:
1. what a handoff summary looks like
2. when it is produced
3. how it relates to the export envelope / serializer / receipt
4. how smoke/demo proves the summary exists

# Completion Criteria
Complete only when:
- the automation system has an explicit handoff summary contract
- approval-related flows can surface a handoff summary
- non-handoff flows are represented honestly and narrowly
- current safe behavior remains unchanged
- smoke/demo validation covers the handoff summary
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What handoff summary contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary