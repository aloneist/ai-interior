# Recommendation Action Contract

## Current Position

- `recommendations` is the MVP exposure and action log table.
- `clicked` was already active through `/api/log-click`.
- `saved` was visible in the current MVP UI, but until this batch it only lived in client state.
- `purchased` has no current UI, API, or checkout flow behind it.

This batch removes the contract ambiguity around action fields so the runtime table reflects real MVP behavior instead of speculative flags.

## Field Decision

| Field | Decision | Why |
| --- | --- | --- |
| `clicked` | ACTIVE MVP FIELD | Real user action, explicit route, already used for recommendation interaction logging. |
| `saved` | ACTIVE MVP FIELD | Real user action in the current saved-products flow, now backed by an explicit runtime update path. |
| `purchased` | OUT OF MVP CONTRACT | No current MVP route, no checkout/order flow, and no confirmed consumer. |

## Operational Meaning

### `clicked`

- Meaning: the user opened or followed a recommendation result.
- Updated by: `POST /api/log-click`
- Row targeting: `request_id` + `furniture_id`
- Runtime status: active

### `saved`

- Meaning: the user marked a recommended product as saved within the MVP recommendation session.
- Updated by: `POST /api/log-save`
- Row targeting: `request_id` + `furniture_id`
- Runtime status: active
- Repeated behavior:
  - repeated `saved: true` stays safe and idempotent
  - `saved: false` cleanly unsaves the same exposure row

### `purchased`

- Meaning: none defined in the current MVP
- Updated by: no current runtime path
- Runtime status: dormant
- Decision: explicitly outside the MVP contract and safe to remove from schema by separate SQL execution

## Minimum Action Contract

### Exposure Insert

- Writer: `POST /api/mvp`
- Inserted fields kept stable:
  - `request_id`
  - `event_source`
  - `space_id`
  - `furniture_id`
  - `compatibility_score`
  - `clicked`
  - `saved`

### Click Update

- Route: `POST /api/log-click`
- Required body:
  - `request_id`
  - `furniture_id`
- Validation:
  - both fields required
  - both fields must be UUIDs
- Missing row behavior: `404`

### Save Update

- Route: `POST /api/log-save`
- Required body:
  - `request_id`
  - `furniture_id`
  - `saved` boolean
- Validation:
  - `request_id` and `furniture_id` required
  - both IDs must be UUIDs
  - `saved` must be a boolean
- Missing row behavior: `404`

## QA Findings

Validated in this batch:

- recommendation exposure row insertion still works
- `/api/log-click` success path still updates `clicked=true`
- `/api/log-click` missing row still returns `404`
- `/api/log-save` updates `saved=true`
- repeated `/api/log-save` with `saved=true` remains safe
- `/api/log-save` updates `saved=false`
- `/api/log-save` missing row returns `404`
- `/api/log-save` invalid `saved` payload returns `400`

## Final MVP Contract

- `clicked`: keep as-is
- `saved`: keep as an active MVP field
- `purchased`: outside the MVP contract now and ready for explicit schema removal
