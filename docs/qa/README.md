# Recommendation QA Baseline V1

## Purpose
This baseline defines a small manual-review set for recommendation quality checks.

It is intended for:
- reviewing recommendation outputs before logic changes are approved
- spotting obvious regressions in recommendation quality
- keeping QA notes in a consistent format

It is not intended for:
- changing recommendation logic
- introducing scoring or ranking behavior
- replacing deeper product QA

## Files
- `data/qa/recommendation-baseline-v1.json`: structured baseline cases and shared review dimensions
- `docs/qa/mvp-manual-browser-smoke-checklist.md`: real-browser MVP smoke checklist
- `docs/qa/mvp-manual-browser-smoke-execution-procedure.md`: operator procedure for later browser smoke execution
- `docs/qa/mvp-manual-browser-smoke-result-template.md`: reusable manual browser smoke report template

## MVP Smoke Layers
Use two distinct validation layers:

- Operational/API smoke: run `npm run qa:mvp-operational-smoke` against an already-running app. This checks `/api/mvp`, recommendation payload shape, canonical product IDs, affiliate URL preference, and save/click logging with `canonical_product_id`.
- Manual browser smoke: run the checklist in a real browser. This checks rendering, file input or image URL input, disabled/loading states, save/compare UI behavior, product detail modal behavior, and outbound new-tab transition.

Operational/API smoke is useful under constrained environments, but it does not replace manual browser smoke.

## Review approach
Use this baseline as a manual-review-first checklist.

For each case:
1. run the recommendation flow with inputs that match the case scenario
2. compare the output against the expected user intent
3. review the output against the positive and failure signals
4. record notes in the `reviewNotes` field or in a separate QA log

## Core dimensions
Review each case using these practical dimensions:
- category relevance
- room-context fit
- budget fit
- style fit
- size/space plausibility
- explanation plausibility
- obvious failure conditions

## Pass guidance
A case is directionally healthy when:
- the leading items match the user’s room and use case
- the set respects clear constraints such as budget, style, or small-space limits
- the explanations sound consistent with the actual products shown
- no obvious mismatches dominate the top results

## Fail guidance
Flag the case for follow-up when:
- top results belong to the wrong room or wrong product category
- recommendations ignore an explicit budget or style constraint
- large or impractical items are suggested for constrained spaces
- explanations make claims that do not fit the product or scenario
- storage, function, or layout priorities are clearly missed

## How to extend V1
When adding a new case, keep the same structure:
- `caseId`
- `scenario`
- `expectedUserIntent`
- `expectedPositiveSignals`
- `expectedFailureSignals`
- `reviewNotes`

Keep additions small and representative.
Prefer real user scenarios over synthetic edge cases.
