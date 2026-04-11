# AI Interior Curation

## What this repository is
This repository powers an AI interior curation product.
The core business flow is:

room input -> staged product intake/review -> canonical product publish -> recommendation/runtime use -> operator verification

This is not maintained as a generic UI demo repository.

## Current priorities
The repository should be developed in this order:
1. operational product data correctness
2. canonical publish contract safety
3. deterministic seller/source support expansion
4. recommendation/runtime stability
5. UX only after data/runtime contracts are stable

## Canonical data model
- `import_jobs`: staging / review only
- `furniture_products`: canonical active product catalog
- `published_product_id`: audited link from staging to canonical product
- publish is a controlled promotion, not a blind copy
- recommendation/save/click/compare identity must stay tied to canonical product identity

## Working model
- ChatGPT: direction, task design, review
- Codex: implementation and narrow code changes
- CI: automated checks
- Human: final approval

## Operating discipline
- verify repository freshness before repo-based planning
- read target files first
- avoid broad scans unless required
- prefer diff-first, narrow edits
- keep output minimal and reviewable
- avoid long logs, prompt restatement, and unchanged-context summaries

## How work is proposed
Work is proposed as bundled tasks under `docs/tasks/`.
Do not invent task sequence numbers.
Check the current latest sequence in the repository first.

## Operator / developer entry points
- Publish / canonical contract: `docs/tasks/done/129-publish-flow-and-canonical-interaction-contract.md`
- Review / publish runbook: `docs/ops/import-jobs-review-and-publish-runbook-2026-04-09.md`
- Current active task: `docs/tasks/154-livart-deterministic-breadth-completion.md`

## Validation baseline
For code changes, run:
- `git diff --check`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Current caution
Do not assume repository freshness.
All planning should start from a user-approved freshness check.
