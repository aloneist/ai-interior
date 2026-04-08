# Goal
Run a real browser-based smoke pass on the current MVP flow and fix only the small, concrete issues proven by that live UI validation.

# Scope
This task is limited to actual browser/UI smoke validation and tightly scoped fixes discovered during that validation.

Target flow:
- upload image or provide image URL
- review/set conditions
- generate recommendations
- save
- compare
- open product detail
- transition to outbound purchase

This task is not for speculative cleanup or feature expansion.

# Primary Objective
Prove that the current MVP flow works as an actual user flow in a browser, then fix only the small blockers or confusing points found during that real interaction.

# Allowed Changes
- Small UI/state/copy fixes directly discovered in browser smoke
- Small hook/component fixes required to complete the flow
- Small API/client fixes only if a real browser-discovered issue requires them
- Small accessibility/interaction fixes (modal close, focus, disabled state clarity, button behavior, etc.)
- Small loading/empty/error/retry improvements backed by real observed friction

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not redesign the app structure
- Do not add broad new features
- Do not build a compare workspace
- Do not add account/save infrastructure
- Do not add a dedicated product detail route/API unless a real blocker makes it unavoidable
- Do not expand backend/schema/architecture unless a real browser blocker requires a tiny fix

# Critical Safety Rule
Do not claim completion without actual browser/UI interaction. Local API calls, curl requests, or page source inspection are useful support checks, but they do not count as completion for this task unless the real browser flow was exercised.

# Working Principles
- Real browser interaction first
- Fix only what was actually observed
- Preserve the canonical product contract
- Prefer the smallest safe fix
- Be explicit about what was and was not tested
- No speculative cleanup

# Required Behavior / Structure

## 1. Real browser smoke pass
Use an actual browser-capable workflow to exercise the MVP UI.

Minimum required scenarios:
- open the app
- upload an image or provide image URL through the actual UI
- move through condition input
- generate recommendations
- save a recommendation
- use compare selection
- open product detail
- trigger outbound purchase action

If browser tooling is unavailable in the environment, do not pretend this was completed. In that case, stop and report the capability gap clearly instead of fabricating browser validation.

## 2. Record concrete browser findings
For each issue found, report:
- where it occurred
- exact reproduction steps
- user-facing impact
- whether it was fixed now or deferred

## 3. Apply only targeted fixes
Make only small, high-value fixes proven by the browser smoke.

Examples:
- broken click path
- hidden or confusing primary action
- modal close/open friction
- compare selection confusion
- stale UI state after retry
- misleading copy
- weak disabled/loading states
- outbound action problems
- browser-visible error-state confusion

## 4. Preserve the current contracts
Do not regress:
- canonical product identity
- save/click semantics
- compare max-selection rule
- outbound resolver behavior
- current recommendation payload/detail assumption

## 5. Be honest about remaining gaps
If some flows were not actually browser-tested, say so explicitly.
If a problem is real but too large for this scope, defer it explicitly.

# Completion Criteria
- A real browser/UI smoke pass was executed and documented
- Concrete browser-observed issues were reported clearly
- Small browser-proven issues were fixed without scope creep
- Canonical/backend contracts remain intact
- Build/lint/type checks pass

# Validation
Run and report:
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Also include:
- exact browser environment/tooling used
- exact UI scenarios exercised
- exact issues found
- exact fixes applied
- what could not be tested in a real browser
- what was deferred and why

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Browser environment used
3. UI smoke scenarios exercised
4. Issues found
5. What changed
6. Deferred items and why
7. Validation results
8. Final approval recommendation