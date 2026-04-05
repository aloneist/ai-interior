# Main Phase Kickoff

Use this document to start the first implementation phase after automation
baseline closeout.

## Fixed Reference Point

The automation baseline is closed and now acts as the fixed reference point for
the next phase.

Do not reopen the closed automation baseline for:

- more automation baseline reporting layers
- boundary rewrites without a real phase change
- deferred automation work that now clearly belongs to the next phase

Reference:
- [next-phase-handoff.md](/workspaces/ai-interior/automation/next-phase-handoff.md)

## Next Phase Starts With

The next phase starts from the current repository state, not from a new
automation redesign.

Initial priorities:

1. recommendation quality on the current product path
2. operational data structure needed to support that recommendation path
3. QA around the current room-analysis and purchasable furniture flow
4. MVP purchasable furniture recommendation flow hardening

## Immediate Non-Goals

Do not immediately reopen:

- closed automation baseline infrastructure
- broad runtime/orchestration redesign
- broad UI planning unrelated to the first product implementation priorities

## Choosing First Tasks

Pick the next tasks only if they directly improve one of the four priorities
above and do not require reopening the closed automation baseline.
