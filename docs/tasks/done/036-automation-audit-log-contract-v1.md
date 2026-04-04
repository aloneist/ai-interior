# Goal
Define the first explicit automation audit log contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/capabilities/*
- automation/execution/*
- automation/orchestration/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not persistence or database integration yet.

# Primary Objective
Create a clear, stable audit log contract that can describe automation execution events in a structured way so future persistence, tracing, and review workflows can build on it safely.

# Required Design Direction
The design must follow these rules:

1. Do not add database persistence in this task.
2. Do not broaden risky execution behavior.
3. The audit contract should be explicit, reviewable, and narrow.
4. It should represent both auto-allowed flows and approval-required flows.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to execution-related types
- Narrow additions to orchestration or audit contract helper files
- Small demo/smoke updates required to surface audit log entries or contract shape
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No DB writes
- No queue system
- No product runtime integration
- No UI changes
- No real workflow engine integration
- No broad refactor
- No unrelated cleanup

# Critical Safety Rule
Do not turn audit logging into execution side effects outside the current safe automation boundary.
This task is only about defining and surfacing the audit log contract.

# Working Principles
- Prefer the smallest explicit audit shape
- Keep the contract easy to inspect and review
- Cover both successful auto-run flows and approval-required stop flows
- Make future persistence easier without adding it now
- Keep smoke/demo coverage narrow and useful

# Suggested V1 Audit Contract Direction
At minimum, an audit entry should make it clear:
- eventId or generated marker
- recordedAt
- requestId
- capabilityId
- operation if applicable
- actorId
- executionMode
- outcome status
- approval lifecycle state if applicable
- provider/source summary if applicable
- safe error code if applicable

Avoid raw secrets, unrestricted payload dumps, or large opaque blobs.

# Required Behavior / Structure
The result should make it clear:
1. what an audit log entry looks like
2. when an audit entry is created
3. where it appears in the current result flow
4. how smoke/demo proves the audit contract exists

# Completion Criteria
Complete only when:
- the automation system has an explicit audit log contract
- auto-run and approval-required flows can both surface audit entries
- current safe execution behavior remains unchanged
- smoke/demo validation covers the audit contract
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What audit log contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary