# 018 - Catalog Read Provider Stub V1

## Goal
Add the first practical read-only provider stub for the automation system inside the main `AI-INTERIOR` repository.

This task is for a non-integrated provider stub only.
Do not connect to Supabase yet.
Do not change product behavior.

## Scope
Only touch files needed for the first provider stub.

Preferred scope:
- `automation/providers/supabase/*`
- optionally small supporting updates under:
  - `automation/providers/types.ts`
  - `automation/capabilities/registry.ts`
  - `automation/providers/README.md`
  - `automation/capabilities/README.md`

Do not modify product logic, recommendation logic, parser logic, API behavior, UI behavior, or database behavior.

## Primary Objective
- Create a first provider stub for `catalog.read`
- Make the stub conform to the current provider and capability contracts
- Keep it read-only and static
- Prove that the contract layer is implementable without introducing real integration

## Allowed Changes
- Add a provider stub file under `automation/providers/supabase/`
- Add static/mock result data inside the stub if needed
- Add small type-only or registry-alignment changes if directly required
- Add a small README note only if useful for clarity

## Disallowed Changes
- No product logic changes
- No recommendation logic changes
- No parser logic changes
- No API behavior changes
- No UI behavior changes
- No DB changes
- No real Supabase calls
- No environment-variable reads
- No runtime coupling into product code
- No unrelated cleanup

## Critical Safety Rule
This is a stub task only.

Do not add real network access.
Do not add hidden integration logic.
Do not wire this stub into existing product runtime.

## Working Principles
- Keep the file small
- Keep the behavior explicit
- Return static mock data only
- Make the provider shape easy to replace with a real implementation later
- Prefer clarity over clever abstraction

## Required Stub Behavior
Create a read-only provider stub that:

1. identifies itself as a Supabase provider placeholder
2. declares support for `catalog.read`
3. marks other capabilities as unsupported or placeholder as appropriate
4. accepts the typed provider request shape
5. returns a typed `catalog.read` mock result
6. keeps all logic isolated inside `automation/`

## Suggested Stub Shape
A good result would include something like:
- provider metadata
- supported capability map
- one executor implementation for `catalog.read`
- a small static result payload such as catalog item summaries or a sample count/list structure

The exact mock response can be simple.
It only needs to demonstrate contract correctness.

## Completion Criteria
- A first provider stub exists
- It conforms to the current contract layer
- It is clearly read-only and non-integrated
- No product logic files were modified
- The structure is ready for later real provider replacement

## Validation
Run in this order:

1. Review the diff and confirm only automation stub files changed
2. Confirm no product logic files were modified
3. Summarize the stub shape
4. Explain how `catalog.read` is represented
5. Confirm there is no real external integration

## Required Result Format
Report results using this structure:

- changed files
- stub summary
- catalog.read behavior summary
- validation result
- risk notes