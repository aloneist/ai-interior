# Goal
Establish the first minimal CI connection for the AI-INTERIOR main repository so that core repository health and the existing automation scaffold can be validated automatically.

# Scope
This task is limited to the minimum CI wiring needed for:
- typecheck
- lint
- automation smoke validation if a smoke runner already exists
- build

Target repository:
- AI-INTERIOR main repository only

# Primary Objective
Convert the current state into a minimal but reliable CI gate that helps prevent silent breakage of the automation scaffold and core repo health.

# Allowed Changes
- Add or update one CI workflow file under `.github/workflows/`
- Add minimal package scripts only if needed for CI clarity
- Add a missing dev dependency only if the existing automation smoke runner already requires it
- Read existing files related to:
  - `package.json`
  - `tsconfig.json`
  - `.github/workflows/*`
  - `automation/demo/*`
  - other directly related automation execution entrypoints

# Disallowed Changes
- No product feature work
- No UI work
- No DB schema work
- No Supabase / Cloudinary / Stability integration
- No broad refactor
- No lint cleanup outside what is strictly necessary for this CI task
- No splitting CI into multiple advanced workflows unless absolutely required
- No test framework introduction in this task
- No secrets redesign in this task

# Critical Safety Rule
Do not change product logic or expand scope. Keep the diff narrow and focused on CI-first validation only.

# Working Principles
- Prefer the smallest viable change set
- Reuse existing commands and runners if they already exist
- If automation smoke validation already exists, include it
- If a required dependency is already referenced by an existing smoke runner but missing in `package.json`, add only that dependency
- Make CI failure points easy to read by separating steps

# Required Behavior / Structure
The final CI should check, in this order if feasible:
1. install dependencies
2. typecheck
3. lint
4. automation smoke validation
5. build

If automation smoke validation does not already exist in executable form, do not invent a large new test system in this task. Instead, keep CI limited to typecheck, lint, and build.

# Completion Criteria
Complete only when all of the following are true:
- A CI workflow exists for pull requests and/or main branch pushes
- CI validates repository health with the smallest reasonable set of commands
- If present, the automation smoke runner is included in CI
- Any newly added package script is minimal and directly tied to CI readability
- Any newly added dependency is strictly required by existing code
- The diff remains narrow

# Validation
Expected local validation commands should be aligned to repository reality, typically:
- `npm ci`
- `npm run typecheck` or `npx tsc --noEmit`
- `npm run lint`
- `npm run automation:smoke` if applicable
- `npm run build`

# Required Result Format
Return the result in this format:
1. Files changed
2. Why each file changed
3. Commands used for validation
4. Any warnings or blockers
5. Final diff summary