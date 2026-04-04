# Demo

This folder contains small automation-only demos and smoke tests.

Current runner:
- `run-smoke-test.cjs`
- `run-smoke-test.ts`

Coverage:
- `catalog.read` through the execution service with the explicit `list_active_furniture_products` gateway operation
- `asset.search` through the execution service with the explicit `search_design_reference_assets` gateway operation
- one approval-required write case through the execution service

Suggested run command:

```bash
node automation/demo/run-smoke-test.cjs
```

The `catalog.read` smoke path uses live Supabase reads only when both
`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present.
Otherwise it falls back to a demo-only in-memory dataset so the gateway path
remains testable without opening a general database execution surface.

The `asset.search` smoke path uses live Cloudinary reads only when
`CLOUDINARY_NAME`, `CLOUDINARY_KEY`, and `CLOUDINARY_SECRET` are present.
Otherwise it falls back to a demo-only in-memory dataset so the asset gateway
path remains testable without introducing a general Cloudinary admin surface.

The smoke path also verifies the approval boundary by sending
`catalog.write.safe` through execution and asserting that automation returns a
structured `APPROVAL_REQUIRED` result instead of auto-running the operation.
That approval-required result now includes an explicit `n8n-approval` handoff
payload contract so the future orchestration shape is visible without sending
any real network request. It also passes that payload through a placeholder
sender boundary, and exposes an explicit approval lifecycle state contract with
the current placeholder flow ending at `handoff_not_sent`.

Each smoke scenario also surfaces a structured audit entry describing the
execution outcome, so the current contract covers both auto-run and
approval-required flows without adding persistence.

Each smoke scenario also surfaces a run report derived from the execution
result and audit entry, giving a single-execution summary contract without
introducing a separate reporting system.

Each smoke scenario also surfaces a narrower review summary derived from the
run report, making reviewer-facing status easier to inspect without adding a
parallel workflow layer.

Approval-related smoke scenarios also surface a decision envelope derived from
the existing review/report identifiers, so reviewer or orchestration decisions
can be represented explicitly without triggering any execution side effects.
