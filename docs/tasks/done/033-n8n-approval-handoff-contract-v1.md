# Goal
Define the first explicit n8n approval handoff contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/capabilities/*
- automation/execution/*
- automation/orchestration/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not a product-feature task.
This is not full n8n integration yet.

# Primary Objective
Create a clear, reviewable contract for how approval-required automation results are handed off to an external approval flow such as n8n.

The result should move the system from:
- approval-required results that stop locally

toward:
- approval-required results with a structured handoff payload and contract shape ready for orchestration integration later

# Required Design Direction
The design must follow these rules:

1. Do not perform real n8n network integration in this task unless there is already a narrow placeholder path.
2. Define the handoff contract explicitly.
3. The contract must be safe, bounded, and reviewable.
4. Keep risky operations blocked from auto-execution.
5. The diff should remain inside automation/infrastructure areas.

# Allowed Changes
- Narrow updates to execution result / approval metadata shapes
- Narrow orchestration-layer contract types or handoff helper additions
- Narrow demo/smoke updates required to prove the contract shape
- Small documentation comments only if directly helpful

# Disallowed Changes
- No real webhook/network send if not already clearly prepared
- No product runtime integration
- No UI changes
- No broad workflow redesign
- No DB/schema redesign
- No recommendation/QA work
- No generic task runner
- No unrelated refactor

# Critical Safety Rule
Do not broaden approval into automatic execution.
This task is only about defining and surfacing the handoff contract shape.

# Working Principles
- Prefer the smallest explicit contract
- Make the approval handoff payload obvious
- Preserve current stop-at-boundary behavior
- Make future n8n integration easier, not broader
- Keep the result easy to test in smoke/demo form

# Suggested V1 Contract Shape
At minimum, the handoff contract should clearly include:
- requestId
- capabilityId
- operation if applicable
- actorId
- summary/title
- risk level if available
- status such as `approval_required`
- minimal payload preview or safe metadata
- timestamp or generated marker if already part of current system conventions

Avoid including secrets, raw unrestricted payloads, or broad opaque blobs when a narrower summary will do.

# Required Behavior / Structure
The result should make it clear:
1. when a handoff payload is created
2. what its shape is
3. where it lives in the execution result
4. how smoke/demo proves it exists for approval-required flows

# Completion Criteria
Complete only when:
- approval-required results include a clearer handoff contract shape
- current read-only auto-run behavior still works
- stop-at-boundary behavior still remains intact
- smoke/demo validation covers the handoff contract

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What n8n approval handoff contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary