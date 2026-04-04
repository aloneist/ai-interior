# Goal
Add the first optional file-based smoke report output for the AI-INTERIOR automation system, without changing smoke validation behavior.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/demo/run-smoke-test.ts
- automation/demo/README.md

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime integration.

# Primary Objective
Extend the smoke runner so it can optionally write the existing machine-readable JSON smoke report to a local file, while preserving:
- current validations
- current detailed logs
- current FINAL SUMMARY
- current JSON REPORT stdout block
- current exit-code contract

# Required Design Direction
The design must follow these rules:

1. Do not change what smoke validates.
2. Do not remove current stdout behavior.
3. File output must be optional, explicit, and local-only.
4. The file report must be derived from the existing JSON smoke report.
5. Keep the diff narrow and reviewable.

# Allowed Changes
- Narrow updates to automation/demo/run-smoke-test.ts
- Narrow updates to automation/demo/README.md
- Small helper additions only if strictly required for file writing

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
This task is only about adding an optional local file output for the existing JSON report.

# Working Principles
- Prefer the smallest optional file-output path
- Reuse the existing JSON smoke report
- Keep stdout output unchanged
- Keep the file path explicit and easy to review
- Preserve current safe behavior

# Suggested V1 File Output Direction
A good v1 implementation should:
- keep JSON REPORT printed to stdout
- optionally write the same report to a local file only when explicitly requested
- use one narrow env or CLI-free toggle if possible
- avoid broad file-management behavior

Preferred shape:
- env toggle such as `AUTOMATION_SMOKE_REPORT_PATH`
- if set, write the JSON report to that exact path
- if not set, do not write any file
- fail safely and explicitly if the file write cannot be completed

# Required Behavior / Structure
The result should make it clear:
1. how the optional file output is enabled
2. what exact data is written
3. that stdout output remains unchanged
4. how operators should use the file output
5. how failure to write is handled safely

# Completion Criteria
Complete only when:
- smoke still validates the same behavior
- stdout output remains intact
- JSON report can optionally be written to a local file
- README explains the optional file output briefly
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke
- optional smoke run with AUTOMATION_SMOKE_REPORT_PATH set

# Required Result Format
Return:
1. Files changed
2. What smoke report file-output changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary