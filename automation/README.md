# Automation

This directory holds the non-product automation scaffold for `AI-INTERIOR`.

Current goals:
- keep automation structure separate from product logic
- separate capability definitions from provider implementations
- reserve space for orchestration and CI
- stay safe to extend later without changing app behavior

Current status:
- scaffold plus narrow automation-only contracts
- narrow real outbound webhook delivery for approval-required handoff only
- narrow receive-side approval response normalization and reviewer summary only
- narrow app runtime bridge routes now exist for approval-response intake, approval-boundary simulation, outbound webhook verification, safe readiness summary, concise status summary, concise runtime snapshot, concise runtime check, route inventory inspection, approval-response sample discovery, and overview inspection
- operator-friendly local commands now exist for runtime bridge inspection and fixed approval-boundary simulation
- no product runtime usage
- webhook env setup documented in [env-setup.md](/workspaces/ai-interior/automation/env-setup.md)
- connection and human/Codex loop readiness documented in [connection-loop-readiness.md](/workspaces/ai-interior/automation/connection-loop-readiness.md)
- operator workflow documented in [operator-runbook.md](/workspaces/ai-interior/automation/operator-runbook.md)
- baseline status board documented in [status-board.md](/workspaces/ai-interior/automation/status-board.md)
- final baseline review documented in [final-review.md](/workspaces/ai-interior/automation/final-review.md)
- baseline approval decision documented in [baseline-approval.md](/workspaces/ai-interior/automation/baseline-approval.md)
- baseline closeout boundary documented in [baseline-closeout.md](/workspaces/ai-interior/automation/baseline-closeout.md)
- next-phase handoff documented in [next-phase-handoff.md](/workspaces/ai-interior/automation/next-phase-handoff.md)
- contract stack documented in [contract-map.md](/workspaces/ai-interior/automation/contract-map.md)
- post-change review steps documented in [review-checklist.md](/workspaces/ai-interior/automation/review-checklist.md)
- post-change recording template documented in [change-log-template.md](/workspaces/ai-interior/automation/change-log-template.md)

Top-level folders:
- `capabilities/`: automation-facing contracts and registry placeholders
- `providers/`: provider-specific placeholder areas
- `orchestration/`: future workflow and approval routing structure
- `ci/`: future repository quality gate structure

Operator review order:
- [next-phase-handoff.md](/workspaces/ai-interior/automation/next-phase-handoff.md)
- [status-board.md](/workspaces/ai-interior/automation/status-board.md)
- [baseline-closeout.md](/workspaces/ai-interior/automation/baseline-closeout.md)
- [baseline-approval.md](/workspaces/ai-interior/automation/baseline-approval.md)
- [final-review.md](/workspaces/ai-interior/automation/final-review.md)
- [operator-runbook.md](/workspaces/ai-interior/automation/operator-runbook.md)
- [connection-loop-readiness.md](/workspaces/ai-interior/automation/connection-loop-readiness.md)
- [env-setup.md](/workspaces/ai-interior/automation/env-setup.md)
- [contract-map.md](/workspaces/ai-interior/automation/contract-map.md)
- [review-checklist.md](/workspaces/ai-interior/automation/review-checklist.md)
- [change-log-template.md](/workspaces/ai-interior/automation/change-log-template.md)
- [orchestration/n8n/approval-response-intake.ts](/workspaces/ai-interior/automation/orchestration/n8n/approval-response-intake.ts)
- [execution/execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts)
- [execution/types.ts](/workspaces/ai-interior/automation/execution/types.ts)
- [demo/README.md](/workspaces/ai-interior/automation/demo/README.md)
