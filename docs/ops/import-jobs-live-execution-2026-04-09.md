# Import Jobs Live Execution - 2026-04-09

## Scope

Live execution of the already-approved deterministic `import_jobs` remediation and publish workflow against production-connected operational data.

This run used the existing contracts:

- canonical table: `furniture_products`
- staging/review queue: `import_jobs`
- allowed statuses: `pending_review`, `published`, `rejected`
- existing publish path: `POST /api/admin/import-jobs/[jobId]/publish`

## Commands Run

Pre-execution audit:

```bash
npm run ops:import-jobs:audit -- --report-path=/tmp/import-jobs-pre-execution-audit-2026-04-09.json
```

Live deterministic remediation:

```bash
npm run ops:import-jobs:remediate -- --apply --report-path=/tmp/import-jobs-remediation-apply-2026-04-09.json
```

Local app for publish route execution:

```bash
npm start -- --hostname 127.0.0.1
```

Real publish for true publish-ready row:

```bash
APP_BASE_URL=http://127.0.0.1:3000 npm run ops:import-jobs:publish -- --apply --job-id=b1834a03-80fc-47db-ac8a-593bf42171bc --report-path=/tmp/import-job-publish-apply-2026-04-09.json
```

Post-execution audit:

```bash
npm run ops:import-jobs:audit -- --report-path=/tmp/import-jobs-post-execution-audit-2026-04-09.json
```

## Pre-Execution Snapshot

- total jobs: `31`
- `pending_review`: `29`
- `published`: `2`
- deterministic reconciliation candidates: `27`
- true publish-ready candidates: `1`
- manual-review-required candidates: `1`

## Live Actions Taken

Deterministic remediation applied:

- `27` rows moved from `pending_review` to `published`
- each row received `published_product_id` from the exact active canonical `source_url` match
- no heuristic or ambiguous matching was used

Real publish executed:

- `1` row published through the existing admin publish route
- import job: `b1834a03-80fc-47db-ac8a-593bf42171bc`
- new canonical product id: `5626545f-38d3-4fb1-bc45-7ece79eb1316`
- source URL: `https://www.ikea.com/kr/ko/p/landskrona-3-seat-sofa-gunnared-light-green-wood-s19270327/`

Untouched rows:

- `1` row remained in manual review because it is blocked by missing `extracted_name`

## Post-Execution Snapshot

- total jobs: `31`
- `pending_review`: `1`
- `published`: `30`
- deterministic reconciliation candidates: `0`
- true publish-ready candidates: `0`
- manual-review-required candidates: `1`

## Remaining Manual Review Row

- import job: `8ea68838-1578-414b-9fa6-cd410fb3c200`
- source URL: `qa://legacy-furniture-retirement/invalid-missing-name`
- blocker: missing `extracted_name`
- warning: missing image
- action: leave untouched until staged data is corrected or intentionally rejected

## Artifacts

- `/tmp/import-jobs-pre-execution-audit-2026-04-09.json`
- `/tmp/import-jobs-remediation-apply-2026-04-09.json`
- `/tmp/import-job-publish-apply-2026-04-09.json`
- `/tmp/import-jobs-post-execution-audit-2026-04-09.json`
