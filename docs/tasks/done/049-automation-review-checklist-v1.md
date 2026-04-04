# Goal
Create the first explicit automation review checklist for the AI-INTERIOR automation system.

# Scope
This task is automation documentation and review infrastructure only.

Primary target area:
- automation/README.md
- automation/contract-map.md
- automation/review-checklist.md

This is not product-feature work.
This is not persistence, UI integration, or workflow runtime integration.

# Primary Objective
Produce a concise operator-facing review checklist that can be used after any automation-system change to verify the current contract stack, smoke path, and approval/handoff boundaries remain correct.

# Required Design Direction
The design must follow these rules:

1. Do not change execution behavior in this task.
2. Prefer one concise checklist over broad prose.
3. The checklist must reflect current repository reality only.
4. Keep the diff narrow and documentation-focused.
5. Make the result useful for operator review and future Codex review loops.

# Allowed Changes
- Add `automation/review-checklist.md`
- Narrow updates to `automation/README.md`
- Narrow updates to `automation/contract-map.md` only if a short cross-link is helpful

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
This task is only about making review safer and more repeatable.

# Working Principles
- Prefer short actionable checks
- Reflect current actual automation contracts and smoke behavior
- Separate always-present checks from approval-only checks
- Keep the checklist readable under time pressure
- Make it suitable for post-change review

# Suggested V1 Checklist Coverage
At minimum, include checks for:
- read-only flows still auto-run
- approval-required flows still stop
- approval handoff contract still exists
- lifecycle state still exists
- audit/report/review summary/state snapshot still exist
- contract bundle/export envelope/export serializer still exist
- transport receipt/handoff summary/delivery readiness/transport adapter still behave honestly
- smoke path remains the primary verification path
- contract map stays updated when contracts change

Also include:
- when to run `npm run automation:smoke`
- when to run `npm run lint`
- when to run `npx tsc --noEmit`

# Required Behavior / Structure
The result should make it clear:
1. what to verify after an automation change
2. what is always expected
3. what is approval-only
4. what docs must stay aligned
5. what commands to run

# Completion Criteria
Complete only when:
- the repo has a concise automation review checklist
- the checklist reflects current repository reality
- the diff remains narrow and documentation-focused
- no safe execution behavior was broadened

# Validation
Use repository reality. Prefer:
- `git diff -- automation/README.md automation/contract-map.md automation/review-checklist.md`
- optional doc review only

# Required Result Format
Return:
1. Files changed
2. What review-checklist documentation changes were made
3. Validation commands run if any
4. Risks or follow-up notes
5. Final diff summary