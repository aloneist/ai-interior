# Import Jobs Review And Publish Runbook 2026-04-09

## Purpose

Use this runbook to operate the current `import_jobs -> furniture_products` review and publish flow without guessing.

This is the operator path for:

- intake quality review before publish
- safe reconciliation of exact status/link drift
- real publish through the existing helper contract
- post-publish verification of the canonical row and outbound target

## Source Of Truth

- `furniture_products` is the canonical active product table.
- `import_jobs` is staging/review only.
- `published_product_id` is the official link from a staging row to its canonical product row.
- `pending_review`, `published`, and `rejected` are the only operational statuses.

## Status Semantics

### `pending_review`

Means:

- the row has not yet completed the publish routine, and
- there is no accepted canonical link recorded on the import row.

Operational rule:

- if a `pending_review` row already has a valid canonical link, or exactly one active canonical product matches the same `source_url`, it is no longer semantically pending and should be reconciled to `published`.

### `published`

Means:

- the canonical product row exists in `furniture_products`, and
- `import_jobs.published_product_id` points at that canonical row, and
- the row has completed publish or deterministic reconciliation.

Operational rule:

- `published` without a valid canonical link is inconsistent and must be repaired only if the canonical mapping is exact and unique.

### `rejected`

Means:

- the row is explicitly not publishable without further manual rework.

Operational rule:

- do not auto-publish or auto-reconcile rejected rows.

## Publish-Intake Quality Gates

Every staged row should be reviewed with one of these quality gates:

### `publish_ready`

Meaning:

- no publish blockers are present
- no warning-level quality issues are present

Operator action:

- row may be approved for publish immediately

### `publish_allowed_with_warning`

Meaning:

- no publish blockers are present
- one or more warning-level issues still require operator review

Typical cases:

- image missing
- affiliate URL missing
- brand missing
- outbound URL looks technically valid but generic or redirect-prone

Operator action:

- review warnings explicitly before approval
- publish only if the warning is understood and acceptable

### `publish_blocked`

Meaning:

- required approval fields are missing or invalid
- the row should not be published until the staged data is corrected

Blocking examples:

- missing or non-http `source_url`
- missing `extracted_name`
- missing `extracted_category`
- missing or non-positive `extracted_price`

Operator action:

- fix staged data first, then rerun audit

### `manual_review_required`

Meaning:

- the row has an operational consistency or ambiguity problem that should not be auto-fixed or auto-approved

Manual review examples:

- `rejected` status
- invalid status value
- more than one canonical `source_url` match
- linked canonical row missing
- linked canonical row conflicts with staged `source_url`
- exact canonical match exists but is not `active`

Operator action:

- keep out of publish until manually resolved

## Quality Review Rules

### Blocking Fields

These must be present and valid for publish approval:

- `source_url`
- `extracted_name`
- `extracted_category`
- `extracted_price > 0`

### Warning-Only Fields

These do not block publish automatically, but they require operator review:

- missing `extracted_image_urls`
- missing `extracted_affiliate_url`
- missing `extracted_brand`
- generic/category-like outbound URLs
- technically valid URLs that may lead to broad listing or redirect-prone destinations

## Outbound URL Review Rules

Outbound review is part of intake approval, not an optional afterthought.

Flag the row for outbound review when:

- `extracted_affiliate_url` is missing
- `extracted_affiliate_url` is not a valid `http(s)` URL
- `source_url` or affiliate URL contains obviously generic destination patterns such as:
  - `/cat/`
  - `/products-products`
  - `/search/`
  - `/offers/`
  - `search.shopping.naver.com`

Operator rule:

- do not auto-rewrite URLs from the runbook
- if the target looks broad, redirect-prone, or category-like, keep the row in warning/manual review until a product-level PDP target is confirmed

## Deterministic Remediation Rules

Apply only when the mapping is exact and unique.

Safe reconciliation is allowed when:

- `pending_review` has a valid `published_product_id` whose canonical row matches the same `source_url`
- `pending_review` has no link, but exactly one active canonical product matches the same `source_url`
- `published` has no link, but exactly one active canonical product matches the same `source_url`

Do not auto-fix when:

- `published_product_id` points to a missing canonical row
- `published_product_id` points to a different canonical `source_url` and no exact canonical match exists
- more than one canonical product matches the same `source_url`
- required publish fields are missing
- the matched canonical product is not `active`

## Audit Command

```bash
npm run ops:import-jobs:audit -- --report-path=/tmp/import-jobs-audit.json
```

The audit now reports:

- row-level `disposition`
- row-level `quality_gate`
- blockers and warnings
- rows requiring outbound review
- operator queue slices for:
  - publish-ready rows
  - publish-allowed-with-warning rows
  - publish-blocked rows
  - manual-review rows
  - outbound-review rows

## Operator Intake Routine

### 1. Run audit

```bash
npm run ops:import-jobs:audit -- --report-path=/tmp/import-jobs-audit.json
```

### 2. Review queues in this order

- `manual_review_rows`
- `publish_blocked_rows`
- `publish_allowed_with_warning_rows`
- `publish_ready_rows`

### 3. Handle exact reconciliation separately

Dry run:

```bash
npm run ops:import-jobs:remediate -- --report-path=/tmp/import-jobs-remediation-dry-run.json
```

Apply:

```bash
npm run ops:import-jobs:remediate -- --apply --report-path=/tmp/import-jobs-remediation-apply.json
```

Use remediation only for exact, already-proven canonical matches. Do not use it to override quality blockers.

### 4. Publish a reviewed row

Dry run:

```bash
npm run ops:import-jobs:publish -- --job-id=<import_job_uuid> --report-path=/tmp/import-job-publish-dry-run.json
```

Apply:

```bash
APP_BASE_URL=http://127.0.0.1:3000 \
ADMIN_TOKEN=<admin-token> \
npm run ops:import-jobs:publish -- --job-id=<import_job_uuid> --apply --report-path=/tmp/import-job-publish.json
```

Behavior:

- if the row is truly `ready_to_publish`, the script calls the existing admin publish route
- if the row is already effectively published by exact canonical match, the script reconciles status/link instead of re-publishing
- if the row is blocked, the script exits with explicit blocker reasons
- if publish succeeds, the script includes post-publish verification in the publish report

## Post-Publish Verification Routine

Run explicitly when an operator wants a standalone verification report:

```bash
npm run ops:import-jobs:verify-publish -- --job-id=<import_job_uuid> --report-path=/tmp/import-job-verify.json
```

Minimum expected checks:

- `import_jobs.status = published`
- `import_jobs.published_product_id` is present
- linked `furniture_products` row exists
- linked canonical row is `active`
- canonical `source_url` or `product_url` matches the staged `source_url`
- canonical `product_name` is present
- canonical `category` is present
- canonical `price` is present and positive
- canonical `image_url` is present or explicitly reviewed
- canonical outbound URL is present and does not obviously point to a generic destination

Operator rule:

- failed verification checks are stop conditions
- warning-level verification issues require explicit operator review before relying on the row operationally

## Current Baseline

After the status cleanup and QA fixture purge:

- the operational baseline is clean
- the main forward risk is intake quality drift, not status ambiguity
- future operator focus should be on staged-field completeness, outbound URL quality, and post-publish verification discipline

## Manual Review Cases

Keep rows out of publish when:

- required approval fields are missing or invalid
- canonical linkage is ambiguous
- a linked canonical product conflicts with the staged `source_url`
- outbound destination quality is suspicious
- the row is explicitly `rejected`
