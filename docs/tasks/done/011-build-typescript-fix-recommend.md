# 011 - Build TypeScript Fix for recommend

## Goal
Fix the current TypeScript build error in `app/api/recommend/route.ts` without changing recommendation behavior.

This task is for a narrow type-correctness fix only.
Do not change scoring, ranking, filtering, fallback behavior, response shape, request semantics, or recommendation logic.

## Scope
Only touch this file:

- `app/api/recommend/route.ts`

Do not touch any other file.
If a broader change seems necessary, stop and report it instead of expanding scope.

## Primary Objective
- Resolve the current build-blocking TypeScript error in `app/api/recommend/route.ts`
- Make the local types accurately reflect the actual data shape used in this file
- Keep the diff as small as possible
- Preserve runtime behavior exactly

## Known Problem
The current build error appears to be the same class of issue as the recent `recommend-space` fix:
a nested `furniture` relation shape does not fully match the current local type expectation.

The likely issue is local type mismatch, not business logic.

## Allowed Changes
- Adjust local types in this file so they reflect the actual runtime data shape
- Add small local type aliases or interfaces
- Use `unknown` plus safe narrowing if needed
- Refine nested type definitions used only by this file
- Normalize the relation shape locally only where already needed by the existing usage
- Make minimal type-only or type-safety changes required to satisfy TypeScript

## Disallowed Changes
- No scoring logic changes
- No ranking logic changes
- No filtering changes
- No recommendation behavior changes
- No fallback behavior changes
- No response schema changes
- No request parsing changes
- No DB query meaning changes
- No broad refactors
- No file moves or renames
- No touching unrelated files

## Critical Safety Rule
Behavior safety is more important than fixing the type error quickly.

If a potential fix would affect:
- recommendation ordering
- similarity scoring
- candidate filtering
- fallback handling
- returned payload shape
- control flow

then do not apply that fix.
Choose the smallest type-only correction and report any tradeoff.

## Working Principles
- Keep the diff extremely small
- Prefer local type correction over structural code change
- Preserve runtime behavior exactly
- Do not clean up surrounding code unless directly required
- If the exact nested shape is unclear, match the actual usage in this file rather than inventing a broader abstraction
- Treat this as a build-unblock task, not a cleanup task

## Completion Criteria
- The current TypeScript error in `app/api/recommend/route.ts` is resolved
- No other files are modified
- Recommendation behavior remains unchanged
- `npm run build` should move past this error, or any remaining failure should be reported exactly
- Any intentionally unresolved issue should be reported clearly

## Validation
Run in this order:

1. Review the diff and confirm only `app/api/recommend/route.ts` was changed
2. Run targeted TypeScript/build validation if practical
3. Run `npm run build`
4. If build still fails, report the exact failure cause and affected files
5. If build passes this point, report that clearly

## Required Result Format
Report results using this structure:

- changed files
- implementation summary
- build result
- remaining issue, if any
- risk notes