# 004 - API Route Lint Batch 1

## Goal
Clean up the first batch of API route lint debt, focusing on `any`-related issues first.

This batch is not about adding features.
The purpose is to improve type safety and prepare for restoring a stronger CI quality gate.

## Scope
Only touch these files:

- `app/api/recommend/route.ts`
- `app/api/analyze-space/route.ts`
- `app/api/analyze-furniture/route.ts`
- `app/api/import-product/route.ts`
- `app/api/test-parser/route.ts`
- `app/api/upload-image/route.ts`
- `app/api/log-click/route.ts`

## Allowed Changes
- Replace `any` with more specific types
- Add small local `type` or `interface` definitions where needed
- Add minimal type guards where needed
- Use `unknown` with narrowing when exact types are unclear
- Clean up unused variables only if they are directly within the touched code path

## Disallowed Changes
- No business logic changes
- No response schema changes
- No DB query meaning changes
- No frontend or component changes
- No broad refactors
- No new libraries
- No file moves or renames

## Working Principles
- Keep changes tightly scoped to the listed files
- Prefer small diffs
- If the exact type is unclear, do not keep `any`; use `unknown` and narrow safely
- Only extract shared types if the same pattern clearly repeats across 3 or more files
- Preserve existing runtime behavior

## Priority Order
1. Request body types
2. External API response types
3. Parser result types
4. `catch` error typing
5. `map`, `filter`, and callback parameter typing

## Preferred Patterns

### 1. Request body typing
Before:
```ts
const body: any = await request.json()