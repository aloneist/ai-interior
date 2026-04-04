import type { N8nApprovalHandoffPayload } from "@/automation/orchestration/n8n/approval-handoff"

export type N8nWebhookPlaceholderDeliveryResult = {
  target: "n8n-approval"
  deliveryMode: "placeholder"
  attempted: boolean
  delivered: boolean
  status: "not_sent"
  reason: string
  payloadRequestId: string
}

export function sendN8nWebhookPlaceholder(
  payload: N8nApprovalHandoffPayload
): N8nWebhookPlaceholderDeliveryResult {
  return {
    target: payload.target,
    deliveryMode: "placeholder",
    attempted: false,
    delivered: false,
    status: "not_sent",
    reason: "Placeholder sender only. Real n8n webhook delivery is not enabled in automation v1.",
    payloadRequestId: payload.requestId,
  }
}
