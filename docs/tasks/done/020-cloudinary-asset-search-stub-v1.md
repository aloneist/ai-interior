# 020 - Cloudinary Asset Search Stub V1

## Goal
Add the first practical Cloudinary provider stub for `asset.search` inside the main `AI-INTERIOR` repository.

This task is for a non-integrated provider stub only.
Do not connect to Cloudinary yet.
Do not change product behavior.

## Scope
Only touch files needed for the Cloudinary provider stub.

Preferred scope:
- `automation/providers/cloudinary/*`
- optionally small supporting updates under:
  - `automation/providers/types.ts`
  - `automation/providers/registry.ts`
  - `automation/providers/resolver.ts`
  - `automation/providers/cloudinary/README.md`
  - `automation/providers/index.ts`

Do not modify product logic, recommendation logic, parser logic, API behavior, UI behavior, or database behavior.

## Primary Objective
- Create a first Cloudinary provider stub for `asset.search`
- Make the stub conform to the current provider and capability contracts
- Keep it read/search-only and static
- Prove that the provider registry/resolver structure works cleanly with more than one provider and more than one executable capability

## Allowed Changes
- Add a provider stub file under `automation/providers/cloudinary/`
- Add static/mock asset result data inside the stub if needed
- Add small type-only or registry-alignment changes if directly required
- Add a small README note only if useful for clarity
- Add or refine local exports if needed

## Disallowed Changes
- No product logic changes
- No recommendation logic changes
- No parser logic changes
- No API behavior changes
- No UI behavior changes
- No DB changes
- No real Cloudinary calls
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
- Keep behavior explicit
- Return static mock data only
- Make the provider shape easy to replace with a real implementation later
- Prefer clarity over abstraction

## Required Stub Behavior
Create a read/search-only provider stub that:

1. identifies itself as a Cloudinary provider placeholder
2. declares support for `asset.search`
3. marks other capabilities as unsupported or placeholder as appropriate
4. accepts the typed provider request shape
5. returns a typed `asset.search` mock result
6. keeps all logic isolated inside `automation/`

## Suggested Stub Shape
A good result would include:
- provider metadata
- supported capability map
- one executor implementation for `asset.search`
- a small static result payload such as asset summaries, tags, kind, source, or count/list structure

The exact mock response can be simple.
It only needs to demonstrate contract correctness.

## Completion Criteria
- A first Cloudinary provider stub exists
- It conforms to the current contract layer
- It is clearly non-integrated and read/search-only
- No product logic files were modified
- The structure is ready for later real provider replacement

## Validation
Run in this order:

1. Review the diff and confirm only automation stub files changed
2. Confirm no product logic files were modified
3. Summarize the stub shape
4. Explain how `asset.search` is represented
5. Confirm there is no real external integration

## Required Result Format
Report results using this structure:

- changed files
- stub summary
- asset.search behavior summary
- validation result
- risk notes