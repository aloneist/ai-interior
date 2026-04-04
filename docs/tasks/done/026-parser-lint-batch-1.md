# Goal
Reduce the first batch of parser-related lint debt in the AI-INTERIOR main repository without changing parsing behavior.

# Scope
Only work in parser-related files that currently produce meaningful lint debt, starting from:

- lib/parsers/router.ts
- lib/parsers/shared/*
- lib/parsers/sites/ikea.ts

If one of these paths has no actual lint issue, leave it unchanged.

# Primary Objective
Reduce parser-side lint debt with narrow fixes only, especially:
- unsafe `any`
- unused variables/imports
- prefer-const
- other nearby low-risk lint issues

# Allowed Changes
- Narrow local type improvements
- Replacing `any` with bounded types
- Removing unused imports/variables
- `prefer-const` fixes
- Small local refactors only when required to satisfy lint

# Disallowed Changes
- No parsing behavior changes
- No parser redesign
- No feature additions
- No API/UI/CI changes
- No unrelated cleanup outside parser target files
- No broad refactor across the parsing system

# Critical Safety Rule
Do not change parser behavior. Keep all fixes local, narrow, and lint-focused.

# Working Principles
- Prefer the smallest safe fix
- Fix real reported lint issues only
- Leave already-clean files untouched
- Preserve current parser control flow and outputs
- Avoid speculative cleanup

# Required Behavior / Structure
For each touched file:
1. inspect actual lint issues
2. fix the highest-value local issues first
3. keep the diff narrow
4. stop once the target file is clean enough for this batch

# Completion Criteria
Complete only when:
- changes stay inside parser target files
- lint issues in touched files are reduced or removed
- no intentional behavior change is introduced
- diff remains narrow and reviewable
- lint passes or remaining blockers are clearly explained

# Validation
Use repository reality. Prefer:
- targeted eslint for touched parser files
- npm run lint
- npx tsc --noEmit

# Required Result Format
Return:
1. Files changed
2. Lint issues addressed in each file
3. Validation commands run
4. Remaining blockers or risky spots
5. Final diff summary