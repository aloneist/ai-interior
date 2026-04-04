# Goal
Define the first explicit automation transport adapter contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/orchestration/*
- automation/execution/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not real network delivery, persistence, UI integration, or full workflow/runtime integration yet.

# Primary Objective
Create a narrow transport adapter contract that represents the boundary where a serialized automation export payload would be handed to an external transport implementation later.

# Required Design Direction
The design must follow these rules:

1. Do not add real network delivery in this task.
2. Do not change current safe execution behavior.
3. The adapter contract must be explicit, narrow, and derived from the existing serializer / receipt / readiness flow.
4. Keep the adapter boundary replaceable so a future real transport can swap in without changing upstream contracts.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to orchestration/execution transport-adapter-related types
- Narrow helper additions for adapter input/output contracts
- Small demo/smoke updates required to surface and validate the adapter contract
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No DB writes
- No UI changes
- No real network delivery
- No webhook runtime integration
- No broad orchestration redesign
- No unrelated refactor
- No risky execution behavior changes

# Critical Safety Rule
Do not broaden execution behavior or introduce real delivery side effects.
This task is only about defining and surfacing a transport adapter contract.

# Working Principles
- Prefer the smallest useful adapter boundary
- Reuse the existing export serializer and transport receipt concepts
- Keep the adapter contract easy to inspect and replace later
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Adapter Direction
At minimum, the adapter contract should make it clear:
- adapterId or adapter name
- adapter target
- accepted input type (serialized export payload)
- adapter result shape
- whether delivery was attempted
- whether delivery was possible
- why it was blocked if not

Suggested V1 result states:
- adapter_not_applicable
- adapter_placeholder_blocked
- adapter_ready_but_not_connected
- adapter_sent

Do not add raw payload dumps, secrets, or network-specific complexity beyond what is needed for a stable contract.

# Required Behavior / Structure
The result should make it clear:
1. what the transport adapter contract looks like
2. what input it accepts
3. what result it returns
4. how it relates to the current receipt/readiness flow
5. how smoke/demo proves the adapter contract exists

# Completion Criteria
Complete only when:
- the automation system has an explicit transport adapter contract
- approval-related flows can surface adapter-level contract data
- non-handoff flows remain honestly represented
- current safe behavior remains unchanged
- smoke/demo validation covers the adapter contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What transport adapter contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary