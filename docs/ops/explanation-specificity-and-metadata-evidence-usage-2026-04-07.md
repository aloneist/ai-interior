# Explanation Specificity And Metadata Evidence Usage

Date: 2026-04-07

## Current Position

Recommendation ranking, controlled `/api/mvp` QA, and explanation fallback validation are stable. The remaining quality issue after the first catalog metadata overlay was that explanation fallback stayed higher than expected even though top-product metadata improved.

This batch did not change ranking. It only changed explanation payload validation, prompt specificity, and deterministic fallback guards.

## Root Cause

The controlled `/api/mvp` fallback triggers were explanation-side, not ranking-side:

- Generated reasons often omitted a concrete item/category noun, causing `missing_item_category_signal`.
- `NÄMMARÖ` and `PERJOHAN` exposed the weakness of validating only against the coarse DB `category`; both are stored as `chair`, but overlay metadata correctly describes storage/support and bench roles.
- Some generated text omitted exact room/signal terms such as `톤`, `밝기`, `밀도`, or `컬러감`.
- One category-mismatch item used broad fit language such as `적합`, which is too confident for a non-requested furniture type.

## Changes

- `/api/mvp` now passes `description`, `color`, `material`, and overlay metadata into `validateExplanationSet`.
- The validator now accepts grounded `catalog_metadata.category_aliases` as item/type evidence instead of relying only on coarse `category`.
- Fallback labels now prefer specific overlay aliases such as `수납상자` and `벤치` over forcing `의자`.
- Fallback text uses overlay style signals such as `우드톤`, `밝기`, and `차분한 톤` where available.
- The prompt now explicitly requires one exact signal token per sentence and tells the model to use metadata-backed item nouns.
- Explanation generation in `/api/mvp` now uses `temperature: 0` for repeatable QA behavior.
- The validator now treats broad fit language on `category_fit="mismatch"` as `category_fit_overconfidence`.

## QA Evidence

Controlled `/api/mvp` baseline from the immediate pre-fix run:

- pass: 2
- weak: 1
- fail: 0
- fallback: 4
- dominant trigger: `missing_item_category_signal`

Controlled `/api/mvp` final run:

- pass: 2
- weak: 1
- fail: 0
- fallback: 1
- weak case remained weak with `weak_category_match`
- final remaining fallback: one missing reason for `LOBERGET / SIBBEN`

Explanation fixture review final run:

- pass: 3
- weak: 0
- fail: 0
- fallback: 1
- intentional bad-output fallback regression: pass, 3/3 fallbacks triggered

Static validation:

- `npm run lint`: pass
- `npx tsc --noEmit`: pass
- `npm run build`: pass

## Decision

Classification: `EXPLANATION SPECIFICITY IMPROVED`.

The fallback count is now acceptable for MVP because the remaining fallback is not masking a contradiction or ranking defect. The system still catches overconfident category mismatch text and keeps the intentionally weak workspace sofa case weak.

Recommended next quality batch: either enrich the remaining high-frequency non-overlay product `OLSERÖD`, or add a small explanation audit threshold to alert when fallback rises above the controlled baseline.
