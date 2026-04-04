# Goal
Reduce the first batch of API route lint debt in the AI-INTERIOR main repository without changing product behavior.

# Scope
Only fix lint issues in the following API route files:

- app/api/recommend/route.ts
- app/api/analyze-space/route.ts
- app/api/analyze-furniture/route.ts
- app/api/import-product/route.ts
- app/api/test-parser/route.ts
- app/api/upload-image/route.ts
- app/api/log-click/route.ts

# Primary Objective
Remove or reduce the highest-value lint debt in these API routes, especially unsafe `any` usage and closely related narrow issues, while preserving runtime behavior.

# Allowed Changes
- Narrow type improvements
- Safer request/response typing
- Replacing `any` with minimal explicit types
- Small local refactors only when required to satisfy lint
- Small unused variable cleanup only if directly related
- Small import cleanup only if directly related

# Disallowed Changes
- No product logic changes
- No endpoint contract changes unless strictly required for correct typing
- No DB schema changes
- No new features
- No large refactors
- No unrelated lint cleanup outside the listed files
- No UI changes
- No automation or CI changes in this task

# Critical Safety Rule
Do not change behavior. Keep the fixes local, narrow, and type-focused.

# Working Principles
- Prefer the smallest safe fix
- Replace `any` with explicit minimal shapes
- If exact typing is too expensive, use bounded intermediate types instead of broad rewrites
- Preserve request/response shape and existing control flow
- Avoid speculative cleanup

# Required Behavior / Structure
For each touched file:
1. identify lint issues
2. fix unsafe `any` usage first
3. fix only nearby lint issues that are necessary to keep the file clean
4. stop once the file is safe enough and scope remains narrow

# Completion Criteria
Complete only when:
- the listed API route files are the only intended target set
- lint issues in those files are reduced or removed
- no product behavior is intentionally changed
- diff remains narrow and reviewable
- lint passes or clearly improves with remaining blockers explained

# Validation
Use the repository's real commands if available. Prefer:
- npm run lint
- npx tsc --noEmit

If useful, include targeted notes about which files were cleaned successfully.

# Required Result Format
Return:
1. Files changed
2. Lint issues addressed in each file
3. Validation commands run
4. Remaining blockers or risky spots
5. Final diff summary