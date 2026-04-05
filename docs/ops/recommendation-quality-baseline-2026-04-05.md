# Recommendation Quality Baseline

## Current Ranking Findings

- Core ranking previously relied on vector-distance only.
- User constraints such as `furniture`, `budget`, and most style signals were applied mainly in grouped recommendation sorting, not in the primary top-result ranking.
- Duplicate suppression existed, but only after raw score sort and without metadata-quality tie-breaks.
- Weak-result handling was implicit. The API still returned products, but did not clearly say when category or budget fit was weak.

## MVP Quality Baseline

This batch defines the minimum acceptable recommendation baseline for QA review.

### Top-result relevance

- Top recommendations must come from `furniture_products`-hydrated candidates only.
- Recommendation routes must return deduped products.
- When a furniture type is explicitly requested, at least 1 of the top 3 should match the requested type in the constrained QA scenario.
- When a low-budget request is given, at least 1 of the top 3 should be classified as `within` budget in the constrained QA scenario.

### Metadata quality

- Top results should carry enough metadata for purchase-oriented review:
  - product identity
  - category
  - image when available
  - product URL key when available
- Ranking now penalizes weak metadata instead of treating incomplete rows as equal candidates.

### Explainability

- Each returned item should expose:
  - `ranking_context.base_score`
  - `ranking_context.final_score`
  - `ranking_context.category_fit`
  - `ranking_context.budget_fit`
  - `ranking_context.metadata_quality`
  - `ranking_context.weak_match_reasons`
- Each response should expose `quality_summary` with:
  - candidate counts
  - weak-result flag
  - weak-result reasons
  - top-3 category/budget fit counts when user constraints are present

### Weak-result visibility

- Weak recommendation sets must not be silently presented as equally strong.
- A result set is considered weak when one or more of these is true:
  - requested furniture type is poorly represented in the top 3
  - no within-budget item reaches the top 3 for a budget-constrained request
  - top results have low similarity or weak metadata

## Implemented Hardening

- Shared ranking helper now powers recommendation ordering before result slicing.
- Furniture-type matching now uses keyword-aware matching rather than exact category equality only.
- Budget handling now applies stronger penalties for clearly over-budget or price-unknown candidates during budget-constrained ranking.
- Style tags now add narrow, explicit bonuses through existing vector dimensions instead of remaining almost inert.
- Tie-breaks now prefer better metadata quality, then lower known price, then stable name ordering.
- Weak-result cases are surfaced through `quality_summary` and per-item `weak_match_reasons`.

## Known Remaining Limits

- Style fit is still proxy-based because the catalog does not carry explicit human-reviewed style labels.
- Budget fit uses coarse MVP bands rather than product-level affordability models.
- The current baseline is suitable for MVP QA, but not for final recommendation-quality signoff without another focused iteration on style semantics and room-type coverage.

## Decision

Current classification after this batch: `NEEDS ONE MORE HARDENING BATCH`

Reason:

- category and budget handling are now explicit and testable
- duplicate and weak-result behavior are clearer
- style handling is improved but still constrained by limited product metadata
