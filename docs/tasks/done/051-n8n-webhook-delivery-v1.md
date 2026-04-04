# Goal
Implement the first real n8n webhook delivery path for approval-required automation handoff inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/orchestration/n8n/*
- automation/execution/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not approval response handling yet.
This is not persistence or UI integration yet.

# Primary Objective
Replace the current placeholder-only handoff delivery step with a narrow real webhook delivery path for approval-required flows, while keeping the approval boundary and safe execution model intact.

# Required Design Direction
The design must follow these rules:

1. Do not auto-execute risky operations.
2. Only approval-required handoff delivery is in scope.
3. Reuse the existing export envelope / serializer / receipt / handoff summary / delivery readiness flow.
4. Keep the network boundary narrow and replaceable.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow updates to automation/orchestration/n8n/*
- Narrow execution-layer wiring changes needed to use a real webhook sender
- Small updates to receipt/readiness/handoff summary logic if required by real delivery results
- Small demo/smoke updates required to validate behavior
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No approval response handling
- No product runtime integration
- No UI changes
- No DB persistence
- No broad orchestration redesign
- No generic webhook framework
- No unrelated refactor

# Critical Safety Rule
Do not turn approval-required flows into automatic risky execution.
This task is only about delivering the approval handoff payload to n8n.

# Working Principles
- Prefer the smallest real delivery path
- Keep the transport boundary explicit
- Reuse the existing export serializer
- Preserve current approval stop behavior
- Keep smoke/demo coverage useful and reviewable

# Suggested V1 Delivery Direction
A good v1 implementation should:
- use one explicit env variable for the n8n webhook URL
- send only the serialized approval handoff payload
- only run on approval-required flows
- return structured delivery metadata
- fail safely with explicit status/reason
- keep non-handoff flows untouched

Use the existing fixed env variable naming policy if a new env name is introduced, and document that choice clearly.

# Required Behavior / Structure
The result should make it clear:
1. where the webhook sender lives
2. what payload it sends
3. when delivery is attempted
4. what structured result is returned
5. how smoke/demo proves the real delivery path works or safely degrades

# Completion Criteria
Complete only when:
- approval-required flows can use a real webhook sender path
- current read-only auto-run behavior remains unchanged
- approval-required flows still stop locally and do not auto-execute risky work
- receipt/readiness/handoff summary reflect real delivery outcomes
- smoke/demo validation covers the new behavior
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What real webhook delivery changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary