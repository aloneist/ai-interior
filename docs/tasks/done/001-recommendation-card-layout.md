# Task Request

## Task ID
task-001

## Request summary
Improve recommendation product card layout by tightening spacing, clarifying title/price/button alignment, and moving the save button to a more visible position.

## Target files
- components/mvp/RecommendationProductCard.tsx

## Expected result
The card should have clearer information hierarchy, more stable spacing, stronger price visibility, and more obvious save action placement.

## Verification
- build
- browser/manual check
- verify long product names do not break the layout
- verify mobile layout does not collapse
- verify compare/detail buttons keep equal height

## Risk note
- save button could visually crowd the title area on narrow screens
- short or missing reason text could create uneven card height
- mobile button width could feel cramped

## Output format
- full file

## Scope guard
Do not change recommendation logic, save/compare business logic, API routes, or shared type definitions.

## Notes for Codex
Keep the change scoped to the card component only.
Prefer layout and presentation changes over behavior changes.
Preserve existing callbacks and props.