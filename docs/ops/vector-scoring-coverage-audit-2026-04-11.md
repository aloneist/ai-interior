# Vector Scoring Coverage Audit - 2026-04-11

## Scope

Audit scoring-feature coverage for the canonical active catalog after canonical-first runtime convergence, then harden the runtime against misleading null-vector behavior without reintroducing legacy-first candidate selection.

## Live Coverage Snapshot

Live Supabase audit at execution time:

- active canonical `furniture_products`: `48`
- active products with usable `furniture_vectors` rows: `27`
- active products missing vector/scoring rows: `21`
- usable vector coverage: `56.3%`

### Coverage by source

| source | active products | vector-covered | uncovered |
| --- | ---: | ---: | ---: |
| `ikea` | 29 | 27 | 2 |
| `livart` | 10 | 0 | 10 |
| `hanssem` | 8 | 0 | 8 |
| `qa` | 1 | 0 | 1 |

### Largest uncovered category segments

| category | total active | vector-covered | uncovered |
| --- | ---: | ---: | ---: |
| `storage` | 7 | 0 | 7 |
| `sofa` | 19 | 13 | 6 |
| `desk` | 3 | 0 | 3 |
| `table` | 10 | 8 | 2 |
| `bed` | 2 | 0 | 2 |
| `chair` | 7 | 6 | 1 |

### Important concentration

The uncovered rows cluster around recently published canonical products, especially the current `livart` and `hanssem` expansions. This confirms the remaining runtime issue is scoring-feature coverage drift, not candidate inclusion drift.

## Exact Runtime Risk

Active runtime behavior before this hardening:

1. candidate selection already started from canonical `furniture_products`
2. missing vector rows were backfilled with explicit nulls
3. ranking still used `?? 50` defaults for vector-style scoring fields

That preserved runtime correctness, but it created two quality risks:

- missing-vector candidates were scored from a synthetic neutral vector profile instead of real scoring features
- style proxy logic could treat missing-vector rows as if they had real calm/minimal proxy evidence because some proxy checks also inherited the same `50` defaults

This was especially risky for explanation quality because `style_fit = "proxy"` can flow into the MVP explanation path.

## Narrow Hardening Applied

Updated:

- [recommendation-ranking.ts](/workspaces/ai-interior/lib/server/recommendation-ranking.ts)

Changes:

1. detect whether a candidate actually has usable vector coverage
2. surface per-item runtime coverage as `ranking_context.vector_coverage`
3. add `vector_scoring_unavailable` to weak-match reasons for uncovered candidates
4. prevent missing-vector candidates from claiming vector-derived style proxy matches
5. expose coverage counts in `quality_summary`

New `quality_summary` fields:

- `vector_covered_candidate_count`
- `vector_missing_candidate_count`
- `vector_missing_top3_count`

New top-level weak signal:

- `vector_coverage_gap_in_top_result`

## What Did Not Change

- candidate selection remains canonical-first from `furniture_products`
- recommendation/save/click/compare identity remains canonical product identity
- `furniture_vectors` was not promoted back to candidate truth
- ranking strategy was not redesigned
- schema was not changed

## Remaining Legacy Dependency

Still remaining:

- `furniture_vectors` is still the only live source of brightness / temperature / footprint / minimalism / contrast / colorfulness scoring features
- `/api/analyze-furniture` still writes those features into `furniture_vectors`
- newly published canonical products can still participate in runtime without vectors, but they are now explicitly marked as coverage-missing instead of silently inheriting misleading style proxy behavior

## Next Safe Cleanup Step

The next safe step is a scoring backfill / enrichment pass for active canonical products, focused first on:

1. `livart`
2. `hanssem`
3. the remaining uncovered `ikea` rows

Do not delete `furniture_vectors` before canonical products have a replacement scoring-feature path or acceptable enrichment coverage.
