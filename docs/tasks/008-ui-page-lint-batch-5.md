# 008 - UI/Page Lint Batch 5

## Goal
Clean up the remaining UI/page lint issues safely, without changing user-visible behavior.

This batch is for safe lint cleanup only.
If a lint fix could affect rendering flow, state timing, props behavior, user interaction, modal behavior, saved-item flow, recommendation display, or page initialization behavior, do not apply that fix. Leave it unresolved and report it.

## Scope
Only touch these files:

- `app/page.tsx`
- `components/mvp/InputStepSection.tsx`
- `components/mvp/ProductDetailModal.tsx`
- `components/mvp/RecommendationProductCard.tsx`
- `components/mvp/SavedProductsSection.tsx`
- `lib/parsers/dimensions.ts`

## Primary Objective
- Fix safe lint issues in the listed files
- Prioritize safe `@typescript-eslint/no-explicit-any`
- Fix directly related safe unused variables only when clearly safe
- Keep diffs small and behavior unchanged

## Allowed Changes
- Replace `any` with specific local types when clearly safe
- Replace `any` with `unknown` plus safe narrowing when exact types are unclear
- Add small local `type` or `interface` definitions where needed
- Improve catch typing from `any` to `unknown` with safe narrowing
- Remove directly related unused variables only when clearly dead and safe
- Apply trivial lint-only cleanups when they do not affect rendering or interaction

## Disallowed Changes
- No rendering logic changes
- No state timing changes
- No initialization timing changes
- No user interaction changes
- No modal behavior changes
- No saved-products flow changes
- No recommendation display changes
- No prop contract changes
- No parser behavior changes in `lib/parsers/dimensions.ts`
- No broad refactors
- No new libraries
- No file moves or renames
- No touching unrelated files

## Critical Safety Rule
Behavior safety is more important than removing every lint error.

If fixing a lint issue could affect:
- page initialization
- input step behavior
- modal open/close behavior
- recommendation card rendering
- saved products rendering or actions
- image handling
- parser dimension extraction behavior
- fallback UI behavior

then do not fix it.
Leave it unresolved and report it clearly.

## Working Principles
- Keep changes tightly scoped to the listed files
- Prefer the smallest possible diff
- Preserve runtime behavior exactly
- Do not clean up surrounding code unless directly required
- If the exact type is unclear, prefer `unknown` and narrow safely
- Do not introduce shared abstractions unless clearly necessary
- Treat user-facing UI flow as behavior-sensitive

## Priority Order
1. Safe local `any` replacement
2. Safe catch typing
3. Safe removal of directly related unused variables
4. Safe trivial lint-only cleanup
5. Leave behavior-risky lint unresolved and report it

## Completion Criteria
- Remove safe lint issues from the target files as much as realistically possible
- Do not change user-visible behavior
- Do not modify files outside the listed scope
- Explicitly report any unresolved lint left for safety reasons
- Targeted lint results should improve

## Validation
Run in this order:

1. Review the diff and confirm only the target files were changed
2. Run targeted lint on the listed files
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