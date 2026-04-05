# Post-Drop Runtime Stabilization

Generated: 2026-04-05 UTC

## 1. Current Position Summary

legacy `furniture` 제거 이후 런타임은 `furniture_products` 단일 published source 로 동작합니다. 이번 배치는 이 상태가 실제 운영 경로에서 안정적인지 다시 검증하고, 남아 있는 데이터 계약 ambiguity를 `recommendations`, `import_jobs`, `furniture_vectors` 기준으로 정리하는 단계입니다.

이번 배치가 줄이는 운영 리스크는 세 가지입니다:
- post-drop 이후에도 숨은 legacy dependency 가 남아 있는지 불명확한 상태
- `recommendations` 필드가 active 인지 dead 인지 분류되지 않은 상태
- publish / vector 운영 규칙이 코드에는 있지만 문서 계약으로는 불명확한 상태

## 2. Post-Drop Verification

Verified routes and runtime helpers:
- `POST /api/recommend`
- `POST /api/admin/import-jobs/[jobId]/publish`
- `POST /api/log-click`
- `scripts/legacy-furniture-retirement-qa.mjs`

Verified outcomes:
- recommendation hydration works through `furniture_products`
- publish route succeeds, repeats safely, and rejects invalid input
- log-click success path works
- log-click missing-row path returns `404`
- no runtime code path reads legacy `furniture`

Evidence:
- repository grep for `from("furniture")` across `app lib scripts`: no matches
- `npm run qa:post-drop-runtime` result:
  - `vector_count = 27`
  - `hydrated_through_furniture_products_count = 27`
  - `missing_from_furniture_products_count = 0`

Judgment:
- post-drop runtime is stable

## 3. Recommendations Contract

Current write/read evidence:
- written only by `app/api/mvp/route.ts`
- updated only by `app/api/log-click/route.ts`
- no confirmed reader in app runtime beyond log update path

### Field classification

| Field | Status | Evidence | Judgment |
| --- | --- | --- | --- |
| `id` | KEEP | DB row identity, used in QA row verification | Keep |
| `request_id` | KEEP | required for click update lookup and request grouping | Keep |
| `space_id` | KEEP WITH CLARIFICATION | written by MVP insert, ties exposure to analyzed room | Keep |
| `furniture_id` | KEEP | written by MVP insert, used by click update lookup | Keep |
| `compatibility_score` | KEEP | written by MVP insert as actual ranking output | Keep |
| `clicked` | KEEP | actively updated by `/api/log-click` | Keep |
| `event_source` | KEEP WITH CLARIFICATION | written as `"web"` in MVP and `"qa"` in QA, useful provenance field | Keep |
| `saved` | HOLD | written as `false`, no active true-write path confirmed | Hold |
| `purchased` | HOLD | written as `false`, no active true-write path confirmed | Hold |
| `created_at` | KEEP | operational timestamp for exposure ordering/audit | Keep |

### Operational meaning

- `recommendations` is an exposure/log table, not a source-of-truth product table.
- `clicked` is the only confirmed active lifecycle flag today.
- `saved` and `purchased` are structurally reserved but currently unwired.

### Decision

- `saved`: `HOLD`
- `purchased`: `HOLD`
- no field is a safe immediate remove in this batch because DB-level removal was not required to stabilize runtime

## 4. Import Publish Contract

### Status meaning

- `pending_review`
  - imported staging row exists
  - publish is allowed if minimum publishable fields are present
- `published`
  - published product row exists or is expected to exist in `furniture_products`
  - repeated publish is allowed and acts as idempotent upsert
- `rejected`
  - staging row is not publishable
  - requires human correction or decision before any future publish

### Minimum publishable data

Current code requires:
- `extracted_name`
- `source_url`

Current code also maps when available:
- `extracted_brand`
- `extracted_category`
- `extracted_price`
- `extracted_image_urls`
- `extracted_affiliate_url`
- dimensions/material/color and extraction metadata

### Repeated publish behavior

- allowed
- implemented as upsert into `furniture_products` on `source_url`
- same logical product returns the same published product row
- `import_jobs.status` remains `published`
- `published_product_id` is refreshed/maintained when the column exists

### Decision

- status contract: `KEEP WITH CLARIFICATION`
- minimum publishable data contract: `KEEP WITH CLARIFICATION`

## 5. Vector Operations Contract

### Current operational flow

Vectors are created/updated in one place:
- `app/api/analyze-furniture/route.ts`

Current behavior:
- admin-safe analyze route upserts a published product row into `furniture_products`
- route then upserts a vector row into `furniture_vectors`
- conflict target is `furniture_id`
- repeated analysis overwrites the current vector values for that product

### `vector_version` meaning

Current operational meaning:
- none in runtime
- not used by recommendation reads
- not written by current route
- not part of current upsert key

Judgment:
- `vector_version`: `REMOVE CANDIDATE` as a contract concept
  - there is no active versioned-vector behavior in the current runtime
  - current live operation is single active vector per published product

### Transitional / unstable area

Remaining unstable point:
- vectors do not currently expose a separate audited re-analysis history
- re-analysis is overwrite-based, not version-history based

This is acceptable for current MVP runtime and should stay explicit rather than implied.

## 6. Classification Results

### `recommendations`

- `id`: `KEEP`
- `request_id`: `KEEP`
- `space_id`: `KEEP WITH CLARIFICATION`
- `furniture_id`: `KEEP`
- `compatibility_score`: `KEEP`
- `clicked`: `KEEP`
- `event_source`: `KEEP WITH CLARIFICATION`
- `saved`: `HOLD`
- `purchased`: `HOLD`
- `created_at`: `KEEP`

### `import_jobs`

- `status`: `KEEP WITH CLARIFICATION`
- `published_product_id`: `KEEP WITH CLARIFICATION`
- `review_note`: `HOLD`

### `furniture_vectors`

- `furniture_id`: `KEEP`
- score fields (`brightness_compatibility`, `color_temperature_score`, `spatial_footprint_score`, `minimalism_score`, `contrast_score`, `colorfulness_score`): `KEEP`
- `vector_version` as an operational concept: `REMOVE CANDIDATE`

## 7. Next Build-Driving Batch

The next batch should not add features first. It should decide one of these:
- wire a real `saved` behavior and keep `recommendations.saved`
- wire a real purchase confirmation path and keep `recommendations.purchased`
- or explicitly retire those fields from DB/runtime contract if they remain unwired
