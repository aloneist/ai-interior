# 021 - Automation Execution Service V1

## Goal
Add a small automation-internal execution service inside the main `AI-INTERIOR` repository.

This task is for automation-only execution flow.
Do not wire it into product runtime.
Do not change product behavior.

## Scope
Only touch files needed for the automation execution service.

Preferred scope:
- `automation/*`
- especially:
  - `automation/providers/*`
  - `automation/capabilities/*`
  - `automation/execution/*`

Do not modify product logic, recommendation logic, parser logic, API behavior, UI behavior, or database behavior.

## Primary Objective
- Add a small execution service for automation capabilities
- Accept a typed capability request
- Resolve an appropriate ready provider
- Execute the provider
- Return a typed capability result
- Keep all logic isolated inside `automation/`

## Allowed Changes
- Add `automation/execution/*`
- Add a service file such as `execute-capability.ts` or equivalent
- Add small supporting types if directly needed
- Add a small README for `automation/execution/`
- Add small alignment edits in provider/capability files only if strictly necessary

## Disallowed Changes
- No product logic changes
- No recommendation logic changes
- No parser logic changes
- No API behavior changes
- No UI behavior changes
- No DB changes
- No real external integration
- No environment-variable reads
- No runtime coupling into product code
- No unrelated cleanup

## Critical Safety Rule
This is an automation-internal execution layer only.

Do not wire this service into app runtime.
Do not add hidden network access.
Do not make placeholder providers behave like real integrations.

## Working Principles
- Keep it small
- Prefer explicit selection over magic behavior
- Fail clearly when no ready provider exists
- Preserve typed request/result flow
- Make later real integrations easier, not harder

## Required Behavior
Add an execution service that can at least:

1. accept a typed capability request
2. resolve ready providers for that capability
3. choose one provider deterministically
4. execute the chosen provider
5. return the provider result
6. return a clear typed failure result when no ready provider exists

Optional:
- support an explicit preferred provider id
- expose the selected provider in a lightweight execution summary

## Suggested Structure
A good result may include:
- `automation/execution/README.md`
- `automation/execution/execute-capability.ts`
- optional `automation/execution/types.ts`
- optional barrel export if useful

Small deviations are allowed if they improve clarity, but keep the same intent.

## Completion Criteria
- An automation execution service exists
- It can execute current ready provider stubs
- It stays fully inside `automation/`
- No product logic files were modified
- No real integration was added

## Validation
Run in this order:

1. Review the diff and confirm only automation execution-layer files changed
2. Confirm no product logic files were modified
3. Summarize the execution flow
4. Explain how provider selection works
5. Confirm no real external integration exists

## Required Result Format
Report results using this structure:

- changed files
- execution service summary
- provider selection summary
- validation result
- risk notes