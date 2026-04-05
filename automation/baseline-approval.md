# Automation Baseline Approval

Use this document to make the current automation baseline decision explicit.

Status summary:
- [status-board.md](/workspaces/ai-interior/automation/status-board.md)

Closeout summary:
- [baseline-closeout.md](/workspaces/ai-interior/automation/baseline-closeout.md)

Next-phase handoff:
- [next-phase-handoff.md](/workspaces/ai-interior/automation/next-phase-handoff.md)

## Decision States

### Approved Baseline

Approve the current automation baseline only when:

- the required artifact set is present and consistent:
  - `automation-smoke-report`
  - `automation/connection-loop-readiness.json`
  - lint result
  - typecheck result
  - build result
- smoke still shows read-only auto-run plus blocked approval-required write flow
- connection-loop validation still shows the current repo loop and direct-read readiness
- the deferred areas below remain deferred

### Hold For Follow-Up

Hold the baseline for follow-up when:

- any required artifact is missing or contradicts the others
- smoke, connection-loop validation, lint, typecheck, or build is not green
- docs no longer match the current artifact set or current safety boundary
- blocked execution appears to broaden beyond the current contract-only boundary

### Next-Phase Handoff

Move to the next phase only when:

- the baseline is already approved
- the repository no longer needs more baseline automation infrastructure work
- the next work is clearly about deferred areas rather than baseline alignment
- the closeout conditions in [baseline-closeout.md](/workspaces/ai-interior/automation/baseline-closeout.md) are satisfied

## Minimum Evidence

Check these before recording a decision:

1. [final-review.md](/workspaces/ai-interior/automation/final-review.md)
2. [operator-runbook.md](/workspaces/ai-interior/automation/operator-runbook.md)
3. the required CI or local evidence listed above
4. [baseline-closeout.md](/workspaces/ai-interior/automation/baseline-closeout.md) when recording a handoff or closeout decision

## Deferred To Next Phase

The current baseline still does not include:

- risky execution resume
- persistence
- broad admin UI
- final DB structure redesign
- broad orchestration redesign

## Recording The Decision

Record one explicit decision in the change log:

- `approved baseline`
- `hold for follow-up`
- `next-phase handoff`
