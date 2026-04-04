# Goal
Establish the first safe Supabase read-only gateway shape inside the AI-INTERIOR main repository as part of the automation system buildout.

# Scope
This task is for automation infrastructure only.

Primary target area:
- automation/capabilities/*
- automation/providers/*
- automation/orchestration/*
- automation/execution/*
- automation/demo/*
- related automation-only helper files if strictly required

This is not a product-feature task.

# Primary Objective
Create or refine a read-only Supabase gateway path that the automation layer can call safely without turning Codex into a direct privileged database operator.

The output of this task should move the system from:
- stub-only provider shape

toward:
- explicit read-only gateway contract
- explicit provider boundary
- explicit allowed operation surface
- safe demo/smoke-testable execution path

# Required Design Direction
The design must follow these rules:

1. Codex must not be treated as holding raw unrestricted DB power.
2. The automation layer should call a restricted boundary, not arbitrary database access.
3. Version 1 is read-only only.
4. Allowed operations should be narrow and explicit.
5. The diff should stay inside automation/infrastructure areas as much as possible.

# Allowed Changes
- Narrow updates to automation capability contracts
- Narrow updates to provider interfaces / provider registry
- Read-only Supabase gateway/provider implementation or placeholder implementation
- Small execution-path wiring changes required to support the provider
- Small demo/smoke-test updates required to prove the path works
- Small documentation comments only if directly helpful

# Disallowed Changes
- No broad DB redesign
- No product runtime integration
- No UI changes
- No recommendation-quality work
- No QA baseline/rerun work
- No admin write operations
- No broad refactor outside the automation path
- No direct unrestricted SQL execution surface for Codex
- No secret-handling redesign beyond what is minimally required for a read-only boundary

# Critical Safety Rule
Do not create a general-purpose database execution tool.
Create only a narrow read-only gateway with clearly limited operations.

# Working Principles
- Prefer the smallest viable read-only surface
- Make allowed read operations explicit
- Keep provider boundaries obvious
- Preserve the existing automation scaffold shape
- Make the result easy to test with a smoke/demo path
- Use the fixed env variable names if any token variable is referenced

# Suggested V1 Capability Direction
Use a narrow capability shape such as one of the following approaches:

Option A:
- keep `catalog.read`
- make its provider boundary explicitly Supabase read-only

Option B:
- add a new clearly named read-only capability if the current contract is too vague

Prefer the option with the smallest safe diff.

# Required Behavior / Structure
The result should make it clear:
1. what read-only operation is allowed
2. what input shape is accepted
3. what provider is responsible
4. how execution selects the provider
5. how the demo/smoke path proves the gateway works

# Completion Criteria
Complete only when:
- the automation layer has a clearer Supabase read-only gateway path than the current stub-only state
- the allowed read surface is narrow and explicit
- the provider boundary is still safe and reviewable
- the execution path still fits the current automation structure
- a smoke/demo path exists or is updated to validate the read-only flow

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- existing automation smoke path if present
- any narrow automation-only validation needed for the new gateway path

# Required Result Format
Return:
1. Files changed
2. What read-only gateway changes were made
3. Validation commands run
4. Risks or follow-up notes
5. Final diff summary