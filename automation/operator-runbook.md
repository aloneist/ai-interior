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
