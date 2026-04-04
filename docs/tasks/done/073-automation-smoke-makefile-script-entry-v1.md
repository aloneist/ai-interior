# Goal
Add one simple operator-friendly entrypoint for running the current automation smoke flow.

# Scope
This task is for automation infrastructure only.

Primary target area:
- package.json
- automation/demo/README.md
- automation/operator-runbook.md
- related automation-only helper files if strictly required

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime redesign.

# Primary Objective
Make the automation smoke flow easier to run consistently by adding one explicit operator-facing npm script entrypoint for the current smoke behavior and documenting it.

# Required Design Direction
The design must follow these rules:

1. Do not change what smoke validates.
2. Do not change current smoke runtime behavior.
3. Prefer one small script alias over broader tooling changes.
4. Keep the diff narrow and reviewable.
5. Reflect current repository reality only.

# Allowed Changes
- Narrow update to package.json
- Narrow updates to automation/demo/README.md
- Narrow updates to automation/operator-runbook.md
- Small doc-only clarifications if directly helpful

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No smoke assertion changes
- No broad refactor
- No unrelated cleanup
- No Makefile introduction unless one already exists

# Critical Safety Rule
Do not change automation behavior.
This task is only about adding a clearer operator entrypoint.

# Working Principles
- Prefer the smallest operator-friendly command alias
- Reuse the existing smoke command
- Keep current output/exit/artifact behavior intact
- Keep docs short and practical

# Suggested V1 Direction
Use one explicit npm script alias such as:
- `automation:smoke:report`

or another equally clear name if repository reality suggests a better fit.

The alias should only wrap the current smoke runner and optionally make the report-path usage easier if appropriate, without changing default behavior.

If a second helper script is useful, keep it minimal and justified.

# Required Behavior / Structure
The result should make it clear:
1. what command operators should run locally
2. how it differs from or complements the current smoke command
3. that smoke behavior itself is unchanged
4. where operators should look next in the docs

# Completion Criteria
Complete only when:
- the repo has a clearer operator-facing smoke entrypoint
- current smoke behavior remains unchanged
- docs mention the new entrypoint briefly
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint if package.json/scripts cause code checks
- npx tsc --noEmit if needed
- npm run automation:smoke
- npm run automation:smoke:report if added

# Required Result Format
Return:
1. Files changed
2. What operator entrypoint changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary