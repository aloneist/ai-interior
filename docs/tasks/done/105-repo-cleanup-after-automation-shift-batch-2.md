# Goal
Shrink or remove the remaining automation-runtime surfaces that are no longer essential to the current human/Codex/CI loop, while preserving the current direct-access development readiness.

# Scope
This task is for repository cleanup only.

Primary target area:
- app/api/automation/*
- automation/orchestration/n8n/*
- automation/demo/*
- package.json
- .github/workflows/ci.yml
- automation/*.md
- related docs only if directly needed to remove stale references

This is not main product-development work.
This is not recommendation-quality work.
This is not UI work.
This is not final DB redesign.

# Primary Objective
Bundle the next practical cleanup step into one narrow batch:
1. analyze which remaining automation-runtime files are still genuinely needed by the current loop
2. decouple the current loop from non-essential automation-runtime surfaces where possible
3. remove or shrink only the surfaces that no longer provide practical value now

# Required Design Direction
The design must follow these rules:

1. Do not break the current loop:
   - user instruction
   - ChatGPT task proposal
   - Codex code change
   - automated validation
   - ChatGPT review
   - user approval
2. Do not remove current connection-readiness validation.
3. Prefer shrinking/removing old runtime automation surfaces over deleting currently useful validation.
4. Use proof-based reference checks before deletion.
5. Keep the diff narrow and reviewable.

# Allowed Changes
- Delete or shrink unused app/api/automation routes if they are no longer part of the current loop
- Delete or shrink unused n8n scaffolding if it no longer supports current validation
- Delete or shrink demo/runtime scripts that are no longer used by the current loop or CI
- Update package.json, CI, README, and related docs only as needed to remove stale references
- Keep current connection-readiness and Supabase direct-read validation intact

# Disallowed Changes
- No product/recommendation changes
- No UI work
- No final DB redesign
- No broad refactor
- No speculative deletions
- No automation-baseline re-expansion

# Critical Safety Rule
Do not remove anything that still supports:
- current CI validation
- current build stability
- current connection-loop validation
- current direct Supabase-read readiness
- the approved human/Codex/CI review loop

# Working Principles
- Prefer proof-based cleanup over aesthetic cleanup
- Preserve the loop, shrink the leftover automation-runtime scaffolding
- Treat n8n and app/api/automation as cleanup candidates unless they are still required by current validation
- Keep direct-access development readiness intact

# Cleanup Candidate Areas
Analyze these areas first:

1. app/api/automation/*
2. automation/orchestration/n8n/*
3. automation/demo/runtime-oriented scripts
4. package.json automation scripts that no longer serve the current loop
5. CI steps/artifacts that only exist for abandoned automation-runtime surfaces

For each candidate:
- show whether it is still referenced
- show whether it is still used by current validation/build
- decide: keep / shrink / delete

# Required Behavior / Structure
The result should make it clear:
1. which remaining automation-runtime files were deleted or reduced
2. which were kept and why
3. which scripts/CI references were updated
4. that the current loop still works after cleanup

# Completion Criteria
Complete only when:
- non-essential remaining automation-runtime surfaces are removed or reduced with proof
- stale references are removed
- the current loop and connection-readiness surfaces remain intact
- the diff is narrow and practical

# Validation
Use repository reality. Prefer:
- npm run lint
- npx tsc --noEmit
- npm run automation:connection:validate
- npm run build
- targeted search proving removed files are no longer referenced

# Required Result Format
Return:
1. Files changed
2. What cleanup changes were made
3. Validation commands run
4. What was deleted vs kept and why
5. Remaining cleanup debt if any
6. Final diff summary