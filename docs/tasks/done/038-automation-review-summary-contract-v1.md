# Goal
Define the first explicit automation review summary contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/execution/*
- automation/orchestration/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not persistence, UI integration, or workflow runtime integration yet.

# Primary Objective
Create a narrow review summary contract that presents the essential human-review information from a single automation execution in a simpler form than the full run report.

# Required Design Direction
The design must follow these rules:

1. Do not add persistence in this task.
2. Do not change current safe execution behavior.
3. The review summary must be derived from existing execution, audit, approval, lifecycle, and run report data.
4. Keep the summary narrow, readable, and reviewer-focused.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to execution-related review summary types
- Narrow helper additions for building a review summary
- Small demo/smoke updates required to surface and validate the review summary
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
This task is only about defining and surfacing a reviewer-facing summary contract.

# Working Principles
- Prefer the smallest useful reviewer-facing summary
- Reuse existing run report and audit data
- Make approval-required outcomes especially easy to understand
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Review Summary Direction
At minimum, a review summary should make it clear:
- summaryId
- generatedAt
- requestId
- capabilityId
- operation
- executionMode
- reviewStatus
- finalStatus
- provider/source summary if applicable
- approval state if applicable
- short error summary if applicable
- reportId reference

Avoid raw payload dumps, secrets, or large opaque structures.

# Required Behavior / Structure
The result should make it clear:
1. what a review summary looks like
2. when it is produced
3. how it relates to the existing run report
4. how smoke/demo proves the review summary exists

# Completion Criteria
Complete only when:
- the automation system has an explicit review summary contract
- both auto-run and approval-required flows can surface a review summary
- current safe behavior remains unchanged
- smoke/demo validation covers the review summary contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What review summary contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary