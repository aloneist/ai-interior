# Goal
Define the first explicit approval lifecycle contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/capabilities/*
- automation/execution/*
- automation/orchestration/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not persistence or full workflow integration yet.

# Primary Objective
Make approval-required flows carry an explicit lifecycle state model so future n8n delivery, approval decisions, and audit handling can build on a stable contract.

# Required Design Direction
The design must follow these rules:

1. Do not auto-execute risky operations.
2. Do not implement persistence, queues, or full workflow runtime in this task.
3. Define the lifecycle states explicitly and narrowly.
4. Keep the current approval stop behavior intact.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow updates to approval-related types
- Narrow execution/orchestration contract updates
- Small demo/smoke updates required to prove lifecycle states are surfaced
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No real n8n delivery integration
- No DB persistence
- No product runtime integration
- No UI changes
- No broad workflow redesign
- No unrelated refactor

# Critical Safety Rule
Do not broaden approval flows into automatic risky execution.
This task is only about defining and surfacing the lifecycle state contract.

# Working Principles
- Prefer the smallest explicit lifecycle model
- Keep states understandable and reviewable
- Preserve current approval-required stop behavior
- Make future delivery/decision integration easier
- Keep smoke/demo coverage narrow and useful

# Suggested V1 Lifecycle Direction
At minimum, define clear states for:
- approval_required
- handoff_prepared
- handoff_not_sent
- handoff_sent
- approved
- rejected

If some states are future-only, they may exist in the contract even if current execution only reaches early states.

# Required Behavior / Structure
The result should make it clear:
1. what lifecycle states exist
2. which states are currently reachable
3. where the lifecycle state appears in results
4. how smoke/demo proves the contract shape

# Completion Criteria
Complete only when:
- approval-related results include an explicit lifecycle state contract
- current stop-at-boundary behavior remains intact
- current sender placeholder behavior is represented cleanly in lifecycle terms
- smoke/demo validation covers the lifecycle contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What approval lifecycle contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary