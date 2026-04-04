# Goal
Define the first explicit automation contract bundle inside the AI-INTERIOR automation system.

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
Create a narrow bundle contract that groups the key execution-layer contracts for a single automation run into one machine-readable object.

# Required Design Direction
The design must follow these rules:

1. Do not add persistence in this task.
2. Do not change current safe execution behavior.
3. The bundle must be derived from existing contracts, not create parallel systems.
4. Keep the bundle narrow, explicit, and reviewable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to execution/orchestration bundle-related types
- Narrow helper additions for building a bundle
- Small demo/smoke updates required to surface and validate the bundle
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No DB writes
- No UI changes
- No real workflow integration
- No broad orchestration redesign
- No unrelated refactor
- No risky execution behavior changes

# Critical Safety Rule
Do not broaden execution behavior.
This task is only about defining and surfacing a contract bundle.

# Working Principles
- Prefer the smallest useful bundle
- Reuse existing audit, report, summary, decision, and snapshot contracts
- Make the result easy to export and inspect
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Bundle Direction
At minimum, the bundle should make it clear:
- bundleId
- generatedAt
- requestId
- capabilityId
- executionMode
- finalStatus
- audit entry
- run report
- review summary
- decision envelope if present
- state snapshot

Avoid raw payload dumps, secrets, and large unrelated objects.

# Required Behavior / Structure
The result should make it clear:
1. what a contract bundle looks like
2. when it is produced
3. how it relates to the existing execution result
4. how smoke/demo proves the bundle exists

# Completion Criteria
Complete only when:
- the automation system has an explicit contract bundle
- both auto-run and approval-related flows can surface a bundle
- current safe behavior remains unchanged
- smoke/demo validation covers the bundle
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What contract bundle changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary