# Catalog Style Metadata And Human QA Set

## Current Position

- Recommendation runtime is stable on `furniture_products`.
- Recommendation action logging is stable for `clicked` and `saved`.
- Ranking now has explicit signals for category, budget, metadata quality, style fit, room fit, dedupe, and weak-result visibility.

The next quality bottleneck is catalog metadata and repeatable human review. This batch does not change runtime ranking. It defines the MVP metadata approach and adds a small reusable human QA review set.

## MVP Style Metadata Proposal

### Style Labels

Use this closed label set for MVP catalog review:

| Label | Meaning | Positive signals |
| --- | --- | --- |
| `minimal` | visually simple, low clutter, clean lines | minimal, simple, slim, clean, light frame |
| `bright` | visually light, pale, airy | white, cream, beige, light wood, natural tone |
| `warm-wood` | warm material or color direction | wood, oak, walnut, acacia, brown, natural wood |
| `calm` | low visual noise, soft or muted tone | grey, beige, muted blue, natural, low contrast |
| `modern` | contemporary, sharper material language | black, steel, metal, chrome, glass, high contrast |
| `hotel` | more polished lounge or premium feel | velvet, dark tone, gold, lounge-like, premium-looking |

Do not add new labels until at least 20 products require a missing label and the current set cannot express the difference.

### Assignment Rules

- Start with inferred labels from product text and vector signals.
- Human reviewers may confirm or remove inferred labels during QA review.
- A product may have 0 to 3 MVP style labels.
- Prefer fewer labels. If a product needs more than 3 labels, keep only the strongest style signals.
- Do not infer room type from style. Room fit remains category/usage based.
- Do not infer category from style. Category fit remains product-type based.

### Confidence Rules

Use three confidence levels:

| Confidence | Use when |
| --- | --- |
| `high` | product name/category has explicit keyword evidence, or human reviewer confirms the label |
| `medium` | vector proxy and product text direction agree, but no exact keyword exists |
| `low` | only vector proxy exists or product text is ambiguous |

Operational rule:

- `high` and `medium` labels can be used for ranking.
- `low` labels should be used only for QA notes, not as hard ranking evidence.
- If style metadata conflicts with room/category fit, room/category should win in MVP ranking.

### Storage Approach

Do not add schema in this batch.

Recommended next implementation path:

- Add a lightweight `style_labels` array and `style_label_confidence` map to `furniture_products.metadata_json` only after the human QA set has been used on at least one review pass.
- Keep labels reviewable in docs/fixtures before turning them into live catalog metadata.
- Do not create a separate labeling system until the manual review set becomes too large to manage.

## Human QA Review Set

Review fixture:

- `data/qa/recommendation-human-review-set-v1.json`

Coverage:

| Case | Dimension | Purpose |
| --- | --- | --- |
| `hqa-category-chair-workspace-low` | category | workspace chair category fit under low budget |
| `hqa-budget-living-sofa-low` | budget | low-budget handling when sofa coverage may be weak |
| `hqa-style-warm-calm-table` | style | warm/calm style fit with table preference |
| `hqa-room-dining-modern-table` | room-type | dining table room intent |
| `hqa-mixed-workspace-chair-style-budget` | mixed | core regression case across category, style, budget, and room |
| `hqa-weak-workspace-sofa-low` | weak-result | intentional weak case where surfacing matters more than forcing a bad match |

Validator:

- `npm run qa:recommendation-human-review-set`

The validator checks structure, required dimensions, supported labels, supported room types, supported budget levels, supported furniture types, and expectation completeness.

## Review Criteria

### Good Top Result

A good top result should satisfy the primary intent for the case:

- category case: requested furniture type appears in top 3 or an equivalent product is clearly plausible
- budget case: at least one top-3 product is within budget and expensive/unknown products are not silently treated as clean fits
- style case: at least one top-3 product has `style_fit=explicit` or `style_fit=proxy`
- room-type case: at least one top-3 product has `room_fit=good`
- mixed case: category, budget, style, and room signals are all represented in the top 3
- weak case: weak-result visibility is clear even when the exact requested product type is unavailable

### Acceptable Weak Result

A weak result is acceptable when:

- the catalog likely lacks enough matching candidates
- `quality_summary.weak_result=true`
- `quality_summary.weak_reasons` names the primary weakness
- per-item `weak_match_reasons` explain the mismatch
- the recommendation does not pretend an unrelated product is a perfect match

### Follow-Up Fix Triggers

Open a follow-up ranking or metadata fix when:

- a non-weak case returns `weak_result=true` for two consecutive review runs
- top 3 has zero category matches for an explicit furniture request
- top 3 has zero `within` budget items for a low-budget request
- top 3 has zero style-fit items for a style case
- top 3 has zero room-fit items for a room-type case
- explanations claim a style or room fit that `ranking_context` marks as mismatch
- the same product dominates unrelated cases without a clear category/style/budget reason

## Readiness Judgment

`READY FOR ONGOING MVP ITERATION`

Reason:

- style metadata has a small closed label set and confidence rule
- human QA now has a reusable fixture with concrete expectations
- validation is automated for fixture structure
- no heavy labeling system or schema change is required before the next recommendation iteration
