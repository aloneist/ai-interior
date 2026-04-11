# Canonical Scoring Coverage Backfill - 2026-04-11

## Scope

Recover scoring/vector coverage for the canonical active catalog without changing:

- canonical-first candidate selection
- canonical product identity semantics
- ranking strategy
- geometry contract semantics

## Runtime / Scoring Path Reviewed

Files and paths reviewed for this step:

- `app/api/recommend/route.ts`
- `app/api/mvp/route.ts`
- `app/api/recommend-space/route.ts`
- `lib/server/furniture-catalog.ts`
- `lib/server/recommendation-ranking.ts`
- `app/api/analyze-furniture/route.ts`
- `lib/server/furniture-vector-analysis.ts`
- `scripts/canonical-scoring-backfill.mjs`
- `docs/ops/canonical-runtime-convergence-2026-04-11.md`
- `docs/ops/vector-scoring-coverage-audit-2026-04-11.md`

## Coverage Before Backfill

Live audit before this step:

- active canonical `furniture_products`: `48`
- canonical products with usable vector/scoring coverage: `27`
- uncovered active canonical products: `21`
- effective coverage: `56.3%`

### Uncovered breakdown by source

| source | active | covered | uncovered |
| --- | ---: | ---: | ---: |
| `livart` | 10 | 0 | 10 |
| `hanssem` | 8 | 0 | 8 |
| `ikea` | 29 | 27 | 2 |
| `qa` | 1 | 0 | 1 |

### Practical backfill order used

1. `livart`
2. `hanssem`
3. uncovered `ikea`
4. exclude `qa`

The `qa` row was intentionally excluded from live backfill because it is not real operational catalog data.

## Exact Blocker Found During Execution

The first live smoke backfill exposed an additional runtime-compatibility constraint:

- `furniture_vectors.furniture_id` still has a live foreign key to legacy `furniture.id`
- the newer canonical product IDs from `livart`, `hanssem`, and the two uncovered `ikea` rows were missing from `furniture`

This meant a canonical-ID vector upsert alone could not succeed, even though the active runtime had already converged to canonical-first reads.

## Changes Made

Updated:

- [analyze-furniture route](/workspaces/ai-interior/app/api/analyze-furniture/route.ts)
- [furniture-vector-analysis helper](/workspaces/ai-interior/lib/server/furniture-vector-analysis.ts)
- [canonical-scoring-backfill script](/workspaces/ai-interior/scripts/canonical-scoring-backfill.mjs)
- [package.json](/workspaces/ai-interior/package.json)

### 1. Shared scoring-analysis helper

Added a shared helper so the existing analyze route and the new backfill script use the same:

- vision prompt
- score normalization
- hex normalization

This keeps scoring generation behavior aligned instead of duplicating prompt drift.

### 2. Canonical backfill operator script

Added:

- `npm run ops:canonical-scoring:backfill`

The script:

- audits current active canonical coverage
- identifies uncovered canonical products
- skips `qa` and other excluded source sites
- prioritizes `livart -> hanssem -> ikea`
- downloads product images locally
- compresses them to bounded JPEG data URLs before sending them to OpenAI
- upserts `furniture_vectors` rows keyed by canonical product ID

### 3. Explicit bounded compatibility layer

To satisfy the live `furniture_vectors -> furniture.id` foreign key, the script also inserts a narrow mirror row into legacy `furniture` when a canonical product ID is missing there.

This mirror is explicit and bounded:

- it exists only to satisfy the legacy FK surface
- it reuses canonical product fields
- it does not change runtime candidate truth
- it does not change recommendation identity semantics

This is a temporary compatibility mechanism, not a new runtime contract.

## Live Execution

### Smoke execution

One-row live smoke succeeded first:

- canonical Livart sofa `08f8ea0c-e968-4829-bb33-c8ecb29ad7f1`
- inserted legacy `furniture` mirror row
- inserted `furniture_vectors` row
- coverage moved from `27 / 48` to `28 / 48`

### Full execution

Then ran the remaining uncovered real catalog rows.

Results:

- attempted: `19`
- succeeded: `19`
- failed: `0`
- legacy mirror rows inserted in full run: `19`
- QA rows intentionally skipped: `1`

Combined with the smoke row, total real catalog products backfilled in this step:

- `20`

## Coverage After Backfill

Final live state after backfill:

- active canonical `furniture_products`: `48`
- canonical products with usable vector/scoring coverage: `47`
- uncovered active canonical products: `1`
- effective coverage: `97.9%`

### Remaining uncovered source breakdown

| source | active | covered | uncovered |
| --- | ---: | ---: | ---: |
| `ikea` | 29 | 29 | 0 |
| `livart` | 10 | 10 | 0 |
| `hanssem` | 8 | 8 | 0 |
| `qa` | 1 | 0 | 1 |

### Remaining uncovered category breakdown

Only one uncovered row remains:

- `chair`: `1` uncovered
- source: `qa`
- reason: intentionally excluded fixture row

## Focused Runtime Validation

### 1. Legacy retirement QA

Ran:

- `npm run qa:legacy-furniture-retirement`

Result:

- pass

Key evidence:

- `vector_count = 47`
- `hydrated_through_furniture_products_count = 47`
- `missing_from_furniture_products_count = 0`
- canonical save/click semantics still passed

### 2. MVP runtime smoke

Ran:

- `APP_BASE_URL=http://127.0.0.1:3000 npm run qa:mvp-operational-smoke`

Result:

- pass

Key quality summary after backfill:

- `candidate_count = 48`
- `vector_covered_candidate_count = 47`
- `vector_missing_candidate_count = 1`
- `vector_missing_top3_count = 0`

### 3. Recommend-space runtime check

Ran a targeted live `/api/recommend-space` call after backfill.

Result:

- `200`
- `count = 3`
- `vector_covered_candidate_count = 47`
- `vector_missing_candidate_count = 1`
- `vector_missing_top3_count = 0`

This confirms the canonical-first runtime still works and that coverage improvement propagates through the active recommendation paths.

## What Legacy Dependency Still Remains

Still remaining:

- `furniture_vectors` is still the active scoring-feature surface
- ranking still consumes those vector-compatible fields
- the live schema still forces `furniture_vectors.furniture_id -> furniture.id`
- the temporary legacy `furniture` mirror remains necessary for new canonical product IDs until that FK dependency is retired or migrated

Not remaining:

- legacy `furniture` is still not the runtime candidate source
- recommendation IDs are still canonical `furniture_products.id`
- save/click/compare semantics remain canonical

## Next Practical Step

The next safe step is no longer scoring coverage recovery. That is materially recovered.

Next practical step:

1. audit canonical geometry completeness under geometry contract v1.1
2. make geometry completeness visible by source/category
3. only after that, consider shrinking the legacy `furniture` FK dependency behind `furniture_vectors`

Do not mix that next step with ranking redesign.

## Artifacts

Execution reports produced:

- `/tmp/canonical-scoring-backfill-dry-run-2026-04-11.json`
- `/tmp/canonical-scoring-backfill-smoke-2026-04-11-v2.json`
- `/tmp/canonical-scoring-backfill-apply-2026-04-11-v2.json`
