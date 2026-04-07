# Top Product Style And Category Metadata Enrichment

Date: 2026-04-07

## Current Position

Recommendation ranking, explanation fallback, and controlled `/api/mvp` QA are stable. The previous metadata audit showed that high-frequency top products lacked explicit style/category/room metadata and were relying too heavily on product-name keywords and vector proxies.

This batch adds a small explicit metadata overlay for the P0-P4 products only.

## Strategy

Implementation:

- Add `data/catalog/product-metadata-overlay-v1.json`.
- Key overlay entries by `product_key` / `product_url`.
- Merge overlay data during `furniture_products` hydration.
- Preserve `furniture_products` as the published product source of truth.
- Treat the overlay as an explicit, reversible MVP enrichment layer, not a replacement catalog.

Runtime use:

- ranking search text can see style labels, category aliases, room affinity, description, color, and material
- category matching can see category aliases
- explanation payload receives enriched item description/color/material/metadata
- metadata audit reads the same overlay as runtime

No broad ranking redesign, schema change, or production DB metadata mutation was performed.

## Product Enrichment

### P0: `TÄRNÖ 테르뇌 야외테이블`

Added:

- style labels: `warm-wood`, `calm`, `modern`
- aliases: `table`, `outdoor_table`, `small_table`, `side_table`
- room affinity: strong `dining`, `living`; medium `workspace-support`, `outdoor`
- description, color, material, evidence notes

Why:

- previous top priority
- appeared in living table and weak workspace contexts
- needed room/context clarification for outdoor table behavior

### P1: `LOBERGET / SIBBEN 어린이용 책상 의자+패드`

Added:

- style labels: `minimal`, `bright`
- aliases: `chair`, `desk_chair`, `children_chair`, `workspace_chair`
- room affinity: strong `workspace`; medium `bedroom`, `children_room`
- description, color, material, evidence notes

Why:

- repeated high-frequency workspace chair product
- needed explicit style and item evidence for explanations

### P2: `NÄMMARÖ 수납상자`

Added:

- style labels: `warm-wood`, `calm`
- aliases: `storage_box`, `storage`, `outdoor_storage`, `bench_support`
- room affinity: strong `outdoor`, `entry`; medium `living`, `workspace-support`; weak `direct_workspace_chair`
- description, color, material, evidence notes

Why:

- audited category was `chair`, but product semantics are storage/support
- needed alias clarification before future ranking work can distinguish support item vs direct chair

### P3: `GLOSTAD 글로스타드 2인용소파`

Added:

- style labels: `minimal`, `calm`
- aliases: `sofa`, `two_seat_sofa`, `compact_sofa`
- room affinity: strong `living`; weak `workspace`
- description, color, material, evidence notes

Why:

- key sofa anchor product
- previous sofa style fit depended on a proxy rule and generic vector values
- still must remain weak for small workspace sofa fixture

### P4: `PERJOHAN 수납벤치`

Added:

- style labels: `warm-wood`, `minimal`, `calm`
- aliases: `bench`, `storage_bench`, `seating_support`, `chair_support`
- room affinity: strong `entry`, `living`; medium `workspace-support`; weak `direct_workspace_chair`
- description, color, material, evidence notes

Why:

- audited category was `chair`, but product semantics are storage bench/support seating
- needed clearer alias and explanation evidence

## Before / After

Metadata audit before:

- unique top-3 products: 7
- products without style metadata: 7
- products with semantic notes: 3
- products with generic vector notes: 1
- explanation fallback count: 2

Metadata audit after:

- unique top-3 products: 6
- products without style metadata: 1
- products with semantic notes: 0
- products with generic vector notes: 0
- explanation fallback count: 3

Controlled `/api/mvp` QA after:

- pass: 2
- weak: 1
- fail: 0
- fallback: 3

Interpretation:

- Explicit metadata coverage improved materially.
- Category/semantic ambiguity in the audited P0-P4 set is resolved at overlay level.
- GLOSTAD moved from proxy style fit to explicit style fit while preserving `room_type_mismatch` in the weak workspace sofa case.
- Weak workspace sofa remains honestly weak with `weak_category_match`.
- Explanation fallback did not improve in this run; remaining fallback is mostly generated text missing item/category evidence, plus `OLSERÖD`, which was outside P0-P4.

## Remaining Gap

`OLSERÖD 올세뢰드 보조테이블` is now the only top-result product in the controlled audit without explicit style metadata. It was not part of P0-P4, but it appears in the normal living-table case and caused fallback in the latest controlled run.

## Validation

Passed:

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run qa:controlled-mvp`
- `npm run qa:catalog-metadata-audit`

## Decision

`ENRICHMENT BATCH SUCCESSFUL`

The overlay path is explicit, small, reversible, and tied to the published product hydration path. The next batch should either enrich `OLSERÖD` as P5 or add a small explanation-specific item-evidence improvement if fallback reduction is more important than metadata coverage.
