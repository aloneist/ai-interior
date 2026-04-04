import type {
  CapabilityId,
  CapabilityInputMap,
  CapabilityRequest,
} from "@/automation/capabilities/types"

export type N8nApprovalHandoffPayload = {
  contractVersion: "v1"
  target: "n8n-approval"
  status: "approval_required"
  generatedAt: string
  requestId: string
  capabilityId: CapabilityId
  operation?: string
  actorId?: string
  title: string
  summary: string
  riskLevel: "medium" | "high"
  payloadPreview: {
    recordCount?: number
    dryRun?: boolean
    folder?: string
    tagCount?: number
    maxResults?: number
    recipientCount?: number
    suite?: string
  }
}

function getOperationPreview<TCapabilityId extends CapabilityId>(
  payload: CapabilityInputMap[TCapabilityId]
): string | undefined {
  const operation = (payload as { operation?: unknown }).operation
  return typeof operation === "string" ? operation : undefined
}

function getPayloadPreview<TCapabilityId extends CapabilityId>(
  payload: CapabilityInputMap[TCapabilityId]
): N8nApprovalHandoffPayload["payloadPreview"] {
  const candidate = payload as {
    records?: unknown[]
    dryRun?: boolean
    folder?: string
    tags?: string[]
    maxResults?: number
    recipients?: unknown[]
    suite?: string
  }

  return {
    recordCount: Array.isArray(candidate.records) ? candidate.records.length : undefined,
    dryRun: typeof candidate.dryRun === "boolean" ? candidate.dryRun : undefined,
    folder: typeof candidate.folder === "string" ? candidate.folder : undefined,
    tagCount: Array.isArray(candidate.tags) ? candidate.tags.length : undefined,
    maxResults:
      typeof candidate.maxResults === "number" ? candidate.maxResults : undefined,
    recipientCount: Array.isArray(candidate.recipients)
      ? candidate.recipients.length
      : undefined,
    suite: typeof candidate.suite === "string" ? candidate.suite : undefined,
  }
}

function buildHandoffRequestId<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>
): string {
  return request.requestId ?? `approval-${request.capabilityId}-${Date.now()}`
}

export function buildN8nApprovalHandoff<TCapabilityId extends CapabilityId>(
  request: CapabilityRequest<TCapabilityId>,
  approval: {
    status: "required"
    reason?: string
    riskLevel?: "medium" | "high"
  }
): N8nApprovalHandoffPayload {
  return {
    contractVersion: "v1",
    target: "n8n-approval",
    status: "approval_required",
    generatedAt: new Date().toISOString(),
    requestId: buildHandoffRequestId(request),
    capabilityId: request.capabilityId,
    operation: getOperationPreview(request.payload),
    actorId: request.actorId,
    title: `${request.capabilityId} requires approval`,
    summary: approval.reason ?? "Approval is required before this capability can run.",
    riskLevel: approval.riskLevel ?? "medium",
    payloadPreview: getPayloadPreview(request.payload),
  }
}
