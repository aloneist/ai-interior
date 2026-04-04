# Automation Change Log Template

Use this template after an automation-system change is reviewed.

Reference when needed:
- [contract-map.md](/workspaces/ai-interior/automation/contract-map.md) for the current contract stack
- [review-checklist.md](/workspaces/ai-interior/automation/review-checklist.md) for post-change verification steps

---

## Change Title

- Title:
- Date:
- Task ID:
- Author:

## Goal

- What was the intended automation-system change?
- Why was it needed?

## Files Changed

- List the touched files.

## Key Changes

- Contract changes:
- Runtime/execution changes:
- Documentation changes:
- Receive-side approval response changes:

Note:
- If there were no runtime or execution changes, state that explicitly.
- If this was documentation-only, state that explicitly.

## Validation Run

- Commands run:
- Smoke result:
- Lint result:
- Typecheck result:
- Approval response receive-side result:
- Smoke/CI alignment:
  - Did the exit code remain the primary CI signal?
  - Did `FINAL SUMMARY` remain the primary human quick read?
  - Did `JSON REPORT` remain the primary machine-readable summary?
  - Was the `automation-smoke-report` CI artifact checked when needed?
  - If the artifact was missing, was that noted explicitly?

If a command was not run, state why.

## Result Summary

- What is now true after this change?
- What remains unchanged by design?
- Did accepted approval responses remain blocked?

## Remaining Risks / Follow-Up

- What is still placeholder-only?
- What is intentionally not yet reachable?
- What should be checked next if this area changes again?
- If approval response handling changed, does the receive-side flow still avoid risky execution resume?

## Docs To Keep Aligned

- [contract-map.md](/workspaces/ai-interior/automation/contract-map.md)
- [review-checklist.md](/workspaces/ai-interior/automation/review-checklist.md)
- [demo/README.md](/workspaces/ai-interior/automation/demo/README.md)
- [orchestration/n8n/README.md](/workspaces/ai-interior/automation/orchestration/n8n/README.md)
- If smoke output or CI interpretation changed, confirm the exit code, `FINAL SUMMARY`, and `JSON REPORT` guidance stayed aligned.
- Other docs updated in this change:

## Approval / Review Status

- Review status:
- Approved by:
- Follow-up required:

## Short Final Diff Summary

- 1-3 bullets summarizing the highest-signal change outcomes.
