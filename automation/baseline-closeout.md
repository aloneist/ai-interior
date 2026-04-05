# Automation Baseline Closeout

Use this document when deciding that the current automation baseline is finished
and should stop expanding.

Status summary:
- [status-board.md](/workspaces/ai-interior/automation/status-board.md)

Next-phase handoff:
- [next-phase-handoff.md](/workspaces/ai-interior/automation/next-phase-handoff.md)

## Close This Baseline When

Treat the current automation baseline as closed only when:

- the baseline decision is already `approved baseline`
- the required artifact set is present and aligned:
  - `automation-smoke-report`
  - `automation/connection-loop-readiness.json`
  - lint result
  - typecheck result
  - build result
- the current final-review, baseline-approval, checklist, and change-log docs
  still match repository reality

## Do Not Extend This Baseline With

After closeout, do not keep expanding this baseline with:

- risky execution resume
- persistence or DB-backed automation state
- broad admin UI
- final DB structure redesign
- broad orchestration redesign
- more baseline-only reporting layers without a next-phase need

## Next Phase Starts With

The next phase should begin only with work that is clearly beyond the current
baseline, such as:

- explicitly approved resume behavior
- persistence-backed automation state
- broader orchestration/runtime integration
- UI or operator surfaces that depend on a closed baseline

## Record Closeout

Record closeout explicitly in the change log:

- baseline closed: `yes` or `no`
- next-phase boundary changed: `yes` or `no`
- follow-up belongs to:
  - `current baseline`
  - `next phase`
