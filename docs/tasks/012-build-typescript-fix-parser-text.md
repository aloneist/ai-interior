# 012 - Build TypeScript Fix for parser shared text

## Goal
Fix the current TypeScript build error in `lib/parsers/shared/text.ts` without changing parser behavior.

This task is for a narrow type-correctness fix only.
Do not change text extraction behavior, normalization behavior, fallback behavior, block filtering meaning, or downstream parser semantics.

## Scope
Only touch this file:

- `lib/parsers/shared/text.ts`

Do not touch any other file.
If a broader change seems necessary, stop and report it instead of expanding scope.

## Primary Objective
- Resolve the current build-blocking TypeScript error in `lib/parsers/shared/text.ts`
- Keep the diff as small as possible
- Preserve parser runtime behavior exactly

## Known Problem
The current build error is at or near a call like `blockTags.has(tag)` where `tag` is typed as `string | undefined`.

This appears to be a local narrowing issue, not a parser-logic issue.

## Allowed Changes
- Add the smallest possible type guard or narrowing
- Add a safe local fallback only if it preserves existing behavior
- Refine local helper typing in this file only
- Make minimal type-only or type-safety changes required to satisfy TypeScript

## Disallowed Changes
- No text extraction logic changes
- No normalization logic changes
- No block filtering meaning changes
- No fallback behavior changes
- No returned value meaning changes
- No parser behavior changes
- No broad refactors
- No file moves or renames
- No touching unrelated files

## Critical Safety Rule
Behavior safety is more important than fixing the type error quickly.

If a potential fix would affect:
- which nodes are included or excluded
- text cleanup semantics
- snapshot text shape
- downstream parser assumptions
- control flow

then do not apply that fix.
Choose the smallest type-only correction and report any tradeoff.

## Working Principles
- Keep the diff extremely small
- Prefer local narrowing over structural code change
- Preserve runtime behavior exactly
- Do not clean up surrounding code unless directly required
- Treat this as a build-unblock task, not a cleanup task

## Completion Criteria
- The current TypeScript error in `lib/parsers/shared/text.ts` is resolved
- No other files are modified
- Parser behavior remains unchanged
- `npm run build` should move past this error, or any remaining failure should be reported exactly
- Any intentionally unresolved issue should be reported clearly

## Validation
Run in this order:

1. Review the diff and confirm only `lib/parsers/shared/text.ts` was changed
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