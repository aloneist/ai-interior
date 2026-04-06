# MVP Explanation Fixture Review

Date: 2026-04-06

## Current Position

Recommendation ranking is stable, sofa anchors are surfacing, and the false sofa `weak_style_match` was fixed. The remaining risk was explanation trust: `/api/mvp` generated `reason_short` text could still claim a fit that `ranking_context` marked as weak, mismatched, or uncertain.

## Fixture Strategy

This batch uses a controlled explanation-only path instead of calling `/api/mvp` end to end.

Reason:

- `/api/mvp` couples image analysis, DB writes, recommendation insert, ranking, and explanation generation.
- That makes direct `/api/mvp` sampling noisy for explanation review.
- The explanation layer can be reviewed more repeatably by freezing the exact payload sent to the explainer.

Artifacts:

- Fixture: `data/qa/mvp-explanation-review-fixtures-v1.json`
- Runner: `scripts/run-mvp-explanation-review.mjs`
- Script: `npm run qa:mvp-explanation-review`

Method:

- Use stable payload fixtures with frozen room scores, user input, items, `ranking_context`, and `quality_summary`.
- Use the production `RECOMMENDATION_EXPLAIN_SYSTEM_PROMPT`.
- Call `gpt-4o-mini` directly with `temperature: 0`.
- Do not rerun image analysis.
- Do not rerun recommendation ranking.
- Validate generated `reason_short` text against the frozen ranking context.

## Cases Reviewed

1. `mvp-exp-living-sofa-aligned`
   - Low-budget living-room sofa case.
   - Expected: no style false weakness, no budget-fit claim for over-budget secondary sofas.

2. `mvp-exp-workspace-sofa-weak`
   - Intentionally weak small workspace sofa case.
   - Expected: no room-fit claim for the top sofa because `room_fit=mismatch`.

3. `mvp-exp-dining-table-budget-uncertain`
   - Dining table case with one over-budget top-3 item.
   - Expected: no budget-fit claim for `budget_fit=over`.

## Initial Review Findings

The first controlled run found real explanation issues:

- `product_key` mismatch:
  - The model shortened fixture keys such as `fixture://lisabo-table-dining` into `lisabo-table-dining`.
  - This would break exact `reasonMap` matching in `/api/mvp`.

- Room-fit overclaim:
  - For an item with `room_fit=mismatch`, the model generated text equivalent to “fits the space well.”
  - This contradicted `ranking_context`.

No ranking changes were needed.

## Fix Applied

Prompt was narrowed to require:

- copy each `product_key` exactly
- do not shorten, normalize, translate, or remove URL/scheme/punctuation
- do not claim style fit when `style_fit=mismatch`
- do not claim room fit when `room_fit=mismatch`
- do not claim budget fit when `budget_fit=over` or `budget_fit=unknown`
- for `room_fit=mismatch`, use cautious language such as “tone only can be referenced,” not “fits the space”
- do not imply category satisfaction when `category_fit=mismatch`

The runner was also hardened to fail a room-mismatch item when the generated text uses broad room-fit phrases such as “잘 어울,” “잘 맞,” or “조화.”

## Final Review Result

Final command:

```bash
npm run qa:mvp-explanation-review
```

Final summary:

- pass: 2
- weak: 1
- fail: 0

Case results:

- `mvp-exp-living-sofa-aligned`: pass
  - Generated text did not claim budget fit for over-budget secondary sofas.
  - Product keys were copied exactly.

- `mvp-exp-workspace-sofa-weak`: pass
  - `room_fit=mismatch` top sofa used cautious text: `소파의 미니멀 톤만 참고할 수 있어요.`
  - It did not claim the sofa fit the workspace.

- `mvp-exp-dining-table-budget-uncertain`: weak
  - No contradiction was found.
  - One explanation was too light on item evidence: `블랙 컬러감이 다이닝 공간의 대비를 강조해요.`
  - It missed the explicit item category term, so this is specificity debt, not truthfulness failure.

## Backlog

P0: Keep exact `product_key` copy and mismatch-claim guards.

- Status: done in this batch.
- Why: incorrect keys break reason mapping; mismatch claims damage trust.

P1: Improve item-evidence specificity.

- Trigger: generated explanation mentions attributes like color but not the item category or item type.
- Example: `블랙 컬러감이 다이닝 공간의 대비를 강조해요.`
- Proposed next fix: strengthen the prompt to require category/type noun inclusion for every item, or add post-generation fallback when category term is missing.

P2: Add a post-generation validator/fallback inside `/api/mvp`.

- Trigger: current QA validates the explanation layer, but runtime still trusts model output if it is valid JSON.
- Proposed fix: if generated reason misses product_key or contradicts ranking context, use a deterministic fallback sentence grounded in `ranking_context`.

P3: Add a small live `/api/mvp` fixture pass.

- Trigger: after adding fallback, run one controlled image fixture through the full route to verify image analysis + ranking + explanation integration.

## Decision

`NEEDS ONE MORE EXPLANATION HARDENING BATCH`

The truthfulness baseline is materially better: no final contradiction failures and product-key copying is fixed. The remaining issue is explanation specificity and lack of runtime fallback validation, not ranking.
