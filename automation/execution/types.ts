import type {
  ApprovalLifecycleState,
  CapabilityId,
  CapabilityRequest,
  CapabilityResult,
} from "@/automation/capabilities/types"
import type { ProviderCapabilityMatch, ProviderId } from "@/automation/providers"

export type ExecuteCapabilityOptions = {
  preferredProviderId?: ProviderId
}

export type CapabilityExecutionSelection<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  requestedCapabilityId: TCapabilityId
  executionMode: "auto-allowed" | "approval-required"
  selectedProviderId?: ProviderId
  availableReadyProviderIds: ProviderId[]
}

export type AutomationAuditOutcomeStatus =
  | "executed"
  | "approval_required"
  | "failed"

export type AutomationAuditEntry<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  eventId: string
  recordedAt: string
  requestId: string
  capabilityId: TCapabilityId
  operation?: string
  actorId?: string
  executionMode: CapabilityExecutionSelection<TCapabilityId>["executionMode"]
  outcomeStatus: AutomationAuditOutcomeStatus
  approvalLifecycleState?: ApprovalLifecycleState
  providerId?: ProviderId
  sourceSummary?: string
  errorCode?: string
}

export type AutomationRunFinalStatus =
  | "executed"
  | "approval_required"
  | "failed"

export type AutomationRunReport<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  reportId: string
  generatedAt: string
  requestId: string
  capabilityId: TCapabilityId
  operation?: string
  actorId?: string
  executionMode: CapabilityExecutionSelection<TCapabilityId>["executionMode"]
  finalStatus: AutomationRunFinalStatus
  providerId?: ProviderId
  sourceSummary?: string
  approvalState?: ApprovalLifecycleState
  auditEventId: string
  errorCode?: string
}

export type AutomationReviewStatus =
  | "info"
  | "needs_approval"
  | "needs_attention"

export type AutomationReviewSummary<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  summaryId: string
  generatedAt: string
  requestId: string
  capabilityId: TCapabilityId
  operation?: string
  executionMode: CapabilityExecutionSelection<TCapabilityId>["executionMode"]
  reviewStatus: AutomationReviewStatus
  finalStatus: AutomationRunFinalStatus
  providerSummary?: string
  approvalState?: ApprovalLifecycleState
  errorSummary?: string
  reportId: string
}

export type AutomationDecision =
  | "approved"
  | "rejected"
  | "needs_revision"
  | "deferred"

export type AutomationDecisionSource = "human_reviewer" | "orchestration_placeholder"

export type AutomationDecisionEnvelope<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  decisionId: string
  decidedAt: string
  requestId: string
  reportId: string
  capabilityId: TCapabilityId
  decisionSource: AutomationDecisionSource
  decision: AutomationDecision
  note: string
  nextAction?: "wait_for_approval" | "revise_request" | "stop_execution"
}

export type CapabilityExecutionResult<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  selection: CapabilityExecutionSelection<TCapabilityId>
  result: CapabilityResult<TCapabilityId>
  audit: AutomationAuditEntry<TCapabilityId>
  report: AutomationRunReport<TCapabilityId>
  reviewSummary: AutomationReviewSummary<TCapabilityId>
  decisionEnvelope?: AutomationDecisionEnvelope<TCapabilityId>
}

export type CapabilityExecutionHandler = <
  TCapabilityId extends CapabilityId,
>(
  request: CapabilityRequest<TCapabilityId>,
  options?: ExecuteCapabilityOptions
) => Promise<CapabilityExecutionResult<TCapabilityId>>

export type ReadyProviderMatch<TCapabilityId extends CapabilityId = CapabilityId> =
  ProviderCapabilityMatch<TCapabilityId>
