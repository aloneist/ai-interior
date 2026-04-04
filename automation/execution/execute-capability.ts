import type {
  ApprovalLifecycleState,
  CapabilityId,
  CapabilityRequest,
  CapabilityResult,
} from "@/automation/capabilities/types"
import { getCapabilityDefinition } from "@/automation/capabilities/registry"
import { buildN8nApprovalHandoff } from "@/automation/orchestration/n8n/approval-handoff"
import { sendN8nWebhookDelivery } from "@/automation/orchestration/n8n/webhook-placeholder-sender"
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

function buildExecutionStateSnapshot<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>,
  report: CapabilityExecutionResult<TCapabilityId>["report"],
  reviewSummary: CapabilityExecutionResult<TCapabilityId>["reviewSummary"],
  decisionEnvelope?: CapabilityExecutionResult<TCapabilityId>["decisionEnvelope"]
): CapabilityExecutionResult<TCapabilityId>["stateSnapshot"] {
  return {
    snapshotId: `snapshot-${report.reportId}`,
    generatedAt: report.generatedAt,
    requestId: report.requestId,
    capabilityId: report.capabilityId,
    operation: report.operation,
    actorId: request.actorId,
    executionMode: report.executionMode,
    finalStatus: report.finalStatus,
    approvalLifecycleState: report.approvalState,
    reviewStatus: reviewSummary.reviewStatus,
    decisionState: decisionEnvelope?.decision,
    reportId: report.reportId,
    auditEventId: report.auditEventId,
  }
}

function buildExecutionContractBundle<TCapabilityId extends CapabilityId>(
  selection: CapabilityExecutionResult<TCapabilityId>["selection"],
  audit: CapabilityExecutionResult<TCapabilityId>["audit"],
  report: CapabilityExecutionResult<TCapabilityId>["report"],
  reviewSummary: CapabilityExecutionResult<TCapabilityId>["reviewSummary"],
  stateSnapshot: CapabilityExecutionResult<TCapabilityId>["stateSnapshot"],
  decisionEnvelope?: CapabilityExecutionResult<TCapabilityId>["decisionEnvelope"]
): CapabilityExecutionResult<TCapabilityId>["contractBundle"] {
  return {
    bundleId: `bundle-${report.reportId}`,
    generatedAt: report.generatedAt,
    requestId: report.requestId,
    capabilityId: report.capabilityId,
    executionMode: selection.executionMode,
    finalStatus: report.finalStatus,
    audit,
    report,
    reviewSummary,
    decisionEnvelope,
    stateSnapshot,
  }
}

function buildExecutionExportEnvelope<TCapabilityId extends CapabilityId>(
  contractBundle: CapabilityExecutionResult<TCapabilityId>["contractBundle"]
): CapabilityExecutionResult<TCapabilityId>["exportEnvelope"] {
  return {
    envelopeId: `export-${contractBundle.bundleId}`,
    generatedAt: contractBundle.generatedAt,
    exportTarget: "external_handoff",
    requestId: contractBundle.requestId,
    capabilityId: contractBundle.capabilityId,
    executionMode: contractBundle.executionMode,
    finalStatus: contractBundle.finalStatus,
    approvalState: contractBundle.stateSnapshot.approvalLifecycleState,
    reviewStatus: contractBundle.stateSnapshot.reviewStatus,
    reportId: contractBundle.report.reportId,
    auditEventId: contractBundle.audit.eventId,
    bundle: contractBundle,
  }
}

function buildExecutionExportSerializer<TCapabilityId extends CapabilityId>(
  exportEnvelope: CapabilityExecutionResult<TCapabilityId>["exportEnvelope"]
): CapabilityExecutionResult<TCapabilityId>["exportSerializer"] {
  const payloadObject = {
    envelopeId: exportEnvelope.envelopeId,
    exportTarget: exportEnvelope.exportTarget,
    requestId: exportEnvelope.requestId,
    capabilityId: exportEnvelope.capabilityId,
    executionMode: exportEnvelope.executionMode,
    finalStatus: exportEnvelope.finalStatus,
    approvalState: exportEnvelope.approvalState,
    reviewStatus: exportEnvelope.reviewStatus,
    reportId: exportEnvelope.reportId,
    auditEventId: exportEnvelope.auditEventId,
    bundle: exportEnvelope.bundle,
  }

  return {
    serializerVersion: "v1",
    serializedAt: exportEnvelope.generatedAt,
    contentType: "application/json",
    envelopeId: exportEnvelope.envelopeId,
    exportTarget: exportEnvelope.exportTarget,
    succeeded: true,
    payloadObject,
    payloadJson: JSON.stringify(payloadObject),
  }
}

function buildExecutionTransportReceipt<TCapabilityId extends CapabilityId>(
  exportSerializer: CapabilityExecutionResult<TCapabilityId>["exportSerializer"],
  senderResult?: CapabilityResult<TCapabilityId>["approval"] extends
    | { senderResult?: infer TSenderResult }
    | undefined
    ? TSenderResult
    : never
): CapabilityExecutionResult<TCapabilityId>["transportReceipt"] {
  if (!senderResult) {
    return undefined
  }

  return {
    receiptId: `receipt-${exportSerializer.envelopeId}`,
    issuedAt: exportSerializer.serializedAt,
    envelopeId: exportSerializer.envelopeId,
    exportTarget: exportSerializer.exportTarget,
    contentType: exportSerializer.contentType,
    attempted: senderResult.attempted,
    delivered: senderResult.delivered,
    deliveryMode: senderResult.deliveryMode,
    status: senderResult.status,
    reason: senderResult.reason,
    payloadByteLength:
      senderResult.payloadByteLength ??
      Buffer.byteLength(exportSerializer.payloadJson, "utf8"),
    httpStatus: senderResult.httpStatus,
  }
}

function buildExecutionHandoffSummary<TCapabilityId extends CapabilityId>(
  exportEnvelope: CapabilityExecutionResult<TCapabilityId>["exportEnvelope"],
  exportSerializer: CapabilityExecutionResult<TCapabilityId>["exportSerializer"],
  transportReceipt?: CapabilityExecutionResult<TCapabilityId>["transportReceipt"]
): CapabilityExecutionResult<TCapabilityId>["handoffSummary"] {
  let handoffStatus: CapabilityExecutionResult<TCapabilityId>["handoffSummary"]["handoffStatus"] =
    "not_applicable"

  if (transportReceipt) {
    if (transportReceipt.delivered) {
      handoffStatus = "sent"
    } else if (transportReceipt.attempted) {
      handoffStatus = "needs_attention"
    } else if (transportReceipt.status === "not_configured") {
      handoffStatus = "prepared"
    } else {
      handoffStatus = "attempted_not_sent"
    }
  }

  return {
    handoffSummaryId: `handoff-${exportEnvelope.envelopeId}`,
    generatedAt: exportSerializer.serializedAt,
    requestId: exportEnvelope.requestId,
    capabilityId: exportEnvelope.capabilityId,
    exportTarget: exportEnvelope.exportTarget,
    handoffStatus,
    deliveryMode: transportReceipt?.deliveryMode,
    attempted: transportReceipt?.attempted ?? false,
    delivered: transportReceipt?.delivered ?? false,
    payloadByteLength: transportReceipt?.payloadByteLength,
    reason: transportReceipt?.reason,
    envelopeId: exportEnvelope.envelopeId,
    receiptId: transportReceipt?.receiptId,
  }
}

function buildExecutionDeliveryReadiness<TCapabilityId extends CapabilityId>(
  handoffSummary: CapabilityExecutionResult<TCapabilityId>["handoffSummary"]
): CapabilityExecutionResult<TCapabilityId>["deliveryReadiness"] {
  let readinessStatus: CapabilityExecutionResult<TCapabilityId>["deliveryReadiness"]["readinessStatus"] =
    "not_applicable"
  let isReady = false
  let blockingReason: string | undefined

  if (handoffSummary.handoffStatus === "sent") {
    readinessStatus = "ready_for_handoff"
    isReady = true
  } else if (
    handoffSummary.handoffStatus === "attempted_not_sent" ||
    handoffSummary.handoffStatus === "prepared"
  ) {
    readinessStatus = "blocked_not_sent"
    blockingReason = handoffSummary.reason ?? "External handoff was prepared but not sent."
  } else if (handoffSummary.handoffStatus === "needs_attention") {
    readinessStatus = "blocked_needs_attention"
    blockingReason =
      handoffSummary.reason ?? "External handoff needs attention before delivery can proceed."
  }

  return {
    readinessId: `readiness-${handoffSummary.handoffSummaryId}`,
    evaluatedAt: handoffSummary.generatedAt,
    requestId: handoffSummary.requestId,
    capabilityId: handoffSummary.capabilityId,
    exportTarget:
      handoffSummary.handoffStatus === "not_applicable"
        ? undefined
        : handoffSummary.exportTarget,
    readinessStatus,
    isReady,
    blockingReason,
    handoffStatus:
      handoffSummary.handoffStatus === "not_applicable"
        ? undefined
        : handoffSummary.handoffStatus,
    envelopeId:
      handoffSummary.handoffStatus === "not_applicable"
        ? undefined
        : handoffSummary.envelopeId,
    receiptId: handoffSummary.receiptId,
  }
}

function buildExecutionTransportAdapter<TCapabilityId extends CapabilityId>(
  exportSerializer: CapabilityExecutionResult<TCapabilityId>["exportSerializer"],
  deliveryReadiness: CapabilityExecutionResult<TCapabilityId>["deliveryReadiness"],
  transportReceipt?: CapabilityExecutionResult<TCapabilityId>["transportReceipt"]
): CapabilityExecutionResult<TCapabilityId>["transportAdapter"] {
  const input = {
    adapterTarget: exportSerializer.exportTarget,
    contentType: exportSerializer.contentType,
    serializerVersion: exportSerializer.serializerVersion,
    envelopeId: exportSerializer.envelopeId,
  }

  if (deliveryReadiness.readinessStatus === "not_applicable") {
    return {
      adapterId: "n8n-webhook-transport",
      acceptedInputType: "serialized_export_payload",
      status: "adapter_not_applicable",
      deliveryAttempted: false,
      deliveryPossible: false,
    }
  }

  if (transportReceipt?.delivered) {
    return {
      adapterId: "n8n-webhook-transport",
      adapterTarget: exportSerializer.exportTarget,
      acceptedInputType: "serialized_export_payload",
      status: "adapter_sent",
      deliveryAttempted: true,
      deliveryPossible: true,
      input,
      receiptId: transportReceipt.receiptId,
    }
  }

  if (deliveryReadiness.readinessStatus === "blocked_not_sent") {
    return {
      adapterId: "n8n-webhook-transport",
      adapterTarget: exportSerializer.exportTarget,
      acceptedInputType: "serialized_export_payload",
      status: "adapter_ready_but_not_connected",
      deliveryAttempted: transportReceipt?.attempted ?? false,
      deliveryPossible: false,
      blockedReason: deliveryReadiness.blockingReason,
      input,
      receiptId: transportReceipt?.receiptId,
    }
  }

  return {
    adapterId: "n8n-webhook-transport",
    adapterTarget: exportSerializer.exportTarget,
    acceptedInputType: "serialized_export_payload",
    status: "adapter_ready_but_not_connected",
    deliveryAttempted: transportReceipt?.attempted ?? false,
    deliveryPossible: false,
    blockedReason: deliveryReadiness.blockingReason,
    input,
    receiptId: transportReceipt?.receiptId,
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

async function buildApprovalRequiredResult<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>
): Promise<CapabilityResult<TCapabilityId>> {
  const capabilityDefinition = getCapabilityDefinition(request.capabilityId)
  const { executionPolicy } = capabilityDefinition

  if (executionPolicy.mode !== "approval-required") {
    const approval = {
      status: "required" as const,
      riskLevel: "medium" as const,
      reason: "Approval is required before this operation can run.",
    }
    const handoff = buildN8nApprovalHandoff(request, approval)
    const senderResult = await sendN8nWebhookDelivery(handoff)
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
  const senderResult = await sendN8nWebhookDelivery(handoff)
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
  senderStatus: "sent" | "not_configured" | "failed"
): {
  currentState: ApprovalLifecycleState
  reachedStates: ApprovalLifecycleState[]
  availableStates: ApprovalLifecycleState[]
} {
  const reachedStates: ApprovalLifecycleState[] = [
    "approval_required",
    "handoff_prepared",
  ]

  if (senderStatus === "sent") {
    reachedStates.push("handoff_sent")
  } else {
    reachedStates.push("handoff_not_sent")
  }

  return {
    currentState: senderStatus === "sent" ? "handoff_sent" : "handoff_not_sent",
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
    const result = await buildApprovalRequiredResult(request)
    const audit = buildExecutionAuditEntry(request, selection, result)
    const report = buildExecutionRunReport(request, selection, result, audit)
    const reviewSummary = buildExecutionReviewSummary(report)
    const decisionEnvelope = buildExecutionDecisionEnvelope(reviewSummary)
    const stateSnapshot = buildExecutionStateSnapshot(
      request,
      report,
      reviewSummary,
      decisionEnvelope
    )
    const contractBundle = buildExecutionContractBundle(
      selection,
      audit,
      report,
      reviewSummary,
      stateSnapshot,
      decisionEnvelope
    )
    const exportEnvelope = buildExecutionExportEnvelope(contractBundle)
    const exportSerializer = buildExecutionExportSerializer(exportEnvelope)
    const transportReceipt = buildExecutionTransportReceipt(
      exportSerializer,
      result.approval?.senderResult
    )
    const handoffSummary = buildExecutionHandoffSummary(
      exportEnvelope,
      exportSerializer,
      transportReceipt
    )
    const deliveryReadiness = buildExecutionDeliveryReadiness(handoffSummary)
    const transportAdapter = buildExecutionTransportAdapter(
      exportSerializer,
      deliveryReadiness,
      transportReceipt
    )

    return {
      selection,
      result,
      audit,
      report,
      reviewSummary,
      decisionEnvelope,
      stateSnapshot,
      contractBundle,
      exportEnvelope,
      exportSerializer,
      transportReceipt,
      handoffSummary,
      deliveryReadiness,
      transportAdapter,
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
    const decisionEnvelope = buildExecutionDecisionEnvelope(reviewSummary)
    const stateSnapshot = buildExecutionStateSnapshot(
      request,
      report,
      reviewSummary,
      decisionEnvelope
    )
    const contractBundle = buildExecutionContractBundle(
      selection,
      audit,
      report,
      reviewSummary,
      stateSnapshot,
      decisionEnvelope
    )
    const exportEnvelope = buildExecutionExportEnvelope(contractBundle)
    const exportSerializer = buildExecutionExportSerializer(exportEnvelope)
    const transportReceipt = buildExecutionTransportReceipt(
      exportSerializer,
      result.approval?.senderResult
    )
    const handoffSummary = buildExecutionHandoffSummary(
      exportEnvelope,
      exportSerializer,
      transportReceipt
    )
    const deliveryReadiness = buildExecutionDeliveryReadiness(handoffSummary)
    const transportAdapter = buildExecutionTransportAdapter(
      exportSerializer,
      deliveryReadiness,
      transportReceipt
    )

    return {
      selection,
      result,
      audit,
      report,
      reviewSummary,
      decisionEnvelope,
      stateSnapshot,
      contractBundle,
      exportEnvelope,
      exportSerializer,
      transportReceipt,
      handoffSummary,
      deliveryReadiness,
      transportAdapter,
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
  const decisionEnvelope = buildExecutionDecisionEnvelope(reviewSummary)
  const stateSnapshot = buildExecutionStateSnapshot(
    request,
    report,
    reviewSummary,
    decisionEnvelope
  )
  const contractBundle = buildExecutionContractBundle(
    selection,
    audit,
    report,
    reviewSummary,
    stateSnapshot,
    decisionEnvelope
  )
  const exportEnvelope = buildExecutionExportEnvelope(contractBundle)
  const exportSerializer = buildExecutionExportSerializer(exportEnvelope)
  const transportReceipt = buildExecutionTransportReceipt(
    exportSerializer,
    result.approval?.senderResult
  )
  const handoffSummary = buildExecutionHandoffSummary(
    exportEnvelope,
    exportSerializer,
    transportReceipt
  )
  const deliveryReadiness = buildExecutionDeliveryReadiness(handoffSummary)
  const transportAdapter = buildExecutionTransportAdapter(
    exportSerializer,
    deliveryReadiness,
    transportReceipt
  )

  return {
    selection,
    result,
    audit,
    report,
    reviewSummary,
    decisionEnvelope,
    stateSnapshot,
    contractBundle,
    exportEnvelope,
    exportSerializer,
    transportReceipt,
    handoffSummary,
    deliveryReadiness,
    transportAdapter,
  }
}
