# Import Jobs QA Fixture Purge - 2026-04-09

## Scope

Deterministic live cleanup of QA fixture contamination from operational tables after the remediation and publish workflow had already been executed.

This cleanup intentionally targeted only explicit QA fixture rows and their directly linked canonical products.

## Fixture Match Rules Used

The live purge used only these deterministic rules:

- `import_jobs.source_url` exactly matching:
  - `qa://legacy-furniture-retirement/valid-pending-review`
  - `qa://legacy-furniture-retirement/invalid-missing-name`
  - `qa://legacy-furniture-retirement/valid-reviewed`
- `furniture_products.id` exactly matching the canonical rows linked from those QA import jobs:
  - `22bc8754-fa1a-4f7c-bedc-a8120b049fc2`
  - `9395477c-c535-4211-a721-b700beb80e9e`

Additional direct-link checks performed before deletion:

- `recommendations.furniture_id` for those two QA canonical product IDs: none found
- `furniture_vectors.furniture_id` for those two QA canonical product IDs: none found

No heuristic matching was used. No non-`qa://` rows were considered fixture rows.

## Live Purge Actions

Deleted from `import_jobs`:

- `c2edd882-c318-4967-8e82-dfa126f69678`
- `8ea68838-1578-414b-9fa6-cd410fb3c200`
- `bb6dab01-c5bb-4117-b3a5-50cc068f4ffb`

Deleted from `furniture_products`:

- `22bc8754-fa1a-4f7c-bedc-a8120b049fc2`
- `9395477c-c535-4211-a721-b700beb80e9e`

Preserved:

- all non-`qa://` `import_jobs` rows
- all non-`qa://` canonical `furniture_products` rows
- all `recommendations` rows, because no direct links to the deleted QA canonical product IDs existed
- all other operational data not directly tied to the deterministic QA fixture set

## Post-Clean Audit Baseline

Command:

```bash
npm run ops:import-jobs:audit -- --report-path=/tmp/import-jobs-post-clean-audit-2026-04-09.json
```

Result:

- total jobs: `28`
- `pending_review`: `0`
- `published`: `28`
- deterministic reconciliation candidates: `0`
- true publish-ready candidates: `0`
- manual-review-required candidates: `0`

## Artifacts

- `/tmp/import-jobs-post-clean-audit-2026-04-09.json`
