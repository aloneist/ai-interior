# Goal
Create the first narrow n8n webhook placeholder sender boundary inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/orchestration/n8n/*
- automation/execution/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not full n8n integration.
This is not product-feature work.

# Primary Objective
Add a narrow sender boundary that can accept the existing approval handoff contract and represent how it would be delivered to n8n later, without introducing broad workflow execution or risky automatic behavior.

# Required Design Direction
The design must follow these rules:

1. Do not auto-execute risky operations.
2. Do not implement full orchestration/workflow runtime behavior.
3. Keep the sender boundary explicit and narrow.
4. Prefer placeholder/no-op or mock-safe delivery behavior over real broad integration.
5. Preserve the current stop-at-boundary approval behavior.

# Allowed Changes
- Narrow additions under automation/orchestration/n8n/*
- Narrow execution-layer wiring only if strictly needed
- Small demo/smoke updates required to prove the sender boundary exists
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No full n8n workflow integration
- No product runtime integration
- No UI changes
- No DB/schema changes
- No recommendation/QA work
- No generic webhook runner
- No broad refactor
- No automatic execution of approval-required operations

# Critical Safety Rule
Do not turn approval handoff into automatic risky execution.
This task is only about creating the placeholder sender boundary.

# Working Principles
- Prefer the smallest explicit sender interface
- Keep delivery behavior safe and reviewable
- Preserve current approval-required stop behavior
- Make future real n8n webhook integration easier
- Keep smoke/demo coverage narrow and useful

# Suggested V1 Direction
A good v1 shape would be one of:

Option A:
- a dedicated sender helper that accepts the existing n8n approval handoff payload
- returns a structured placeholder delivery result such as:
  - target
  - deliveryMode
  - attempted
  - delivered
  - reason / status

Option B:
- a no-op adapter with explicit result typing and future webhook URL insertion point

Prefer the option with the smallest safe diff.

# Required Behavior / Structure
The result should make it clear:
1. where the n8n handoff payload would be sent
2. what sender function/interface is responsible
3. what structured placeholder delivery result looks like
4. how smoke/demo proves the sender boundary works
5. that approval-required flows still stop locally

# Completion Criteria
Complete only when:
- a narrow n8n sender placeholder boundary exists
- approval-required flows still do not auto-run
- the handoff payload can be passed into the sender boundary safely
- smoke/demo validation covers the placeholder sender behavior
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What n8n webhook placeholder changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary