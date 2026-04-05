# Automation Review Checklist

Use this checklist after any automation-system change.

Read first:
- [contract-map.md](/workspaces/ai-interior/automation/contract-map.md)
- [demo/README.md](/workspaces/ai-interior/automation/demo/README.md)

## When To Run Commands

Run `npm run automation:smoke` when:
- execution contracts changed
- orchestration placeholder contracts changed
- approval response intake or response summary contracts changed
- smoke output expectations changed
- smoke exit-code, final summary, or JSON report expectations changed
- provider behavior for `catalog.read` or `asset.search` changed

Run `npm run lint` when:
- TypeScript or JavaScript files changed
- code comments inside code files changed

Run `npx tsc --noEmit` when:
- execution/orchestration/provider types changed
- any TypeScript code changed

Documentation-only changes:
- review the touched docs directly
- run `git diff` on the changed documentation files

## Always-Present Checks

- Read-only flows still auto-run through the execution service.
- `catalog.read` still uses the explicit `list_active_furniture_products` operation.
- `asset.search` still uses the explicit `search_design_reference_assets` operation.
- Smoke still covers both read-only flows and one approval-required flow.
- Every execution result still surfaces:
  - audit entry
  - run report
  - review summary
  - state snapshot
  - contract bundle
  - export envelope
  - export serializer
  - handoff summary
  - delivery readiness
  - transport adapter
- Non-handoff read-only flows still stay honest:
  - no decision envelope
  - no transport receipt
  - handoff summary is `not_applicable`
  - delivery readiness is `not_applicable`
  - transport adapter is `adapter_not_applicable`

## Approval-Only Checks

- `catalog.write.safe` still stops at the approval boundary.
- Approval-required execution still returns `APPROVAL_REQUIRED`.
- Approval handoff payload still exists for approval-required flows.
- Webhook sender still only applies to approval-required flows.
- Approval lifecycle still exists and now reflects either safe blocked delivery or `handoff_sent` when delivery succeeds.
- Decision envelope is still approval-only and currently resolves to `deferred`.
- Transport receipt is still approval-only and reflects real webhook delivery results or safe no-config/failure outcomes.
- Handoff summary remains approval-only meaningful and should honestly reflect sent vs blocked delivery state.
- Delivery readiness should match the actual handoff outcome.
- Transport adapter should match the webhook boundary rather than imply generic delivery.
- Accepted approval responses still do not resume blocked execution.

## Approval-Response Receive-Side Checks

- Approval response intake still validates against current `requestId`, `reportId`, `capabilityId`, and `decisionId` context.
- Approval response intake still distinguishes:
  - `accepted`
  - `rejected_invalid`
  - `ignored_not_applicable`
- Approval response review summary is still derived from intake rather than a parallel receive-side system.
- Smoke still shows accepted, invalid, and not-applicable approval response cases.
- Receive-side approval response handling still remains informational only:
  - no risky execution resume
  - no persistence
  - no inbound API/runtime surface implied by the docs

## Reachable-State Checks

- Reachable read-only states remain:
  - executed audit/report path
  - review summary `info`
- Reachable approval states remain:
  - review summary `needs_approval`
  - decision envelope `deferred`
  - lifecycle `handoff_sent` or `handoff_not_sent`
  - delivery readiness `ready_for_handoff` or blocked state
  - transport adapter `adapter_sent` or blocked/not-applicable state
- Placeholder-only future states are not accidentally made reachable unless intentionally changed and documented.

## Documentation Alignment Checks

- [contract-map.md](/workspaces/ai-interior/automation/contract-map.md) still matches repository reality.
- [README.md](/workspaces/ai-interior/automation/README.md) still points reviewers to the right starting documents.
- [baseline-closeout.md](/workspaces/ai-interior/automation/baseline-closeout.md) still reflects the current closeout boundary honestly.
- [baseline-approval.md](/workspaces/ai-interior/automation/baseline-approval.md) still reflects the current decision states honestly.
- [final-review.md](/workspaces/ai-interior/automation/final-review.md) still reflects the current baseline honestly.
- [demo/README.md](/workspaces/ai-interior/automation/demo/README.md) still matches current smoke coverage and boundaries.
- Smoke interpretation still stays aligned:
  - CI trusts the smoke exit code first
  - `FINAL SUMMARY` remains the primary human quick read
  - `JSON REPORT` remains the primary machine-readable summary
  - the `automation-smoke-report` artifact remains the CI copy of that machine-readable summary
  - if the CI artifact is missing, note that and fall back to the job log output
- If a contract is added, removed, or renamed, update the contract map and this checklist in the same change.
- If approval response receive-side contracts change, update the change log template in the same change when needed.

## Final Baseline Review Checks

- Final review still checks the current artifact set in one place:
  - `automation-smoke-report`
  - `automation/connection-loop-readiness.json`
  - lint result
  - typecheck result
  - build result
- The final-review bundle still makes the current baseline explicit:
  - what is included now
  - what is intentionally deferred
  - what “approved baseline” means
- The baseline-approval bundle still makes the current decision path explicit:
  - `approved baseline`
  - `hold for follow-up`
  - `next-phase handoff`
- The baseline-closeout bundle still makes the stop/continue boundary explicit:
  - when the current baseline is closed
  - what work should stop here
  - what belongs to the next phase
- Minimum evidence for the baseline decision still stays explicit and artifact-based.

## Minimal Review Flow

1. Read [baseline-approval.md](/workspaces/ai-interior/automation/baseline-approval.md).
2. Read [final-review.md](/workspaces/ai-interior/automation/final-review.md).
3. Read [contract-map.md](/workspaces/ai-interior/automation/contract-map.md).
4. Run `npm run automation:smoke` when behavior or contracts changed.
5. If code changed, run `npm run lint` and `npx tsc --noEmit`.
6. Confirm read-only flows still auto-run and approval-required flows still stop.
7. Confirm delivery remains scoped to approval-required handoff only and never auto-executes risky work.
8. Confirm accepted approval responses remain blocked and only affect receive-side intake/summary contracts.
9. Confirm the current smoke, connection-loop validation, and repo validation results still align as one reviewable baseline.
10. Record one explicit decision: `approved baseline`, `hold for follow-up`, or `next-phase handoff`.
11. If the baseline is done, confirm closeout explicitly and stop baseline-only automation expansion here.
