# Goal
Document how operators should retrieve and inspect the automation smoke report artifact from CI.

# Scope
This task is automation documentation only.

Primary target area:
- automation/demo/README.md
- automation/operator-runbook.md
- automation/review-checklist.md
- automation/change-log-template.md

This is not product-feature work.
This is not runtime behavior change, persistence, or workflow redesign.

# Primary Objective
Make the new CI smoke artifact practically usable by documenting:
- where it comes from
- when to check it
- how to use it during review
- how to record findings

# Required Design Direction
The design must follow these rules:

1. Do not change runtime behavior in this task.
2. Prefer short operator-facing guidance over broad prose.
3. Reflect current repository reality only.
4. Keep the diff narrow and documentation-focused.
5. Reuse existing docs rather than duplicating detail.

# Allowed Changes
- Narrow updates to automation/demo/README.md
- Narrow updates to automation/operator-runbook.md
- Narrow updates to automation/review-checklist.md
- Narrow updates to automation/change-log-template.md

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No smoke behavior changes
- No broad CI redesign
- No unrelated cleanup

# Critical Safety Rule
Do not add new automation behavior in this task.
This task is only about making the CI artifact usable in review flow.

# Working Principles
- Prefer short actionable instructions
- Link CI artifact usage to the existing smoke review flow
- Keep guidance readable under time pressure
- Make it obvious when the artifact should be checked

# Suggested V1 Coverage
At minimum, document:
- artifact name: `automation-smoke-report`
- when operators should inspect it
- how it relates to:
  - exit code
  - FINAL SUMMARY
  - JSON REPORT
- when to use artifact contents in review notes / change log
- what to do if the artifact is missing

# Required Behavior / Structure
The result should make it clear:
1. where the CI smoke artifact appears
2. when operators should inspect it
3. how to use it during review
4. how to record the result

# Completion Criteria
Complete only when:
- current docs mention the CI smoke artifact clearly
- the operator runbook/checklist/change-log template reflect its use
- the diff remains narrow and documentation-focused
- no runtime behavior was changed

# Validation
Use repository reality. Prefer:
- git diff -- automation/demo/README.md automation/operator-runbook.md automation/review-checklist.md automation/change-log-template.md
- optional doc review only

# Required Result Format
Return:
1. Files changed
2. What CI artifact retrieval documentation changes were made
3. Validation commands run if any
4. Risks or follow-up notes
5. Final diff summary