# Goal
Clean up repository files that became unnecessary after the automation criteria shifted, while preserving the current human/Codex/CI execution loop and external-program connection readiness.

# Scope
This task is for repository cleanup only.

Primary target area:
- automation/*
- app/api/automation/*
- package.json
- .github/workflows/ci.yml
- docs/tasks/*
- related docs/readme/runbook files only if directly needed to remove stale references

This is not main product-development work.
This is not recommendation-quality work.
This is not UI work.
This is not final DB redesign.

# Primary Objective
Bundle the next practical cleanup step into one narrow batch:
1. identify files that were useful under the previous automation criteria but are no longer needed now
2. remove or shrink only those files that are clearly obsolete
3. preserve the current execution loop:
   - user instruction
   - ChatGPT task proposal
   - Codex code change
   - automated validation
   - ChatGPT review
   - user approval
4. preserve the current connection-readiness surfaces, especially Supabase direct-read readiness

# Required Design Direction
The design must follow these rules:

1. Do not reopen automation-baseline expansion.
2. Do not start product-feature development.
3. Delete only what is provably unused, obsolete, or out of the current phase scope.
4. Use repository references/search to justify removals.
5. Keep the diff narrow and reviewable.

# Allowed Changes
- Delete obsolete automation/orchestration scaffolding that is no longer part of the current loop
- Delete obsolete docs that only describe removed/abandoned automation paths
- Delete obsolete runtime automation routes/scripts if they are no longer used or referenced
- Update package.json, CI, README, runbook, and other docs only as needed to remove stale references
- Keep current connection/readiness validators and current task/CI loop intact

# Disallowed Changes
- No recommendation/product changes
- No UI work
- No broad refactor
- No final DB redesign
- No new automation expansion
- No speculative deletion without reference checks

# Critical Safety Rule
Do not remove files that still support the current approved loop:
- task instruction flow
- Codex execution flow
- automated validation
- ChatGPT review
- user approval
- Supabase direct-read readiness
- CI-based validation evidence

# Working Principles
- Prefer proof-based cleanup over aesthetic cleanup
- Remove old automation scaffolding before touching still-useful validation surfaces
- Keep the current loop and connection-readiness surfaces obvious and intact
- Treat n8n-centered paths as cleanup candidates, not automatically-deleted truths

# Cleanup Candidate Areas
Start by analyzing these areas first:

1. `automation/orchestration/n8n/*`
2. `app/api/automation/*` routes that existed only for the previous automation criteria
3. demo/runtime scripts that are no longer needed for the current loop
4. docs that only describe removed/abandoned automation flows
5. generated artifacts that no longer provide meaningful baseline value and are not part of the current approval/readiness loop

For each candidate:
- show whether it is still referenced
- show whether it still supports the current loop
- decide: keep / shrink / delete

# Required Behavior / Structure
The result should make it clear:
1. which files were deleted
2. which files were kept and why
3. which references were updated
4. that the current execution loop still works after cleanup

# Completion Criteria
Complete only when:
- obsolete files are removed or reduced with proof
- stale references are removed
- the current loop and connection-readiness surfaces remain intact
- the diff is narrow and practical

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:connection:validate
- any still-relevant current validation command after cleanup
- targeted search proving removed files are no longer referenced

# Required Result Format
Return:
1. Files changed
2. What cleanup changes were made
3. Validation commands run
4. What was deleted vs kept and why
5. Remaining cleanup debt if any
6. Final diff summary