# Goal
Create the first concise operator runbook for the AI-INTERIOR automation system.

# Scope
This task is automation documentation and operator workflow only.

Primary target area:
- automation/README.md
- automation/env-setup.md
- automation/review-checklist.md
- automation/change-log-template.md
- automation/demo/README.md
- automation/operator-runbook.md

This is not product-feature work.
This is not runtime behavior change, persistence, or UI integration.

# Primary Objective
Produce one short operator-facing runbook that explains how to:
- set up the current automation webhook env
- run the automation smoke test
- interpret the smoke output
- review send-side and receive-side boundaries
- record the result after review

# Required Design Direction
The design must follow these rules:

1. Do not change runtime behavior in this task.
2. Prefer one short practical runbook over broad prose.
3. Reflect current repository reality only.
4. Reuse existing docs by linking to them, not duplicating everything.
5. Keep the diff narrow and documentation-focused.

# Allowed Changes
- Add `automation/operator-runbook.md`
- Narrow pointer updates to existing automation docs only where clearly helpful

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No smoke behavior changes
- No broad refactor
- No unrelated cleanup
- No new contract layer

# Critical Safety Rule
Do not add new automation behavior in this task.
This task is only about making current operator workflow explicit and repeatable.

# Working Principles
- Prefer short step-by-step guidance
- Link to existing docs instead of duplicating detail
- Make send-side / receive-side checks obvious
- Keep it useful under time pressure

# Suggested V1 Runbook Coverage
At minimum, include:
- prerequisites
- env setup doc reference
- smoke command
- optional smoke report file command
- how to read:
  - exit code
  - FINAL SUMMARY
  - JSON REPORT
- what to check for:
  - read-only auto-run
  - approval boundary
  - outbound webhook delivery
  - inbound auth boundary
  - inbound response intake
  - no-resume safety
- where to record results:
  - review checklist
  - change log template
- where to inspect contract structure:
  - contract map

# Required Behavior / Structure
The result should make it clear:
1. what an operator does first
2. what command to run
3. how to interpret success/failure
4. which follow-up docs to use

# Completion Criteria
Complete only when:
- the repo has a short operator runbook
- it reflects current repository reality
- it points to the existing setup/checklist/template/map docs
- the diff remains narrow and documentation-focused

# Validation
Use repository reality. Prefer:
- git diff -- automation/README.md automation/env-setup.md automation/review-checklist.md automation/change-log-template.md automation/demo/README.md automation/operator-runbook.md
- optional doc review only

# Required Result Format
Return:
1. Files changed
2. What operator runbook documentation changes were made
3. Validation commands run if any
4. Risks or follow-up notes
5. Final diff summary