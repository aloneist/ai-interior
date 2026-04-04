# Goal
Define the first explicit approval response review summary contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/orchestration/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Create a narrow reviewer-facing summary contract for normalized approval responses so operators can quickly understand:
- whether the response was accepted
- what decision it carried
- whether it matched the current blocked execution context
- what the next action hint is

# Required Design Direction
The design must follow these rules:

1. Do not resume risky execution in this task.
2. Do not add persistence in this task.
3. The summary must be derived from the existing approval response intake contract.
4. Keep the summary explicit, narrow, and reviewer-friendly.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to orchestration response-summary-related types/helpers
- Small demo/smoke updates required to surface and validate the summary
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No inbound API framework
- No broad orchestration redesign
- No unrelated refactor

# Critical Safety Rule
Do not turn accepted approval responses into automatic execution.
This task is only about defining and surfacing a reviewer-facing response summary.

# Working Principles
- Prefer the smallest useful summary
- Reuse existing intake metadata
- Make accepted / invalid / not-applicable easy to distinguish
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Summary Direction
At minimum, the summary should make it clear:
- responseSummaryId
- generatedAt
- requestId
- reportId if available
- capabilityId
- source
- decision
- validityStatus
- nextActionHint
- issueCount
- short statusSummary

Avoid raw payload dumps, secrets, or large embedded objects.

# Required Behavior / Structure
The result should make it clear:
1. what an approval response review summary looks like
2. when it is produced
3. how it relates to the intake contract
4. how smoke/demo proves the summary exists

# Completion Criteria
Complete only when:
- the automation system has an explicit approval response review summary contract
- accepted / invalid / not-applicable intake results can all surface a summary
- current safe behavior remains unchanged
- no blocked operation is auto-resumed
- smoke/demo validation covers the summary
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What approval response review summary changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary