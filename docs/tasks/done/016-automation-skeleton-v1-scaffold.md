# 016 - Automation Skeleton V1 Scaffold

## Goal
Create the first practical automation skeleton inside the main `AI-INTERIOR` repository.

This task is for structure only.
Do not implement real external service integrations yet.
Do not change product behavior.

## Scope
Only touch files directly needed for the automation skeleton.

Preferred scope:
- `automation/*`
- `automation/**/*`

Do not modify product logic, recommendation logic, parser logic, API behavior, UI behavior, or database behavior.

## Primary Objective
- Create a minimal but extensible automation directory structure
- Separate capability definitions from provider-specific integration placeholders
- Reserve clear locations for provider integrations, orchestration, and CI hooks
- Keep the structure small and practical

## Allowed Changes
- Add the `automation/` directory
- Add `README.md` files explaining each folder briefly
- Add small TypeScript type files for capability/provider contracts
- Add a capability registry placeholder
- Add minimal example placeholders where useful

## Disallowed Changes
- No product logic changes
- No recommendation logic changes
- No parser logic changes
- No API behavior changes
- No UI behavior changes
- No DB changes
- No real Supabase or Cloudinary implementation yet
- No n8n workflow implementation yet
- No unrelated cleanup

## Critical Safety Rule
This is a structural scaffold task only.

Do not mix structure setup with real external integration.
Do not modify any existing product code.

## Working Principles
- Keep the scaffold small
- Prefer role-based structure over service-specific structure
- Make future provider addition easier
- Avoid overengineering
- Make folder intent obvious

## Required Structure
Create a practical structure like:

- `automation/README.md`
- `automation/capabilities/README.md`
- `automation/capabilities/types.ts`
- `automation/capabilities/registry.ts`
- `automation/providers/README.md`
- `automation/providers/types.ts`
- `automation/providers/supabase/README.md`
- `automation/providers/cloudinary/README.md`
- `automation/providers/example/README.md`
- `automation/orchestration/README.md`
- `automation/orchestration/n8n/README.md`
- `automation/ci/README.md`

Small deviations are allowed if they improve clarity, but keep the same intent.

## Completion Criteria
- The automation skeleton exists in the main repository
- Capability and provider boundaries are separated
- No product logic files were modified
- The structure is easy to extend later

## Validation
Run in this order:

1. Review the diff and confirm only automation-skeleton-related files were added
2. Confirm no product logic files were modified
3. Summarize the created directory structure
4. Summarize the purpose of each top-level automation folder

## Required Result Format
Report results using this structure:

- changed files
- structure summary
- folder purpose summary
- validation result
- risk notes