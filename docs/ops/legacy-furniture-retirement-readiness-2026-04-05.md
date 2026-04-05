# Legacy Furniture Retirement Readiness

Generated: 2026-04-05 UTC

## 1. Current Position Summary

현재 런타임 추천 읽기 경로는 이미 `furniture_products` 기준으로 정렬되어 있고, `import_jobs -> furniture_products` publish 경로도 존재합니다. 이번 배치는 실제로 legacy `furniture` fallback 이 남아 있는지, publish 와 recommendation/logging 흐름이 removal 직전 수준으로 검증됐는지 확인하는 단계입니다.

이 배치가 줄이는 리스크는 세 가지입니다:
- 코드상 fallback 이 남아 있어도 실제 운영 데이터에서는 이미 불필요한지 확인
- publish 성공/실패/재실행 동작이 애매하게 500 으로 뭉개지는 상태 제거
- recommendation 결과 노출/클릭 로그 경로가 조용히 실패하는 지점 명확화

## 2. Legacy Fallback Findings

### Remaining code dependency

남아 있는 legacy `furniture` read fallback 은 하나뿐입니다.

- `lib/server/furniture-catalog.ts`
  - `loadRuntimeFurnitureRecordsByIds`
  - 1차로 `furniture_products` 에서 ID hydrate
  - 누락 ID가 있을 때만 `furniture` fallback read 수행

### Current measurability

이 fallback 은 이제 로그로 명시됩니다.

- `LEGACY_FURNITURE_FALLBACK_USED`
- `RUNTIME_FURNITURE_HYDRATION_MISSING`

따라서 removal 전 마지막 운영 관찰이 가능해졌습니다.

### QA evidence

`scripts/legacy-furniture-retirement-qa.mjs` 실행 결과:

- `furniture_vectors` sampled runtime IDs: 27
- `furniture_products` hydrated IDs: 27
- fallback candidate IDs: 0
- unresolved IDs: 0

판단:
- 현재 live sample 기준으로는 runtime fallback 이 실제로 사용되지 않았습니다.
- 코드상 fallback 은 아직 남아 있지만, 운영 데이터 증거만 보면 제거 후보 상태입니다.

## 3. Publish QA Findings

### Route behavior validated

Validated route:
- `POST /api/admin/import-jobs/[jobId]/publish`

Validated outcomes:
- valid publish: `200`
- repeated publish/upsert: `200`
- invalid incomplete job: `422`
- missing job: `404`

### State mutation validated

QA run에서 확인된 상태:
- published product row created/upserted in `furniture_products`
- product status: `active`
- import job status after publish: `published`
- `published_product_id` linkage persisted on live DB
- repeated publish returned the same product id

### Important schema reality

task wording과 달리 live `import_jobs` status constraint 에는 별도 `reviewed` 상태가 확인되지 않았습니다. QA fixture 에 `reviewed` 를 넣으면 DB constraint 에서 거절되고, 실제 publishable 상태로 동작한 것은 `pending_review -> published` 흐름이었습니다.

판단:
- publish path 자체는 안정적입니다.
- 다만 “reviewed” 라는 중간 상태를 운영 정책으로 계속 쓸지, 아니면 현재처럼 `pending_review` 를 publishable 상태로 볼지 다음 배치에서 명확히 정리해야 합니다.

## 4. Recommendation / Logging QA Findings

### Recommendation hydration

Validated route:
- `POST /api/recommend`

Validated outcomes:
- response status: `200`
- returned recommendations: `10`
- sample product hydrated with `id`, `name`, `product_key`
- sample `product_key` 는 `furniture_products.product_url/source_url` 기반으로 구성됨

### Recommendation result logging

Validated:
- `recommendations` insert contract with current runtime row shape
- `POST /api/log-click` success path
- `POST /api/log-click` missing-row path

Observed outcomes:
- inserted recommendation row accepted by DB
- click update status: `200`
- clicked flag persisted as `true`
- missing exposure now returns `404`

### Dead / unwired fields

Current QA evidence:
- `recommendations.saved = true` rows: `0`
- `recommendations.purchased = true` rows: `0`

Judgment:
- `saved` / `purchased` are still structurally present but not wired by any confirmed active runtime path in this batch.
- they are not blockers for `furniture` retirement, but they remain dead-ish analytics fields.

## 5. Removal Readiness Judgment

### Judgment

`READY AFTER ONE SMALL FIX`

### Exact reason

Runtime evidence says `furniture` is no longer needed for current data:
- no fallback hits in the QA audit
- recommendation hydration succeeds entirely through `furniture_products`
- publish path writes published rows into `furniture_products`

The one small fix before removal is operational, not schema-destructive:
- decide and document the publishable review-state contract for `import_jobs.status`
  - either formally keep `pending_review -> published`
  - or add/align a real `reviewed` state before claiming that reviewed-only publish exists

If that status contract is clarified, the next batch can safely:
- remove the fallback read from `furniture`
- rerun the same QA script
- then evaluate actual table retirement/drop work separately

## 6. Exact Validation Run

Validated in this batch:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run qa:legacy-furniture-retirement`

Route-level QA used a local production server plus live Supabase access.
