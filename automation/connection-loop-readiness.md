# Connection And Loop Readiness

Use this document to decide whether the repository is ready to start real main-development work after the closed automation baseline.

Current machine-readable report:
- [connection-loop-readiness.json](/workspaces/ai-interior/automation/connection-loop-readiness.json)

## Run

```bash
npm run automation:connection:validate
```

This command validates:
- current Supabase readiness for the repo’s catalog/vector-backed surfaces
- current Cloudinary readiness if configured
- current OpenAI env presence for the existing `/api/mvp` path
- current human/Codex execution-loop surfaces

## What It Checks

### External connections

- Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - read access to `furniture_products`
  - read access to `furniture_vectors`
- Cloudinary:
  - `CLOUDINARY_NAME`
  - `CLOUDINARY_KEY`
  - `CLOUDINARY_SECRET`
  - admin ping when configured
- OpenAI:
  - `OPENAI_API_KEY` presence only

### Human/Codex loop

- task instruction surface
- Codex generation surface
- automated validation surface
- user review surface
- final approval surface

## Current Go / No-Go Rule

Start real main-development work only when:
- Supabase is `ready`
- OpenAI is `configured`
- execution loop is `ready`

Cloudinary is useful but not a hard blocker for the immediate next main-phase recommendation/data/QA batches unless that batch explicitly depends on asset search or upload work.

## Current Snapshot

Latest validated result from [connection-loop-readiness.json](/workspaces/ai-interior/automation/connection-loop-readiness.json):
- overall: `go`
- Supabase: `ready`
- OpenAI: `configured`
- Cloudinary: `ready`
- execution loop: `ready`

Current non-blocking gap:
- the Supabase automation catalog gateway is reachable, but the current `furniture_products` active-row count is `0`
- the current MVP vector surface is reachable separately, so start-work readiness is present, but provider-side catalog population still needs attention if later batches depend on the automation catalog gateway itself

## Current Repository Reality

This validation is intentionally narrow:
- it does not start product-feature work
- it does not broaden automation behavior
- it does not redesign the DB
- it does not treat optional connections as hard blockers unless the current repo path already depends on them

## Read Next

- [automation/README.md](/workspaces/ai-interior/automation/README.md)
- [automation/operator-runbook.md](/workspaces/ai-interior/automation/operator-runbook.md)
- [docs/ops/personal-codex-runbook.md](/workspaces/ai-interior/docs/ops/personal-codex-runbook.md)
