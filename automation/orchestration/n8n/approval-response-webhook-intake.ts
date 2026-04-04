import type { CapabilityId } from "@/automation/capabilities/types"
import {
  buildApprovalResponseApplication,
  buildApprovalResponseResumeEligibility,
  buildApprovalResponseReviewSummary,
  buildManualResumeContract,
  buildManualResumeGate,
  buildManualResumeRequest,
  normalizeApprovalResponseIntake,
  type ApprovalResponseApplication,
  type ApprovalResponseIntake,
  type ApprovalResponseIntakeContext,
  type ApprovalResponseRawInput,
  type ApprovalResponseResumeEligibility,
  type ApprovalResponseReviewSummary,
  type ManualResumeContract,
  type ManualResumeGate,
  type ManualResumeRequest,
} from "@/automation/orchestration/n8n/approval-response-intake"

const APPROVAL_RESPONSE_WEBHOOK_SECRET_ENV =
  "AUTOMATION_APPROVAL_WEBHOOK_SECRET"

export type ApprovalResponseWebhookRequest = {
  method?: string
  contentType?: string
  authorization?: string
  body: string
}

export type ApprovalResponseWebhookAuthStatus = "trusted" | "untrusted"

export type ApprovalResponseWebhookAuth = {
  field: "authorization"
  status: ApprovalResponseWebhookAuthStatus
  reason: string
}

export type ApprovalResponseWebhookStatus =
  | "blocked_untrusted"
  | "accepted"
  | "rejected_invalid"
  | "ignored_not_applicable"

export type ApprovalResponseWebhook<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  webhookId: string
  target: "n8n-approval-response"
  intakeMode: "webhook"
  receivedAt: string
  method: string
  contentType?: string
  auth: ApprovalResponseWebhookAuth
  status: ApprovalResponseWebhookStatus
  issues: string[]
  rawInput?: ApprovalResponseRawInput
  intake?: ApprovalResponseIntake<TCapabilityId>
  reviewSummary?: ApprovalResponseReviewSummary<TCapabilityId>
  application?: ApprovalResponseApplication<TCapabilityId>
  resumeEligibility?: ApprovalResponseResumeEligibility<TCapabilityId>
  manualResumeRequest?: ManualResumeRequest<TCapabilityId>
  manualResumeGate?: ManualResumeGate<TCapabilityId>
  manualResumeContract?: ManualResumeContract<TCapabilityId>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseWebhookBody(body: string): {
  rawInput: ApprovalResponseRawInput
  issues: string[]
} {
  if (body.trim().length === 0) {
    return {
      rawInput: {},
      issues: ["Webhook body must contain a JSON object."],
    }
  }

  try {
    const parsed = JSON.parse(body) as unknown

    if (!isRecord(parsed)) {
      return {
        rawInput: {},
        issues: ["Webhook body must decode to a JSON object."],
      }
    }

    return {
      rawInput: {
        requestId: parsed.requestId,
        reportId: parsed.reportId,
        capabilityId: parsed.capabilityId,
        decisionId: parsed.decisionId,
        source: parsed.source,
        decision: parsed.decision,
        note: parsed.note,
      },
      issues: [],
    }
  } catch {
    return {
      rawInput: {},
      issues: ["Webhook body must be valid JSON."],
    }
  }
}

function withWebhookIssues<TCapabilityId extends CapabilityId>(
  intake: ApprovalResponseIntake<TCapabilityId>,
  webhookIssues: string[]
): ApprovalResponseIntake<TCapabilityId> {
  if (webhookIssues.length === 0) {
    return intake
  }

  return {
    ...intake,
    validityStatus: "rejected_invalid",
    nextActionHint: undefined,
    issues: [...webhookIssues, ...intake.issues],
  }
}

function getExpectedWebhookSecret(): string | undefined {
  const candidate = process.env[APPROVAL_RESPONSE_WEBHOOK_SECRET_ENV]?.trim()
  return candidate && candidate.length > 0 ? candidate : undefined
}

function getProvidedAuthorizationToken(
  authorization: string | undefined
): string | undefined {
  const normalized = authorization?.trim()

  if (!normalized) {
    return undefined
  }

  const bearerMatch = normalized.match(/^Bearer\s+(.+)$/i)
  return bearerMatch?.[1]?.trim() || undefined
}

function buildWebhookAuth(
  authorization: string | undefined
): ApprovalResponseWebhookAuth {
  const expectedWebhookSecret = getExpectedWebhookSecret()
  const providedToken = getProvidedAuthorizationToken(authorization)

  if (!expectedWebhookSecret) {
    return {
      field: "authorization",
      status: "untrusted",
      reason:
        "Inbound approval-response webhook auth is not configured. AUTOMATION_APPROVAL_WEBHOOK_SECRET is required.",
    }
  }

  if (!providedToken) {
    return {
      field: "authorization",
      status: "untrusted",
      reason:
        "authorization header must be Bearer AUTOMATION_APPROVAL_WEBHOOK_SECRET.",
    }
  }

  if (providedToken !== expectedWebhookSecret) {
    return {
      field: "authorization",
      status: "untrusted",
      reason:
        "authorization header does not match AUTOMATION_APPROVAL_WEBHOOK_SECRET.",
    }
  }

  return {
    field: "authorization",
    status: "trusted",
    reason: "authorization header matched AUTOMATION_APPROVAL_WEBHOOK_SECRET.",
  }
}

export function receiveApprovalResponseWebhook<
  TCapabilityId extends CapabilityId,
>(
  request: ApprovalResponseWebhookRequest,
  context: ApprovalResponseIntakeContext<TCapabilityId>
): ApprovalResponseWebhook<TCapabilityId> {
  const receivedAt = new Date().toISOString()
  const method = request.method?.trim().toUpperCase() || "POST"
  const contentType = request.contentType?.trim()
  const auth = buildWebhookAuth(request.authorization)
  const webhookIssues: string[] = []

  if (auth.status === "untrusted") {
    return {
      webhookId: `approval-response-webhook-${context.reportId}-blocked_untrusted`,
      target: "n8n-approval-response",
      intakeMode: "webhook",
      receivedAt,
      method,
      contentType,
      auth,
      status: "blocked_untrusted",
      issues: [auth.reason],
    }
  }

  if (method !== "POST") {
    webhookIssues.push("Webhook method must be POST.")
  }

  if (
    contentType &&
    !contentType.toLowerCase().includes("application/json")
  ) {
    webhookIssues.push("Webhook content-type must be application/json.")
  }

  const { rawInput, issues: parsingIssues } = parseWebhookBody(request.body)
  webhookIssues.push(...parsingIssues)

  const intake = withWebhookIssues(
    normalizeApprovalResponseIntake(rawInput, context),
    webhookIssues
  )
  const reviewSummary = buildApprovalResponseReviewSummary(intake)
  const application = buildApprovalResponseApplication(intake, reviewSummary)
  const resumeEligibility = buildApprovalResponseResumeEligibility(application)
  const manualResumeRequest = buildManualResumeRequest(resumeEligibility)
  const manualResumeGate = buildManualResumeGate(manualResumeRequest)
  const manualResumeContract = buildManualResumeContract(manualResumeGate)

  return {
    webhookId: `approval-response-webhook-${intake.intakeId}-${intake.validityStatus}`,
    target: "n8n-approval-response",
    intakeMode: "webhook",
    receivedAt: intake.receivedAt,
    method,
    contentType,
    auth,
    status: intake.validityStatus,
    issues: intake.issues,
    rawInput,
    intake,
    reviewSummary,
    application,
    resumeEligibility,
    manualResumeRequest,
    manualResumeGate,
    manualResumeContract,
  }
}
