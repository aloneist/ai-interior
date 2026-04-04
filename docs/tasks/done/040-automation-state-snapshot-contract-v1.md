# Goal
Define the first explicit automation state snapshot contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/execution/*
- automation/orchestration/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not persistence, UI integration, or full workflow runtime integration yet.

# Primary Objective
Create a narrow state snapshot contract that captures the essential current state of a single automation execution in one machine-readable object.

# Required Design Direction
The design must follow these rules:

1. Do not add persistence in this task.
2. Do not change current safe execution behavior.
3. The state snapshot must be derived from existing execution, approval, audit, run report, review summary, and decision metadata.
4. Keep the snapshot narrow, explicit, and reviewable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to execution/orchestration state snapshot types
- Narrow helper additions for building a state snapshot
- Small demo/smoke updates required to surface and validate the state snapshot
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No DB writes
- No UI changes
- No real workflow engine integration
- No broad orchestration redesign
- No unrelated refactor
- No risky execution behavior changes

# Critical Safety Rule
Do not broaden execution behavior.
This task is only about defining and surfacing a state snapshot contract.

# Working Principles
- Prefer the smallest useful state snapshot
- Reuse existing metadata rather than inventing parallel state systems
- Make current execution state easy to export and inspect
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 State Snapshot Direction
At minimum, a state snapshot should make it clear:
- snapshotId
- generatedAt
- requestId
- capabilityId
- operation
- actorId
- executionMode
- current approval lifecycle state if applicable
- review status if applicable
- decision state if applicable
- final status
- reportId
- auditEventId

Avoid raw payload dumps, secrets, and large opaque blobs.

# Required Behavior / Structure
The result should make it clear:
1. what a state snapshot looks like
2. when it is produced
3. how it relates to the existing report/summary/decision contracts
4. how smoke/demo proves the snapshot exists

# Completion Criteria
Complete only when:
- the automation system has an explicit state snapshot contract
- both auto-run and approval-related flows can surface a snapshot
- current safe behavior remains unchanged
- smoke/demo validation covers the state snapshot contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What state snapshot contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary