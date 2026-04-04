# Goal
Make the automation smoke runner expose an explicit exit-code contract that matches the current human summary and JSON report, without changing smoke behavior.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/demo/run-smoke-test.ts
- automation/demo/README.md

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime integration.

# Primary Objective
Define and implement a narrow exit-code contract so operators and future CI usage can rely on smoke termination behavior explicitly, rather than inferring it from logs.

# Required Design Direction
The design must follow these rules:

1. Do not change what smoke validates.
2. Do not remove current detailed logs, final human summary, or JSON report.
3. Keep the exit-code behavior explicit, stable, and derived from existing smoke outcomes.
4. Keep the diff narrow and reviewable.
5. Keep current safe behavior intact.

# Allowed Changes
- Narrow updates to automation/demo/run-smoke-test.ts
- Narrow updates to automation/demo/README.md
- Small helper additions only if strictly required for explicit exit-code handling

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No contract logic changes
- No broad refactor
- No unrelated cleanup

# Critical Safety Rule
Do not change automation behavior or smoke assertions.
This task is only about making the smoke exit-code contract explicit.

# Working Principles
- Prefer the smallest explicit exit-code contract
- Reuse existing overall pass/fail state
- Keep exit behavior easy for humans and CI to reason about
- Preserve current detailed output

# Suggested V1 Exit-Code Direction
At minimum, make it explicit that:
- exit code `0` means all smoke scenarios passed
- exit code `1` means one or more smoke scenarios failed

If the runner already behaves this way, make the contract explicit in code structure and README rather than changing behavior unnecessarily.

# Required Behavior / Structure
The result should make it clear:
1. what exit codes the smoke runner uses
2. how the exit code is derived
3. that the human summary and JSON report remain unchanged
4. how operators/CI should interpret the exit code

# Completion Criteria
Complete only when:
- smoke has an explicit exit-code contract
- current validations remain intact
- current human summary and JSON report remain intact
- README explains the exit-code contract briefly
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What smoke exit-code contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary