# Goal
Execute the already-prepared manual browser smoke workflow on the verified browser-capable path, and fix only the small, concrete issues discovered during that real UI run.

# Scope
This task covers:
- running the existing manual browser smoke checklist/procedure/result template
- using the verified browser-capable local path
- recording real UI findings
- applying only small, targeted fixes justified by the smoke run

Target flow:
- open app
- provide image URL or upload image
- review/set conditions
- generate recommendations
- save
- compare
- open product detail
- trigger outbound purchase action

This task is not for redesign, broad QA expansion, or speculative cleanup.

# Primary Objective
Prove the current MVP flow works in a real browser on the verified execution path, then remove only the small blockers or confusing points discovered in that live run.

# Allowed Changes
- Small UI/state/copy fixes directly discovered in manual browser smoke
- Small hook/component fixes needed to complete the current flow
- Small API/client fixes only if a real smoke issue requires them
- Small accessibility/interaction fixes
- Small retry/loading/error/empty-state fixes backed by the observed browser run
- Small documentation touchups to the smoke result docs if needed for clarity

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not redesign the app structure
- Do not add broad new features
- Do not build large E2E automation
- Do not add a compare workspace
- Do not add account/save infrastructure
- Do not add a dedicated product detail route/API unless a real blocker makes it unavoidable
- Do not expand backend/schema/architecture unless a real smoke blocker requires a tiny fix
- Do not recreate the manual smoke pack from scratch

# Critical Safety Rule
Use the already-prepared manual browser smoke contract and the verified browser-capable path. Do not substitute API smoke, HTML inspection, or speculative assumptions for actual browser interaction.

# Working Principles
- Real browser execution first
- Reuse the prepared smoke checklist/procedure/result template
- Fix only what the live run proves
- Preserve canonical product/backend contracts
- Keep scope tight
- Be explicit about what passed, failed, or was not exercised

# Required Behavior / Structure

## 1. Use the prepared manual smoke pack
Run the smoke using the existing docs:
- `docs/qa/mvp-manual-browser-smoke-checklist.md`
- `docs/qa/mvp-manual-browser-smoke-execution-procedure.md`
- `docs/qa/mvp-manual-browser-smoke-result-template.md`

Do not recreate the smoke method unless a tiny clarification is absolutely necessary.

## 2. Use the verified environment path
Use the already-verified browser-capable execution path or an equally real browser path if available.

Expected baseline path:
1. build
2. start local app outside sandbox
3. run the browser-capable path
4. execute the manual UI flow and record results

## 3. Execute the real UI flow
Minimum scenarios to exercise:
- app opens correctly
- image URL or upload works through the UI
- condition input/review is understandable
- recommendations can be generated
- save action works
- compare selection works within the shared max-selection rule
- product detail opens and closes correctly
- outbound purchase action can be triggered
- if practical, confirm recommendation/save/click persistence continuity as observed through the UI flow

## 4. Record concrete findings
For each issue:
- where it happened
- exact reproduction steps
- user-facing impact
- severity
- whether fixed now or deferred

## 5. Apply only targeted fixes
Fix only the small issues actually observed in the browser run.

Examples:
- broken click path
- modal/detail friction
- compare limit confusion
- missing/weak action visibility
- stale state after retry
- misleading copy
- disabled/loading confusion
- outbound transition confusion
- browser-visible error-state issues

## 6. Preserve existing contracts
Do not regress:
- canonical product identity
- save/click semantics
- compare max-selection rule
- outbound URL resolver behavior
- current recommendation payload/detail assumption

# Completion Criteria
- The prepared manual smoke pack was actually executed in a real browser-capable environment
- Real browser findings were documented
- Small real issues were fixed without scope creep
- Canonical/backend contracts remain intact
- Build/lint/type checks pass

# Validation
Run and report:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Also include:
- exact browser environment/path used
- exact scenarios exercised
- exact findings
- exact fixes applied
- what was not tested and why
- completed smoke result artifact(s)

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Browser environment used
3. Smoke scenarios exercised
4. Issues found
5. What changed
6. Deferred items and why
7. Validation results
8. Final approval recommendation