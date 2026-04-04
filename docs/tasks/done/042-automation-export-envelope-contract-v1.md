# Goal
Define the first explicit automation export envelope contract inside the AI-INTERIOR automation system.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/execution/*
- automation/orchestration/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not persistence, UI integration, or full workflow/runtime integration yet.

# Primary Objective
Create a narrow export envelope contract that packages a single automation run for safe external handoff or logging use, based on the existing internal contract bundle.

# Required Design Direction
The design must follow these rules:

1. Do not add persistence in this task.
2. Do not change current safe execution behavior.
3. The export envelope must be derived from the existing contract bundle, not create a parallel system.
4. Keep the envelope explicit, narrow, and safe for external handoff.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to execution/orchestration export-envelope-related types
- Narrow helper additions for building an export envelope
- Small demo/smoke updates required to surface and validate the export envelope
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No DB writes
- No UI changes
- No real workflow integration
- No network delivery expansion beyond current placeholder boundaries
- No broad refactor
- No risky execution behavior changes

# Critical Safety Rule
Do not broaden execution behavior or expose raw unrestricted payloads.
This task is only about defining and surfacing a safe export envelope contract.

# Working Principles
- Prefer the smallest useful external-safe envelope
- Reuse the existing contract bundle
- Keep the export shape easy to inspect and review
- Expose only safe summary-level fields at the top level
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Export Envelope Direction
At minimum, the export envelope should make it clear:
- envelopeId
- generatedAt
- exportTarget
- requestId
- capabilityId
- executionMode
- finalStatus
- approvalState if applicable
- reviewStatus if applicable
- reportId
- auditEventId
- contractBundle reference or embedded safe bundle payload

Avoid raw unrestricted payloads, secrets, and large opaque blobs.
If embedding the bundle, do so deliberately and keep the top-level envelope narrow.

# Required Behavior / Structure
The result should make it clear:
1. what an export envelope looks like
2. when it is produced
3. how it relates to the existing contract bundle
4. how smoke/demo proves the export envelope exists

# Completion Criteria
Complete only when:
- the automation system has an explicit export envelope contract
- both auto-run and approval-related flows can surface an export envelope
- current safe behavior remains unchanged
- smoke/demo validation covers the export envelope
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What export envelope contract changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary