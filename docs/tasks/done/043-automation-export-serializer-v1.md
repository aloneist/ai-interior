# Goal
Define and implement the first explicit automation export serializer contract inside the AI-INTERIOR automation system.

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
Create a narrow serializer layer that turns the existing automation export envelope into a stable, reviewable export payload string/object form for future external handoff or logging use.

# Required Design Direction
The design must follow these rules:

1. Do not add persistence in this task.
2. Do not change current safe execution behavior.
3. The serializer must be derived from the existing export envelope, not create a parallel system.
4. Keep the serializer explicit, narrow, and safe for external handoff.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow additions to execution/orchestration serializer-related types
- Narrow helper additions for building serialized export payloads
- Small demo/smoke updates required to surface and validate the serializer output
- Small automation-only documentation comments if directly helpful

# Disallowed Changes
- No DB writes
- No UI changes
- No real workflow integration
- No network delivery expansion
- No broad refactor
- No risky execution behavior changes

# Critical Safety Rule
Do not broaden execution behavior or expose raw unrestricted payloads.
This task is only about defining and surfacing a safe serializer contract.

# Working Principles
- Prefer the smallest useful serializer layer
- Reuse the existing export envelope
- Keep the serialized output deterministic and reviewable
- Expose only safe envelope-derived data
- Keep smoke/demo coverage narrow and useful
- Preserve current safe behavior

# Suggested V1 Serializer Direction
At minimum, the serializer layer should make it clear:
- serializerVersion
- serializedAt
- contentType
- envelopeId
- exportTarget
- payloadObject and/or payloadJson
- whether serialization succeeded

If both object and JSON string are provided, keep them tightly aligned and derived from the same source.

# Required Behavior / Structure
The result should make it clear:
1. what a serialized export payload looks like
2. when it is produced
3. how it relates to the existing export envelope
4. how smoke/demo proves the serializer exists

# Completion Criteria
Complete only when:
- the automation system has an explicit export serializer contract
- both auto-run and approval-related flows can surface serialized export output
- current safe behavior remains unchanged
- smoke/demo validation covers the serializer output
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What export serializer changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary