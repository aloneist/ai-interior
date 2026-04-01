# Task Template

## Title
[Short task name]

## Goal
[State the task goal clearly in 1-3 short sentences.]

This task is for [safe lint cleanup / safe type cleanup / narrow UI fix / targeted API cleanup / parser-safe cleanup / other].
Do not change core behavior unless the task explicitly allows it.

## Scope
Only touch these files:

- `path/to/file-a`
- `path/to/file-b`

## Primary Objective
- [Primary objective 1]
- [Primary objective 2]
- [Primary objective 3]

## Allowed Changes
- [Allowed change type 1]
- [Allowed change type 2]
- [Allowed change type 3]

## Disallowed Changes
- No business logic changes
- No response schema changes
- No DB query meaning changes
- No broad refactors
- No new libraries
- No file moves or renames
- No touching unrelated files

[Add task-specific disallowed items here.]

## Critical Safety Rule
Behavior safety is more important than cleanup quality.

If a fix could affect:
- [behavior-sensitive area 1]
- [behavior-sensitive area 2]
- [behavior-sensitive area 3]

then do not apply that fix.
Leave it unresolved and report it clearly.

## Working Principles
- Keep changes tightly scoped
- Prefer the smallest possible diff
- Preserve runtime behavior
- Do not clean up surrounding code unless directly required
- If the exact type is unclear, prefer `unknown` with safe narrowing
- If a fix is behavior-risky, skip it and report it

## Completion Criteria
- Improve the target issue(s) within the listed scope
- Do not modify files outside the listed scope
- Do not change intended behavior
- Explicitly report unresolved issues left for safety reasons
- Validation results should be included

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
- unresolved issues left intentionally
- lint result
- build result
- risk notes

## Notes
- If a wider change seems necessary, do not expand scope automatically
- Stop and report if the safe fix is unclear
- Prefer a smaller safe improvement over a larger risky cleanup