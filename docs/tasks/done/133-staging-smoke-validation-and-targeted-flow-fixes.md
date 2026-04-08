# Goal
Validate the current MVP flow in a real staging/browser-backed environment and fix only the small, concrete issues discovered during that live smoke pass.

# Scope
This task is limited to live or staging-connected smoke validation of the current MVP flow and tightly scoped fixes discovered from that validation.

Target flow:
- upload
- condition input
- recommendation generation
- save
- compare
- product detail
- outbound purchase transition

Where possible, also validate the current publish/recommendation/save/click path against real Supabase-backed behavior.

# Primary Objective
Confirm that the already-built MVP flow works in practice, not just in code, and remove only the small blockers or confusing points discovered during real smoke validation.

# Allowed Changes
- Small UI/state/copy fixes directly discovered during live smoke
- Small API or hook fixes if needed to resolve real smoke failures
- Small logging or guard improvements if they help diagnose or unblock the current flow
- Small contract-preserving fixes for publish/recommendation/save/click continuity
- Small staging-safe tweaks only when clearly justified by a real smoke finding

# Disallowed Changes
- Do not redesign ranking/scoring
- Do not add broad new features
- Do not redesign the app structure
- Do not build a full compare workspace
- Do not add a full account/save system
- Do not build a dedicated product-detail route/API unless absolutely required by a real blocker
- Do not expand schema/architecture unless a real smoke blocker makes it unavoidable

# Critical Safety Rule
Only fix issues proven by real smoke validation. Do not use this task as an excuse for speculative cleanup or feature expansion.

# Working Principles
- Real smoke first, code second
- Fix only what was actually observed
- Preserve canonical product identity and current backend contracts
- Prefer the smallest safe fix
- Keep the current MVP flow stable and understandable
- Be explicit about what was tested and what remains untested

# Required Behavior / Structure

## 1. Execute a real smoke pass
Use the current app in a realistic environment and report the exact scenarios exercised.

Minimum required scenarios:
- upload image or provide image URL
- set/review conditions
- generate recommendations
- save a recommendation
- use compare selection
- open product detail
- perform outbound purchase transition

If available and appropriate in the current staging environment, also validate:
- publish flow from import job to canonical product
- recommendation insertion
- click/save logging

## 2. Record concrete findings
For each issue found, report:
- where it happened
- reproduction steps
- user-facing impact
- whether it was fixed in this task or intentionally deferred

## 3. Apply only targeted fixes
Make only the smallest fixes required to address the observed blockers/friction.

Examples of acceptable fixes:
- broken or confusing button behavior
- stale state after retry/navigation
- broken modal close/back behavior
- weak or misleading error copy
- compare/save state drift
- outbound transition edge-case issues
- real click/save API wiring issues
- real publish path issues if exercised

## 4. Preserve current contracts
Do not regress the hardened contracts:
- canonical product identity
- save/click semantics
- compare max-selection rule
- outbound URL resolver behavior
- current recommendation payload/detail assumptions

## 5. Be honest about remaining gaps
If some parts were not actually exercised live, say so clearly.
If a problem is real but too large for this scope, defer it explicitly.

# Completion Criteria
- A real smoke pass was executed and documented
- Concrete issues were reported clearly
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
- exact smoke scenarios exercised
- exact issues found
- exact fixes applied
- what could not be tested live
- what was deferred and why

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Smoke environment used
3. Smoke scenarios exercised
4. Issues found
5. What changed
6. Deferred items and why
7. Validation results
8. Final approval recommendation