# 017 - Automation Capability Contract V1

## Goal
Refine the first automation skeleton by defining a practical capability contract v1 inside the main `AI-INTERIOR` repository.

This task is for contract definition only.
Do not implement real providers yet.
Do not change product behavior.

## Scope
Only touch automation contract files.

Preferred scope:
- `automation/capabilities/*`
- `automation/providers/types.ts`
- optionally small README updates under `automation/` if directly needed

Do not modify product logic, recommendation logic, parser logic, API behavior, UI behavior, or database behavior.

## Primary Objective
- Define a small set of core automation capabilities
- Define capability names consistently
- Define minimal input/output contract shapes
- Define the minimum provider interface needed to support those capabilities
- Keep the contract extensible but small

## Allowed Changes
- Refine `automation/capabilities/types.ts`
- Refine `automation/capabilities/registry.ts`
- Refine `automation/providers/types.ts`
- Add small supporting type aliases if needed
- Update nearby README files only if necessary to match the new contract

## Disallowed Changes
- No product logic changes
- No recommendation logic changes
- No parser logic changes
- No API behavior changes
- No UI behavior changes
- No DB changes
- No real Supabase implementation yet
- No real Cloudinary implementation yet
- No n8n implementation yet
- No unrelated cleanup

## Critical Safety Rule
This is a contract-definition task only.

Do not mix capability definition with provider implementation.
Do not add runtime coupling to product code.

## Working Principles
- Keep the contract small
- Prefer stable capability names
- Define only the fields that are clearly useful now
- Avoid overengineering
- Make later provider implementation easier, not harder

## Required Capability Set
Define a practical v1 capability set such as:

- `catalog.read`
- `catalog.write.safe`
- `asset.upload`
- `asset.search`
- `qa.run`
- `approval.request`
- `notify.send`

Small naming adjustments are allowed if they improve consistency, but keep the same intent.

## Required Contract Shape
Define at least:

1. capability identifier type
2. capability metadata shape
3. capability input/output envelope shape
4. provider capability support shape
5. provider execution interface or equivalent placeholder

Keep this lightweight and implementation-ready.

## Completion Criteria
- Core capability names are defined
- Input/output contract shapes are defined
- Provider-facing contract is clearer than before
- No product logic files were modified
- The contract is small enough to implement later without rework

## Validation
Run in this order:

1. Review the diff and confirm only automation contract files changed
2. Confirm no product logic files were modified
3. Summarize the capability set
4. Summarize the provider-facing contract

## Required Result Format
Report results using this structure:

- changed files
- capability summary
- provider contract summary
- validation result
- risk notes