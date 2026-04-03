# 022 - Automation Smoke Test V1

## Goal
Add a very small automation-internal smoke test/demo layer to verify that the current automation execution flow works end-to-end inside the main `AI-INTERIOR` repository.

This task is for automation-only testing.
Do not wire anything into product runtime.
Do not change product behavior.

## Scope
Only touch files needed for the automation smoke test.

Preferred scope:
- `automation/demo/*`
- optionally small supporting updates under:
  - `automation/execution/*`
  - `automation/providers/*`
  - `automation/README.md`

Do not modify product logic, recommendation logic, parser logic, API behavior, UI behavior, or database behavior.

## Primary Objective
- Add a tiny internal demo/smoke-test entry
- Execute at least one ready `catalog.read` request
- Execute at least one ready `asset.search` request
- Execute at least one no-ready-provider case
- Keep everything isolated inside `automation/`

## Allowed Changes
- Add `automation/demo/*`
- Add a small runner file such as `run-smoke-test.ts`
- Add small helper formatting code if needed
- Add tiny alignment edits only if directly required
- Add a short README note only if useful

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
This is an automation-internal smoke test only.

Do not wire this into app runtime.
Do not add hidden network access.
Do not make the smoke test depend on external services.

## Working Principles
- Keep it very small
- Prefer one simple runner over a mini framework
- Make the tested scenarios obvious
- Keep output readable
- Make future replacement with real provider tests easy

## Required Behavior
Add a smoke-test/demo runner that does at least:

1. run `catalog.read` through the execution service
2. run `asset.search` through the execution service
3. run one capability with no ready provider and confirm the typed failure path
4. print or expose readable results
5. stay entirely inside `automation/`

## Suggested Cases
Use simple example requests such as:
- `catalog.read` with a small query and limit
- `asset.search` with a query and optional tags
- `approval.request` or `notify.send` as the no-ready-provider case

The exact case values can be simple and static.

## Completion Criteria
- A smoke-test/demo runner exists
- It exercises the current execution service
- It covers both success and no-ready-provider paths
- No product logic files were modified
- No real integration was added

## Validation
Run in this order:

1. Review the diff and confirm only automation smoke-test files changed
2. Confirm no product logic files were modified
3. Summarize the smoke-test structure
4. Summarize the tested scenarios
5. Report the smoke-test run result if executed

## Required Result Format
Report results using this structure:

- changed files
- smoke test summary
- scenario summary
- validation result
- risk notes