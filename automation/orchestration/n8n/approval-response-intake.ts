import type { CapabilityId } from "@/automation/capabilities/types"
import type {
  AutomationDecision,
  AutomationDecisionEnvelope,
  AutomationRunReport,
} from "@/automation/execution/types"

export type ApprovalResponseIntakeSource = "n8n" | "external_orchestrator"

export type ApprovalResponseIntakeNextActionHint =
  | "remain_blocked"
  | "revise_request"
  | "stop_execution"

export type ApprovalResponseIntakeValidityStatus =
  | "accepted"
  | "rejected_invalid"
  | "ignored_not_applicable"

export type ApprovalResponseRawInput = {
  requestId?: unknown
  reportId?: unknown
  capabilityId?: unknown
  decisionId?: unknown
  source?: unknown
  decision?: unknown
  note?: unknown
}

export type ApprovalResponseIntakeContext<
  TCapabilityId extends CapabilityId = CapabilityId,
> = Pick<
  AutomationRunReport<TCapabilityId>,
  "requestId" | "reportId" | "capabilityId" | "finalStatus"
> & {
  decisionId?: AutomationDecisionEnvelope<TCapabilityId>["decisionId"]
}

export type ApprovalResponseIntake<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  intakeId: string
  receivedAt: string
  requestId: string
  reportId?: string
  capabilityId: TCapabilityId
  decisionId?: string
  source: ApprovalResponseIntakeSource
  decision?: AutomationDecision
  note?: string
  nextActionHint?: ApprovalResponseIntakeNextActionHint
  validityStatus: ApprovalResponseIntakeValidityStatus
  issues: string[]
}

export type ApprovalResponseReviewSummary<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  responseSummaryId: string
  generatedAt: string
  requestId: string
  reportId?: string
  capabilityId: TCapabilityId
  source: ApprovalResponseIntakeSource
  decision?: AutomationDecision
  validityStatus: ApprovalResponseIntakeValidityStatus
  nextActionHint?: ApprovalResponseIntakeNextActionHint
  issueCount: number
  statusSummary: string
}

export type ApprovalResponseApplicationStatus =
  | "no_action"
  | "remain_blocked"
  | "mark_rejected"
  | "mark_deferred"
  | "mark_needs_revision"
  | "invalid_response"

export type ApprovalResponseApplication<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  applicationId: string
  evaluatedAt: string
  requestId: string
  reportId?: string
  capabilityId: TCapabilityId
  source: ApprovalResponseIntakeSource
  decision?: AutomationDecision
  validityStatus: ApprovalResponseIntakeValidityStatus
  applicationStatus: ApprovalResponseApplicationStatus
  nextActionHint?: ApprovalResponseIntakeNextActionHint
  reasonSummary: string
  issueCount: number
}

export type ApprovalResponseResumeEligibilityStatus =
  | "not_applicable"
  | "eligible_for_manual_resume"
  | "blocked_rejected"
  | "blocked_deferred"
  | "blocked_needs_revision"
  | "blocked_invalid_response"
  | "blocked_still_requires_manual_gate"

export type ApprovalResponseResumeEligibility<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  eligibilityId: string
  evaluatedAt: string
  requestId: string
  reportId?: string
  capabilityId: TCapabilityId
  source: ApprovalResponseIntakeSource
  decision?: AutomationDecision
  applicationStatus: ApprovalResponseApplicationStatus
  eligibilityStatus: ApprovalResponseResumeEligibilityStatus
  isEligible: boolean
  blockingReason?: string
  nextActionHint?: ApprovalResponseIntakeNextActionHint
}

export type ManualResumeRequestStatus =
  | "not_applicable"
  | "request_blocked"
  | "request_pending_manual_gate"
  | "request_rejected_invalid"

export type ManualResumeRequest<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  resumeRequestId: string
  requestedAt: string
  requestId: string
  reportId?: string
  capabilityId: TCapabilityId
  source: ApprovalResponseIntakeSource
  decision?: AutomationDecision
  eligibilityStatus: ApprovalResponseResumeEligibilityStatus
  requestStatus: ManualResumeRequestStatus
  isRequestable: boolean
  blockingReason?: string
  nextActionHint?: ApprovalResponseIntakeNextActionHint
}

export type ManualResumeGateStatus =
  | "gate_not_applicable"
  | "gate_blocked"
  | "gate_open_for_future_resume_contract"
  | "gate_rejected_invalid"

export type ManualResumeGate<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  manualGateId: string
  evaluatedAt: string
  requestId: string
  reportId?: string
  capabilityId: TCapabilityId
  source: ApprovalResponseIntakeSource
  requestStatus: ManualResumeRequestStatus
  gateStatus: ManualResumeGateStatus
  canOpenResumePath: boolean
  blockingReason?: string
  nextActionHint?: ApprovalResponseIntakeNextActionHint
}

export type ManualResumeContractStatus =
  | "contract_not_applicable"
  | "contract_blocked"
  | "contract_available_for_future_resume_artifact"
  | "contract_rejected_invalid"

export type ManualResumeContract<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  manualResumeContractId: string
  generatedAt: string
  requestId: string
  reportId?: string
  capabilityId: TCapabilityId
  source: ApprovalResponseIntakeSource
  gateStatus: ManualResumeGateStatus
  contractStatus: ManualResumeContractStatus
  canIssueFutureResumeArtifact: boolean
  blockingReason?: string
  nextActionHint?: ApprovalResponseIntakeNextActionHint
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

function normalizeSource(value: unknown): ApprovalResponseIntakeSource | undefined {
  const normalized = normalizeString(value)?.toLowerCase()

  if (!normalized) {
    return undefined
  }

  if (normalized.includes("n8n")) {
    return "n8n"
  }

  return "external_orchestrator"
}

function normalizeDecision(value: unknown): AutomationDecision | undefined {
  const normalized = normalizeString(value)
    ?.toLowerCase()
    .replace(/[\s-]+/g, "_")

  if (
    normalized === "approved" ||
    normalized === "rejected" ||
    normalized === "deferred" ||
    normalized === "needs_revision"
  ) {
    return normalized
  }

  return undefined
}

function buildNextActionHint(
  decision?: AutomationDecision
): ApprovalResponseIntakeNextActionHint | undefined {
  if (decision === "needs_revision") {
    return "revise_request"
  }

  if (decision === "rejected") {
    return "stop_execution"
  }

  if (decision === "approved" || decision === "deferred") {
    // Intake stays informational in v1. No blocked execution is resumed here.
    return "remain_blocked"
  }

  return undefined
}

function buildStatusSummary<TCapabilityId extends CapabilityId>(
  intake: ApprovalResponseIntake<TCapabilityId>
): string {
  if (intake.validityStatus === "accepted") {
    return `Accepted ${intake.decision ?? "unknown"} response for ${intake.capabilityId}.`
  }

  if (intake.validityStatus === "ignored_not_applicable") {
    return `Ignored response because ${intake.capabilityId} is not in an approval-required state.`
  }

  return `Rejected invalid response for ${intake.capabilityId} with ${intake.issues.length} issue(s).`
}

export function normalizeApprovalResponseIntake<
  TCapabilityId extends CapabilityId,
>(
  rawInput: ApprovalResponseRawInput,
  context: ApprovalResponseIntakeContext<TCapabilityId>
): ApprovalResponseIntake<TCapabilityId> {
  const receivedAt = new Date().toISOString()
  const source = normalizeSource(rawInput.source) ?? "external_orchestrator"
  const decision = normalizeDecision(rawInput.decision)
  const note = normalizeString(rawInput.note)
  const issues: string[] = []

  if (
    context.finalStatus !== "approval_required" ||
    typeof context.decisionId !== "string"
  ) {
    return {
      intakeId: `intake-${context.reportId}`,
      receivedAt,
      requestId: context.requestId,
      reportId: context.reportId,
      capabilityId: context.capabilityId,
      decisionId: context.decisionId,
      source,
      decision,
      note,
      validityStatus: "ignored_not_applicable",
      issues: ["Approval response intake is not applicable for this execution state."],
    }
  }

  const rawRequestId = normalizeString(rawInput.requestId)
  const rawReportId = normalizeString(rawInput.reportId)
  const rawCapabilityId = normalizeString(rawInput.capabilityId)
  const rawDecisionId = normalizeString(rawInput.decisionId)

  if (!rawRequestId) {
    issues.push("requestId is required.")
  } else if (rawRequestId !== context.requestId) {
    issues.push("requestId does not match the approval-required execution.")
  }

  if (rawReportId && rawReportId !== context.reportId) {
    issues.push("reportId does not match the approval-required execution.")
  }

  if (!rawCapabilityId) {
    issues.push("capabilityId is required.")
  } else if (rawCapabilityId !== context.capabilityId) {
    issues.push("capabilityId does not match the approval-required execution.")
  }

  if (rawDecisionId && rawDecisionId !== context.decisionId) {
    issues.push("decisionId does not match the current decision envelope.")
  }

  if (!normalizeSource(rawInput.source)) {
    issues.push("source is required.")
  }

  if (!decision) {
    issues.push(
      "decision must be one of: approved, rejected, deferred, needs_revision."
    )
  }

  return {
    intakeId: `intake-${context.reportId}`,
    receivedAt,
    requestId: context.requestId,
    reportId: context.reportId,
    capabilityId: context.capabilityId,
    decisionId: context.decisionId,
    source,
    decision,
    note,
    nextActionHint: issues.length === 0 ? buildNextActionHint(decision) : undefined,
    validityStatus: issues.length === 0 ? "accepted" : "rejected_invalid",
    issues,
  }
}

export function buildApprovalResponseReviewSummary<
  TCapabilityId extends CapabilityId,
>(
  intake: ApprovalResponseIntake<TCapabilityId>
): ApprovalResponseReviewSummary<TCapabilityId> {
  return {
    responseSummaryId: `response-summary-${intake.intakeId}-${intake.validityStatus}`,
    generatedAt: intake.receivedAt,
    requestId: intake.requestId,
    reportId: intake.reportId,
    capabilityId: intake.capabilityId,
    source: intake.source,
    decision: intake.decision,
    validityStatus: intake.validityStatus,
    nextActionHint: intake.nextActionHint,
    issueCount: intake.issues.length,
    statusSummary: buildStatusSummary(intake),
  }
}

function mapApplicationStatus(
  intake: ApprovalResponseIntake,
  reviewSummary: ApprovalResponseReviewSummary
): ApprovalResponseApplicationStatus {
  if (intake.validityStatus === "ignored_not_applicable") {
    return "no_action"
  }

  if (intake.validityStatus === "rejected_invalid") {
    return "invalid_response"
  }

  if (reviewSummary.decision === "rejected") {
    return "mark_rejected"
  }

  if (reviewSummary.decision === "deferred") {
    return "mark_deferred"
  }

  if (reviewSummary.decision === "needs_revision") {
    return "mark_needs_revision"
  }

  return "remain_blocked"
}

function buildApplicationReasonSummary(
  applicationStatus: ApprovalResponseApplicationStatus,
  reviewSummary: ApprovalResponseReviewSummary
): string {
  if (applicationStatus === "remain_blocked") {
    return `${reviewSummary.statusSummary} Execution remains blocked in automation v1.`
  }

  if (applicationStatus === "no_action") {
    return reviewSummary.statusSummary
  }

  if (applicationStatus === "invalid_response") {
    return reviewSummary.statusSummary
  }

  return `${reviewSummary.statusSummary} Execution still does not resume automatically.`
}

export function buildApprovalResponseApplication<
  TCapabilityId extends CapabilityId,
>(
  intake: ApprovalResponseIntake<TCapabilityId>,
  reviewSummary: ApprovalResponseReviewSummary<TCapabilityId>
): ApprovalResponseApplication<TCapabilityId> {
  const applicationStatus = mapApplicationStatus(intake, reviewSummary)

  return {
    applicationId: `response-application-${reviewSummary.responseSummaryId}`,
    evaluatedAt: reviewSummary.generatedAt,
    requestId: reviewSummary.requestId,
    reportId: reviewSummary.reportId,
    capabilityId: reviewSummary.capabilityId,
    source: reviewSummary.source,
    decision: reviewSummary.decision,
    validityStatus: reviewSummary.validityStatus,
    applicationStatus,
    nextActionHint: reviewSummary.nextActionHint,
    reasonSummary: buildApplicationReasonSummary(applicationStatus, reviewSummary),
    issueCount: reviewSummary.issueCount,
  }
}

function mapResumeEligibilityStatus(
  application: ApprovalResponseApplication
): ApprovalResponseResumeEligibilityStatus {
  if (application.applicationStatus === "no_action") {
    return "not_applicable"
  }

  if (application.applicationStatus === "invalid_response") {
    return "blocked_invalid_response"
  }

  if (application.applicationStatus === "mark_rejected") {
    return "blocked_rejected"
  }

  if (application.applicationStatus === "mark_deferred") {
    return "blocked_deferred"
  }

  if (application.applicationStatus === "mark_needs_revision") {
    return "blocked_needs_revision"
  }

  return "blocked_still_requires_manual_gate"
}

function buildEligibilityBlockingReason(
  eligibilityStatus: ApprovalResponseResumeEligibilityStatus,
  application: ApprovalResponseApplication
): string | undefined {
  if (eligibilityStatus === "not_applicable") {
    return undefined
  }

  if (eligibilityStatus === "blocked_still_requires_manual_gate") {
    return "Approved responses still require a future manual resume gate in automation v1."
  }

  return application.reasonSummary
}

export function buildApprovalResponseResumeEligibility<
  TCapabilityId extends CapabilityId,
>(
  application: ApprovalResponseApplication<TCapabilityId>
): ApprovalResponseResumeEligibility<TCapabilityId> {
  const eligibilityStatus = mapResumeEligibilityStatus(application)

  return {
    eligibilityId: `resume-eligibility-${application.applicationId}`,
    evaluatedAt: application.evaluatedAt,
    requestId: application.requestId,
    reportId: application.reportId,
    capabilityId: application.capabilityId,
    source: application.source,
    decision: application.decision,
    applicationStatus: application.applicationStatus,
    eligibilityStatus,
    isEligible: eligibilityStatus === "eligible_for_manual_resume",
    blockingReason: buildEligibilityBlockingReason(eligibilityStatus, application),
    nextActionHint: application.nextActionHint,
  }
}

function mapManualResumeRequestStatus(
  eligibility: ApprovalResponseResumeEligibility
): ManualResumeRequestStatus {
  if (eligibility.eligibilityStatus === "not_applicable") {
    return "not_applicable"
  }

  if (eligibility.eligibilityStatus === "blocked_invalid_response") {
    return "request_rejected_invalid"
  }

  if (eligibility.eligibilityStatus === "blocked_still_requires_manual_gate") {
    return "request_pending_manual_gate"
  }

  return "request_blocked"
}

function buildManualResumeBlockingReason(
  requestStatus: ManualResumeRequestStatus,
  eligibility: ApprovalResponseResumeEligibility
): string | undefined {
  if (requestStatus === "not_applicable") {
    return undefined
  }

  if (requestStatus === "request_pending_manual_gate") {
    return "Manual resume remains gated and does not execute automatically in automation v1."
  }

  return eligibility.blockingReason
}

export function buildManualResumeRequest<
  TCapabilityId extends CapabilityId,
>(
  eligibility: ApprovalResponseResumeEligibility<TCapabilityId>
): ManualResumeRequest<TCapabilityId> {
  const requestStatus = mapManualResumeRequestStatus(eligibility)

  return {
    resumeRequestId: `manual-resume-request-${eligibility.eligibilityId}`,
    requestedAt: eligibility.evaluatedAt,
    requestId: eligibility.requestId,
    reportId: eligibility.reportId,
    capabilityId: eligibility.capabilityId,
    source: eligibility.source,
    decision: eligibility.decision,
    eligibilityStatus: eligibility.eligibilityStatus,
    requestStatus,
    isRequestable: requestStatus === "request_pending_manual_gate",
    blockingReason: buildManualResumeBlockingReason(requestStatus, eligibility),
    nextActionHint: eligibility.nextActionHint,
  }
}

function mapManualResumeGateStatus(
  resumeRequest: ManualResumeRequest
): ManualResumeGateStatus {
  if (resumeRequest.requestStatus === "not_applicable") {
    return "gate_not_applicable"
  }

  if (resumeRequest.requestStatus === "request_rejected_invalid") {
    return "gate_rejected_invalid"
  }

  if (resumeRequest.requestStatus === "request_pending_manual_gate") {
    return "gate_open_for_future_resume_contract"
  }

  return "gate_blocked"
}

function buildManualResumeGateBlockingReason(
  gateStatus: ManualResumeGateStatus,
  resumeRequest: ManualResumeRequest
): string | undefined {
  if (gateStatus === "gate_not_applicable") {
    return undefined
  }

  if (gateStatus === "gate_open_for_future_resume_contract") {
    return "Manual gate is open only for a future explicit resume contract, not for execution in automation v1."
  }

  return resumeRequest.blockingReason
}

export function buildManualResumeGate<
  TCapabilityId extends CapabilityId,
>(
  resumeRequest: ManualResumeRequest<TCapabilityId>
): ManualResumeGate<TCapabilityId> {
  const gateStatus = mapManualResumeGateStatus(resumeRequest)

  return {
    manualGateId: `manual-gate-${resumeRequest.resumeRequestId}`,
    evaluatedAt: resumeRequest.requestedAt,
    requestId: resumeRequest.requestId,
    reportId: resumeRequest.reportId,
    capabilityId: resumeRequest.capabilityId,
    source: resumeRequest.source,
    requestStatus: resumeRequest.requestStatus,
    gateStatus,
    canOpenResumePath: gateStatus === "gate_open_for_future_resume_contract",
    blockingReason: buildManualResumeGateBlockingReason(gateStatus, resumeRequest),
    nextActionHint: resumeRequest.nextActionHint,
  }
}

function mapManualResumeContractStatus(
  manualGate: ManualResumeGate
): ManualResumeContractStatus {
  if (manualGate.gateStatus === "gate_not_applicable") {
    return "contract_not_applicable"
  }

  if (manualGate.gateStatus === "gate_rejected_invalid") {
    return "contract_rejected_invalid"
  }

  if (manualGate.gateStatus === "gate_open_for_future_resume_contract") {
    return "contract_available_for_future_resume_artifact"
  }

  return "contract_blocked"
}

function buildManualResumeContractBlockingReason(
  contractStatus: ManualResumeContractStatus,
  manualGate: ManualResumeGate
): string | undefined {
  if (contractStatus === "contract_not_applicable") {
    return undefined
  }

  if (contractStatus === "contract_available_for_future_resume_artifact") {
    return "A future manual resume artifact may be issued later, but no executable resume action exists in automation v1."
  }

  return manualGate.blockingReason
}

export function buildManualResumeContract<
  TCapabilityId extends CapabilityId,
>(
  manualGate: ManualResumeGate<TCapabilityId>
): ManualResumeContract<TCapabilityId> {
  const contractStatus = mapManualResumeContractStatus(manualGate)

  return {
    manualResumeContractId: `manual-resume-contract-${manualGate.manualGateId}`,
    generatedAt: manualGate.evaluatedAt,
    requestId: manualGate.requestId,
    reportId: manualGate.reportId,
    capabilityId: manualGate.capabilityId,
    source: manualGate.source,
    gateStatus: manualGate.gateStatus,
    contractStatus,
    canIssueFutureResumeArtifact:
      contractStatus === "contract_available_for_future_resume_artifact",
    blockingReason: buildManualResumeContractBlockingReason(
      contractStatus,
      manualGate
    ),
    nextActionHint: manualGate.nextActionHint,
  }
}
