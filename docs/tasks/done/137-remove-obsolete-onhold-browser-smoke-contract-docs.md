# Goal
Remove obsolete on-hold browser-smoke planning/contract documents that were created only to defer manual browser smoke until a browser-capable environment existed.

# Scope
This task is limited to deleting no-longer-needed deferred planning documents under `docs/tasks/onhold` that are now obsolete because:
- browser-capable environment enablement was completed
- manual browser smoke was actually executed
- smoke artifacts and QA docs now exist elsewhere as the real source of truth

# Primary Objective
Delete outdated on-hold docs that describe future browser-smoke preparation or deferred browser-smoke reminders, while preserving all still-relevant QA execution docs and actual smoke result artifacts.

# Allowed Changes
- Delete obsolete `.md` files under `docs/tasks/onhold`
- Update or remove references to those deleted files if any remain elsewhere in the repo
- Add a very small note only if needed to clarify where the real current source of truth now lives

# Disallowed Changes
- Do not delete `docs/qa` manual smoke docs
- Do not delete actual smoke result artifacts
- Do not redesign QA structure
- Do not change product/backend code
- Do not delete unrelated task history that is still meaningful
- Do not broadly clean the whole tasks tree beyond the obsolete browser-smoke deferral docs

# Critical Safety Rule
Delete only documents whose purpose was to defer or remind future manual browser smoke work before browser capability existed. Keep documents that are now actual execution assets, evidence, or still-relevant completed task history.

# Working Principles
- Remove dead planning docs, keep real execution artifacts
- Preserve useful historical and operational context
- Prefer precise deletion over broad cleanup
- If a deleted file is referenced elsewhere, update that reference cleanly
- Do not delete anything still serving as the current source of truth

# Required Behavior / Structure

## 1. Inspect `docs/tasks/onhold`
Find the `.md` files whose role is now obsolete because browser-manual-smoke preparation is no longer deferred.

## 2. Delete only obsolete deferred browser-smoke docs
Delete files that were created to say things like:
- browser smoke will be done later
- manual smoke content to remember later
- future reminders/contracts for browser-capable manual smoke
- deferred environment-dependent browser-smoke task plans

## 3. Preserve current real source-of-truth docs
Do NOT delete:
- `docs/qa/mvp-manual-browser-smoke-checklist.md`
- `docs/qa/mvp-manual-browser-smoke-execution-procedure.md`
- `docs/qa/mvp-manual-browser-smoke-result-template.md`
- actual completed smoke run docs/results
- meaningful done-task history unless it is clearly duplicate dead planning

## 4. Clean references if needed
If any deleted on-hold file is referenced from a README, QA doc, or task doc that should remain, update or remove that stale reference.

# Completion Criteria
- Obsolete deferred browser-smoke docs under `docs/tasks/onhold` are removed
- Relevant QA docs and real smoke result artifacts remain intact
- Any stale references to deleted files are cleaned up
- No product/backend code changed
- Build/lint/type checks pass if any tracked file changes require them

# Validation
Run and report:
- `git diff --check`
- `npm run typecheck` only if necessary
- `npm run lint` only if necessary
- `npm run build` only if necessary

Also report:
- which files were deleted
- which files were intentionally kept
- whether any stale references were updated

# Required Result Format
Provide the result in this exact structure:

1. Current position summary
2. Files deleted
3. Files intentionally kept
4. Reference cleanup performed
5. Validation results
6. Final approval recommendation