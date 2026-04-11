# Canonical Runtime Convergence - 2026-04-11

## Scope

Converge the active recommendation runtime toward the canonical catalog path without changing recommendation identity semantics, ranking logic, or schema.

## Exact Dual-Runtime Gap Found

Before this step:

- canonical publish/read path already used `furniture_products`
- recommendation/save/click/compare identity already used canonical `furniture_products.id`
- but the active runtime candidate set still started from `furniture_vectors`

That meant:

- `/api/recommend` read candidate IDs from `furniture_vectors`
- `/api/mvp` read candidate IDs from `furniture_vectors`
- `/api/recommend-space` read candidate IDs from `furniture_vectors`
- then those routes hydrated product records from `furniture_products`

So the runtime was dual-structured:

- identity and hydration were canonical
- candidate selection was still vector-table-first

This was the exact gap: active canonical products without vector rows could not participate in runtime recommendation selection even though `furniture_products` is the operational source of truth.

## What Changed

Updated:

- [furniture-catalog.ts](/workspaces/ai-interior/lib/server/furniture-catalog.ts)
- [route.ts](/workspaces/ai-interior/app/api/recommend/route.ts)
- [route.ts](/workspaces/ai-interior/app/api/mvp/route.ts)
- [route.ts](/workspaces/ai-interior/app/api/recommend-space/route.ts)

New convergence helper:

- `loadRuntimeRecommendationCatalog(supabase)`

Behavior now:

1. read active candidate rows from canonical `furniture_products`
2. build runtime product records from canonical catalog rows
3. left-join `furniture_vectors` by canonical product ID
4. backfill missing vector rows with explicit null scores
5. let the existing ranking layer apply its current `?? 50` fallback behavior

This is an explicit compatibility layer, not a hidden third contract:

- canonical catalog is now the runtime source of candidate truth
- `furniture_vectors` remains only a scoring-feature compatibility surface

## Identity Semantics Preserved

No recommendation identity contract changed.

Still true after convergence:

- recommendation payload IDs are canonical `furniture_products.id`
- `recommendations.furniture_id` still stores canonical product IDs
- `/api/log-save` and `/api/log-click` still update by canonical product ID
- `published_product_id` remains the official staging -> canonical link

## Runtime Validation

### 1. Focused recommend-route canonical QA

Ran:

- `npm run qa:legacy-furniture-retirement`

Result:

- pass

Key outcomes:

- `vector_count = 27`
- `hydrated_through_furniture_products_count = 27`
- `missing_from_furniture_products_count = 0`
- `/api/recommend` returned `10` items
- first recommended product ID remained canonical
- click/save action updates still worked on canonical IDs

### 2. Focused MVP runtime smoke

Ran:

- `APP_BASE_URL=http://127.0.0.1:3000 npm run qa:mvp-operational-smoke`

Result:

- pass

Key outcomes:

- `/api/mvp` returned `200`
- top recommendation ID was canonical
- save/click/unsave actions succeeded
- `quality_summary.candidate_count = 48`

### 3. Focused recommend-space check

Ran a targeted live call against the latest persisted `spaces` row.

Result:

- `/api/recommend-space` returned `200`
- top recommendation ID was canonical
- `quality_summary.candidate_count = 48`

## Convergence State

### Now converged

- runtime candidate selection starts from active canonical `furniture_products`
- runtime hydration is canonical
- runtime output IDs are canonical
- save/click/update paths remain canonical

### Still legacy / compatibility-backed

- `furniture_vectors` still exists as the scoring-feature surface
- `/api/analyze-furniture` still writes vector scores into `furniture_vectors`
- ranking still consumes vector-style fields, with null -> default fallback behavior

### Important runtime evidence

The post-change candidate set now reflects the canonical catalog breadth:

- recommendation quality smoke showed `candidate_count = 48`
- legacy vector QA still reported `vector_count = 27`

That confirms the convergence step worked:

- active runtime is no longer restricted to vector-row membership for candidate inclusion
- vector coverage is now feature enrichment, not runtime existence

## Temporary Compatibility Layer

Yes, explicitly introduced:

- canonical-first runtime candidate load
- optional vector enrichment from `furniture_vectors`
- null vector backfill when a canonical product has no vector row yet

This compatibility is intentional and narrow. It preserves current ranking behavior while removing vector-table-first candidate gating.

## Remaining Legacy Dependency

Still remaining:

- vector generation/storage lifecycle
- ranking feature dependence on vector-compatible fields
- QA scripts that still mention `furniture_vectors` for runtime independence checks

Not remaining on the active runtime path:

- no active recommendation route now requires `furniture_vectors` to be the primary catalog source
- no route now uses legacy `furniture` identity semantics as runtime truth

## Next Cleanup Step

The next safe cleanup step is not a schema deletion. It is a narrower runtime hardening pass:

- measure how many active canonical products still rely on vector backfill defaults
- decide whether to increase vector coverage for canonical products
- only then consider shrinking the runtime significance of `furniture_vectors` further

Do not delete legacy tables blindly from this step.
