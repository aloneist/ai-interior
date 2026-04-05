# Automation Next-Phase Handoff

Use this document when handing the current automation baseline off to the next
implementation phase.

Main-phase kickoff:
- [main-phase-kickoff.md](/workspaces/ai-interior/docs/main-phase-kickoff.md)

## Current Automation Phase Ends Here

The current automation phase ends when:

- the baseline is already `approved baseline`
- the baseline is explicitly closed
- the required evidence remains aligned:
  - `automation-smoke-report`
  - `automation/connection-loop-readiness.json`
  - lint result
  - typecheck result
  - build result

## Evidence Required Before Handoff

Confirm these before handoff:

1. [status-board.md](/workspaces/ai-interior/automation/status-board.md)
2. [baseline-closeout.md](/workspaces/ai-interior/automation/baseline-closeout.md)
3. [baseline-approval.md](/workspaces/ai-interior/automation/baseline-approval.md)
4. [final-review.md](/workspaces/ai-interior/automation/final-review.md)
5. the required evidence listed above

## Next Phase Starts With

The next phase should start with work that depends on the closed baseline, such
as:

- explicitly approved resume behavior
- persistence-backed automation state
- broader orchestration/runtime integration
- UI or operator surfaces that should only follow a closed baseline

## Do Not Reopen This Baseline For

Do not reopen the current automation baseline for:

- more baseline-only reporting layers
- rewording closed baseline boundaries without a real phase change
- deferred items that clearly belong to the next phase
- broadening runtime behavior inside the closed baseline
