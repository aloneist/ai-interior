import type { N8nApprovalHandoffPayload } from "@/automation/orchestration/n8n/approval-handoff"

const N8N_WEBHOOK_URL_ENV = "AUTOMATION_APPROVAL_WEBHOOK_URL"
const WEBHOOK_REQUEST_TIMEOUT_MS = 5000

export type N8nWebhookDeliveryResult = {
  target: "n8n-approval"
  deliveryMode: "webhook"
  attempted: boolean
  delivered: boolean
  status: "sent" | "not_configured" | "failed"
  reason: string
  payloadRequestId: string
  payloadByteLength: number
  httpStatus?: number
}

function getConfiguredWebhookUrl(): string | undefined {
  const candidate = process.env[N8N_WEBHOOK_URL_ENV]?.trim()

  if (!candidate) {
    return undefined
  }

  return /^https?:\/\//.test(candidate) ? candidate : undefined
}

export async function sendN8nWebhookDelivery(
  payload: N8nApprovalHandoffPayload
): Promise<N8nWebhookDeliveryResult> {
  const payloadJson = JSON.stringify(payload)
  const payloadByteLength = Buffer.byteLength(payloadJson, "utf8")
  const webhookUrl = getConfiguredWebhookUrl()

  if (!webhookUrl) {
    return {
      target: payload.target,
      deliveryMode: "webhook",
      attempted: false,
      delivered: false,
      status: "not_configured",
      reason:
        "No n8n webhook URL configured. AUTOMATION_APPROVAL_WEBHOOK_URL must contain an http(s) webhook URL for automation approval delivery.",
      payloadRequestId: payload.requestId,
      payloadByteLength,
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: payloadJson,
      signal: controller.signal,
    })

    if (!response.ok) {
      return {
        target: payload.target,
        deliveryMode: "webhook",
        attempted: true,
        delivered: false,
        status: "failed",
        reason: `n8n webhook delivery failed with HTTP ${response.status}.`,
        payloadRequestId: payload.requestId,
        payloadByteLength,
        httpStatus: response.status,
      }
    }

    return {
      target: payload.target,
      deliveryMode: "webhook",
      attempted: true,
      delivered: true,
      status: "sent",
      reason: "n8n webhook delivery succeeded.",
      payloadRequestId: payload.requestId,
      payloadByteLength,
      httpStatus: response.status,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook delivery failure."

    return {
      target: payload.target,
      deliveryMode: "webhook",
      attempted: true,
      delivered: false,
      status: "failed",
      reason: `n8n webhook delivery failed: ${message}`,
      payloadRequestId: payload.requestId,
      payloadByteLength,
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
