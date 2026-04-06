# Sofa Style-Fit And Explanation Alignment

Date: 2026-04-06

## Current Position

Recommendation runtime is stable on `furniture_products`, and the previous batch fixed sofa anchor surfacing. The remaining issue was that the living-room sofa review case still reported `weak_style_match` even when the top result was a correct low-budget sofa.

## Root Cause

The issue was not sofa supply or vector coverage.

- `furniture_products` rows: 29
- sofa-like published products: 13
- sofa-like products with `furniture_vectors`: 13

The issue was sofa style evidence classification:

- The review case requested `styles=["minimal"]`.
- `GLOSTAD 글로스타드 2인용소파` ranked correctly as the first low-budget sofa.
- Its vector values were compatible with a compact neutral sofa, but not with the previous global `minimal` proxy threshold:
  - `minimalism_score=52`
  - `contrast_score=52`
  - `colorfulness_score=45`
  - `spatial_footprint_score=74`
- The old rule required `minimalism_score >= 68` unless product text had an explicit minimal keyword.
- Therefore all top sofa results were marked `style_fit=mismatch`, causing `weak_style_match`.

This was too harsh for sofa cases. A compact neutral sofa can be weak-but-not-contradictory style evidence even without explicit metadata.

## Implemented Fix

The ranking fix is narrow:

- Keep the global `minimal` proxy threshold unchanged.
- Add a sofa-only minimal proxy for compact neutral sofas:
  - sofa-like product text/category
  - no obvious minimal-style contradiction keywords
  - `minimalism_score >= 50`
  - `contrast_score <= 55`
  - `colorfulness_score <= 50`
  - `spatial_footprint_score <= 80`
- Add neutral evidence handling for sofa + minimal requests where the product has no obvious contradictory style keywords but also does not meet proxy strength.

This does not force all sofas to fit minimal style. Red/yellow/blue/gold/velvet/pattern-heavy sofa text remains contradictory for the minimal proxy.

## Explanation Alignment

The MVP explainer now receives `ranking_context` for each top item.

The explanation prompt now explicitly says:

- use `item.ranking_context` when present
- do not claim style fit when `style_fit=mismatch`
- do not claim room fit when `room_fit=mismatch`
- do not claim budget fit when `budget_fit=over` or `budget_fit=unknown`
- if `weak_match_reasons` contains a mismatch, explain a safer room attribute instead

This batch validates the explanation contract at source level. It does not live-call `/api/mvp` for generated text because that route performs image analysis and LLM explanation generation. The route is hardened so future generated explanations receive the same ranking context as the API response.

## QA Evidence

Validation passed:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run qa:recommendation-quality`
- `npm run qa:recommendation-human-review-run`
- `npm run qa:sofa-style-explanation`

Targeted sofa result after the fix:

- `hqa-budget-living-sofa-low`: pass
- top 3 preferred category count: 3
- top 3 within budget count: 1
- top 3 style fit count: 1
- top 3 room fit count: 3
- `weak_result=false`
- `weak_reasons=[]`
- first result: `GLOSTAD 글로스타드 2인용소파`
- first result context:
  - `category_fit=preferred`
  - `room_fit=good`
  - `style_fit=proxy`
  - `budget_fit=within`

Genuinely weak case after the fix:

- `hqa-weak-workspace-sofa-low`: weak
- `weak_reasons=["weak_category_match"]`
- the weak signal remains because the request asks for a low-budget sofa in a small workspace

Human review run summary after the fix:

- pass: 5
- weak: 1
- fail: 0

## Outcome

`SOFA STYLE GAP FIXED`

The living-room sofa case no longer reports a false `weak_style_match`, while the awkward workspace sofa case remains honestly weak. The next quality batch should live-review `/api/mvp` explanation text with a controlled image fixture or mockable explanation path, rather than changing ranking again.
