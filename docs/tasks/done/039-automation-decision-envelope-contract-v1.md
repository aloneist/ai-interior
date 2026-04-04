# Goal
Define the first explicit automation decision envelope contract inside the AI-INTERIOR automation system.

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
Create a narrow contract that represents a human or orchestration decision applied to an automation run, especially for approval-required flows.

# Required Design Direction
The design must follow these rules:

1. Do not add persistence in this task.
2. Do not execute risky operations from this task.
3. The decision envelope must be explicit, narrow, and reviewable.
4. It should fit the current approval lifecycle, run report, and review summary model.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to execution/orchestration decision-related types
- Narrow helper additions for building or validating a decision envelope
- Small demo/smoke updates required to surface and validate the decision envelope
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No DB writes
- No UI changes
- No real n8n response integration
- No broad orchestration redesign
- No unrelated refactor
- No risky execution behavior changes

# Critical Safety Rule
Do not turn decisions into automatic risky execution.
This task is only about defining and surfacing the decision envelope contract.

# Working Principles
- Prefer the smallest useful decision contract
- Reuse existing request/report/approval identifiers and metadata
- Make reviewer decisions explicit and machine-readable
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Decision Envelope Direction
At minimum, a decision envelope should make it clear:
- decisionId
- decidedAt
- requestId
- reportId
- capabilityId
- decisionSource
- decision
- note or summary
- nextAction hint if applicable

Suggested narrow decisions:
- approved
- rejected
- needs_revision
- deferred

Avoid raw payload dumps, secrets, or execution side effects.

# Required Behavior / Structure
The result should make it clear:
1. what a decision envelope looks like
2. when it is produced or attached
3. how it relates to the existing review summary / run report
4. how smoke/demo proves the contract exists

# Completion Criteria
Complete only when:
- the automation system has an explicit decision envelope contract
- approval-related flows can surface a decision envelope shape
- current safe behavior remains unchanged
- smoke/demo validation covers the decision envelope contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What decision envelope contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary