# 009 - Build Font Stability Batch 1

## Goal
Stabilize build behavior related to Google font fetching without harming the main product behavior.

This task is not a visual redesign task.
This task is not a broad build-system refactor.
The purpose is to make build results more reliable by addressing the current font-related build blocker in a safe, controlled way.

## Scope
Only touch these files if needed:

- `app/layout.tsx`
- `app/globals.css`
- `package.json`
- `next.config.js`
- `next.config.mjs`
- `next.config.ts`

Do not touch files outside this scope unless absolutely necessary.
If a broader change seems required, stop and report it instead of expanding scope.

## Primary Objective
- Investigate the current build blocker caused by remote Google font fetching
- Apply the safest fix that improves build reliability
- Preserve existing user-visible behavior as much as reasonably possible
- Keep the diff small and operationally safe

## Allowed Changes
- Replace remote font loading with a safer build-stable alternative if behavior impact is minimal and clearly explained
- Adjust font setup in `app/layout.tsx`
- Use a local/system-font fallback approach if needed
- Add small CSS adjustments only if required to preserve reasonable typography behavior
- Make minimal config changes only if directly related to font/build stability
- Add comments only when they help explain a non-obvious stability decision

## Disallowed Changes
- No visual redesign
- No unrelated CSS cleanup
- No broad styling refactor
- No layout structure changes
- No route/component behavior changes
- No feature changes
- No unrelated dependency changes
- No file moves or renames
- No touching unrelated files

## Critical Safety Rule
Build reliability is important, but core product behavior and overall UI stability still come first.

If a proposed fix would significantly affect:
- layout structure
- page behavior
- component behavior
- responsive behavior
- overall visual hierarchy

then do not apply that fix automatically.
Use the most conservative stable alternative and report tradeoffs clearly.

## Working Principles
- Prefer the smallest possible diff
- Prefer reliability over visual perfection
- Preserve runtime and user interaction behavior
- Avoid broad styling changes
- Keep typography changes minimal and controlled
- If a fully equivalent fix is not possible, choose the safest operational fix and report the tradeoff clearly

## Preferred Direction
Prioritize solutions in this order:

1. Safe build-stable font configuration with minimal visible impact
2. Safe fallback to local/system font stack with clear reporting
3. Small CSS compensation only if necessary

Avoid solutions that introduce broader styling uncertainty.

## Completion Criteria
- The current font-related build blocker is addressed or reduced in a clearly documented way
- Changes stay within the approved scope
- Build reliability should improve
- User-visible impact should be minimal and clearly reported
- Any remaining build limitation should be reported honestly

## Validation
Run in this order:

1. Review the diff and confirm only approved files were changed
2. Run `npm run build`
3. If build still fails, report the exact failure cause and affected files
4. If build passes, report that clearly
5. Note any visible typography tradeoff introduced by the fix

## Required Result Format
Report results using this structure:

- changed files
- implementation summary
- build result
- remaining issue, if any
- visual/typography tradeoff
- risk notes