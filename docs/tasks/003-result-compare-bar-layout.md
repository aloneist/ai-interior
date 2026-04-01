# Task Request

## Task ID
task-003

## Request summary
Improve the result compare bar layout so the selected state is easier to scan, action buttons feel steadier, and the bar remains readable on narrower screens without changing behavior.

## Target files
- components/mvp/ResultCompareBar.tsx

## Expected result
The compare bar should have clearer selection hierarchy, more stable spacing, and safer action alignment on mobile while preserving existing props and callbacks.

## Verification
- build
- browser/manual check
- verify selected and unselected states are easy to distinguish
- verify compare action remains usable
- verify narrow/mobile layout does not collapse
- verify long product names do not make the bar unreadable

## Risk note
- long product names may still wrap awkwardly in narrow widths
- stronger selected-state emphasis could feel visually heavy if spacing is too tight
- button grouping may still need small responsive tuning after visual QA

## Output format
- full file

## Scope guard
Do not change compare business logic, recommendation logic, API routes, or shared type definitions.

## Notes for Codex
Keep the change scoped to presentation/layout only.
Preserve existing props, callbacks, and user actions.
Prefer clearer state hierarchy and steadier action layout over adding new UI features.