# Task Request

## Task ID
task-002

## Request summary
Improve saved products section layout so saved items are easier to scan, spacing is steadier, and the empty state is clearer without changing behavior.

## Target files
- components/mvp/SavedProductsSection.tsx

## Expected result
The saved products section should have clearer spacing, better card/action alignment, and a more readable empty state while preserving existing behavior.

## Verification
- build
- browser/manual check
- verify empty state is clear
- verify saved item actions remain usable
- verify long product names do not break layout
- verify mobile layout does not collapse

## Risk note
- long product names may still wrap awkwardly on narrow screens
- card height could still vary if summary text length differs
- action button width may feel cramped on mobile if layout is too tight

## Output format
- full file

## Scope guard
Do not change recommendation logic, saved product business logic, API routes, or shared type definitions.

## Notes for Codex
Keep the change scoped to presentation/layout only.
Preserve existing props, callbacks, and user actions.
Prefer clearer spacing and stronger visual hierarchy over adding new features.