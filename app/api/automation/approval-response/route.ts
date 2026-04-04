export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { capabilityRegistry } from "@/automation/capabilities/registry"
import type { CapabilityId } from "@/automation/capabilities/types"
import {
  automationApprovalResponseRouteRequestExample,
  type AutomationApprovalResponseRouteBody,
  type AutomationApprovalResponseRouteResolvedContext,
} from "@/app/api/automation/contracts"
import {
  receiveApprovalResponseWebhook,
  type ApprovalResponseWebhookStatus,
} from "@/automation/orchestration/n8n/approval-response-webhook-intake"
import type { AutomationRunFinalStatus } from "@/automation/execution/types"

type ApprovalResponseRouteError = {
  route: "/api/automation/approval-response"
  routeVersion: "v1"
  target: "n8n-approval-response"
  status: "rejected_invalid"
  issues: string[]
  requestShape?: typeof automationApprovalResponseRouteRequestExample
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function normalizeCapabilityId(value: unknown): CapabilityId | undefined {
  const normalized = normalizeString(value)

  if (!normalized) {
    return undefined
  }

  return Object.hasOwn(capabilityRegistry, normalized)
    ? (normalized as CapabilityId)
    : undefined
}

function normalizeFinalStatus(
  value: unknown
): AutomationRunFinalStatus | undefined {
  const normalized = normalizeString(value)

  if (
    normalized === "executed" ||
    normalized === "approval_required" ||
    normalized === "failed"
  ) {
    return normalized
  }

  return undefined
}

function mapWebhookStatusToHttpStatus(
  status: ApprovalResponseWebhookStatus
): number {
  if (status === "blocked_untrusted") {
    return 401
  }

  if (status === "rejected_invalid") {
    return 400
  }

  return 200
}

function buildInvalidRouteResponse(issues: string[]): NextResponse {
  const body: ApprovalResponseRouteError = {
    route: "/api/automation/approval-response",
    routeVersion: "v1",
    target: "n8n-approval-response",
    status: "rejected_invalid",
    issues,
    requestShape: automationApprovalResponseRouteRequestExample,
  }

  return NextResponse.json(body, { status: 400 })
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  let parsedBody: AutomationApprovalResponseRouteBody | undefined

  if (rawBody.trim().length > 0) {
    try {
      const parsed = JSON.parse(rawBody) as unknown

      if (!isRecord(parsed)) {
        return buildInvalidRouteResponse([
          "Runtime approval-response route body must decode to a JSON object.",
        ])
      }

      parsedBody = parsed as AutomationApprovalResponseRouteBody
    } catch {
      return buildInvalidRouteResponse([
        "Runtime approval-response route body must be valid JSON.",
      ])
    }
  } else {
    return buildInvalidRouteResponse([
      "Runtime approval-response route body is required.",
    ])
  }

  const contextInput = isRecord(parsedBody.context) ? parsedBody.context : undefined
  const contextIssues: string[] = []

  const requestId = normalizeString(contextInput?.requestId)
  if (!requestId) {
    contextIssues.push("context.requestId is required.")
  }

  const reportId = normalizeString(contextInput?.reportId)
  if (!reportId) {
    contextIssues.push("context.reportId is required.")
  }

  const capabilityId = normalizeCapabilityId(contextInput?.capabilityId)
  if (!capabilityId) {
    contextIssues.push("context.capabilityId must be a known automation capability.")
  }

  const finalStatus = normalizeFinalStatus(contextInput?.finalStatus)
  if (!finalStatus) {
    contextIssues.push(
      "context.finalStatus must be one of: executed, approval_required, failed."
    )
  }

  if (contextIssues.length > 0) {
    return buildInvalidRouteResponse(contextIssues)
  }

  const resolvedContext: AutomationApprovalResponseRouteResolvedContext = {
    requestId: requestId as string,
    reportId: reportId as string,
    capabilityId: capabilityId as CapabilityId,
    finalStatus: finalStatus as AutomationRunFinalStatus,
    decisionId: normalizeString(contextInput?.decisionId),
  }

  const result = receiveApprovalResponseWebhook(
    {
      method: request.method,
      contentType: request.headers.get("content-type") ?? undefined,
      authorization: request.headers.get("authorization") ?? undefined,
      body: JSON.stringify({
        requestId: parsedBody.requestId,
        reportId: parsedBody.reportId,
        capabilityId: parsedBody.capabilityId,
        decisionId: parsedBody.decisionId,
        source: parsedBody.source,
        decision: parsedBody.decision,
        note: parsedBody.note,
      }),
    },
    {
      requestId: resolvedContext.requestId,
      reportId: resolvedContext.reportId,
      capabilityId: resolvedContext.capabilityId,
      finalStatus: resolvedContext.finalStatus,
      decisionId: resolvedContext.decisionId,
    }
  )

  return NextResponse.json(
    {
      route: "/api/automation/approval-response",
      routeVersion: "v1",
      requestShape: automationApprovalResponseRouteRequestExample,
      context: resolvedContext,
      webhook: result,
    },
    { status: mapWebhookStatusToHttpStatus(result.status) }
  )
}
