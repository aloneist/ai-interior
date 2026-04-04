# Goal
Establish the first safe Cloudinary read-only gateway shape inside the AI-INTERIOR main repository as part of the automation system buildout.

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
Create or refine a read-only Cloudinary gateway path that the automation layer can call safely without turning Codex into a general Cloudinary operator.

The output of this task should move the system from:
- stub-only asset search shape

toward:
- explicit read-only asset search contract
- explicit provider boundary
- explicit allowed operation surface
- safe demo/smoke-testable execution path

# Required Design Direction
The design must follow these rules:

1. Codex must not be treated as having unrestricted Cloudinary power.
2. The automation layer should call a restricted boundary, not arbitrary asset/admin APIs.
3. Version 1 is read-only only.
4. Allowed operations should be narrow and explicit.
5. The diff should stay inside automation/infrastructure areas as much as possible.

# Allowed Changes
- Narrow updates to automation capability contracts
- Narrow updates to provider interfaces / provider registry
- Read-only Cloudinary gateway/provider implementation or placeholder implementation
- Small execution-path wiring changes required to support the provider
- Small demo/smoke-test updates required to prove the path works
- Small documentation comments only if directly helpful

# Disallowed Changes
- No upload, delete, rename, or write/admin asset operations
- No broad media pipeline redesign
- No product runtime integration
- No UI changes
- No recommendation-quality work
- No QA baseline/rerun work
- No broad refactor outside the automation path
- No generic Cloudinary admin tool surface
- No secret-handling redesign beyond what is minimally required for a read-only boundary

# Critical Safety Rule
Do not create a general-purpose Cloudinary tool.
Create only a narrow read-only gateway with clearly limited operations.

# Working Principles
- Prefer the smallest viable read-only surface
- Make allowed asset-search operations explicit
- Keep provider boundaries obvious
- Preserve the existing automation scaffold shape
- Make the result easy to test with a smoke/demo path
- Use the fixed env variable names if any token variable is referenced

# Suggested V1 Capability Direction
Use a narrow capability shape such as one of the following approaches:

Option A:
- keep `asset.search`
- make its provider boundary explicitly Cloudinary read-only

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

# Suggested V1 Operation Shape
Prefer one explicit operation such as:
- `search_design_reference_assets`

with a narrow, bounded input surface such as:
- optional `folder`
- optional bounded `tags`
- bounded `maxResults`

Avoid free-form generic admin expressions if a narrower form is possible.

# Completion Criteria
Complete only when:
- the automation layer has a clearer Cloudinary read-only gateway path than the current stub-only state
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