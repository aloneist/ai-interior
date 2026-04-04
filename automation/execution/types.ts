import type {
  ApprovalLifecycleState,
  CapabilityId,
  CapabilityRequest,
  CapabilityResult,
} from "@/automation/capabilities/types"
import type { N8nWebhookDeliveryResult } from "@/automation/orchestration/n8n/webhook-placeholder-sender"
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

export type AutomationStateSnapshot<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  snapshotId: string
  generatedAt: string
  requestId: string
  capabilityId: TCapabilityId
  operation?: string
  actorId?: string
  executionMode: CapabilityExecutionSelection<TCapabilityId>["executionMode"]
  finalStatus: AutomationRunFinalStatus
  approvalLifecycleState?: ApprovalLifecycleState
  reviewStatus?: AutomationReviewStatus
  decisionState?: AutomationDecision
  reportId: string
  auditEventId: string
}

export type AutomationContractBundle<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  bundleId: string
  generatedAt: string
  requestId: string
  capabilityId: TCapabilityId
  executionMode: CapabilityExecutionSelection<TCapabilityId>["executionMode"]
  finalStatus: AutomationRunFinalStatus
  audit: AutomationAuditEntry<TCapabilityId>
  report: AutomationRunReport<TCapabilityId>
  reviewSummary: AutomationReviewSummary<TCapabilityId>
  decisionEnvelope?: AutomationDecisionEnvelope<TCapabilityId>
  stateSnapshot: AutomationStateSnapshot<TCapabilityId>
}

export type AutomationExportEnvelopeTarget = "external_handoff" | "safe_audit_log"

export type AutomationExportEnvelope<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  envelopeId: string
  generatedAt: string
  exportTarget: AutomationExportEnvelopeTarget
  requestId: string
  capabilityId: TCapabilityId
  executionMode: CapabilityExecutionSelection<TCapabilityId>["executionMode"]
  finalStatus: AutomationRunFinalStatus
  approvalState?: ApprovalLifecycleState
  reviewStatus?: AutomationReviewStatus
  reportId: string
  auditEventId: string
  bundle: AutomationContractBundle<TCapabilityId>
}

export type AutomationSerializedExportPayload<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  envelopeId: string
  exportTarget: AutomationExportEnvelopeTarget
  requestId: string
  capabilityId: TCapabilityId
  executionMode: CapabilityExecutionSelection<TCapabilityId>["executionMode"]
  finalStatus: AutomationRunFinalStatus
  approvalState?: ApprovalLifecycleState
  reviewStatus?: AutomationReviewStatus
  reportId: string
  auditEventId: string
  bundle: AutomationContractBundle<TCapabilityId>
}

export type AutomationExportSerializer<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  serializerVersion: "v1"
  serializedAt: string
  contentType: "application/json"
  envelopeId: string
  exportTarget: AutomationExportEnvelopeTarget
  succeeded: boolean
  payloadObject: AutomationSerializedExportPayload<TCapabilityId>
  payloadJson: string
}

export type AutomationTransportReceipt<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  receiptId: string
  issuedAt: string
  envelopeId: string
  exportTarget: AutomationExportEnvelopeTarget
  contentType: AutomationExportSerializer<TCapabilityId>["contentType"]
  attempted: boolean
  delivered: boolean
  deliveryMode: N8nWebhookDeliveryResult["deliveryMode"]
  status: N8nWebhookDeliveryResult["status"]
  reason?: string
  payloadByteLength: number
  httpStatus?: number
}

export type AutomationHandoffStatus =
  | "not_applicable"
  | "prepared"
  | "attempted_not_sent"
  | "sent"
  | "needs_attention"

export type AutomationHandoffSummary<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  handoffSummaryId: string
  generatedAt: string
  requestId: string
  capabilityId: TCapabilityId
  exportTarget: AutomationExportEnvelopeTarget
  handoffStatus: AutomationHandoffStatus
  deliveryMode?: AutomationTransportReceipt<TCapabilityId>["deliveryMode"]
  attempted: boolean
  delivered: boolean
  payloadByteLength?: number
  reason?: string
  envelopeId: string
  receiptId?: string
}

export type AutomationDeliveryReadinessStatus =
  | "not_applicable"
  | "ready_for_handoff"
  | "blocked_not_sent"
  | "blocked_needs_attention"

export type AutomationDeliveryReadiness<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  readinessId: string
  evaluatedAt: string
  requestId: string
  capabilityId: TCapabilityId
  exportTarget?: AutomationExportEnvelopeTarget
  readinessStatus: AutomationDeliveryReadinessStatus
  isReady: boolean
  blockingReason?: string
  handoffStatus?: AutomationHandoffSummary<TCapabilityId>["handoffStatus"]
  envelopeId?: string
  receiptId?: string
}

export type AutomationTransportAdapterStatus =
  | "adapter_not_applicable"
  | "adapter_placeholder_blocked"
  | "adapter_ready_but_not_connected"
  | "adapter_sent"

export type AutomationTransportAdapterInput<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  adapterTarget: AutomationExportEnvelopeTarget
  contentType: AutomationExportSerializer<TCapabilityId>["contentType"]
  serializerVersion: AutomationExportSerializer<TCapabilityId>["serializerVersion"]
  envelopeId: string
}

export type AutomationTransportAdapterResult<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  adapterId: "n8n-webhook-transport"
  adapterTarget?: AutomationExportEnvelopeTarget
  acceptedInputType: "serialized_export_payload"
  status: AutomationTransportAdapterStatus
  deliveryAttempted: boolean
  deliveryPossible: boolean
  blockedReason?: string
  input?: AutomationTransportAdapterInput<TCapabilityId>
  receiptId?: string
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
  stateSnapshot: AutomationStateSnapshot<TCapabilityId>
  contractBundle: AutomationContractBundle<TCapabilityId>
  exportEnvelope: AutomationExportEnvelope<TCapabilityId>
  exportSerializer: AutomationExportSerializer<TCapabilityId>
  transportReceipt?: AutomationTransportReceipt<TCapabilityId>
  handoffSummary: AutomationHandoffSummary<TCapabilityId>
  deliveryReadiness: AutomationDeliveryReadiness<TCapabilityId>
  transportAdapter: AutomationTransportAdapterResult<TCapabilityId>
}

export type CapabilityExecutionHandler = <
  TCapabilityId extends CapabilityId,
>(
  request: CapabilityRequest<TCapabilityId>,
  options?: ExecuteCapabilityOptions
) => Promise<CapabilityExecutionResult<TCapabilityId>>

export type ReadyProviderMatch<TCapabilityId extends CapabilityId = CapabilityId> =
  ProviderCapabilityMatch<TCapabilityId>
