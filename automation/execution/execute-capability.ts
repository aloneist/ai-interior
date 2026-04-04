import type {
  ApprovalLifecycleState,
  CapabilityId,
  CapabilityRequest,
  CapabilityResult,
} from "@/automation/capabilities/types"
import { getCapabilityDefinition } from "@/automation/capabilities/registry"
import { buildN8nApprovalHandoff } from "@/automation/orchestration/n8n/approval-handoff"
import { sendN8nWebhookPlaceholder } from "@/automation/orchestration/n8n/webhook-placeholder-sender"
import { resolveReadyProvidersByCapability } from "@/automation/providers"
import type { ProviderId } from "@/automation/providers"
import type {
  CapabilityExecutionResult,
  ExecuteCapabilityOptions,
  ReadyProviderMatch,
} from "@/automation/execution/types"

function getRequestId<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>
): string {
  return request.requestId ?? `execution-${request.capabilityId}-${Date.now()}`
}

function getOperationPreview<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>
): string | undefined {
  const operation = (request.payload as { operation?: unknown }).operation
  return typeof operation === "string" ? operation : undefined
}

function getSourceSummary<TCapabilityId extends CapabilityId>(
  result: CapabilityResult<TCapabilityId>
): string | undefined {
  const source = (result.data as { source?: unknown } | undefined)?.source
  return typeof source === "string" ? source : undefined
}

function buildExecutionAuditEntry<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>,
  selection: CapabilityExecutionResult<TCapabilityId>["selection"],
  result: CapabilityResult<TCapabilityId>
): CapabilityExecutionResult<TCapabilityId>["audit"] {
  return {
    eventId: `audit-${getRequestId(request)}`,
    recordedAt: new Date().toISOString(),
    requestId: getRequestId(request),
    capabilityId: request.capabilityId,
    operation: getOperationPreview(request),
    actorId: request.actorId,
    executionMode: selection.executionMode,
    outcomeStatus: result.ok
      ? "executed"
      : result.error?.code === "APPROVAL_REQUIRED"
        ? "approval_required"
        : "failed",
    approvalLifecycleState: result.approval?.lifecycle?.currentState,
    providerId: result.providerId ?? selection.selectedProviderId,
    sourceSummary: getSourceSummary(result),
    errorCode: result.error?.code,
  }
}

function buildExecutionRunReport<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>,
  selection: CapabilityExecutionResult<TCapabilityId>["selection"],
  result: CapabilityResult<TCapabilityId>,
  audit: CapabilityExecutionResult<TCapabilityId>["audit"]
): CapabilityExecutionResult<TCapabilityId>["report"] {
  return {
    reportId: `report-${audit.eventId}`,
    generatedAt: audit.recordedAt,
    requestId: audit.requestId,
    capabilityId: request.capabilityId,
    operation: audit.operation,
    actorId: request.actorId,
    executionMode: selection.executionMode,
    finalStatus: audit.outcomeStatus,
    providerId: audit.providerId,
    sourceSummary: audit.sourceSummary,
    approvalState: audit.approvalLifecycleState,
    auditEventId: audit.eventId,
    errorCode: audit.errorCode,
  }
}

function buildExecutionReviewSummary<TCapabilityId extends CapabilityId>(
  report: CapabilityExecutionResult<TCapabilityId>["report"]
): CapabilityExecutionResult<TCapabilityId>["reviewSummary"] {
  return {
    summaryId: `review-${report.reportId}`,
    generatedAt: report.generatedAt,
    requestId: report.requestId,
    capabilityId: report.capabilityId,
    operation: report.operation,
    executionMode: report.executionMode,
    reviewStatus:
      report.finalStatus === "approval_required"
        ? "needs_approval"
        : report.finalStatus === "failed"
          ? "needs_attention"
          : "info",
    finalStatus: report.finalStatus,
    providerSummary: report.sourceSummary ?? report.providerId,
    approvalState: report.approvalState,
    errorSummary: report.errorCode,
    reportId: report.reportId,
  }
}

function buildExecutionDecisionEnvelope<TCapabilityId extends CapabilityId>(
  reviewSummary: CapabilityExecutionResult<TCapabilityId>["reviewSummary"]
): CapabilityExecutionResult<TCapabilityId>["decisionEnvelope"] {
  if (reviewSummary.reviewStatus !== "needs_approval") {
    return undefined
  }

  return {
    decisionId: `decision-${reviewSummary.summaryId}`,
    decidedAt: reviewSummary.generatedAt,
    requestId: reviewSummary.requestId,
    reportId: reviewSummary.reportId,
    capabilityId: reviewSummary.capabilityId,
    decisionSource: "orchestration_placeholder",
    decision: "deferred",
    note: "Approval-required execution is waiting for an external reviewer or orchestration decision.",
    nextAction: "wait_for_approval",
  }
}

function buildNoReadyProviderResult<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>,
  preferredProviderId?: ProviderId
): CapabilityResult<TCapabilityId> {
  const preferredProviderMessage = preferredProviderId
    ? ` Preferred provider ${preferredProviderId} is not ready for ${request.capabilityId}.`
    : ""

  return {
    capabilityId: request.capabilityId,
    ok: false,
    error: {
      code: "NO_READY_PROVIDER",
      message: `No ready provider found for ${request.capabilityId}.${preferredProviderMessage}`,
    },
  }
}

function buildApprovalRequiredResult<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>
): CapabilityResult<TCapabilityId> {
  const capabilityDefinition = getCapabilityDefinition(request.capabilityId)
  const { executionPolicy } = capabilityDefinition

  if (executionPolicy.mode !== "approval-required") {
    const approval = {
      status: "required" as const,
      riskLevel: "medium" as const,
      reason: "Approval is required before this operation can run.",
    }
    const handoff = buildN8nApprovalHandoff(request, approval)
    const senderResult = sendN8nWebhookPlaceholder(handoff)
    const lifecycle = buildApprovalLifecycle(senderResult.status)

    return {
      capabilityId: request.capabilityId,
      ok: false,
      approval: {
        ...approval,
        handoff,
        senderResult,
        lifecycle,
      },
      error: {
        code: "APPROVAL_REQUIRED",
        message: "Approval is required before this capability can be executed.",
      },
    }
  }

  const approval = {
    status: "required" as const,
    riskLevel: executionPolicy.riskLevel,
    reason: executionPolicy.reason,
  }
  const handoff = buildN8nApprovalHandoff(request, approval)
  const senderResult = sendN8nWebhookPlaceholder(handoff)
  const lifecycle = buildApprovalLifecycle(senderResult.status)

  return {
    capabilityId: request.capabilityId,
    ok: false,
    approval: {
      ...approval,
      handoff,
      senderResult,
      lifecycle,
    },
    error: {
      code: "APPROVAL_REQUIRED",
      message: executionPolicy.reason,
    },
  }
}

function buildApprovalLifecycle(
  senderStatus: "not_sent"
): {
  currentState: ApprovalLifecycleState
  reachedStates: ApprovalLifecycleState[]
  availableStates: ApprovalLifecycleState[]
} {
  const reachedStates: ApprovalLifecycleState[] = [
    "approval_required",
    "handoff_prepared",
  ]

  if (senderStatus === "not_sent") {
    reachedStates.push("handoff_not_sent")
  }

  return {
    currentState: senderStatus === "not_sent" ? "handoff_not_sent" : "handoff_prepared",
    reachedStates,
    availableStates: [
      "approval_required",
      "handoff_prepared",
      "handoff_not_sent",
      "handoff_sent",
      "approved",
      "rejected",
    ],
  }
}

function selectReadyProvider<TCapabilityId extends CapabilityId>(
  readyProviders: ReadyProviderMatch<TCapabilityId>[],
  preferredProviderId?: ProviderId
): ReadyProviderMatch<TCapabilityId> | undefined {
  if (preferredProviderId) {
    return readyProviders.find(
      (provider) => provider.providerId === preferredProviderId
    )
  }

  return readyProviders[0]
}

export async function executeCapability<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>,
  options?: ExecuteCapabilityOptions
): Promise<CapabilityExecutionResult<TCapabilityId>> {
  const capabilityDefinition = getCapabilityDefinition(request.capabilityId)

  if (capabilityDefinition.executionPolicy.mode === "approval-required") {
    const selection = {
      requestedCapabilityId: request.capabilityId,
      executionMode: "approval-required" as const,
      selectedProviderId: undefined,
      availableReadyProviderIds: [],
    }
    const result = buildApprovalRequiredResult(request)
    const audit = buildExecutionAuditEntry(request, selection, result)
    const report = buildExecutionRunReport(request, selection, result, audit)
    const reviewSummary = buildExecutionReviewSummary(report)

    return {
      selection,
      result,
      audit,
      report,
      reviewSummary,
      decisionEnvelope: buildExecutionDecisionEnvelope(reviewSummary),
    }
  }

  const readyProviders = resolveReadyProvidersByCapability(request.capabilityId)
  const selectedProvider = selectReadyProvider(
    readyProviders,
    options?.preferredProviderId
  )

  if (!selectedProvider) {
    const selection = {
      requestedCapabilityId: request.capabilityId,
      executionMode: "auto-allowed" as const,
      selectedProviderId: undefined,
      availableReadyProviderIds: readyProviders.map((provider) => provider.providerId),
    }
    const result = buildNoReadyProviderResult(request, options?.preferredProviderId)
    const audit = buildExecutionAuditEntry(request, selection, result)
    const report = buildExecutionRunReport(request, selection, result, audit)
    const reviewSummary = buildExecutionReviewSummary(report)

    return {
      selection,
      result,
      audit,
      report,
      reviewSummary,
      decisionEnvelope: buildExecutionDecisionEnvelope(reviewSummary),
    }
  }

  const result = await selectedProvider.executor.execute(request, {
    requestId: request.requestId,
    actorId: request.actorId,
  })

  const selection = {
    requestedCapabilityId: request.capabilityId,
    executionMode: "auto-allowed" as const,
    selectedProviderId: selectedProvider.providerId,
    availableReadyProviderIds: readyProviders.map((provider) => provider.providerId),
  }
  const audit = buildExecutionAuditEntry(request, selection, result)
  const report = buildExecutionRunReport(request, selection, result, audit)
  const reviewSummary = buildExecutionReviewSummary(report)

  return {
    selection,
    result,
    audit,
    report,
    reviewSummary,
    decisionEnvelope: buildExecutionDecisionEnvelope(reviewSummary),
  }
}
