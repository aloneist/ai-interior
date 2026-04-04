# Goal
Add the first machine-readable JSON smoke report for the AI-INTERIOR automation system without changing smoke behavior.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/demo/run-smoke-test.ts
- automation/demo/README.md
- related automation-only helper files if strictly required

This is not product-feature work.
This is not persistence, UI integration, or workflow/runtime integration.

# Primary Objective
Extend the smoke runner so it can produce a concise machine-readable JSON report of the same already-validated smoke outcomes, while preserving current smoke behavior and human-readable output.

# Required Design Direction
The design must follow these rules:

1. Do not change what smoke validates.
2. Do not remove the current human-readable output or final summary.
3. The JSON report must be derived from existing smoke scenario results and final summary state.
4. Keep the report narrow, stable, and operator/Codex-friendly.
5. Keep the diff narrow and reviewable.

# Allowed Changes
- Narrow updates to automation/demo/run-smoke-test.ts
- Narrow updates to automation/demo/README.md
- Small helper additions only if strictly required for report shaping

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
This task is only about adding a machine-readable report output.

# Working Principles
- Prefer one small stable JSON report
- Reuse existing scenario results and final summary
- Keep keys explicit and easy to inspect
- Make the report useful for CI/operator follow-up later
- Preserve current safe behavior

# Suggested V1 Report Direction
At minimum, the JSON report should contain:
- generatedAt
- overallStatus
- scenarioCount
- passedCount
- summary:
  - readOnlyCatalog
  - readOnlyAsset
  - approvalBoundary
  - outboundWebhook
  - inboundAuthBoundary
  - inboundResponseIntake
  - manualResumeChain
  - noResumeSafety
- scenarios:
  - label
  - capabilityId
  - ok
  - selectedProvider if applicable
  - executionMode if applicable
  - errorCode if applicable

Output direction:
- print one final JSON block to stdout and/or
- optionally write one local report file under automation/demo/ if explicitly simple and safe

Prefer the smallest approach that keeps current smoke use simple.

# Required Behavior / Structure
The result should make it clear:
1. what the JSON smoke report contains
2. how it is derived from existing smoke results
3. that the current final human summary still exists
4. how operators should use the JSON report

# Completion Criteria
Complete only when:
- smoke still validates the same behavior
- a concise JSON smoke report is produced
- current human-readable summary remains intact
- README explains the JSON report briefly
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What JSON smoke report changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary