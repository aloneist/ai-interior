export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { buildN8nApprovalHandoff } from "@/automation/orchestration/n8n/approval-handoff"
import { sendN8nWebhookDelivery } from "@/automation/orchestration/n8n/webhook-placeholder-sender"
import type { CatalogWriteSafeInput } from "@/automation/capabilities/types"

const APPROVAL_WEBHOOK_URL_ENV = "AUTOMATION_APPROVAL_WEBHOOK_URL"

function hasConfiguredWebhookUrl(): boolean {
  const candidate = process.env[APPROVAL_WEBHOOK_URL_ENV]?.trim()
  return Boolean(candidate && /^https?:\/\//.test(candidate))
}

function buildWebhookTestPayload() {
  return buildN8nApprovalHandoff(
    {
      capabilityId: "catalog.write.safe",
      requestId: "runtime-webhook-test-catalog-write-safe",
      actorId: "automation-runtime-bridge",
      payload: {
        operation: "archive",
        records: [{ id: "runtime-bridge-demo-record" }],
        reason: "Runtime webhook bridge verification only.",
        dryRun: true,
      } satisfies CatalogWriteSafeInput,
    },
    {
      status: "required",
      reason: "Runtime webhook bridge verification only. No risky execution occurs.",
      riskLevel: "high",
    }
  )
}

export async function POST() {
  const payload = buildWebhookTestPayload()
  const delivery = await sendN8nWebhookDelivery(payload)

  return NextResponse.json(
    {
      route: "/api/automation/webhook-test",
      routeVersion: "v1",
      target: payload.target,
      configured: {
        outboundApprovalWebhookConfigured: hasConfiguredWebhookUrl(),
      },
      verification: {
        executesRiskyWork: false,
        resumesBlockedExecution: false,
        exposesSecrets: false,
      },
      handoff: {
        contractVersion: payload.contractVersion,
        requestId: payload.requestId,
        capabilityId: payload.capabilityId,
        operation: payload.operation,
        actorId: payload.actorId,
        title: payload.title,
        summary: payload.summary,
        riskLevel: payload.riskLevel,
        payloadPreview: payload.payloadPreview,
      },
      delivery,
    },
    { status: delivery.status === "failed" ? 502 : 200 }
  )
}
