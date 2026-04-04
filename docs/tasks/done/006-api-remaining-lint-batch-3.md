# 006 - API Remaining Lint Batch 3

## Goal
Clean up the remaining API-route lint debt in this batch, with a strict safety rule:

**Do not change core behavior to fix lint.**

This batch is for safe lint cleanup only.
If a lint fix risks changing runtime behavior, request/response flow, initialization timing, scoring logic, or user-visible results, leave it unresolved and report it instead.

## Scope
Only touch these files:

- `app/api/generate/route.ts`
- `app/api/recommend-space/route.ts`

## Primary Objective
- Fix safe `@typescript-eslint/no-explicit-any` issues
- Improve error typing where safe
- Keep diffs small and behavior unchanged

## Allowed Changes
- Replace `any` with specific local types
- Replace `any` with `unknown` plus safe narrowing when exact types are unclear
- Add small local `type` or `interface` definitions where needed
- Change `catch (err: any)` to `catch (err: unknown)` with `instanceof Error` narrowing
- Clean up directly related unused variables only if clearly safe

## Disallowed Changes
- No business logic changes
- No scoring logic changes
- No recommendation logic changes
- No request validation behavior changes unless already broken and clearly required for type safety
- No response schema changes
- No DB query meaning changes
- No prompt logic changes
- No state/flow timing changes
- No broad refactors
- No new libraries
- No file moves or renames
- No touching unrelated files

## Safety Rule
Behavior safety is more important than removing every lint error.

If a lint fix could affect:
- recommendation ranking
- filtering behavior
- fallback behavior
- request parsing semantics
- response payload shape
- runtime control flow

then do not apply that fix.
Leave it unresolved and report it clearly.

## Working Principles
- Keep changes tightly scoped to the listed files
- Prefer small diffs
- Preserve runtime behavior exactly
- Do not “clean up” surrounding code unless directly required
- If the exact type is unclear, prefer `unknown` and narrow safely
- Do not introduce shared abstractions unless clearly necessary

## Priority Order
1. Safe `any` replacement in local variables and helper params
2. Safe catch-block typing
3. Safe typed aliases for parsed JSON or external responses
4. Leave risky lint unresolved and report it

## Preferred Patterns

### 1. Safe catch typing
Before:
```ts
} catch (err: any) {
  console.error(err.message)
}