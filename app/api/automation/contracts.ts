import type { CapabilityId } from "@/automation/capabilities/types"
import type { ApprovalResponseRawInput } from "@/automation/orchestration/n8n/approval-response-intake"
import type { AutomationRunFinalStatus } from "@/automation/execution/types"

export type AutomationApprovalResponseRouteContext = {
  requestId?: unknown
  reportId?: unknown
  capabilityId?: unknown
  decisionId?: unknown
  finalStatus?: unknown
}

export type AutomationApprovalResponseRouteBody = ApprovalResponseRawInput & {
  context?: AutomationApprovalResponseRouteContext
}

export type AutomationApprovalResponseRouteResolvedContext = {
  requestId: string
  reportId: string
  capabilityId: CapabilityId
  decisionId?: string
  finalStatus: AutomationRunFinalStatus
}

export const automationApprovalResponseRouteRequestExample = {
  headers: {
    authorization: "Bearer AUTOMATION_APPROVAL_WEBHOOK_SECRET",
    "content-type": "application/json",
  },
  body: {
    context: {
      requestId: "approval-run-request-id",
      reportId: "report-audit-example",
      capabilityId: "catalog.write.safe",
      finalStatus: "approval_required",
      decisionId: "decision-review-report-audit-example",
    },
    requestId: "approval-run-request-id",
    reportId: "report-audit-example",
    capabilityId: "catalog.write.safe",
    decisionId: "decision-review-report-audit-example",
    source: "n8n",
    decision: "approved",
    note: "Approved for manual review flow only.",
  },
} as const
