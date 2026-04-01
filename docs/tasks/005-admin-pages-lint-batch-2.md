# 005 - Admin Pages Lint Batch 2

## Goal
Clean up the next batch of lint debt in admin pages.

This batch focuses on:
- `@typescript-eslint/no-explicit-any`
- `react-hooks/set-state-in-effect`
- small related cleanup only when directly necessary

This is not a feature task.
The purpose is to reduce lint debt with minimal behavioral risk and continue CI quality gate recovery.

## Scope
Only touch these files:

- `app/admin/furniture/page.tsx`
- `app/admin/furniture-bulk/page.tsx`
- `app/admin/furniture-test/page.tsx`

## Allowed Changes
- Replace `any` with more specific types
- Add small local `type` or `interface` definitions where needed
- Use `unknown` with narrowing when exact types are unclear
- Refactor local state flow only if necessary to resolve `react-hooks/set-state-in-effect`
- Move derived values from effects into memoized or computed values when behavior stays the same
- Clean up unused variables only when directly related to the touched code

## Disallowed Changes
- No business logic changes
- No UI redesign
- No API contract changes
- No DB query meaning changes
- No broad refactors
- No new libraries
- No file moves or renames
- No touching unrelated files

## Working Principles
- Keep changes tightly scoped to the listed files
- Prefer small diffs
- Preserve existing runtime behavior and page flow
- If the exact type is unclear, do not keep `any`; use `unknown` and narrow safely
- Do not introduce new abstractions unless clearly necessary
- Fix hook lint issues by simplifying state flow, not by suppressing rules

## Priority Order
1. Remove `any`
2. Fix `react-hooks/set-state-in-effect`
3. Clean up directly related unused variables
4. Keep rendering and interaction behavior unchanged

## Preferred Patterns

### 1. Replace `any`
Before:
```ts
const value: any = data