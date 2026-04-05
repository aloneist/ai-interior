# Supabase Live Schema Audit

Generated: 2026-04-05 UTC

## 1. Current Position Summary

현재 운영 경로는 `spaces -> furniture_vectors + furniture -> recommendations` 조합을 기준으로 돌아가고 있고, 상품 수집 쪽은 `import_jobs` 에 적재만 되는 상태입니다. 반면 `furniture_products` 는 라이브에 존재하지만 현재 MVP 추천 경로와 분리되어 있고, `analyze-furniture` 코드는 라이브 `furniture_vectors` 스키마와 직접 드리프트가 있습니다.

이번 배치가 필요한 이유는 "실제 추천 런타임이 쓰는 테이블"과 "수집/검수용으로 남아 있는 테이블"을 분리해서 다음 스키마 의사결정을 안전하게 만들기 위해서입니다. 줄이는 리스크는 세 가지입니다: 잘못된 유지 대상 선택, 죽은 테이블 기준으로 후속 작업 진행, 라이브 스키마와 안 맞는 코드 경로를 놓치는 것.

## 2. Approval Judgment

`partial`

- 라이브 Supabase 스키마 읽기, 컬럼/타입/nullable/default 확인, row count 확인은 성공.
- 제약조건/관계는 현재 사용한 read-only OpenAPI snapshot 경로에서 직접 확인되지 않음.
- 따라서 관계/제약 관련 판단은 확인 불가 시 `inferred` 로 표기.

## 3. Evidence Base

### Confirmed repository read/write paths

- `app/api/analyze-furniture/route.ts`
- `app/api/analyze-space/route.ts`
- `app/api/recommend/route.ts`
- `app/api/recommend-space/route.ts`
- `app/api/mvp/route.ts`
- `app/api/log-click/route.ts`
- `app/api/import-product/route.ts`
- `app/api/test-save-product/route.ts`
- `app/admin/furniture/page.tsx`
- `app/admin/furniture-bulk/page.tsx`
- `app/admin/furniture-test/page.tsx`
- `automation/providers/supabase/catalog-read-stub.ts`
- `automation/demo/run-connection-loop-validation.mjs`

### Confirmed live-schema sources

- `scripts/supabase-readiness-snapshot.mjs`
- `automation/supabase-readiness-snapshot.json`
- `automation/supabase-readiness-summary.md`

## 4. Flow Mapping

### A. Furniture data analysis -> runtime furniture save

Confirmed:
- Admin UI `app/admin/furniture/page.tsx` and `app/admin/furniture-bulk/page.tsx` call `/api/analyze-furniture`.
- `/api/analyze-furniture` upserts into `furniture`.
- The same route then upserts into `furniture_vectors`.

Drift:
- Code writes `furniture_vectors.vector_version`.
- Code writes `furniture_vectors.dominant_color_hex`.
- Code uses conflict target `furniture_id,vector_version`.
- Live `furniture_vectors` has none of those columns confirmed.

Operational meaning:
- Current admin furniture registration path is pointed at runtime recommendation tables, not a staging/review table.
- As written, this path is schema-drifted and likely fails or is partially broken on live DB.

### B. Furniture import/admin review path

Confirmed:
- `/api/import-product` writes to `import_jobs`.
- `app/admin/furniture-test/page.tsx` can run import mode and inspect returned `import_job`.

Missing:
- No confirmed repository path promotes approved `import_jobs` rows into `furniture` or `furniture_products`.
- No confirmed current UI/code path reads `import_jobs` as a review queue and then writes a production table.

Operational meaning:
- Import exists as staging capture only.
- Review/promotion is missing in current repository.

### C. Furniture product save path

Confirmed:
- `app/api/test-save-product/route.ts` upserts into `furniture_products`.
- `automation/providers/supabase/catalog-read-stub.ts` reads active rows from `furniture_products`.
- Automation demo/readiness scripts also read `furniture_products`.

Not confirmed as production runtime:
- No current recommendation route reads `furniture_products`.
- No current import route writes `furniture_products`.

Operational meaning:
- `furniture_products` is currently an isolated automation/test catalog surface, not the live recommendation source.

### D. Furniture vector/recommendation path

Confirmed:
- `/api/recommend`, `/api/recommend-space`, `/api/mvp` all read `furniture_vectors`.
- They join nested `furniture:furniture_id (...)` and score against room values.

Inferred relation:
- `furniture_vectors.furniture_id -> furniture.id`
- Inferred from Supabase nested select syntax working in code and matching naming.

Operational meaning:
- `furniture_vectors` + `furniture` is the active runtime recommendation store.

### E. Room image analysis -> room analysis save

Confirmed:
- `/api/analyze-space` inserts into `spaces`.
- `/api/mvp` also inserts into `spaces`.
- `/api/recommend-space` reads `spaces` by `id`.

Operational meaning:
- `spaces` is the confirmed room-analysis persistence layer for runtime recommendation.

### F. Recommendation result/event logging path

Confirmed:
- `/api/mvp` inserts recommendation result rows into `recommendations`.
- `/api/log-click` updates `recommendations.clicked=true` by `request_id` + `furniture_id`.

Live state:
- Current live row count is `0`.

Interpretation:
- The table is structurally live but not currently populated.
- Cause is not confirmed from this audit alone. Possible explanations include route not exercised recently, insert failure elsewhere, or data cleanup outside current repo.

## 5. Live Table Inventory

| Table | Confirmed role | Current code writes | Current code reads | Runtime/Admin/Analytics | Live rows | Main issue |
| --- | --- | --- | --- | --- | ---: | --- |
| `furniture` | Runtime furniture entity joined by recommendations | Yes | Yes | Runtime | 28 | Extra columns exist beyond active reads; admin registration writes directly here |
| `furniture_vectors` | Runtime recommendation scoring surface | Yes, but drifted writer | Yes | Runtime | 28 | Code expects missing columns `vector_version`, `dominant_color_hex` |
| `spaces` | Room analysis persistence | Yes | Yes | Runtime | 27 | No major structural drift found |
| `recommendations` | Recommendation exposure/click/save/purchase event log | Yes | Yes | Runtime/analytics | 0 | Live table is empty despite active write code |
| `import_jobs` | Import staging and normalization queue | Yes | No confirmed in-app reads beyond immediate response | Admin/staging | 28 | No confirmed promotion path to runtime tables |
| `furniture_products` | Legacy or automation-only catalog table | Test-only write | Automation-only read | Automation/legacy catalog | 0 | Disconnected from import and runtime recommendation flow |

## 6. Table-by-Table Analysis

### `furniture`

Intended role:
- Runtime furniture master row used by recommendation joins.

Actual current usage:
- Written by `/api/analyze-furniture`.
- Read by `/api/recommend`, `/api/recommend-space`, `/api/mvp` via relation from `furniture_vectors`.

Confirmed columns and practical role:

| Column | Live type | Null/default | Practical meaning | Current code usage | Assessment |
| --- | --- | --- | --- | --- | --- |
| `id` | string | not null / no default exposed | runtime furniture PK | Active read | Keep |
| `name` | string | not null | display product name | Active read/write | Keep |
| `brand` | string | nullable | display/searchable brand | Active read/write | Keep |
| `category` | string | nullable | category used in dedupe and copy | Active read/write | Keep |
| `price` | integer | nullable | price display | Active read/write | Keep |
| `image_url` | string | nullable | product image | Active read/write | Keep |
| `product_key` | string | not null | dedupe key and explain key | Active read/write | Keep |
| `created_at` | string | nullable / `now()` | record timestamp | Active read | Keep |
| `source_site` | string | nullable | import provenance | No confirmed read/write in current runtime path | Likely useful but currently unused |
| `source_url` | string | not null | source provenance | No confirmed active read; not written by `/api/analyze-furniture` | Drift or staging overlap |
| `affiliate_url` | string | nullable | outbound link | Not read from DB; runtime recomputes URL in code | Weakly used |
| `material` | string | nullable | product attributes | No confirmed runtime use | Unused in current MVP |
| `width_cm` | number | nullable | dimensional data | No confirmed runtime use | Unused in current MVP |
| `depth_cm` | number | nullable | dimensional data | No confirmed runtime use | Unused in current MVP |
| `height_cm` | number | nullable | dimensional data | No confirmed runtime use | Unused in current MVP |
| `color_options` | jsonb | nullable | color variants | No confirmed runtime use | Unused in current MVP |

Judgment:
- Runtime-critical table.
- Current column set already mixes runtime minimal entity fields with richer import/catalog attributes.

### `furniture_vectors`

Intended role:
- Runtime scoring vector per furniture item.

Actual current usage:
- Read by all recommendation paths.
- Written by `/api/analyze-furniture`.

Confirmed columns and practical role:

| Column | Live type | Null/default | Practical meaning | Current code usage | Assessment |
| --- | --- | --- | --- | --- | --- |
| `furniture_id` | string | not null | joins vector to furniture row | Active read/write | Keep |
| `brightness_compatibility` | number | not null | brightness fit score | Active read/write | Keep |
| `color_temperature_score` | number | not null | warm/cool fit score | Active read/write | Keep |
| `spatial_footprint_score` | number | not null | perceived size/heaviness | Active read/write | Keep |
| `minimalism_score` | number | not null | style simplicity score | Active read/write | Keep |
| `contrast_score` | number | not null | contrast match score | Active read/write | Keep |
| `colorfulness_score` | number | not null | color intensity score | Active read/write | Keep |

Code-referenced but missing from live DB:

| Missing live column | Repository reference | Operational effect |
| --- | --- | --- |
| `vector_version` | `/api/analyze-furniture` write + conflict target | Admin analyze/upsert path is schema-drifted |
| `dominant_color_hex` | `/api/analyze-furniture` write | Same path is schema-drifted |

Judgment:
- Runtime-critical.
- Confirmed schema drift on the only writer in repo.

### `spaces`

Intended role:
- Runtime room-analysis persistence.

Actual current usage:
- Written by `/api/analyze-space` and `/api/mvp`.
- Read by `/api/recommend-space`.

Confirmed columns and practical role:

| Column | Live type | Null/default | Practical meaning | Current code usage | Assessment |
| --- | --- | --- | --- | --- | --- |
| `id` | string | not null / `uuid_generate_v4()` | room analysis PK | Active read | Keep |
| `image_url` | string | not null | analyzed room image reference | Active read/write | Keep |
| `brightness_score` | integer | nullable | room brightness | Active read/write | Keep |
| `color_temperature_score` | integer | nullable | room warmth/coolness | Active read/write | Keep |
| `spatial_density_score` | integer | nullable | clutter density | Active read/write | Keep |
| `minimalism_score` | integer | nullable | room minimalism | Active read/write | Keep |
| `dominant_color_hex` | string | nullable | dominant room tone | Written, not currently re-read in recommendation path | Keep |
| `created_at` | string | nullable / `now()` | timestamp | Not materially used | Keep |
| `contrast_score` | integer | nullable | room contrast | Active read/write | Keep |
| `colorfulness_score` | integer | nullable | room color intensity | Active read/write | Keep |

Judgment:
- Cleanest runtime table in current system.
- No confirmed live drift against current code.

### `recommendations`

Intended role:
- Log which items were recommended for a request and later mark click/save/purchase outcomes.

Actual current usage:
- Written by `/api/mvp`.
- Updated by `/api/log-click`.
- No confirmed reader beyond update-by-key flow.

Confirmed columns and practical role:

| Column | Live type | Null/default | Practical meaning | Current code usage | Assessment |
| --- | --- | --- | --- | --- | --- |
| `id` | string | not null / `uuid_generate_v4()` | event row PK | No direct code use | Keep |
| `space_id` | string | nullable | source room analysis | Active write | Keep |
| `furniture_id` | string | nullable | recommended item | Active write/update | Keep |
| `compatibility_score` | integer | nullable | recommendation score | Active write | Keep |
| `clicked` | boolean | nullable / `false` | click event flag | Active write/update | Keep |
| `saved` | boolean | nullable / `false` | saved-product flag | Active write only | Hold |
| `purchased` | boolean | nullable / `false` | purchased flag | Active write only | Hold |
| `created_at` | string | nullable / `now()` | timestamp | Passive | Keep |
| `request_id` | string | nullable | request/session grouping key | Active write/update | Keep |
| `event_source` | string | nullable / `web` | request source marker | Active write | Keep |

Inferred relations:
- `recommendations.space_id -> spaces.id`
- `recommendations.furniture_id -> furniture.id`

Risk:
- Zero live rows means this table is not giving any current evidence for CTR/save/purchase behavior.
- `saved` and `purchased` exist in schema and are populated as `false` on insert, but there is no confirmed current repository path that updates them.

Judgment:
- Runtime logging table should stay, but current operational use is incomplete.

### `import_jobs`

Intended role:
- Staging/import queue containing raw import payload and normalized extracted fields.

Actual current usage:
- Written by `/api/import-product`.
- Returned immediately to admin test UI after insert/upsert.
- No confirmed later read or approval/promotion path.

Confirmed columns and practical role:

| Column | Live type | Null/default | Practical meaning | Current code usage | Assessment |
| --- | --- | --- | --- | --- | --- |
| `id` | string | not null / `uuid_generate_v4()` | import row PK | Passive | Keep |
| `source_site` | string | nullable | importer source label | Active write | Keep |
| `source_url` | string | not null | dedupe key for import job | Active write | Keep |
| `raw_payload` | jsonb | nullable | full fetched/imported payload | Active write | Keep |
| `extracted_name` | string | nullable | parsed product name | Active write | Keep |
| `extracted_brand` | string | nullable | parsed brand | Active write | Keep |
| `extracted_category` | string | nullable | parsed category | Active write | Keep |
| `extracted_price` | integer | nullable | parsed price | Active write | Keep |
| `extracted_material` | string | nullable | parsed material | Active write | Keep |
| `extracted_width_cm` | number | nullable | parsed width | Active write | Keep |
| `extracted_depth_cm` | number | nullable | parsed depth | Active write | Keep |
| `extracted_height_cm` | number | nullable | parsed height | Active write | Keep |
| `extracted_color_options` | jsonb | nullable | parsed color list | Active write | Keep |
| `extracted_image_urls` | jsonb | nullable | parsed image list | Active write | Keep |
| `status` | string | nullable / `pending` | review state | Active write | Keep |
| `review_note` | string | nullable | reviewer notes | No confirmed current use | Hold |
| `created_at` | string | nullable / `now()` | timestamp | Passive | Keep |
| `updated_at` | string | nullable / `now()` | timestamp | Passive | Keep |
| `extracted_source_site` | string | nullable | normalized source label | Active write | Keep |
| `extracted_affiliate_url` | string | nullable | outgoing product URL | Active write | Keep |
| `extracted_size_label` | string | nullable | label enrichment | Active write | Keep |
| `extracted_capacity_label` | string | nullable | capacity enrichment | Active write | Keep |
| `extracted_source_variant_ids` | jsonb | nullable | variant IDs | Active write | Keep |
| `extracted_option_summaries` | jsonb | nullable | variant summaries | Active write | Keep |
| `extracted_confidence` | number | nullable | extraction confidence | Active write | Keep |
| `extraction_notes` | string | nullable | parser/debug notes | Active write | Keep |

Judgment:
- Useful staging table with live data.
- Missing only the next-step operational path.

### `furniture_products`

Intended role:
- Purchasable furniture catalog table for automation/catalog read paths.

Actual current usage:
- Written only by test route `/api/test-save-product`.
- Read only by automation catalog gateway and readiness/demo scripts.
- Not used by current recommendation runtime.
- Not written by current import pipeline.

Confirmed columns and practical role:

| Column | Live type | Null/default | Practical meaning | Current code usage | Assessment |
| --- | --- | --- | --- | --- | --- |
| `id` | string | not null / `gen_random_uuid()` | product PK | Test-only | Hold |
| `source_site` | string | not null | source label | Test-only write, automation read | Hold |
| `source_url` | string | not null | dedupe key | Test-only write, automation read | Hold |
| `product_name` | string | not null | product title | Test-only write, automation read | Hold |
| `brand` | string | nullable | brand | Test-only write, automation read | Hold |
| `category` | string | nullable | category | Test-only write, automation read | Hold |
| `price` | number | nullable | price | Test-only write, automation read | Hold |
| `currency` | string | nullable / `KRW` | price currency | Test-only write, automation read | Hold |
| `image_url` | string | nullable | image | Test-only write, automation read | Hold |
| `product_url` | string | not null | destination product URL | Test-only write, automation read | Hold |
| `description` | string | nullable | product text | Test-only write | Hold |
| `color` | string | nullable | product color | Test-only write | Hold |
| `material` | string | nullable | product material | Test-only write | Hold |
| `width_cm` | number | nullable | width | Test-only write | Hold |
| `depth_cm` | number | nullable | depth | Test-only write | Hold |
| `height_cm` | number | nullable | height | Test-only write | Hold |
| `metadata_json` | jsonb | nullable | raw metadata | Test-only write | Hold |
| `status` | string | nullable / `active` | active catalog status | Automation read | Hold |
| `created_at` | string | nullable / `now()` | timestamp | Passive | Hold |
| `updated_at` | string | nullable / `now()` | timestamp | Passive | Hold |

Risk:
- Live rows are `0`.
- Overlaps strongly with both `import_jobs` and the richer columns already present on `furniture`.

Judgment:
- Not safe to delete immediately because automation still reads it.
- But it is not connected to the current MVP product recommendation path.

## 7. Drift and Overlap Findings

### Confirmed code -> DB drift

1. `app/api/analyze-furniture/route.ts` writes columns not present in live `furniture_vectors`.
   - Missing live columns: `vector_version`, `dominant_color_hex`
   - Missing live conflict target component: `vector_version`

2. `furniture_products` is treated as a catalog surface in automation, but current import code does not populate it.

3. `import_jobs` is the real live import write target, but no current production promotion path exists from `import_jobs` to runtime recommendation tables.

### Confirmed live columns currently unused by runtime code

`furniture`
- `source_site`
- `source_url`
- `affiliate_url`
- `material`
- `width_cm`
- `depth_cm`
- `height_cm`
- `color_options`

`recommendations`
- `saved` has no confirmed updater
- `purchased` has no confirmed updater

`import_jobs`
- `review_note` has no confirmed current usage

`furniture_products`
- Entire table is unused by current MVP recommendation runtime

### Overlap by responsibility

1. `import_jobs` vs `furniture_products`
   - Both hold product-ingest style data.
   - `import_jobs` is richer for staging/debug.
   - `furniture_products` is flatter and currently only powers automation/test reads.

2. `furniture_products` vs `furniture`
   - Both can represent a product catalog item.
   - `furniture` already contains runtime-facing attributes plus some provenance/dimension fields.
   - `furniture_products` is not the recommendation source of truth.

3. `import_jobs` vs `furniture`
   - There is an obvious staging-to-runtime boundary implied by current columns.
   - That promotion boundary is missing in current repository.

### Runtime despite newer/parallel architecture

Confirmed:
- Runtime recommendation still depends on `furniture` + `furniture_vectors`, not on `furniture_products`.
- Import/admin capture goes to `import_jobs`, but this does not feed runtime automatically.

### Constraint/relation verification status

- Direct foreign keys / unique constraints: not confirmed by current audit path.
- Inferred relations only:
  - `furniture_vectors.furniture_id -> furniture.id`
  - `recommendations.space_id -> spaces.id`
  - `recommendations.furniture_id -> furniture.id`

## 8. Classification Result

| Table | Classification | Why | What blocks immediate action | What must be verified next |
| --- | --- | --- | --- | --- |
| `spaces` | `KEEP` | Clean runtime table with confirmed read/write use and no current structural drift | None from this batch | Only verify whether retention policy is needed later |
| `furniture_vectors` | `KEEP WITH MODIFICATION` | Core runtime scoring table, actively read by all recommendation paths | Writer code is drifted against live schema | Decide whether schema should gain `vector_version`/`dominant_color_hex` or code should be reduced to live shape |
| `furniture` | `KEEP WITH MODIFICATION` | Core runtime entity table used by recommendation paths | Role overlap with catalog/import data fields is unresolved | Decide whether it remains runtime-only or becomes canonical approved product table |
| `recommendations` | `KEEP WITH MODIFICATION` | Correct place for result/click/save/purchase logging | Live table empty; save/purchase path incomplete | Verify whether insert path is being executed in practice and whether `saved`/`purchased` should remain booleans here |
| `import_jobs` | `KEEP WITH MODIFICATION` | Real live staging/import table with active writes and useful audit payload | No approval/promotion path into runtime tables | Define and verify explicit review -> approve -> publish flow |
| `furniture_products` | `MERGE CANDIDATE` | Structurally overlaps with `import_jobs` and `furniture`, but only powers automation/test reads today | Automation still reads it; cannot delete safely yet | Decide whether automation should read approved `furniture` rows instead, or whether this remains a dedicated published-catalog table |

### Delete-candidate status

No table is a confirmed immediate `DELETE CANDIDATE` from current evidence.

Reason:
- `furniture_products` is the closest candidate, but automation still depends on it.
- Deletion would be premature before reader migration or explicit deprecation.

### Hold status

No full table is classified `HOLD`, but these fields remain hold-level decisions:
- `recommendations.saved`
- `recommendations.purchased`
- `import_jobs.review_note`
- several non-runtime catalog attributes on `furniture`

## 9. Next Priority Actions

Strict order:

1. Fix or explicitly resolve the `furniture_vectors` schema drift first.
   - Current admin furniture analyze path does not match live schema.
   - This is the most direct code/live mismatch.

2. Decide the single published product source of truth second.
   - Choice is effectively between:
   - `furniture` as approved runtime catalog
   - `furniture_products` as approved runtime catalog
   - Maintaining both is current duplication.

3. Define the missing promotion boundary third.
   - `import_jobs -> approved product table -> vector generation/runtime availability`
   - Current repository has import staging but no confirmed approval/publish step.

4. Verify why `recommendations` is empty fourth.
   - Confirm whether `/api/mvp` insert path is unused, failing, or cleaned externally.
   - This is operationally important, but it is downstream of the core table decision.

5. After source-of-truth decision, migrate automation readers fifth.
   - If `furniture_products` is retired, update automation gateway to read the chosen published table.

6. Only after reader migration, consider `furniture_products` deprecation/removal.
   - Until then it stays a merge candidate, not a delete candidate.

## 10. Short Decision Summary

- Keep runtime recommendation around `spaces`, `furniture`, `furniture_vectors`, `recommendations`.
- Keep `import_jobs` as staging, but it needs a real publish path.
- Treat `furniture_products` as duplicated catalog surface pending merge decision, not as current runtime truth.
- Do not make delete decisions before resolving automation dependency and publish-path design.
