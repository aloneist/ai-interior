# Sofa Anchor Coverage And Review Runner Room Targets

## Current Position

- The recommendation baseline is stable.
- The first human review run found the highest priority product-quality gap: sofa-intent cases did not surface sofa anchors in the top 3.
- The same run used one fixed room target profile across all cases, which made repeated top products more likely and made review evidence less realistic.

This batch keeps the fix narrow: audit sofa supply/vector coverage, adjust tie-break ordering for explicit furniture intent, and make the review runner use per-case room targets.

## Sofa Root-Cause Findings

Read-only live catalog audit:

| Check | Result |
| --- | ---: |
| `furniture_products` rows checked | `29` |
| active sofa-like products found | `13` |
| sofa-like products with `furniture_vectors` rows | `13` |

Conclusion:

- The sofa weakness was not caused by missing published product supply.
- The sofa weakness was not caused by missing vector rows.
- Sofa alias/category matching was not the primary issue; sofa rows have `category=sofa`.
- The root cause was ranking saturation and tie-break order.

Observed behavior before this batch:

- Sofa candidates could reach the capped score `100`.
- Cheap chair/table candidates also reached score `100`.
- Tie-breaks preferred metadata quality and lower price before explicit furniture preference.
- Therefore cheap non-sofa products could outrank sofa candidates even when the user explicitly requested `furniture=["sofa"]`.

## Implemented Fix

Changed tie-break ordering in `lib/server/recommendation-ranking.ts`:

1. Sort by `recommendation_score`.
2. When scores tie, prefer `category_fit`:
   - `preferred`
   - `room_match`
   - `neutral`
   - `mismatch`
3. Then prefer `room_fit`.
4. Then prefer `style_fit`.
5. Then use metadata quality, price, and name.

This does not force sofas into results. It only prevents lower-price non-sofa candidates from beating equally scored sofa candidates when explicit sofa intent is present.

## Review Runner Improvements

The human review set now supports per-case room targets:

- `brightness`
- `temperature`
- `footprint`
- `minimalism`
- `contrast`
- `colorfulness`

The runner uses:

- per-case `roomTargets` when present
- default room targets only as fallback

The validator now checks optional `roomTargets` shape and requires each provided target to be a number from `0` to `100`.

## Review Evidence

Final review command:

- `npm run qa:recommendation-human-review-run`

Final summary:

| Judgment | Count |
| --- | ---: |
| pass | `4` |
| weak | `2` |
| fail | `0` |

### Sofa Cases

Before this batch:

- `hqa-budget-living-sofa-low`: top3 sofa count `0`, weak due `weak_category_match`
- `hqa-weak-workspace-sofa-low`: top3 sofa count `0`, weak due `weak_category_match`

After this batch:

- `hqa-budget-living-sofa-low`: top3 sofa count `3`
- `hqa-budget-living-sofa-low`: top3 within-budget count `1`
- `hqa-budget-living-sofa-low`: first result is `GLOSTAD 글로스타드 2인용소파`, price `140000`, `budget_fit=within`
- `hqa-budget-living-sofa-low`: still mechanically weak only because `style_fit_in_top3=0` and `weak_style_match`
- `hqa-weak-workspace-sofa-low`: still top3 sofa count `0`, with `weak_category_match`, which remains acceptable for the intentionally awkward small-workspace sofa case

### Repeated Top Product Behavior

Before this batch:

- `GULTARP`, `TÄRNÖ`, and `LOBERGET / SIBBEN` dominated all six cases.

After this batch:

- chair/workspace cases now surface chair-like products such as `LOBERGET / SIBBEN`, `NÄMMARÖ`, and `PERJOHAN`
- table/style and dining cases now surface table-like products such as `TÄRNÖ`, `OLSERÖD`, `LISABO`, and `MITTZON`
- living-room sofa case now surfaces sofa products: `GLOSTAD`, `SÖDERHAMN`, and `SÖDERHAMN` armchair variant

The repeated-top-product problem is reduced under per-case room targets and category-first tie-breaks.

## Outcome

`SOFA GAP FIXED`

The original sofa-anchor failure is fixed for the living-room sofa case. The remaining weakness in that case is now style metadata/style-fit related, not sofa coverage. The intentionally weak workspace sofa case remains honestly weak, which is the correct behavior.

## Recommended Next Batch

`118-sofa-style-fit-and-explanation-alignment-batch-1`

Reason:

- Sofa anchor coverage is fixed.
- The living-room sofa case still reports `weak_style_match`.
- Explanations are still not reviewed in the human review runner because `/api/recommend` does not produce `reason_short`.
- The next quality batch should focus on sofa style metadata and `/api/mvp` explanation alignment, not more category anchoring.
