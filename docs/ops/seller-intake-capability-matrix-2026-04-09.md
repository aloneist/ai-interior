# Seller Intake Capability Matrix - 2026-04-09

## Purpose

This document separates source coverage from source capability.

It answers two different operational questions:

- do we currently have enough data from a source
- can the current intake pipeline actually fetch, stage, quality-review, and publish that source reliably

Use this matrix before expanding beyond the current IKEA-heavy operating dataset.

## Capability States

### `supported_operational`

Meaning:

- fetch works in the current environment
- extraction produces the required publish fields consistently enough for normal staged review
- quality gates can approve valid rows without special-case handling
- publish and post-publish verification are operationally viable

### `fetch_blocked`

Meaning:

- the source cannot be fetched reliably enough to reach staged review
- the failure happens before quality gates can evaluate the row

Typical causes:

- seller access controls
- anti-bot or `403` behavior
- environment-specific network restrictions

### `parse_blocked`

Meaning:

- the source can be fetched, but the current extraction path cannot produce a usable staged product identity
- required publish fields are usually absent because the parser/extractor is not source-capable yet

### `quality_blocked`

Meaning:

- the source can reach staged review
- quality gates are correctly blocking publish because required approval fields are missing or invalid
- this is usually downstream evidence of parse/extraction weakness, not a reason to loosen gates

### `experimental`

Meaning:

- the source is recognized in code or has some partial handling path
- operational evidence is not yet strong enough to treat it as supported

### `untested`

Meaning:

- the source is named in code or planning, but no meaningful live operational evidence exists yet

## Evidence Basis

Current evidence comes from:

- importer host detection in [route.ts](/workspaces/ai-interior/app/api/import-product/route.ts)
- parser coverage in [router.ts](/workspaces/ai-interior/lib/parsers/router.ts)
- recent live intake validation in [import-jobs-intake-batch-validation-2026-04-09.md](/workspaces/ai-interior/docs/ops/import-jobs-intake-batch-validation-2026-04-09.md)
- current live operational distribution:
  - `import_jobs`: `ikea:published = 29`, `livart:pending_review = 1`
  - `furniture_products`: `ikea:active = 29`

## Source Capability Matrix

| Source | Fetch Capability | Parse / Extraction Capability | Quality-Gate Outcome | Publish Viability | Current Status | Evidence | Next Required Work |
| --- | --- | --- | --- | --- | --- | --- | --- |
| IKEA | Working | Deterministic source parser exists and produces required fields in observed cases | Gates approve valid rows; duplicate intake is handled through warning/reconciliation | Proven | `supported_operational` | Only source with live canonical catalog rows and successful fresh publish on 2026-04-09 | Continue as baseline source; use for operational reference and regression checks |
| Todayhouse | Blocked in observed validation | Not meaningfully exercised because fetch failed before staging | Not reached | Not currently viable | `fetch_blocked` | Live intake attempt returned `400` with `Failed to fetch page: 403` | Solve fetch/access path first; do not spend time on publish tuning until a real staged row can be created |
| Livart | Working in observed validation | No deterministic parser; generic enrichment staged a row but missed required identity fields | Correctly blocked by gates for `missing_name`, `missing_category`, `missing_price` | Not currently viable | `quality_blocked` | Live intake created `import_jobs` row `de39c8a0-0ec9-4e30-8705-8c008bb8be0a`, but publish was blocked | Add source-capable extraction for product identity and price before retrying publish |
| Hanssem | Unproven | No deterministic parser evidence | Unknown | Unknown | `untested` | Host is recognized in importer, but no live intake evidence and no canonical rows observed | Run a small validation batch before prioritizing parser work |
| Other hosts via generic host fallback | Unproven | Generic fetch + AI-only enrichment path exists, but no operational proof for publish-quality outcomes | Unknown | Unknown | `experimental` | Import route can label unknown hosts, but current evidence does not show a supported path beyond IKEA | Treat as exploratory only; do not call these sources supported without a staged batch and gate results |

## Current Classification Notes

### IKEA

This is not just a coverage-heavy source. It is the only source with end-to-end operational proof:

- deterministic parsing exists
- staged rows can be `publish_ready`
- real publish succeeded
- post-publish verification succeeded
- canonical `furniture_products` rows are live and active

This means IKEA is both a coverage source and a capability reference source.

### Todayhouse

Todayhouse currently looks like a capability problem, not a coverage problem.

Reason:

- the recent intake attempt did not even reach staged review
- no quality-gate judgment was possible
- the bottleneck is fetch/access, not the operator workflow

Operational implication:

- do not classify Todayhouse as parser-blocked or quality-blocked yet
- it is fetch-blocked until a real staged row exists

### Livart

Livart currently looks like a quality-blocked source caused by extraction weakness.

Reason:

- fetch succeeded
- staged review row was created
- required publish fields were absent
- the quality gate correctly prevented publish

Operational implication:

- this is exactly the kind of case the hardened intake gates are supposed to stop
- the fix is source capability expansion, not gate loosening

### Hanssem

Hanssem is recognized by host detection but has no operational evidence yet.

Operational implication:

- keep it in `untested`
- do not assume it behaves like Livart or Todayhouse until a controlled batch is run

## Coverage Versus Capability

Current reality:

- IKEA is both high-coverage and operationally supported
- non-IKEA sources are not merely under-covered; they are capability-limited in different ways

That distinction matters:

- adding more seller URLs without source capability work will mostly produce blocked rows or route failures
- expanding source support requires solving source-specific fetch and extraction issues, not reducing quality standards

## Expansion Priority Recommendation

Use this order for next-source expansion:

### 1. Livart

Why first:

- fetch already works
- staging already works
- the failure mode is explicit and close to publish: missing required extracted fields
- this is the shortest path from unsupported to operationally useful

Recommended next step:

- add minimal Livart-specific extraction for product name, category hint, price, and primary image
- rerun a small Livart-only validation batch through the existing gates

### 2. Hanssem

Why second:

- importer already recognizes the host
- likely easier to evaluate than a source currently blocked at fetch
- could become another domestic seller path if basic page structure is accessible

Recommended next step:

- run a small Hanssem intake validation batch first
- only after that decide whether the problem is fetch, parse, or quality

### 3. Todayhouse

Why third:

- the most urgent problem is still fetch/access
- parser work is premature until route-level access is reliable

Recommended next step:

- investigate access requirements and whether the current server-side fetch path is viable at all
- if seller access is structurally hostile, deprioritize rather than forcing brittle workarounds

## Operator / Developer Use

Use this matrix when deciding the next intake batch:

- choose `supported_operational` sources for publishable operational batches
- choose `quality_blocked` or `parse_blocked` sources only for capability-development validation
- avoid spending operator review time on `fetch_blocked` sources until the route can stage rows
- keep `untested` and `experimental` sources in small exploratory batches only

## Practical Rule

Do not interpret blocked non-IKEA rows as evidence that the quality gate is too strict.

In the currently observed system, blocked non-IKEA rows are evidence that source capability expansion has not happened yet.

## Deferred Items

- no live Hanssem validation has been run yet
- no source-level fetch diagnostics exist yet for Todayhouse beyond the observed `403`
- no Livart-specific parser or extractor has been added yet
- the current matrix should be revised only when new live evidence exists, not on assumption
