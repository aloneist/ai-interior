# Goal
Make the operator-facing smoke report entrypoint more cross-platform without changing smoke behavior.

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
Replace the current Unix-specific local smoke-report alias with a more portable operator-facing entrypoint while preserving the same smoke behavior and report-file intent.

# Required Design Direction
The design must follow these rules:

1. Do not change what smoke validates.
2. Do not change current smoke runtime behavior.
3. Prefer one small portability improvement over broader tooling changes.
4. Keep the diff narrow and reviewable.
5. Reflect current repository reality only.

# Allowed Changes
- Narrow update to package.json
- Narrow updates to automation/demo/README.md
- Narrow updates to automation/operator-runbook.md
- Small helper addition only if strictly required to avoid shell-specific env syntax

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No smoke assertion changes
- No broad refactor
- No unrelated cleanup

# Critical Safety Rule
Do not change automation behavior.
This task is only about improving local operator portability.

# Working Principles
- Prefer the smallest cross-platform fix
- Reuse the existing smoke report path mechanism
- Keep the operator entrypoint simple
- Preserve current stdout/output/exit behavior

# Suggested V1 Direction
Prefer one of:
- a tiny Node-based wrapper that sets AUTOMATION_SMOKE_REPORT_PATH and runs the existing smoke path
- a package.json script approach that avoids Unix-only inline env syntax

Keep the final operator command simple, such as:
- npm run automation:smoke:report

# Required Behavior / Structure
The result should make it clear:
1. what command operators should run locally
2. that it works without Unix-only inline env syntax
3. that smoke behavior itself is unchanged
4. where the local report file is written

# Completion Criteria
Complete only when:
- the repo has a more portable operator-facing smoke report entrypoint
- current smoke behavior remains unchanged
- docs mention the entrypoint briefly
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run automation:smoke
- npm run automation:smoke:report
- run lint/tsc only if code files change

# Required Result Format
Return:
1. Files changed
2. What cross-platform entrypoint changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary