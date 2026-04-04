# Goal
Create the first explicit automation env example and setup documentation for the AI-INTERIOR automation webhook flow.

# Scope
This task is automation documentation and operator setup only.

Primary target area:
- automation/README.md
- automation/orchestration/n8n/README.md
- automation/demo/README.md
- automation/env.example.md or automation/env-setup.md

This is not product-feature work.
This is not runtime behavior change, persistence, or UI integration.

# Primary Objective
Document the new automation webhook env contract clearly so operators and future Codex runs can configure outbound and inbound webhook behavior without ambiguity.

# Required Design Direction
The design must follow these rules:

1. Do not change runtime behavior in this task.
2. Prefer one concise setup doc over scattered notes.
3. Reflect current repository reality only.
4. Make outbound and inbound config usage explicit.
5. Keep the diff narrow and documentation-focused.

# Allowed Changes
- Add one focused automation env/setup doc
- Narrow README updates with pointers only where helpful
- Small documentation clarifications related to the new webhook config split

# Disallowed Changes
- No product runtime changes
- No DB writes
- No UI changes
- No webhook behavior changes
- No broad refactor
- No unrelated cleanup
- No new contract layer

# Critical Safety Rule
Do not reintroduce ambiguous config behavior.
This task is only about documenting the current explicit setup.

# Working Principles
- Prefer short actionable setup guidance
- Make required vs optional config obvious
- Separate outbound and inbound setup clearly
- Keep docs readable under time pressure

# Suggested V1 Coverage
At minimum, document:
- `AUTOMATION_APPROVAL_WEBHOOK_URL`
- `AUTOMATION_APPROVAL_WEBHOOK_SECRET`
- what each variable is used for
- which path uses each variable
- what happens when each variable is missing
- how smoke uses them
- explicit note that `ADMIN_TOKEN` is not part of automation webhook config

Also include:
- a minimal local test example
- a short operator checklist for verifying setup

# Required Behavior / Structure
The result should make it clear:
1. what env variables are needed
2. which automation path consumes each variable
3. how to configure local smoke testing
4. what docs to read next

# Completion Criteria
Complete only when:
- the repo has a concise automation env/setup doc
- current README docs point to it where useful
- the docs reflect current repository reality
- the diff remains narrow and documentation-focused

# Validation
Use repository reality. Prefer:
- git diff -- automation/README.md automation/orchestration/n8n/README.md automation/demo/README.md automation/env-setup.md
- optional doc review only

# Required Result Format
Return:
1. Files changed
2. What env/setup documentation changes were made
3. Validation commands run if any
4. Risks or follow-up notes
5. Final diff summary