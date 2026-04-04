# Goal
Create the first explicit automation change log template for the AI-INTERIOR automation system.

# Scope
This task is automation documentation and review infrastructure only.

Primary target area:
- automation/README.md
- automation/review-checklist.md
- automation/change-log-template.md

This is not product-feature work.
This is not persistence, UI integration, or workflow runtime integration.

# Primary Objective
Produce a concise operator-facing change log template that can be reused after automation-system changes to record:
- what changed
- why it changed
- what was validated
- what risks remain
- what document/contracts must stay aligned

# Required Design Direction
The design must follow these rules:

1. Do not change execution behavior in this task.
2. Prefer one reusable template over broad prose.
3. The template must reflect current repository reality only.
4. Keep the diff narrow and documentation-focused.
5. Make the result useful for future operator review and Codex result review loops.

# Allowed Changes
- Add `automation/change-log-template.md`
- Narrow updates to `automation/README.md`
- Narrow updates to `automation/review-checklist.md` only if a short cross-link is clearly helpful

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No real network delivery
- No broad refactor
- No unrelated cleanup
- No new contract layer
- No execution-path changes

# Critical Safety Rule
Do not add new automation behavior in this task.
This task is only about making post-change recording safer and more repeatable.

# Working Principles
- Prefer short reusable sections
- Reflect current actual automation review flow
- Make it easy to capture validation results and remaining risks
- Keep the template readable under time pressure
- Make it useful immediately after a Codex result is reviewed

# Suggested V1 Template Coverage
At minimum, include sections for:
- change title / date / task id
- files changed
- goal of the change
- key contract/runtime/doc changes
- validation commands run
- result summary
- remaining risks / follow-up notes
- docs that must be kept aligned
- approval status

Also include a short note for:
- when to reference `automation/contract-map.md`
- when to reference `automation/review-checklist.md`

# Required Behavior / Structure
The result should make it clear:
1. how to record an automation change after review
2. what minimum evidence should always be captured
3. what docs should be updated alongside the change when needed
4. how approval status should be recorded

# Completion Criteria
Complete only when:
- the repo has a concise automation change log template
- the template reflects current repository reality
- the diff remains narrow and documentation-focused
- no safe execution behavior was broadened

# Validation
Use repository reality. Prefer:
- `git diff -- automation/README.md automation/review-checklist.md automation/change-log-template.md`
- optional doc review only

# Required Result Format
Return:
1. Files changed
2. What change-log-template documentation changes were made
3. Validation commands run if any
4. Risks or follow-up notes
5. Final diff summary