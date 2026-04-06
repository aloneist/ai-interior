# Explanation Runtime Validation And Fallback

Date: 2026-04-06

## Current Position

Recommendation ranking, sofa anchor coverage, and sofa style-fit are stable. Controlled explanation fixture review had no contradiction failures, but runtime still trusted any valid JSON returned by the model. This batch moves explanation handling from prompt-only guidance to deterministic runtime validation and fallback.

## Runtime Validation Rules

Runtime now validates generated explanation output before exposing `reason_short`.

Validation checks:

- exact `product_key` match
- missing product key
- missing or empty `reason_short`
- structurally invalid explanation response
- duplicate product keys
- forbidden generic phrases
- missing room signal term
- missing item/category evidence
- style-fit claim when `ranking_context.style_fit=mismatch`
- room-fit claim when `ranking_context.room_fit=mismatch`
- budget-fit claim when `ranking_context.budget_fit=over` or `unknown`
- broad room-fit wording when `room_fit=mismatch`

The implementation lives in `lib/mvp/explanation-validation.ts`.

## Fallback Behavior

If any validation rule fails, runtime uses deterministic fallback text instead of generated model output.

Fallback rules:

- preserve the correct product key by mapping fallback to the original item
- include item/category evidence where possible
- avoid room-fit claims when `room_fit=mismatch`
- avoid budget-fit claims when `budget_fit=over` or `unknown`
- avoid style-fit claims when `style_fit=mismatch`
- keep the text short and MVP-safe

Examples:

- `room_fit=mismatch`: `소파의 톤만 참고할 수 있어요.`
- `budget_fit=over`: `소파의 톤과 밀도를 참고해 주세요.`
- `style_fit=mismatch`: `테이블의 밝기와 밀도를 기준으로 골랐어요.`
- style fit present: `소파의 톤과 미니멀감이 맞아요.`

## Runtime Wiring

`/api/mvp` now:

1. requests model explanations as before
2. parses the JSON response
3. validates the generated reasons against the top-3 items and `ranking_context`
4. builds `reason_short` from validated generated text or deterministic fallback
5. returns the same response shape

No ranking logic changed.

## QA Evidence

Validation passed:

- `npm run qa:mvp-explanation-review`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Controlled explanation review final result:

- pass: 3
- weak: 0
- fail: 0
- fallback during clean generated review: 0

Fallback regression result:

- intentionally invalid generated outputs: 3
- fallback triggers: 3
- fallback final judgment: pass

Fallback trigger examples:

- wrong product key caused `missing_reason`
- over-budget claim caused `budget_fit_claim_mismatch`
- empty explanation caused `missing_reason`

## Full `/api/mvp` Fixture Decision

A controlled full `/api/mvp` fixture pass was not added in this batch.

Reason:

- `/api/mvp` still performs image analysis and DB writes.
- That would mix explanation QA with image-analysis variance and persistent runtime side effects.
- The current fixture path is more repeatable for explanation correctness.

Recommended next step, if needed:

- add an explicit test-only/mockable explanation path or dependency injection boundary for `/api/mvp`
- then run one full-route fixture without writing misleading QA data

## Decision

`EXPLANATION BASELINE STABLE`

The runtime no longer blindly trusts generated explanation text. Prompt output can still vary, but invalid, missing, contradictory, or too-generic output now degrades to deterministic fallback.
