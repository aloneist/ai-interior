# Review Set Expansion And Next Gap Detection

Date: 2026-04-07

## Current Position

Recommendation ranking, explanation validation/fallback, the metadata overlay, and the controlled `/api/mvp` QA harness are stable enough for small iterative review. The current controlled top-3 set no longer has an explicit style-metadata gap after the `OLSERÖD` overlay entry.

This batch expanded the controlled review set with three new high-signal cases and did not change runtime ranking behavior.

## New Cases

### `controlled-mvp-normal-living-sofa`

Request: living room, low budget, sofa, calm/minimal style.

Reason added: verifies that the fixed sofa anchor and sofa style-fit path still works in a normal, non-weak sofa scenario.

### `controlled-mvp-dining-modern-table`

Request: dining room, low budget, table, modern style.

Reason added: adds a dining-room style/room combination that was not covered in the original controlled set.

### `controlled-mvp-weak-bedroom-chair`

Request: bedroom, low budget, chair, bright/minimal style.

Reason added: tests whether chair intent and bedroom room-fit are semantically precise, or whether the system is still overusing workspace/support-chair products.

## Review Run

Command:

```bash
npm run qa:controlled-mvp
```

Result:

- total cases: 6
- pass: 5
- weak: 1
- fail: 0
- explanation fallback: 1

Case judgments:

- `controlled-mvp-normal-living-table`: pass
- `controlled-mvp-constrained-workspace-chair`: pass
- `controlled-mvp-weak-workspace-sofa`: weak, expected, with `weak_category_match`
- `controlled-mvp-normal-living-sofa`: pass
- `controlled-mvp-dining-modern-table`: pass
- `controlled-mvp-weak-bedroom-chair`: pass

## Findings

### Stable Areas

- Normal living-room sofa now returns sofa anchors in top 3.
- Dining modern table returns preferred table items in top 3.
- Explanation/ranking-context alignment had no reported failures.
- The intentionally awkward workspace sofa case remained honestly weak.

### Next Gap

The strongest new issue is semantic looseness around `chair` intent.

Evidence:

- `controlled-mvp-weak-bedroom-chair` passed mechanically, but top 3 included:
  - `LOBERGET / SIBBEN` as a real chair
  - `PERJOHAN` as a storage bench
  - `NÄMMARÖ` as a storage box
- All three were marked `category_fit=preferred` and `room_fit=good`.
- `PERJOHAN` and `NÄMMARÖ` have overlay metadata clarifying support/storage roles, but ranking still treats the coarse DB `category=chair` as enough for direct chair intent.

This is not a style metadata gap. It is a category alias / semantic category strictness gap.

## Prioritized Gap

Priority: direct-chair semantic strictness.

Why now:

- It appears in multiple controlled chair-oriented cases.
- It can make storage/support items look like direct chair recommendations.
- It is narrow and testable without redesigning ranking.

## Recommended Next Batch

Recommended batch: `127-direct-chair-semantic-strictness-batch-1`.

Scope:

- Use existing overlay aliases to distinguish direct chair items from bench/storage/support items.
- Penalize or downgrade `bench_support`, `storage_box`, and `storage_bench` when user intent is direct `chair`.
- Preserve support items for non-direct or support contexts.
- Add expectations to controlled chair cases so direct-chair top 3 has fewer support/storage items.

Do not broaden metadata or redesign scoring in that batch.
