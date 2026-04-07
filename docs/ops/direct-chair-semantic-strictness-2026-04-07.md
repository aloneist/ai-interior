# Direct Chair Semantic Strictness

Date: 2026-04-07

## Current Position

The controlled `/api/mvp` review set showed that direct `chair` intent was too broad. The ranking path treated coarse `category=chair` as enough even when overlay metadata or product text described support/storage roles.

This batch kept the fix narrow: only explicit direct-chair requests now receive extra semantic strictness.

## Root Cause

The matcher used broad furniture text and coarse product category:

- `PERJOHAN` has `category=chair`, but overlay aliases describe `bench`, `storage_bench`, and support roles.
- `NÄMMARÖ` has `category=chair`, but overlay aliases describe `storage_box`, `storage`, and support roles.
- non-overlay bench products can also carry `category=chair` while the name says `bench`.

That meant these products could be marked `category_fit=preferred` for direct chair requests.

This is not primarily a new metadata problem. Existing overlay aliases already identify the P0/P1 support-storage cases. The ranking path was not using that evidence to distinguish direct chair intent from support seating/storage.

## Change

Changed `lib/server/recommendation-ranking.ts` only:

- Added direct-chair intent detection for explicit `chair` / `의자` requests.
- Added support/storage role detection using overlay aliases such as `storage_box`, `storage_bench`, `bench_support`, and `chair_support`.
- Added support/storage role detection from product name/material for non-overlay bench/storage products.
- Applied a direct-chair-only penalty of `-32`.
- Marked support/storage-only items as `category_fit=mismatch` only in direct chair intent cases.

The change does not globally demote support or storage products.

## QA Evidence

Before:

- `controlled-mvp-weak-bedroom-chair` top 3 included `LOBERGET / SIBBEN`, `PERJOHAN`, and `NÄMMARÖ`.
- All three were marked `category_fit=preferred`.
- `PERJOHAN` and `NÄMMARÖ` are support/storage role items, not direct chairs.

After:

- `controlled-mvp-weak-bedroom-chair` top 3 no longer includes `PERJOHAN` or `NÄMMARÖ`.
- `controlled-mvp-constrained-workspace-chair` top 3 no longer includes `PERJOHAN` or `NÄMMARÖ`.
- Sofa and dining cases remained stable.
- `controlled-mvp-weak-workspace-sofa` remained weak with `weak_category_match`.

Final controlled QA:

- total cases: 6
- pass: 5
- weak: 1
- fail: 0
- fallback: 5

Static validation:

- `npm run lint`: pass
- `npx tsc --noEmit`: pass after rerun; the first attempt raced with `next build` and failed on transient `.next/types` generation.
- `npm run build`: pass

## Residual Notes

This batch fixed the support/storage-as-direct-chair issue. It did not solve every chair subtype question.

Remaining follow-up candidates:

- Decide whether `stool` should count as a direct chair for workspace chair requests.
- Decide whether expensive armchairs in low-budget bedroom-chair cases should be treated as acceptable `preferred` results or downgraded by budget/room context.
- Investigate controlled explanation fallback variance separately if it persists; this batch did not change explanation logic.

## Decision

Classification: `DIRECT-CHAIR SUPPORT/ STORAGE STRICTNESS IMPROVED`.

Recommended next batch: `128-chair-subtype-budget-and-explanation-noise-review-batch-1`, focused on evidence gathering before another ranking change.
