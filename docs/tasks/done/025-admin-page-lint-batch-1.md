# Goal
Reduce the first batch of admin page lint debt in the AI-INTERIOR main repository without changing product behavior.

# Scope
Only work in these files:

- app/admin/furniture/page.tsx
- app/admin/furniture-bulk/page.tsx
- app/admin/furniture-test/page.tsx

# Primary Objective
Remove or reduce the most valuable lint debt in the listed admin pages while preserving current runtime behavior and UI behavior.

# Allowed Changes
- Narrow type improvements
- Removing unused variables/imports
- Small local refactors required to satisfy lint
- Small state/effect cleanup only if directly required by lint
- Small JSX cleanup only if directly required by lint

# Disallowed Changes
- No product logic changes
- No UI redesign
- No API contract changes
- No DB/schema changes
- No feature additions
- No broad refactor
- No unrelated cleanup outside the listed files
- No CI or automation changes in this task

# Critical Safety Rule
Do not change behavior. Keep the fixes local, narrow, and lint-focused.

# Working Principles
- Prefer the smallest safe fix
- Fix high-signal lint issues first
- Avoid speculative cleanup
- Keep all edits easy to review
- Preserve current rendering and interaction behavior

# Required Behavior / Structure
For each touched file:
1. inspect actual lint issues
2. fix the highest-value local issues first
3. keep the diff narrow
4. stop when the file is clean enough for this batch

# Completion Criteria
Complete only when:
- changes stay within the listed admin files
- lint issues in those files are reduced or removed
- no intentional behavior change is introduced
- diff remains narrow and reviewable
- lint passes or remaining blockers are clearly explained

# Validation
Use repository reality. Prefer:
- npx eslint app/admin/furniture/page.tsx app/admin/furniture-bulk/page.tsx app/admin/furniture-test/page.tsx
- npm run lint
- npx tsc --noEmit

# Required Result Format
Return:
1. Files changed
2. Lint issues addressed in each file
3. Validation commands run
4. Remaining blockers or risky spots
5. Final diff summary