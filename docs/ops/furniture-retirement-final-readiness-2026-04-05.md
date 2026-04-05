# Furniture Retirement Final Readiness

Generated: 2026-04-05 UTC

## 1. Current Position Summary

런타임은 이제 `furniture_products` 만으로 상품 hydrate 를 수행하고, `import_jobs.status` 도 MVP 기준의 단순 계약으로 정리됐습니다. 이번 배치는 남아 있던 legacy `furniture` runtime fallback 을 실제로 제거해서, 더 이상 운영 코드가 legacy table 을 참조하지 않도록 마무리한 단계입니다.

이 배치가 제거한 리스크는 두 가지입니다:
- published catalog 누락을 legacy fallback 이 숨기는 문제
- publish 상태 계약이 `reviewed` 같은 비운영 상태를 암묵적으로 기대하는 문제

## 2. Status Contract Decision

`import_jobs.status` contract is now:

- `pending_review`
- `published`
- `rejected`

Publish route 기준 publishable status 는 다음 두 개만 허용됩니다:
- `pending_review`
- `published`

`rejected` 는 publish 불가입니다.
`reviewed` 는 더 이상 코드에서 기대하지 않습니다.

## 3. Runtime Independence Result

Removed:
- `lib/server/furniture-catalog.ts` 의 `furniture_products -> furniture` fallback read

Current behavior:
- 런타임 hydrate 는 `furniture_products` only
- 누락 ID가 있으면 legacy fallback 대신 `RUNTIME_FURNITURE_HYDRATION_MISSING` warning 만 남김
- QA script 는 `furniture_vectors` ID 중 `furniture_products` 에 없는 항목이 1개라도 있으면 즉시 실패함

Conclusion:
- runtime is fully independent from `furniture`
- final QA result: `missing_from_furniture_products_count = 0`

## 4. Validation Result

Validated in this batch:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm run qa:legacy-furniture-retirement`

QA result summary:
- runtime independence: pass
- publish flow: pass
- recommendation hydration: pass
- recommendation insert: pass
- log-click success path: pass
- log-click missing-row path: pass

## 5. Furniture Drop Readiness

Judgment:

`READY FOR REMOVAL`

Reason:
- no runtime code path reads `public.furniture`
- QA proves `furniture_vectors` IDs are fully covered by `furniture_products`
- publish and logging paths still pass after fallback removal

Explicit SQL artifact:
- `docs/sql/2026-04-05-drop-legacy-furniture.sql`

Execution caution:
- run the SQL artifact manually
- do not add `CASCADE`
- if the drop fails due to a DB-level dependency, inspect that dependency instead of broadening the statement
