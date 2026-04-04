# Goal
Align the automation smoke runner and current CI usage expectations explicitly, without changing automation behavior.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/demo/README.md
- automation/review-checklist.md
- automation/change-log-template.md
- .github/workflows/ci.yml only if a tiny documentation-style naming/alignment change is truly needed

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime redesign.

# Primary Objective
Make it explicit how operators and CI should rely on:
- smoke exit code
- final summary
- JSON report

This task should align documentation and usage expectations, not redesign CI.

# Required Design Direction
The design must follow these rules:

1. Do not change smoke validation behavior in this task.
2. Do not change contract logic in this task.
3. Prefer documentation and naming alignment over workflow expansion.
4. Keep the diff narrow and reviewable.
5. Reflect current repository reality only.

# Allowed Changes
- Narrow updates to automation/demo/README.md
- Narrow updates to automation/review-checklist.md
- Narrow updates to automation/change-log-template.md
- Tiny CI naming/comment alignment only if clearly justified and extremely small

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No smoke assertion changes
- No broad CI redesign
- No unrelated cleanup

# Critical Safety Rule
Do not change automation behavior.
This task is only about making smoke/CI usage expectations explicit and repeatable.

# Working Principles
- Prefer short operational guidance
- Reuse the current smoke runner behavior as-is
- Make CI/operator interpretation explicit
- Keep docs readable under time pressure

# Suggested V1 Coverage
At minimum, document:
- CI should trust smoke exit code first
- `FINAL SUMMARY` is the primary human quick read
- `JSON REPORT` is the primary machine-readable summary
- review checklist should confirm these three stay aligned
- change log template should capture smoke/CI alignment when relevant

If touching CI at all, only do a tiny alignment improvement that does not change behavior.

# Required Behavior / Structure
The result should make it clear:
1. how CI should interpret smoke success/failure
2. how operators should read smoke output
3. what docs must stay aligned when smoke output changes
4. that no runtime behavior changed

# Completion Criteria
Complete only when:
- smoke/CI interpretation is documented clearly
- review checklist and change-log template reflect the current smoke contract
- diff remains narrow and mostly documentation-focused
- current safe behavior remains unchanged

# Validation
Use repository reality. Prefer:
- git diff -- automation/demo/README.md automation/review-checklist.md automation/change-log-template.md .github/workflows/ci.yml
- optional lint/tsc only if code or workflow behavior changed

# Required Result Format
Return:
1. Files changed
2. What smoke/CI alignment changes were made
3. Validation commands run if any
4. Risks or follow-up notes
5. Final diff summary