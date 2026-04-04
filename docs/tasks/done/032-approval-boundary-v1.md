# Goal
Define and implement the first explicit approval boundary inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/capabilities/*
- automation/providers/*
- automation/orchestration/*
- automation/execution/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not a product-feature task.

# Primary Objective
Make the automation system explicitly distinguish between:
- safe auto-executable operations
- operations that must stop and require approval

The result should make approval handling a first-class system boundary instead of an implicit future idea.

# Required Design Direction
The design must follow these rules:

1. Read-only operations may execute automatically if already allowed.
2. Write/admin/destructive/high-risk operations must not auto-run.
3. Approval-required operations should return a clear structured result.
4. The boundary should be explicit in capability/provider/execution flow.
5. The diff should remain inside automation/infrastructure areas.

# Allowed Changes
- Narrow updates to automation capability contracts
- Narrow updates to execution result / error / selection shapes
- Narrow provider-boundary updates if required
- Approval request placeholder/provider wiring if needed
- Small smoke/demo updates required to prove the approval boundary works
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No product runtime integration
- No UI changes
- No n8n integration yet unless absolutely required for placeholder structure
- No broad workflow redesign
- No DB/schema redesign
- No recommendation/QA work
- No generic task runner
- No unrelated refactor

# Critical Safety Rule
Do not introduce automatic execution of risky operations.
This task is about making the stop-and-approve boundary explicit.

# Working Principles
- Prefer the smallest explicit boundary
- Make auto vs approval-required behavior obvious
- Keep current read-only operations working
- Keep the execution path easy to review and test
- Make future n8n handoff easier, not broader

# Suggested V1 Direction
At minimum, the system should clearly express:
- which capability/operation is auto-allowed
- which capability/operation is approval-required
- what structured result is returned when approval is required

Example:
- `catalog.read` -> auto-allowed
- `asset.search` -> auto-allowed
- approval-required capability or attempted high-risk operation -> returns structured approval-needed result, not silent failure

# Required Behavior / Structure
The result should make it clear:
1. how the system classifies operation risk
2. where approval is enforced
3. what result shape is returned when approval is needed
4. how the smoke/demo path proves the behavior

# Completion Criteria
Complete only when:
- the automation system has an explicit approval boundary
- safe read-only operations still work
- approval-required flows return a clear structured result
- the execution path remains narrow and reviewable
- smoke/demo validation covers the approval boundary

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What approval-boundary changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary