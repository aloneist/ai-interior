# Catalog Metadata Enrichment Priority

Date: 2026-04-06

## Current Position

Recommendation ranking, explanation validation/fallback, and controlled `/api/mvp` QA are stable. The next quality bottleneck is catalog metadata quality: the system is relying on product names, broad categories, and vector proxy values instead of explicit style/category/room metadata.

This batch does not mutate production metadata. It identifies where enrichment should start.

## Audit Method

Command:

```bash
npm run qa:catalog-metadata-audit
```

Method:

1. Run the controlled `/api/mvp` fixture cases.
2. Collect top-3 products per case.
3. Join those products back to live `furniture_products`.
4. Join matching rows from `furniture_vectors`.
5. Score enrichment candidates by:
   - top-3 frequency
   - missing explicit style metadata
   - missing useful description
   - category/semantic ambiguity
   - generic vector evidence
   - explanation fallback count
   - weak/mismatch signals

## Audit Summary

- controlled cases: 3
- unique top-3 products: 7
- products without explicit style metadata: 7 / 7
- products with semantic/category notes: 3 / 7
- products with generic vector-style notes: 1 / 7
- explanation fallback count observed in audit run: 2

## Biggest Metadata Gaps

1. No explicit style metadata on high-frequency top products.
   - Current style fit is mostly inferred from product name keywords and vector proxies.
   - This affects both ranking confidence and explanation specificity.

2. Chair category is semantically overloaded.
   - `NÄMMARÖ` is categorized as `chair`, but the name is a storage box.
   - `PERJOHAN` is categorized as `chair`, but the name is a storage bench.
   - This can make workspace-chair cases pass mechanically while the actual product intent is less clear.

3. Table room affinity is weakly contextualized.
   - `TÄRNÖ` is an outdoor table that appears in living/weak workspace contexts.
   - It may still be useful, but it needs explicit room/context metadata so the system can distinguish indoor living/dining fit from fallback table behavior.

4. Sofa style evidence is still mostly proxy-driven.
   - `GLOSTAD` now works for sofa anchor and sofa style proxy, but the vector values are generic:
     - `minimalism_score=52`
     - `contrast_score=52`
     - `colorfulness_score=45`
   - It needs explicit style/confidence notes to avoid relying on a sofa-specific proxy rule long term.

5. Description and item evidence are weak.
   - Top products lack useful descriptions in the live product rows.
   - Explanation fallback triggers were tied to missing item/category evidence.

## Priority Model

Priority score uses:

- top-3 frequency: product appears often in controlled QA outputs
- missing style metadata: high because it directly affects style fit and explanations
- semantic ambiguity: high when category and product name diverge
- weak/mismatch signal: high when the product appears in weak or mismatch contexts
- generic vector evidence: high when vector values look broad/default-like
- explanation fallback: medium-high when generated explanation lacked item evidence
- missing description/color/material: medium because these improve explanation grounding

## Recommended Enrichment Targets

### P0: `TÄRNÖ 테르뇌 야외테이블`

Why:

- Highest priority score: 46
- Appears in 2 controlled top-3 cases
- Shows up in both normal living-table and weak workspace-sofa contexts
- Has `category_mismatch` in the weak sofa case
- Needs table room-affinity/context metadata

Enrich first:

- `style_labels`: `warm-wood`, `modern`, `calm` if confirmed
- `room_affinity`: living/dining/outdoor, with caution for workspace
- `category_aliases`: table, outdoor_table, side_table if appropriate
- `description`: short human-readable material/color/use note
- `color`: black/light-brown/warm wood style evidence

Measure with:

- `controlled-mvp-normal-living-table`
- `controlled-mvp-weak-workspace-sofa`
- Expected gain: explanation fallback stays `0`, table still ranks for table case, weak sofa case remains weak without overclaiming table relevance.

### P1: `LOBERGET / SIBBEN 어린이용 책상 의자+패드`

Why:

- Priority score: 33
- Appears in 2 controlled top-3 cases
- Important for workspace-chair baseline
- No explicit style metadata or useful description

Enrich first:

- `style_labels`: minimal, bright
- `room_affinity`: workspace, children_room if supported
- `description`: desk chair / pad / compact use
- `color`: white/dark-grey
- `material`: if available

Measure with:

- `controlled-mvp-constrained-workspace-chair`
- Expected gain: no explanation fallback from missing item evidence; top-3 style fit stays >= 1; chair case remains pass.

### P2: `NÄMMARÖ 수납상자`

Why:

- Priority score: 33
- Appears in workspace-chair top 3
- Categorized as `chair`, but product name says storage box
- Caused explanation fallback due missing item/category evidence

Enrich first:

- `category_aliases`: storage_box, bench_storage, outdoor_storage if accurate
- `room_affinity`: outdoor, entry, workspace-support only if justified
- `style_labels`: warm-wood, natural, calm if confirmed
- `description`: storage box, not primary seating

Measure with:

- `controlled-mvp-constrained-workspace-chair`
- Expected gain: fewer misleading “chair” explanations; either remains as workspace support with clearer text or drops below stronger chair products after future ranking consumes aliases.

### P3: `GLOSTAD 글로스타드 2인용소파`

Why:

- Priority score: 31
- Key sofa anchor product
- In weak workspace-sofa case it has `room_type_mismatch`, which is correct
- Style fit still relies on sofa-specific proxy because vector values are generic

Enrich first:

- `style_labels`: minimal, calm/neutral if confirmed
- `style_confidence_notes`: compact neutral sofa, not strongly decorative
- `room_affinity`: living yes, workspace no/low
- `description`: low-budget compact two-seat sofa
- `color/material`: dark grey / fabric if confirmed

Measure with:

- `controlled-mvp-weak-workspace-sofa`
- future sofa fixture from prior review
- Expected gain: sofa remains honest weak in workspace, but living-room sofa can rely on explicit metadata rather than proxy-only fit.

### P4: `PERJOHAN 수납벤치`

Why:

- Priority score: 29
- Categorized as `chair`, but product is a storage bench
- Important as workspace support item, but not the same as a desk chair

Enrich first:

- `category_aliases`: bench, storage_bench, seating_support
- `room_affinity`: workspace-support, entry, living if confirmed
- `style_labels`: warm-wood, minimal/calm if confirmed
- `description`: pine storage bench

Measure with:

- `controlled-mvp-constrained-workspace-chair`
- Expected gain: clearer explanation and future ability to distinguish direct chair from support seating.

## QA Measurement Plan

Use the controlled `/api/mvp` harness as the baseline:

```bash
npm run qa:controlled-mvp
npm run qa:catalog-metadata-audit
```

Meaningful gains after enrichment:

- top-3 counts do not regress in pass cases
- controlled weak sofa case remains weak with `weak_category_match`
- explanation fallback count decreases for products enriched with category/type metadata
- style fit becomes supported by explicit metadata where ranking/explanation logic consumes it
- semantic alias notes shrink for ambiguous products after aliases are added and used
- explanations mention correct item type more consistently

Relevant fixture cases:

- `controlled-mvp-normal-living-table`: validates table style/room enrichment
- `controlled-mvp-constrained-workspace-chair`: validates chair/bench/storage alias enrichment
- `controlled-mvp-weak-workspace-sofa`: validates sofa room-fit honesty and weak-result preservation

## Next Implementation Batch

Recommended next batch:

`123-top-product-style-and-category-metadata-enrichment-batch-1`

Scope:

- add a small explicit metadata overlay or import-safe metadata utility for the P0-P4 products
- do not change ranking broadly
- consume metadata only where it directly improves style/category/explanation evidence
- re-run controlled MVP QA and metadata audit

## Decision

`READY FOR ENRICHMENT IMPLEMENTATION`

The enrichment targets are concrete, ranked, and tied directly to controlled `/api/mvp` fixtures. The next batch can start with P0-P4 without another broad audit.
