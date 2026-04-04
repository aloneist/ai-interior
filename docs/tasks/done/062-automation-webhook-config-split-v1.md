# Goal
Remove `ADMIN_TOKEN` from the automation webhook path and split outbound/inbound webhook config into clear dedicated variables.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/orchestration/n8n/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not product-feature work.
This is not risky execution resume, persistence, or UI integration yet.

# Primary Objective
Replace the current overloaded `ADMIN_TOKEN` usage in automation with explicit dedicated config for:
- outbound approval webhook delivery URL
- inbound approval webhook shared secret

# Required Design Direction
The design must follow these rules:

1. `ADMIN_TOKEN` must no longer be used by automation webhook delivery or inbound auth.
2. Outbound and inbound config must be clearly separated.
3. Keep the current outbound and inbound automation behavior intact.
4. Do not resume risky execution in this task.
5. Keep the diff inside automation/infrastructure areas.

# Allowed Changes
- Narrow updates under automation/orchestration/n8n/*
- Narrow demo/smoke updates required to use the new config names
- Small documentation updates directly related to config/env usage
- Small helper additions if strictly required for explicit config resolution

# Disallowed Changes
- No risky execution resume
- No DB writes
- No UI changes
- No product runtime route integration
- No broad orchestration redesign
- No unrelated refactor

# Critical Safety Rule
Do not broaden execution behavior.
This task is only about removing config overloading and making automation webhook config explicit.

# Working Principles
- Prefer the smallest useful config split
- Use clear dedicated env names
- Keep outbound URL and inbound auth secret separate
- Preserve current safe behavior
- Keep smoke/demo coverage narrow and useful

# Required Env Direction
Introduce explicit dedicated env names for automation webhook behavior.

Recommended names:
- `AUTOMATION_APPROVAL_WEBHOOK_URL`
- `AUTOMATION_APPROVAL_WEBHOOK_SECRET`

Requirements:
- outbound sender uses only `AUTOMATION_APPROVAL_WEBHOOK_URL`
- inbound auth boundary validates only `AUTOMATION_APPROVAL_WEBHOOK_SECRET`
- `ADMIN_TOKEN` remains untouched and outside this automation path

# Required Behavior / Structure
The result should make it clear:
1. where outbound webhook URL config is resolved
2. where inbound shared-secret config is resolved
3. how missing/invalid config is classified
4. how smoke/demo proves the split works
5. that approved responses still do not resume blocked execution

# Completion Criteria
Complete only when:
- `ADMIN_TOKEN` is removed from the automation webhook path
- outbound webhook delivery uses a dedicated URL env
- inbound auth uses a dedicated secret env
- current safe behavior remains unchanged
- no blocked operation is auto-resumed
- smoke/demo validation covers the new config split
- diff remains narrow and reviewable

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:smoke

# Required Result Format
Return:
1. Files changed
2. What webhook config split changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary