# Goal
Define the first explicit automation run report contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/execution/*
- automation/orchestration/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not persistence or UI integration yet.

# Primary Objective
Create a clear run-level summary contract that can describe the result of a single automation execution in a way that is easy for review, approval, and future orchestration/reporting flows to consume.

# Required Design Direction
The design must follow these rules:

1. Do not add persistence in this task.
2. Do not change safe execution behavior.
3. Keep the contract narrow and reviewable.
4. The run report should be derived from existing execution/audit/approval data, not invent a second unrelated system.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to execution-related report/result types
- Narrow helper additions for building a run report
- Small demo/smoke updates required to surface and validate the run report
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
This task is only about defining and surfacing a run-level report contract.

# Working Principles
- Prefer the smallest useful run summary
- Reuse existing audit, approval, and execution metadata
- Make the result easy for humans to review
- Keep smoke/demo coverage narrow and practical
- Preserve current safe behavior

# Suggested V1 Run Report Direction
At minimum, a run report should make it clear:
- reportId or generated marker
- generatedAt
- requestId
- capabilityId
- operation if applicable
- actorId
- executionMode
- finalStatus
- provider/source summary if applicable
- approval state if applicable
- audit event reference or embedded audit summary
- safe error summary if applicable

Avoid raw payload dumps, secrets, or large opaque structures.

# Required Behavior / Structure
The result should make it clear:
1. what a run report looks like
2. when a run report is produced
3. how it relates to the existing audit entry
4. how smoke/demo proves the report contract exists

# Completion Criteria
Complete only when:
- the automation system has an explicit run report contract
- both auto-run and approval-required flows can surface a run report
- current safe behavior remains unchanged
- smoke/demo validation covers the run report contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What run report contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary