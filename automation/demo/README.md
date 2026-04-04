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
npm run automation:smoke
```

Operator-friendly report command:

```bash
npm run automation:smoke:report
```

Setup reference:
- [env-setup.md](/workspaces/ai-interior/automation/env-setup.md)

Output note:
- CI should trust the smoke exit code first.
- use the final `FINAL SUMMARY` block for the quick operator read
- use the per-scenario sections above it when a summary line fails and you need detail
- use the final `JSON REPORT` block when you need a machine-readable view of the same smoke outcomes
- set `AUTOMATION_SMOKE_REPORT_PATH` if you also want the same JSON report written to a local file
- `npm run automation:smoke:report` is the simplest local entrypoint when you want the current smoke flow plus a report file in your system temp directory
- the local report path is printed in the final `REPORT FILE` block and defaults to `automation-smoke-report.json` inside the current OS temp directory unless `AUTOMATION_SMOKE_REPORT_PATH` is already set
- CI sets `AUTOMATION_SMOKE_REPORT_PATH` and uploads that JSON report as the `automation-smoke-report` artifact
- inspect the `automation-smoke-report` artifact when CI fails, when stdout is truncated, or when you need the exact machine-readable report from that run
- the stdout `JSON REPORT` block and optional file output now come from the same in-memory report payload
- use the final `EXIT CODE CONTRACT` block for CI/operator interpretation: `0` means all scenarios passed, `1` means one or more scenarios failed

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
any risky operation. For automation v1, approval handoff delivery uses a narrow
real webhook path when `AUTOMATION_APPROVAL_WEBHOOK_URL` contains an `http(s)`
webhook URL. The smoke path starts a local receiver and validates the current
reachable delivery flow ending at `handoff_sent`.

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

Each smoke scenario also surfaces a narrow state snapshot derived from the
existing audit, report, review summary, and decision metadata, making the
current state of a single automation execution easy to inspect without adding
storage or workflow runtime integration.

Each smoke scenario now also surfaces a contract bundle that groups the key
execution-layer contracts for one automation run into one exportable object,
without introducing persistence or a separate orchestration path.

Each smoke scenario also surfaces an export envelope derived from that bundle,
with a narrow top-level summary shape intended for safe external handoff or
logging without exposing raw unrestricted execution payloads.

Each smoke scenario also surfaces an export serializer derived from that
envelope, exposing a stable payload object plus matching JSON string for future
handoff or logging use without expanding runtime behavior.

Approval-related smoke scenarios also surface a transport receipt derived from
the serializer and webhook sender result, making the external handoff boundary
explicit while staying scoped to approval-required flows.

Each smoke scenario also surfaces a narrow handoff summary derived from the
export envelope, serializer, and transport receipt, so reviewer-facing handoff
state is easy to inspect without exposing the full transport/export objects.

Each smoke scenario also surfaces a delivery readiness contract derived from
the handoff summary and related export metadata, making it explicit whether the
run is ready for external handoff and, if not, what is blocking it.

Each smoke scenario also surfaces a transport adapter contract derived from the
serializer, receipt, and readiness data, so the replaceable delivery boundary
is explicit while the sender remains limited to the current n8n approval
webhook path.

Approval-related smoke coverage also surfaces a narrow approval response intake
contract derived from current request, report, and decision identifiers. The
smoke path now validates that receive-side flow through a real local inbound
webhook endpoint, covering accepted, rejected-invalid, and
ignored-not-applicable intake cases without resuming blocked execution.
That same inbound path now also has an explicit auth boundary: smoke sends
trusted requests with `authorization: Bearer AUTOMATION_APPROVAL_WEBHOOK_SECRET`
and separately verifies that untrusted requests are rejected before intake
normalization.

That intake coverage now also derives a narrow reviewer-facing approval
response summary contract so accepted, invalid, and not-applicable responses
are easy to distinguish without having to inspect the raw intake issues first.

That same receive-side flow now also derives a narrow approval response
application contract that maps accepted reviewer decisions into safe internal
statuses such as `remain_blocked`, `mark_rejected`, `mark_deferred`, and
`mark_needs_revision`, while invalid responses map to `invalid_response` and
not-applicable responses map to `no_action`. None of those states resume
blocked execution in automation v1.

That receive-side flow now also derives a narrow resume eligibility contract
from the application result. In automation v1, approved responses are still
reported as `blocked_still_requires_manual_gate` rather than directly
executable, while rejected, deferred, needs-revision, invalid, and
not-applicable cases each map to explicit blocked or non-applicable
eligibility statuses.

That same receive-side flow now also derives a narrow manual resume request
contract from the eligibility result. In automation v1, approved responses can
surface `request_pending_manual_gate`, but that remains a non-executing
request-only contract. Rejected, deferred, needs-revision, invalid, and
not-applicable cases stay explicitly non-requestable.

That same receive-side flow now also derives a narrow manual resume gate
contract from the manual resume request result. In automation v1, approved
responses can surface `gate_open_for_future_resume_contract`, but that gate is
still only a future-contract boundary and does not create a runnable resume
action. Blocked, invalid, and not-applicable cases stay explicitly closed.

That same receive-side flow now also derives a narrow manual resume contract
from the manual resume gate result. In automation v1, approved responses can
surface `contract_available_for_future_resume_artifact`, but that remains a
contract-only placeholder and does not issue any executable resume token or
action. Blocked, invalid, and not-applicable cases stay explicitly unavailable.
