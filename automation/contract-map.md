# Automation Contract Map

This document maps the current automation contract stack for the non-product
automation scaffold.

Use this file first when reviewing:
- what the execution layer returns
- which contracts are always present versus optional
- which states are currently reachable in the current scaffold
- where real delivery is already present versus still placeholder-only

## Current Reachable Flow

Read-only auto-run flow:
1. capability request enters execution
2. provider is selected and executed
3. execution returns result plus derived execution contracts
4. export and handoff contracts are still built
5. transport-specific contracts remain honestly non-applicable

Approval-required flow:
1. capability request enters execution
2. approval boundary stops execution before provider work
3. approval handoff payload is built
4. narrow n8n webhook sender attempts delivery when `AUTOMATION_APPROVAL_WEBHOOK_URL` contains an `http(s)` URL
5. execution returns result plus derived approval, export, and handoff contracts

Approval-response receive-side flow:
1. external reviewer or orchestrator sends an approval response payload
2. response payload is normalized against current request/report/decision context
3. normalized intake result is derived as `accepted`, `rejected_invalid`, or `ignored_not_applicable`
4. reviewer-facing response summary is derived from that intake result
5. blocked execution still remains blocked in automation v1

## Contract Stack

| Contract | What It Represents | Created In | Presence | Current Reachable State |
| --- | --- | --- | --- | --- |
| read-only capability result | Safe provider result for `catalog.read` or `asset.search` | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) via provider executors | auto-run flows | reachable |
| approval boundary result | Structured stop for non-auto capabilities | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | approval-required flows | reachable |
| approval lifecycle | Current approval boundary progress | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | approval-required flows | `handoff_sent` and `handoff_not_sent` contract path |
| audit entry | Execution-layer event record | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | always | `executed` and `approval_required` reachable |
| run report | Single-run execution summary | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | always | reachable |
| review summary | Reviewer-facing execution summary | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | always | `info` and `needs_approval` reachable |
| decision envelope | Reviewer/orchestration decision placeholder | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | approval-related only | `deferred` reachable |
| approval response intake | Normalized inbound reviewer/orchestration response shape | [approval-response-intake.ts](/workspaces/ai-interior/automation/orchestration/n8n/approval-response-intake.ts) | orchestration/demo only | `accepted`, `rejected_invalid`, `ignored_not_applicable` contract path |
| approval response review summary | Reviewer-facing summary derived from normalized approval response intake | [approval-response-intake.ts](/workspaces/ai-interior/automation/orchestration/n8n/approval-response-intake.ts) | orchestration/demo only | `accepted`, `rejected_invalid`, `ignored_not_applicable` contract path |
| state snapshot | Current state of one execution | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | always | reachable |
| contract bundle | Grouped execution-layer contracts for one run | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | always | reachable |
| export envelope | Safe top-level handoff/logging envelope | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | always | reachable |
| export serializer | Stable object + JSON payload derived from export envelope | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | always | reachable |
| transport receipt | Attempted external handoff result | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | approval-related only | `sent`, `failed`, `not_configured` contract path |
| handoff summary | Reviewer-facing handoff state summary | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | always | `not_applicable`, `prepared`, `sent`, `needs_attention` contract path |
| delivery readiness | Whether external handoff is ready and what blocks it | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | always | `not_applicable`, `ready_for_handoff`, `blocked_not_sent`, `blocked_needs_attention` contract path |
| transport adapter | Replaceable future delivery boundary contract | [execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) | always | `adapter_not_applicable`, `adapter_ready_but_not_connected`, `adapter_sent` contract path |

## Presence Rules

Always present on every execution result:
- selection metadata
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

Only present on approval-related flows:
- approval metadata
- approval lifecycle
- n8n approval handoff payload
- webhook sender result
- decision envelope
- transport receipt

Absent by design on current read-only auto-run flows:
- decision envelope
- transport receipt

## Reachable Vs Placeholder

Currently reachable in repository reality:
- `catalog.read` auto-run
- `asset.search` auto-run
- approval-required stop for `catalog.write.safe`
- approval handoff payload creation
- real webhook delivery for approval-required flows when `AUTOMATION_APPROVAL_WEBHOOK_URL` contains an `http(s)` URL
- approval response intake normalization and validation without execution resume
- approval response review summary derivation without execution resume
- no-config safe fallback when `AUTOMATION_APPROVAL_WEBHOOK_URL` is absent or is not a webhook URL
- derived sent or blocked handoff/readiness/adapter states

Defined but not always reachable in the current scaffold:
- approval lifecycle `approved`
- approval lifecycle `rejected`
- decision states other than `deferred`
- handoff summary `needs_attention` unless webhook delivery fails after an attempt
- delivery readiness `blocked_needs_attention` unless webhook delivery fails after an attempt
- transport adapter `adapter_placeholder_blocked`

## Operator Review Order

When reviewing one automation run, inspect in this order:
1. [automation/demo/run-smoke-test.ts](/workspaces/ai-interior/automation/demo/run-smoke-test.ts) for current covered scenarios
2. [automation/execution/execute-capability.ts](/workspaces/ai-interior/automation/execution/execute-capability.ts) for where contracts are assembled
3. [automation/execution/types.ts](/workspaces/ai-interior/automation/execution/types.ts) for exact contract shapes
4. [automation/orchestration/n8n/approval-handoff.ts](/workspaces/ai-interior/automation/orchestration/n8n/approval-handoff.ts) for approval handoff payload
5. [automation/orchestration/n8n/webhook-placeholder-sender.ts](/workspaces/ai-interior/automation/orchestration/n8n/webhook-placeholder-sender.ts) for the current webhook delivery boundary
6. [automation/orchestration/n8n/approval-response-intake.ts](/workspaces/ai-interior/automation/orchestration/n8n/approval-response-intake.ts) for receive-side normalization and reviewer summary

## Current Boundaries

What the scaffold does now:
- executes explicit read-only provider paths
- blocks risky capabilities at the approval boundary
- derives review/export/handoff contracts from the execution result
- can attempt a narrow real n8n webhook delivery for approval-required handoff only
- can normalize and validate a narrow external approval response payload without resuming execution
- can derive a reviewer-facing approval response summary from that normalized intake result

What the scaffold does not do now:
- no risky execution resume from approval responses
- no persistence or DB logging for automation contracts
- no product runtime integration
- no workflow engine execution
