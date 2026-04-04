# 007 - Parser Lint Batch 4

## Goal
Clean up parser-related lint debt safely, without changing parser behavior.

This batch is for safe lint cleanup only.
If a lint fix could affect parsing output, extraction logic, normalization behavior, category detection, fallback rules, or downstream product data shape, do not apply that fix. Leave it unresolved and report it.

## Scope
Only touch these files:

- `lib/parsers/router.ts`
- `lib/parsers/shared/snapshot.ts`
- `lib/parsers/shared/text.ts`
- `lib/parsers/shared/types.ts`
- `lib/parsers/sites/ikea.ts`
- `lib/parsers/categories/chair.ts`
- `lib/parsers/categories/sofa.ts`
- `lib/parsers/categories/table.ts`

## Primary Objective
- Fix safe `@typescript-eslint/no-explicit-any`
- Fix safe `prefer-const`
- Fix directly related unused variables only when clearly safe
- Keep diffs small and behavior unchanged

## Allowed Changes
- Replace `any` with specific local types where clearly safe
- Replace `any` with `unknown` plus safe narrowing when exact types are unclear
- Add small local type/interface definitions where needed
- Apply `prefer-const` where variable reassignment does not occur
- Remove unused variables only when they are clearly dead and not part of future parser intent
- Improve catch typing from `any` to `unknown` with safe narrowing

## Disallowed Changes
- No parsing logic changes
- No normalization logic changes
- No extraction rule changes
- No category decision logic changes
- No scoring or ranking changes
- No schema meaning changes
- No prompt changes
- No broad refactors
- No shared abstraction redesign
- No new libraries
- No file moves or renames
- No touching unrelated files

## Critical Safety Rule
Behavior safety is more important than removing every lint error.

If a lint fix could affect:
- parsed field values
- extracted dimensions, colors, or materials
- category classification
- snapshot content
- text cleanup semantics
- fallback handling
- returned parser object shape
- downstream import behavior

then do not fix it.
Leave it unresolved and report it clearly.

## Working Principles
- Keep changes tightly scoped to the listed files
- Prefer the smallest possible diff
- Preserve runtime behavior exactly
- Do not “clean up” surrounding code unless directly required for the lint fix
- If the exact type is unclear, prefer `unknown` and narrow safely
- Do not introduce reusable abstractions unless clearly necessary
- Treat parser outputs as behavior-sensitive

## Priority Order
1. Safe `prefer-const`
2. Safe local `any` replacement
3. Safe `catch` typing
4. Safe removal of directly related unused variables
5. Leave behavior-risky lint unresolved and report it

## Completion Criteria
- Remove safe lint issues from the target files as much as realistically possible
- Do not change parser behavior
- Do not modify files outside the listed scope
- Explicitly report any unresolved lint left for safety reasons
- Targeted lint results should improve

## Validation
Run in this order:

1. Review the diff and confirm only the target files were changed
2. Run targeted lint on the listed parser files
3. Run repo-wide lint if practical
4. Run build if practical
5. If something fails, report only the actual cause and affected files

## Required Result Format
Report results using this structure:

- changed files
- per-file summary
- unresolved lint left intentionally
- lint result
- build result
- risk notes