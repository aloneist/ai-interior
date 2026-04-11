# Canonical Dimension Completeness Audit Refresh - 2026-04-11

## Scope

Refresh the active canonical geometry completeness snapshot after the recent Hanssem geometry hardening, Livart breadth completion, and canonical geometry metadata propagation/backfill work.

This audit is intentionally narrow:

- no new seller parser implementation
- no OCR or image-derived geometry work
- no schema change
- no ranking or UX change

## Geometry State Reviewed

Files and layers reviewed for this refresh:

- `docs/ops/parser-geometry-contract-v1-2026-04-09.md`
- `docs/ops/parser-geometry-contract-v1-1-2026-04-11.md`
- `docs/ops/livart-deterministic-breadth-completion-2026-04-10.md`
- `docs/ops/hanssem-geometry-spec-hardening-2026-04-11.md`
- `lib/parsers/shared/types.ts`
- `lib/parsers/shared/debug.ts`
- `lib/parsers/shared/dimensions.ts`
- `lib/parsers/sites/ikea.ts`
- `lib/parsers/sites/livart.ts`
- `lib/parsers/sites/hanssem.ts`
- `lib/parsers/categories/chair.ts`
- `lib/parsers/categories/table.ts`
- `lib/parsers/categories/sofa.ts`
- `app/api/import-product/route.ts`
- `lib/server/furniture-catalog.ts`
- active canonical `furniture_products`
- linked published `import_jobs`

## Refreshed Active Canonical Geometry Completeness

Live audit against active `furniture_products` after the recent hardening and propagation work:

- total active canonical products: `48`
- geometry-complete `3d` (`width_cm`, `depth_cm`, `height_cm`): `36`
- geometry envelope `2d` (`width_cm`, `depth_cm`, missing `height_cm`): `1`
- geometry partial (`1` trustworthy axis only): `2`
- geometry absent (`width_cm`, `depth_cm`, `height_cm` all null): `9`

Practical reading:

- `75.0%` of the active catalog is now fully usable for `3d` outer-envelope work
- `81.3%` has at least operationally usable geometry (`3d + 2d + one-axis partial`)
- `18.8%` is still identity-only from a canonical geometry standpoint

Delta versus the stale earlier audit:

- full `3d`: `34 -> 36`
- envelope `2d`: `1 -> 1`
- one-axis partial: `0 -> 2`
- absent: `13 -> 9`

This confirms the earlier snapshot is stale and materially understates the current usable geometry state.

## Source Breakdown

| source | total | full_3d | envelope_2d | partial | absent | meaningful provenance |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `ikea` | 29 | 29 | 0 | 0 | 0 | 29 |
| `livart` | 10 | 7 | 0 | 0 | 3 | 10 |
| `hanssem` | 8 | 0 | 1 | 2 | 5 | 0 |
| `qa` | 1 | 0 | 0 | 0 | 1 | 0 |

Key conclusions:

- geometry completeness remains strongest in `ikea`
- `livart` improved materially from `5` to `7` full `3d` rows
- `hanssem` improved from `1` operationally usable row to `3`, but still has `5` absent rows
- all real-seller geometry absence is now concentrated in `livart` and `hanssem`

Real-seller absent rows:

- `livart`: `3`
- `hanssem`: `5`
- combined real-seller absent rows: `8 / 9`

## Category Breakdown

| category | total | full_3d | envelope_2d | partial | absent | meaningful provenance |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `sofa` | 19 | 18 | 0 | 0 | 1 | 19 |
| `table` | 10 | 9 | 0 | 0 | 1 | 10 |
| `chair` | 7 | 6 | 0 | 0 | 1 | 6 |
| `storage` | 7 | 2 | 0 | 2 | 3 | 4 |
| `desk` | 3 | 1 | 1 | 0 | 1 | 0 |
| `bed` | 2 | 0 | 0 | 0 | 2 | 0 |

Category conclusion:

- `sofa`, `table`, and `chair` are now mostly geometry-usable
- `storage` remains the biggest mixed/missing segment
- `bed` remains fully geometry-missing
- `desk` is still split across one full `3d`, one `2d`, and one absent row

## Geometry Completeness vs Provenance

These must be read separately.

### 1. Any canonical geometry metadata presence

After the recent propagation/backfill work:

- active rows with any geometry-related canonical metadata fields present: `47`

This number includes normalized boolean alias fields, so it is useful for coverage inspection but too broad to represent rich provenance on its own.

### 2. Meaningful source-grounded geometry provenance

Using a stricter provenance definition that counts only:

- non-empty source/debug text fields such as
  - `raw_dimension_text_preview`
  - `selected_dimension_line`
  - `selected_dimension_unit`
  - `range_policy_applied`
- finite secondary geometry numbers such as
  - `overall_height_cm`
  - `backrest_height_cm`
  - `diameter_cm`
- shape/diameter flags only when true
  - `width_is_diameter`
  - `depth_is_diameter`
  - `derived_width_from_diameter`
  - `derived_depth_from_diameter`
  - `footprint_shape`

Current meaningful provenance coverage is:

- rows with meaningful canonical geometry provenance: `39`
- usable-geometry rows without meaningful provenance: `0`
- rows with neither geometry nor meaningful provenance: `9`

Important reading:

- meaningful provenance coverage now exactly matches the count of operationally usable geometry rows
- the broader `47` count is real, but it mostly reflects normalized canonical metadata presence after propagation, not rich source evidence by itself
- provenance coverage no longer materially exceeds usable geometry coverage once false boolean aliases are excluded

### 3. Meaningful provenance field coverage

- `raw_dimension_text_preview`: `39`
- `selected_dimension_line`: `13`
- `selected_dimension_unit`: `13`
- `range_policy_applied`: `1`
- `overall_height_cm`: `4`
- `backrest_height_cm`: `1`
- `diameter_cm`: `3`
- `width_is_diameter = true`: `2`
- `depth_is_diameter = true`: `3`
- `derived_width_from_diameter = true`: `2`
- `derived_depth_from_diameter = true`: `3`
- `footprint_shape = "round"`: `2`

## Geometry Support Classification

### 1. Fully usable outer-envelope geometry

Rows with all three canonical outer-envelope fields present:

- count: `36`

This is the strongest current subset for room-fit, placement, and future geometry-sensitive work.

### 2. Partial but operationally usable geometry

Rows with some trustworthy geometry but not full `3d`:

- `2d` envelope-only: `1`
- one-axis partial: `2`
- combined operationally usable but incomplete: `3`

Representative cases:

- `플롯 컴퓨터 책상 120x70cm`
  - `120 / 70 / null`
  - trusted compact size string preserved canonically
- `샘 책장 5단 120cm 수납형 시공`
  - `120 / null / null`
  - trusted width-class preserved canonically
- `디어 오보에 거실장 140cm (2종 택1)`
  - `140 / null / null`
  - trusted width-class preserved canonically

These rows are operationally useful for bounded footprint or width-aware work, but not full `3d` placement reasoning.

### 3. Diameter / round-compatible geometry with canonical provenance preserved

Current active canonical rows with preserved round semantics:

- count: `2`

Representative rows:

- `MÖRBYLÅNGA`
  - `width_cm = depth_cm = 145`
  - `footprint_shape = "round"`
  - `diameter_cm = 145`
  - `width_is_diameter = true`
  - `depth_is_diameter = true`
- `LISABO`
  - `width_cm = depth_cm = 105`
  - `footprint_shape = "round"`
  - `diameter_cm = 105`
  - `width_is_diameter = true`
  - `depth_is_diameter = true`

There is still one mixed diameter-derived case in the active catalog, but it remains intentionally non-round because only one axis is diameter-derived.

### 4. Identity-only rows with no trustworthy canonical geometry

Rows with `width_cm`, `depth_cm`, and `height_cm` all null:

- count: `9`

These break down as:

- real seller rows: `8`
- QA fixture row: `1`

### 5. Rows where the source likely lacks trustworthy text-based geometry entirely

Using the refreshed canonical state:

- rows with neither usable geometry nor meaningful provenance: `9`
- real seller rows in this bucket: `8`
- QA row in this bucket: `1`

This is the current best evidence-based proxy for:

- no trustworthy text-based overall-size geometry on the active deterministic path

It does not prove the seller site never exposes geometry elsewhere.
It does show that the current deterministic extraction/publish path is not carrying trustworthy overall-size evidence for these rows today.

## Biggest Remaining Missing Segments

### 1. Hanssem remains the largest active seller gap

Current Hanssem state:

- total: `8`
- full `3d`: `0`
- `2d`: `1`
- partial: `2`
- absent: `5`

Why it still goes first:

- largest concentration of real-seller geometry absence
- now has proof that some trustworthy title-grounded geometry can be recovered
- still weak on storage, bed, and table-set/dining patterns

### 2. Livart remains the second seller gap, but it improved

Current Livart state:

- total: `10`
- full `3d`: `7`
- absent: `3`

Why it goes second now:

- already materially better than the earlier `5 / 5` split
- remaining null rows look like selective page-pattern or source-coverage limits, not broad seller failure

### 3. Category pressure still centers on storage and bed

Current highest-missing categories:

- `storage`: `3` absent, `2` partial
- `bed`: `2` absent of `2`

These remain the best category lenses for the next seller-specific geometry sampling.

## Refreshed Next Hardening Order

### 1. Hanssem seller-specific geometry hardening next

Do this next.

Priority within Hanssem:

- storage
- bed
- table-set / dining pages

Why:

- highest remaining real-seller absence count
- has already shown bounded wins on trustworthy title-grounded patterns
- still lacks any full `3d` active canonical rows

### 2. Livart geometry-negative page-pattern follow-up second

Do this after Hanssem.

Focus:

- the remaining three null Livart rows
- especially storage / bed / desk-negative patterns

Why:

- Livart is no longer the biggest blocker
- the current problem is selective unsupported patterns, not broad geometry failure

### 3. Non-round shape semantics only if fresh evidence appears

Do not prioritize this yet.

Why:

- round/diameter canonical preservation is now operational for clear cases
- there is still no strong active evidence justifying near-term `oval` or `l_shaped` normalization work
- the next bottleneck is still missing geometry, not richer shape semantics on already-good rows

### 4. Image-derived geometry experimentation remains deferred

Keep this last.

Why:

- deterministic text-grounded coverage is still the cleaner next lever
- current remaining gaps are still understandable without introducing image-derived ambiguity

### 5. Further canonical metadata normalization is not the next bottleneck

Current reading:

- meaningful provenance now covers all operationally usable geometry rows
- the next blocker is not canonical propagation drift
- the next blocker is seller-specific extraction coverage on the remaining null rows

## Decision

The refreshed canonical state changes the priority ordering in detail, but not in direction:

- the catalog is meaningfully better than the stale earlier audit suggested
- usable geometry improved from `35` rows to `39`
- full `3d` improved from `34` rows to `36`
- geometry absence dropped from `13` rows to `9`
- provenance propagation is no longer the main problem
- Hanssem remains the next seller-specific hardening priority
- Livart now looks more like a bounded follow-up than the leading blocker

## Audit Commands Used

Live reads used for this refresh:

- active canonical `furniture_products` geometry completeness snapshot
- active canonical `furniture_products` provenance snapshot
- linked published `import_jobs` context where needed for the recent propagation interpretation

No new parser implementation or runtime behavior was changed in this audit step.
