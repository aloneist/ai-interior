# Import Jobs Intake Batch Validation - 2026-04-09

## Batch URLs

Validation batch used:

- `https://www.ikea.com/kr/ko/p/landskrona-3-seat-sofa-djuparp-dark-blue-metal-s99415821/`
- `https://www.ikea.com/kr/ko/p/landskrona-3-seat-sofa-gunnared-light-green-wood-s19270327/`
- `https://store.ohou.se/goods/2860725`
- `https://mall.hyundailivart.co.kr/p/P200134640`

Batch intent:

- fresh IKEA PDP expected to be fully publish-ready
- already-published IKEA PDP expected to exercise duplicate-intake warning/reconciliation
- Todayhouse PDP expected to test route-level fetch resilience
- Livart PDP expected to test blocked staged intake with parser gaps

## Intake Results

### 1. Fresh IKEA PDP

- URL: `https://www.ikea.com/kr/ko/p/landskrona-3-seat-sofa-djuparp-dark-blue-metal-s99415821/`
- intake result: success
- import job: `a0887a9f-b662-48e2-906a-93f33bdb1e9a`

### 2. Duplicate IKEA PDP

- URL: `https://www.ikea.com/kr/ko/p/landskrona-3-seat-sofa-gunnared-light-green-wood-s19270327/`
- intake result: success
- existing import job updated: `b1834a03-80fc-47db-ac8a-593bf42171bc`
- operational effect: existing published row was restaged as `pending_review`, which the audit later flagged as warning/reconciliation rather than publish-ready

### 3. Todayhouse PDP

- URL: `https://store.ohou.se/goods/2860725`
- intake result: failed at route level
- HTTP result: `400`
- failure detail: `Failed to fetch page: 403`
- staged row created: no

### 4. Livart PDP

- URL: `https://mall.hyundailivart.co.kr/p/P200134640`
- intake result: success
- import job: `de39c8a0-0ec9-4e30-8705-8c008bb8be0a`
- parser behavior: no deterministic parser result; staged row lacked required publish fields

## Quality Audit Results

Audit artifact:

- `/tmp/import-jobs-batch-audit-2026-04-09.json`

Batch-specific classification before publish/remediation:

- `publish_ready`
  - `a0887a9f-b662-48e2-906a-93f33bdb1e9a`
- `publish_allowed_with_warning`
  - `b1834a03-80fc-47db-ac8a-593bf42171bc`
  - warning: `pending_review_already_linked`
  - deterministic remediation available: `sync_status_to_published_from_existing_link`
- `publish_blocked`
  - `de39c8a0-0ec9-4e30-8705-8c008bb8be0a`
  - blockers: `missing_name`, `missing_category`, `missing_price`
  - warnings: `missing_image`, `missing_brand`
- route-level intake failure
  - Todayhouse URL returned `403` and never reached staged review

Important behavior note:

- the quality-gate layer separated the Livart row as `publish_blocked`
- the older disposition layer still labeled that row `manual_review_required`
- this is acceptable operationally, but it means operators should use `quality_gate` for approval decisions and `disposition` for linkage/state semantics

## Actions Taken

### Published

- published ready row: `a0887a9f-b662-48e2-906a-93f33bdb1e9a`
- canonical product created: `b415b25c-34ab-4583-b204-fefe8f76f21a`

Publish artifact:

- `/tmp/import-job-publish-a0887a9f-2026-04-09.json`

### Reconciled

- reconciled duplicate warning row: `b1834a03-80fc-47db-ac8a-593bf42171bc`
- action: `sync_status_to_published_from_existing_link`

Remediation artifact:

- `/tmp/import-job-remediate-b1834a03-2026-04-09.json`

### Left Untouched

- blocked Livart row: `de39c8a0-0ec9-4e30-8705-8c008bb8be0a`
- Todayhouse URL: no staged row was created because the route fetch failed with `403`

## Post-Publish Verification

The publish report for `a0887a9f-b662-48e2-906a-93f33bdb1e9a` included successful post-publish verification:

- import job status published
- `published_product_id` present
- canonical row exists and is active
- canonical source URL matches staged source URL
- canonical name, category, price, image, and outbound URL all present
- no verification warnings

## Final Post-Action Audit

Post-action audit artifact:

- `/tmp/import-jobs-batch-post-actions-audit-2026-04-09.json`

Post-action state:

- total jobs: `30`
- `published`: `29`
- `pending_review`: `1`
- remaining staged follow-up row: Livart blocked row `de39c8a0-0ec9-4e30-8705-8c008bb8be0a`

## Operational Conclusion

This validation batch was small, but it was useful:

- the hardened gate system meaningfully separated a truly ready IKEA PDP from a duplicate-intake warning case and a blocked unsupported-seller case
- the duplicate-intake warning path behaved correctly and was recoverable through deterministic remediation without re-publish
- the blocked Livart row showed the current intake path is still parser-dependent; unsupported sellers can stage rows, but they will usually fail publish quality gates because required product identity fields are absent
- Todayhouse exposed a route-level fetch problem before staging, which is a different operational failure mode from quality gating

## Follow-Up

- keep using `quality_gate` as the primary operator decision signal
- treat repeated intake of already-published URLs as a warning/reconciliation case, not a publish case
- if non-IKEA seller intake is an actual near-term goal, the next work is source-specific parser coverage or fetch handling, not loosening publish gates
