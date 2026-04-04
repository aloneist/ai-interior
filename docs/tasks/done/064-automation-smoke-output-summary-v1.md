# Goal
Improve the automation smoke output into a concise operator-readable summary without changing automation behavior.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/demo/run-smoke-test.ts
- automation/demo/README.md
- related automation-only helper files if strictly required

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime integration.

# Primary Objective
Make the smoke test output easier for operators to review quickly by adding a concise final summary of the current automation state, while preserving all existing validations and behavior.

# Required Design Direction
The design must follow these rules:

1. Do not change automation execution behavior in this task.
2. Do not remove existing validations.
3. Prefer one concise final summary section over noisy extra logs.
4. Keep the result operator-readable under time pressure.
5. Keep the diff narrow and reviewable.

# Allowed Changes
- Narrow updates to automation/demo/run-smoke-test.ts
- Narrow updates to automation/demo/README.md
- Small helper additions only if strictly required for summary formatting

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No contract logic changes
- No broad refactor
- No unrelated cleanup

# Critical Safety Rule
Do not change what the smoke test validates.
This task is only about improving how the result is summarized for human review.

# Working Principles
- Prefer short, high-signal output
- Keep all existing assertions intact
- Summarize the most important states only
- Make it obvious whether:
  - read-only flows still auto-run
  - approval-required flows still stop
  - outbound delivery works
  - inbound auth works
  - inbound response normalization works
  - no resume behavior exists

# Suggested V1 Summary Direction
At minimum, add a final summary block that reports:
- overall pass/fail
- read-only flow status
- approval boundary status
- outbound webhook status
- inbound auth boundary status
- inbound response intake status
- manual resume chain status
- no-resume safety status

Keep it text-only and concise.

# Required Behavior / Structure
The result should make it clear:
1. what the smoke currently covers
2. whether the key automation boundaries passed
3. that risky execution still does not resume
4. how operators should interpret the final summary

# Completion Criteria
Complete only when:
- smoke output includes a concise final summary
- existing validations remain intact
- current automation behavior remains unchanged
- README explains the new summary briefly
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What smoke-output summary changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary