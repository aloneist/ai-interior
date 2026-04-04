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
- narrow app runtime bridge routes now exist for approval-response intake, outbound webhook verification, and safe readiness summary
- no product runtime usage
- webhook env setup documented in [env-setup.md](/workspaces/ai-interior/automation/env-setup.md)
- operator workflow documented in [operator-runbook.md](/workspaces/ai-interior/automation/operator-runbook.md)
- contract stack documented in [contract-map.md](/workspaces/ai-interior/automation/contract-map.md)
- post-change review steps documented in [review-checklist.md](/workspaces/ai-interior/automation/review-checklist.md)
- post-change recording template documented in [change-log-template.md](/workspaces/ai-interior/automation/change-log-template.md)

Top-level folders:
- `capabilities/`: automation-facing contracts and registry placeholders
- `providers/`: provider-specific placeholder areas
- `orchestration/`: future workflow and approval routing structure
- `ci/`: future repository quality gate structure

Operator review order:
- [operator-runbook.md](/workspaces/ai-interior/automation/operator-runbook.md)
- [env-setup.md](/workspaces/ai-interior/automation/env-setup.md)
- [contract-map.md](/workspaces/ai-interior/automation/contract-map.md)
- [review-checklist.md](/workspaces/ai-interior/automation/review-checklist.md)
- [change-log-template.md](/workspaces/ai-interior/automation/change-log-template.md)
- [orchestration/n8n/approval-response-intake.ts](/workspaces/ai-interior/automation/orchestration/n8n/approval-response-intake.ts)
- [execution/execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts)
- [execution/types.ts](/workspaces/ai-interior/automation/execution/types.ts)
- [demo/README.md](/workspaces/ai-interior/automation/demo/README.md)
