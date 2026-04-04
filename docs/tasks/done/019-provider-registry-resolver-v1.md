# 019 - Provider Registry Resolver V1

## Goal
Add a small provider registry/resolver layer inside the main `AI-INTERIOR` repository so automation providers can be discovered by capability or provider id.

This task is for registry/resolver structure only.
Do not add real external integration.
Do not change product behavior.

## Scope
Only touch files needed for the provider registry/resolver.

Preferred scope:
- `automation/providers/*`
- optionally:
  - `automation/capabilities/registry.ts`
  - `automation/providers/supabase/*`
  - `automation/providers/example/*`
  - nearby README files only if directly needed

Do not modify product logic, recommendation logic, parser logic, API behavior, UI behavior, or database behavior.

## Primary Objective
- Create a small provider registry
- Allow lookup by provider id
- Allow lookup by capability id
- Keep unsupported or placeholder providers visible in a controlled way
- Keep all logic isolated inside `automation/`

## Allowed Changes
- Add a provider registry file
- Add a resolver file or equivalent helper
- Add small supporting type refinements if directly required
- Add exports/index files if useful
- Add small README notes only if needed for clarity

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
This is a registry/resolver task only.

Do not add product runtime wiring.
Do not add hidden integration logic.
Do not turn placeholder providers into real integrations.

## Working Principles
- Keep it small
- Prefer explicit registration over magic discovery
- Keep capability lookup predictable
- Make later provider additions simple
- Avoid overengineering

## Required Behavior
Add a registry/resolver layer that can at least:

1. return all registered providers
2. resolve one provider by provider id
3. resolve providers that support a given capability
4. optionally separate `ready` from `placeholder` or `unsupported`
5. keep typed outputs aligned with current provider contracts

## Suggested Structure
A good result may include:
- `automation/providers/registry.ts`
- `automation/providers/resolver.ts`
- optional exports via `automation/providers/index.ts`

Exact file names may vary if clarity improves, but keep the same intent.

## Completion Criteria
- A provider registry exists
- Capability-based lookup exists
- Provider-id lookup exists
- The implementation stays inside `automation/`
- No product logic files were modified

## Validation
Run in this order:

1. Review the diff and confirm only automation provider-layer files changed
2. Confirm no product logic files were modified
3. Summarize the registry/resolver structure
4. Explain how provider lookup works
5. Confirm no real external integration was added

## Required Result Format
Report results using this structure:

- changed files
- registry/resolver summary
- lookup behavior summary
- validation result
- risk notes