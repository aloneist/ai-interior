# Automation Operator Runbook

Use this runbook for the current automation-only workflow.

Final baseline review starts at:
- [next-phase-handoff.md](/workspaces/ai-interior/automation/next-phase-handoff.md)
- [status-board.md](/workspaces/ai-interior/automation/status-board.md)
- [baseline-closeout.md](/workspaces/ai-interior/automation/baseline-closeout.md)
- [final-review.md](/workspaces/ai-interior/automation/final-review.md)
- [baseline-approval.md](/workspaces/ai-interior/automation/baseline-approval.md)

## 1. Prepare

- Read [env-setup.md](/workspaces/ai-interior/automation/env-setup.md).
- Set:
  - `AUTOMATION_APPROVAL_WEBHOOK_URL` for outbound approval handoff
  - `AUTOMATION_APPROVAL_WEBHOOK_SECRET` for inbound approval-response auth
- Do not use `ADMIN_TOKEN` for the automation webhook path.

## 2. Run Smoke

Standard smoke:

```bash
npm run automation:smoke
```

Optional JSON report file:

```bash
npm run automation:smoke:report
```

That command writes the local report to your system temp directory by default
and prints the exact path in the final `REPORT FILE` block.

For smoke output details, read [demo/README.md](/workspaces/ai-interior/automation/demo/README.md).

## 3. Read The Result

Use this order:

1. exit code
2. `FINAL SUMMARY`
3. `JSON REPORT`
4. per-scenario detail only when a summary line fails

In CI:

- trust the exit code first
- use `FINAL SUMMARY` for the quick human read
- use the `automation-smoke-report` artifact when you need the exact JSON report from that run
- if the artifact is missing, treat that as CI evidence worth noting and fall back to the job log `JSON REPORT`
- CI now also runs `npm run automation:runtime:http:verify` after smoke, so runtime bridge failures should be treated as a separate route-level verification signal
- when that verifier fails, inspect the `automation-runtime-http-verify-log` artifact for the preserved route-level diagnostics from that CI run
- inspect the `automation-runtime-http-verify-report` artifact when you need the exact preserved machine-readable verifier report from that CI run
- inspect the `automation-readiness-report` artifact when you need the final combined automation baseline read across smoke plus runtime artifacts

Current success expectations:

- read-only `catalog.read` and `asset.search` auto-run
- `catalog.write.safe` stops at the approval boundary
- outbound approval webhook delivery is scoped to approval-required flow only
- inbound auth blocks untrusted approval-response requests before normalization
- inbound approval response intake distinguishes accepted, invalid, and not-applicable cases
- blocked execution still does not resume

## 4. Review Boundaries

- Use [contract-map.md](/workspaces/ai-interior/automation/contract-map.md) to inspect the current execution, handoff, and receive-side contract stack.
- Use [review-checklist.md](/workspaces/ai-interior/automation/review-checklist.md) for post-change verification.

Runtime bridge routes:

- `GET /api/automation/readiness` for safe configured/not-configured readiness only
- `GET /api/automation/check` for one concise operator-facing runtime bridge check over the current inspection surface
- `GET /api/automation/snapshot` for one concise current runtime snapshot that combines readiness, status, and overview summaries
- `GET /api/automation/status` for one concise operator-facing status summary of the current runtime bridge surface and verifier coverage
- `GET /api/automation/routes` for safe summary inventory of the current automation runtime bridge surface
- `GET /api/automation/overview` for one safe operator-facing overview bundle derived from readiness, route inventory, and approval-response reference metadata
- `POST /api/automation/approval-boundary-test` for one fixed simulation of the approval-required write-path boundary through the current execution chain
- `POST /api/automation/webhook-test` to verify the current outbound approval webhook sender path without executing risky work
- `POST /api/automation/approval-response` to classify inbound approval responses using the current receive-side chain
  auth: `authorization: Bearer AUTOMATION_APPROVAL_WEBHOOK_SECRET`
  required body context: `requestId`, `reportId`, `capabilityId`, `finalStatus`
  optional body context: `decisionId`
  sample request shape: [contracts.ts](/workspaces/ai-interior/app/api/automation/contracts.ts)
- `GET /api/automation/approval-response/sample` for a safe request-shape and response-reference example for the approval-response bridge
- `npm run automation:runtime:http:verify` to exercise the current runtime bridge routes, including readiness, route inventory, overview, approval-boundary test, approval-response sample, webhook-test, and approval-response
- `npm run automation:runtime:inspect` to start the same local runtime bridge setup and print a concise inspection summary for the current safe inspection routes
- `npm run automation:runtime:check` to combine the existing inspect and verifier JSON reports into one combined runtime-check summary and JSON report
- `npm run automation:runtime:approval-boundary:test` to start the same local runtime bridge setup and hit the fixed `POST /api/automation/approval-boundary-test` route directly

Command boundary:

- use `npm run automation:runtime:http:verify` when you need pass/fail correctness and safety assertions
- use `npm run automation:runtime:inspect` when you need operator-readable current-state reporting and the JSON inspection report

Report envelope alignment:

- inspect, verify, and check now expose a more consistent top-level report contract
- compare `reportKind`, `overallStatus`, `sourceSummary`, `summary`, and `safetySummary` first
- then use each report’s role-specific fields for deeper detail

For `npm run automation:runtime:http:verify`:

- use the final `FINAL SUMMARY` block for the quick verifier result read
- use the `JSON REPORT` block for the machine-readable verifier result
- set `AUTOMATION_RUNTIME_VERIFY_REPORT_PATH` if you want the same verifier JSON report written to a local file
- in CI, inspect both `automation-runtime-http-verify-log` and `automation-runtime-http-verify-report` when you need preserved verifier diagnostics plus the structured verifier report

For `npm run automation:runtime:check`:

- use the final `FINAL SUMMARY` block for the quick combined runtime result
- use the `JSON REPORT` block for the combined machine-readable result
- set `AUTOMATION_RUNTIME_CHECK_REPORT_PATH` if you want the combined JSON report written to a local file
- in CI, inspect the `automation-runtime-check-report` artifact for the combined structured result built from the existing inspect and verifier reports
- if `AUTOMATION_RUNTIME_ARTIFACT_MANIFEST_PATH` is set during that same command, it also writes one runtime artifact manifest built from the existing inspect, verify, and check reports
- in CI, inspect the `automation-runtime-artifact-manifest` artifact when you want one concise index over the current runtime report artifacts

For `npm run automation:readiness:report`:

- use it when you want one combined automation result across the current smoke and runtime artifact outputs
- set `AUTOMATION_READINESS_REPORT_PATH` if you want the readiness JSON written to a local file
- in CI, inspect the `automation-readiness-report` artifact when you want one consolidated readiness view over smoke plus runtime
- this report is composition-only; it does not broaden smoke validation, runtime verification, or route behavior

For `npm run automation:runtime:inspect`:

- use the final `FINAL SUMMARY` block for the quick human read
- use the `JSON REPORT` block for the machine-readable inspection result
- set `AUTOMATION_RUNTIME_INSPECT_REPORT_PATH` if you want the same JSON report written to a local file
- in CI, inspect the `automation-runtime-inspect-report` artifact when you need the exact preserved runtime inspection JSON from that run

The inspection and simulation routes are intentionally narrow:

- they do not expose secret values
- they do not execute blocked work
- they do not resume blocked execution
- the approval-boundary test route stays fixed to `catalog.write.safe` and does not accept arbitrary capability ids
- the status route exposes verifier coverage as summary-only metadata, not raw logs or runtime internals
- the snapshot route is summary-only and is intended for quick current-state inspection, not execution or diagnostics
- the check route is summary-only and is intended for concise operator verification, not execution or diagnostics
- the local `automation:runtime:inspect` command is inspection-only and does not execute blocked work
- the local `automation:runtime:approval-boundary:test` command only exercises the fixed approval-boundary simulation route and does not broaden execution behavior

Focus on:

- read-only auto-run boundaries
- approval-required stop behavior
- outbound webhook delivery boundary
- inbound auth boundary
- receive-side intake and summary path
- no-resume safety

## 5. Record The Outcome

- Use [change-log-template.md](/workspaces/ai-interior/automation/change-log-template.md) after review.
- Record what changed, what was validated, which baseline decision was taken, whether the baseline was explicitly closed, whether the final-review / approval / closeout bundle stayed aligned, which readiness/runtime artifacts were checked, and what stayed blocked by design.
