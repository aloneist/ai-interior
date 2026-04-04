import { mkdir, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import { dirname } from "node:path"
import type {
  AssetSearchInput,
  CapabilityId,
  CapabilityOutputMap,
  CapabilityRequest,
  CatalogReadInput,
  CatalogWriteSafeInput,
} from "@/automation/capabilities/types"
import { executeCapability } from "@/automation/execution"
import {
  receiveApprovalResponseWebhook,
  type ApprovalResponseWebhook,
} from "@/automation/orchestration/n8n/approval-response-webhook-intake"
import type {
  ApprovalResponseApplication,
  ApprovalResponseIntake,
  ApprovalResponseIntakeContext,
  ApprovalResponseRawInput,
  ApprovalResponseResumeEligibility,
  ApprovalResponseReviewSummary,
  ManualResumeContract,
  ManualResumeGate,
  ManualResumeRequest,
} from "@/automation/orchestration/n8n/approval-response-intake"

const APPROVAL_WEBHOOK_URL_ENV = "AUTOMATION_APPROVAL_WEBHOOK_URL"
const APPROVAL_WEBHOOK_SECRET_ENV = "AUTOMATION_APPROVAL_WEBHOOK_SECRET"
const SMOKE_REPORT_PATH_ENV = "AUTOMATION_SMOKE_REPORT_PATH"
const SMOKE_EXIT_CODE_SUCCESS = 0
const SMOKE_EXIT_CODE_FAILURE = 1

type SmokeScenario<TCapabilityId extends CapabilityId> = {
  label: string
  request: CapabilityRequest<TCapabilityId>
}

type SmokeScenarioOutcome = {
  capabilityId: CapabilityId
  errorCode?: string
  executionMode: string
  label: string
  operatorSummary: string[]
  passed: boolean
  selectedProviderId?: string
}

type SmokeJsonSummary = {
  approvalBoundary: "PASS" | "FAIL"
  inboundAuthBoundary: "PASS" | "FAIL"
  inboundResponseIntake: "PASS" | "FAIL"
  manualResumeChain: "PASS" | "FAIL"
  noResumeSafety: "PASS" | "FAIL"
  outboundWebhook: "PASS" | "FAIL"
  readOnlyAsset: "PASS" | "FAIL"
  readOnlyCatalog: "PASS" | "FAIL"
}

type SmokeJsonReport = {
  generatedAt: string
  overallStatus: "PASS" | "FAIL"
  passedCount: number
  scenarioCount: number
  scenarios: Array<{
    capabilityId: CapabilityId
    errorCode?: string
    executionMode: string
    label: string
    ok: boolean
    selectedProvider?: string
  }>
  summary: SmokeJsonSummary
}

type SmokeExitCodeContract = {
  exitCode: 0 | 1
  meaning: "all_scenarios_passed" | "one_or_more_scenarios_failed"
}

type SmokeWebhookCapture = {
  requests: Array<{
    method?: string
    body: string
  }>
  close: () => Promise<void>
  url: string
}

type SmokeApprovalResponseWebhookServer<
  TCapabilityId extends CapabilityId = CapabilityId,
> = {
  responses: ApprovalResponseWebhook<TCapabilityId>[]
  close: () => Promise<void>
  url: string
}

const smokeScenarios: [
  SmokeScenario<"catalog.read">,
  SmokeScenario<"asset.search">,
  SmokeScenario<"catalog.write.safe">,
] = [
  {
    label: "catalog.read success",
    request: {
      capabilityId: "catalog.read",
      requestId: "smoke-catalog-read-001",
      actorId: "automation-smoke-test",
      payload: {
        operation: "list_active_furniture_products",
        category: "chair",
        limit: 2,
      } satisfies CatalogReadInput,
    },
  },
  {
    label: "asset.search success",
    request: {
      capabilityId: "asset.search",
      requestId: "smoke-asset-search-001",
      actorId: "automation-smoke-test",
      payload: {
        operation: "search_design_reference_assets",
        folder: "mock/living-room",
        tags: ["chair"],
        maxResults: 2,
      } satisfies AssetSearchInput,
    },
  },
  {
    label: "catalog.write.safe approval-required",
    request: {
      capabilityId: "catalog.write.safe",
      requestId: "smoke-catalog-write-safe-001",
      actorId: "automation-smoke-test",
      payload: {
        operation: "archive",
        records: [{ id: "demo-product-001" }],
        reason: "Confirms the approval boundary stops write operations.",
        dryRun: true,
      } satisfies CatalogWriteSafeInput,
    },
  },
]

function formatDataPreview<TCapabilityId extends CapabilityId>(
  capabilityId: TCapabilityId,
  data: CapabilityOutputMap[TCapabilityId] | undefined
): string {
  if (!data) {
    return "none"
  }

  if (capabilityId === "catalog.read") {
    const catalogData = data as CapabilityOutputMap["catalog.read"]
    return `${catalogData.operation} via ${catalogData.source}, ${catalogData.items.length} item(s), totalCount=${catalogData.totalCount ?? 0}`
  }

  if (capabilityId === "asset.search") {
    const assetData = data as CapabilityOutputMap["asset.search"]
    return `${assetData.operation} via ${assetData.source}, ${assetData.results.length} result(s)`
  }

  return "none"
}

async function startSmokeWebhookCapture(): Promise<SmokeWebhookCapture> {
  const requests: SmokeWebhookCapture["requests"] = []

  const server = createServer((request, response) => {
    const chunks: Buffer[] = []

    request.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    request.on("end", () => {
      requests.push({
        method: request.method,
        body: Buffer.concat(chunks).toString("utf8"),
      })

      response.statusCode = 200
      response.setHeader("content-type", "application/json")
      response.end(JSON.stringify({ ok: true }))
    })
  })

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve())
  })

  const address = server.address()

  if (!address || typeof address === "string") {
    throw new Error("Smoke webhook capture failed to start.")
  }

  return {
    requests,
    url: `http://127.0.0.1:${address.port}/n8n-approval`,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      })
    },
  }
}

async function startSmokeApprovalResponseWebhookServer<
  TCapabilityId extends CapabilityId,
>(
  context: ApprovalResponseIntakeContext<TCapabilityId>
): Promise<SmokeApprovalResponseWebhookServer<TCapabilityId>> {
  const responses: ApprovalResponseWebhook<TCapabilityId>[] = []

  const server = createServer((request, response) => {
    const chunks: Buffer[] = []

    request.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    request.on("end", () => {
      const result = receiveApprovalResponseWebhook(
        {
          method: request.method,
          contentType:
            typeof request.headers["content-type"] === "string"
              ? request.headers["content-type"]
              : undefined,
          authorization:
            typeof request.headers.authorization === "string"
              ? request.headers.authorization
              : undefined,
          body: Buffer.concat(chunks).toString("utf8"),
        },
        context
      )

      responses.push(result)

      response.statusCode =
        result.status === "blocked_untrusted"
          ? 401
          : result.status === "rejected_invalid"
            ? 400
            : 200
      response.setHeader("content-type", "application/json")
      response.end(JSON.stringify(result))
    })
  })

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve())
  })

  const address = server.address()

  if (!address || typeof address === "string") {
    throw new Error("Smoke approval response webhook server failed to start.")
  }

  return {
    responses,
    url: `http://127.0.0.1:${address.port}/n8n-approval-response`,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      })
    },
  }
}

async function postSmokeApprovalResponseWebhook<TCapabilityId extends CapabilityId>(
  url: string,
  body: string,
  authorization: string,
  contentType = "application/json"
): Promise<{
  httpStatus: number
  response: ApprovalResponseWebhook<TCapabilityId>
}> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization,
      "content-type": contentType,
    },
    body,
  })

  return {
    httpStatus: response.status,
    response: (await response.json()) as ApprovalResponseWebhook<TCapabilityId>,
  }
}

function getSmokeTrustedAuthorization(): string {
  const webhookSecret = process.env[APPROVAL_WEBHOOK_SECRET_ENV]?.trim()

  if (!webhookSecret) {
    throw new Error(
      "Smoke trusted authorization requires AUTOMATION_APPROVAL_WEBHOOK_SECRET."
    )
  }

  return `Bearer ${webhookSecret}`
}

function requireWebhookChain<TCapabilityId extends CapabilityId>(
  webhook: ApprovalResponseWebhook<TCapabilityId>
): {
  rawInput: ApprovalResponseRawInput
  intake: ApprovalResponseIntake<TCapabilityId>
  reviewSummary: ApprovalResponseReviewSummary<TCapabilityId>
  application: ApprovalResponseApplication<TCapabilityId>
  resumeEligibility: ApprovalResponseResumeEligibility<TCapabilityId>
  manualResumeRequest: ManualResumeRequest<TCapabilityId>
  manualResumeGate: ManualResumeGate<TCapabilityId>
  manualResumeContract: ManualResumeContract<TCapabilityId>
} {
  if (
    !webhook.rawInput ||
    !webhook.intake ||
    !webhook.reviewSummary ||
    !webhook.application ||
    !webhook.resumeEligibility ||
    !webhook.manualResumeRequest ||
    !webhook.manualResumeGate ||
    !webhook.manualResumeContract
  ) {
    throw new Error(
      `Webhook ${webhook.webhookId} did not include the expected receive-side contract chain.`
    )
  }

  return {
    rawInput: webhook.rawInput,
    intake: webhook.intake,
    reviewSummary: webhook.reviewSummary,
    application: webhook.application,
    resumeEligibility: webhook.resumeEligibility,
    manualResumeRequest: webhook.manualResumeRequest,
    manualResumeGate: webhook.manualResumeGate,
    manualResumeContract: webhook.manualResumeContract,
  }
}

function buildOperatorSummary(
  scenario: SmokeScenario<CapabilityId>,
  passed: boolean
): string[] {
  if (scenario.request.capabilityId === "catalog.read") {
    return [
      `read-only catalog flow: ${passed ? "PASS" : "FAIL"} (${scenario.request.capabilityId} auto-run)`,
    ]
  }

  if (scenario.request.capabilityId === "asset.search") {
    return [
      `read-only asset flow: ${passed ? "PASS" : "FAIL"} (${scenario.request.capabilityId} auto-run)`,
    ]
  }

  return [
    `approval boundary: ${passed ? "PASS" : "FAIL"} (write path still blocked)`,
    `outbound webhook: ${passed ? "PASS" : "FAIL"} (approval handoff delivery)`,
    `inbound auth boundary: ${passed ? "PASS" : "FAIL"} (trusted vs untrusted)`,
    `inbound response intake: ${passed ? "PASS" : "FAIL"} (accepted and invalid classification)`,
    `manual resume chain: ${passed ? "PASS" : "FAIL"} (contract-only, no execution resume)`,
  ]
}

function printFinalSmokeSummary(outcomes: SmokeScenarioOutcome[]): void {
  const passedCount = outcomes.filter((outcome) => outcome.passed).length
  const overallStatus = passedCount === outcomes.length ? "PASS" : "FAIL"

  console.log("")
  console.log("FINAL SUMMARY")
  console.log(`  overall: ${overallStatus} (${passedCount}/${outcomes.length} scenarios)`)

  for (const outcome of outcomes) {
    console.log(`  scenario: ${outcome.label} -> ${outcome.passed ? "PASS" : "FAIL"}`)

    for (const line of outcome.operatorSummary) {
      console.log(`    ${line}`)
    }
  }

  console.log(`  no-resume safety: ${overallStatus} (blocked execution still does not resume)`)
}

function buildSmokeJsonSummary(
  outcomes: SmokeScenarioOutcome[]
): SmokeJsonSummary {
  const catalogOutcome = outcomes.find(
    (outcome) => outcome.capabilityId === "catalog.read"
  )
  const assetOutcome = outcomes.find(
    (outcome) => outcome.capabilityId === "asset.search"
  )
  const approvalOutcome = outcomes.find(
    (outcome) => outcome.capabilityId === "catalog.write.safe"
  )

  return {
    readOnlyCatalog: catalogOutcome?.passed ? "PASS" : "FAIL",
    readOnlyAsset: assetOutcome?.passed ? "PASS" : "FAIL",
    approvalBoundary: approvalOutcome?.passed ? "PASS" : "FAIL",
    outboundWebhook: approvalOutcome?.passed ? "PASS" : "FAIL",
    inboundAuthBoundary: approvalOutcome?.passed ? "PASS" : "FAIL",
    inboundResponseIntake: approvalOutcome?.passed ? "PASS" : "FAIL",
    manualResumeChain: approvalOutcome?.passed ? "PASS" : "FAIL",
    noResumeSafety: outcomes.every((outcome) => outcome.passed) ? "PASS" : "FAIL",
  }
}

function buildSmokeJsonReport(outcomes: SmokeScenarioOutcome[]): SmokeJsonReport {
  const passedCount = outcomes.filter((outcome) => outcome.passed).length

  return {
    generatedAt: new Date().toISOString(),
    overallStatus: passedCount === outcomes.length ? "PASS" : "FAIL",
    scenarioCount: outcomes.length,
    passedCount,
    summary: buildSmokeJsonSummary(outcomes),
    scenarios: outcomes.map((outcome) => ({
      label: outcome.label,
      capabilityId: outcome.capabilityId,
      ok: outcome.passed,
      selectedProvider: outcome.selectedProviderId,
      executionMode: outcome.executionMode,
      errorCode: outcome.errorCode,
    })),
  }
}

function serializeSmokeJsonReport(report: SmokeJsonReport): string {
  return JSON.stringify(report, null, 2)
}

function printSmokeJsonReport(reportJson: string): void {
  console.log("")
  console.log("JSON REPORT")
  console.log(reportJson)
}

async function writeSmokeJsonReportFile(
  reportPath: string | undefined,
  reportJson: string
): Promise<void> {
  if (!reportPath) {
    return
  }

  await mkdir(dirname(reportPath), { recursive: true })
  await writeFile(reportPath, `${reportJson}\n`, "utf8")

  console.log("")
  console.log("REPORT FILE")
  console.log(`  path: ${reportPath}`)
}

function buildSmokeExitCodeContract(
  outcomes: SmokeScenarioOutcome[]
): SmokeExitCodeContract {
  const passedCount = outcomes.filter((outcome) => outcome.passed).length

  if (passedCount === outcomes.length) {
    return {
      exitCode: SMOKE_EXIT_CODE_SUCCESS,
      meaning: "all_scenarios_passed",
    }
  }

  return {
    exitCode: SMOKE_EXIT_CODE_FAILURE,
    meaning: "one_or_more_scenarios_failed",
  }
}

function printSmokeExitCodeContract(outcomes: SmokeScenarioOutcome[]): void {
  const contract = buildSmokeExitCodeContract(outcomes)

  console.log("")
  console.log("EXIT CODE CONTRACT")
  console.log(`  exitCode: ${contract.exitCode}`)
  console.log(`  meaning: ${contract.meaning}`)
}

async function runScenario<TCapabilityId extends CapabilityId>(
  scenario: SmokeScenario<TCapabilityId>
): Promise<SmokeScenarioOutcome> {
  const execution = await executeCapability(scenario.request)
  const {
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
  } = execution

  console.log(`SCENARIO ${scenario.label}`)
  console.log(`  capability: ${scenario.request.capabilityId}`)
  console.log(`  executionMode: ${selection.executionMode}`)
  console.log(`  selectedProvider: ${selection.selectedProviderId ?? "none"}`)
  console.log(
    `  readyProviders: ${
      selection.availableReadyProviderIds.length
        ? selection.availableReadyProviderIds.join(", ")
        : "none"
    }`
  )
  console.log(`  ok: ${result.ok ? "true" : "false"}`)
  console.log(`  auditEventId: ${audit.eventId}`)
  console.log(`  auditOutcome: ${audit.outcomeStatus}`)
  console.log(`  auditSource: ${audit.sourceSummary ?? "none"}`)
  console.log(`  auditErrorCode: ${audit.errorCode ?? "none"}`)
  console.log(`  reportId: ${report.reportId}`)
  console.log(`  reportStatus: ${report.finalStatus}`)
  console.log(`  reportAuditRef: ${report.auditEventId}`)
  console.log(`  reviewSummaryId: ${reviewSummary.summaryId}`)
  console.log(`  reviewStatus: ${reviewSummary.reviewStatus}`)
  console.log(`  reviewReportRef: ${reviewSummary.reportId}`)
  console.log(`  decisionId: ${decisionEnvelope?.decisionId ?? "none"}`)
  console.log(`  decisionValue: ${decisionEnvelope?.decision ?? "none"}`)
  console.log(`  decisionNextAction: ${decisionEnvelope?.nextAction ?? "none"}`)
  console.log(`  snapshotId: ${stateSnapshot.snapshotId}`)
  console.log(`  snapshotFinalStatus: ${stateSnapshot.finalStatus}`)
  console.log(`  snapshotReviewStatus: ${stateSnapshot.reviewStatus ?? "none"}`)
  console.log(
    `  snapshotApprovalState: ${stateSnapshot.approvalLifecycleState ?? "none"}`
  )
  console.log(`  snapshotDecisionState: ${stateSnapshot.decisionState ?? "none"}`)
  console.log(`  snapshotReportRef: ${stateSnapshot.reportId}`)
  console.log(`  snapshotAuditRef: ${stateSnapshot.auditEventId}`)
  console.log(`  bundleId: ${contractBundle.bundleId}`)
  console.log(`  bundleFinalStatus: ${contractBundle.finalStatus}`)
  console.log(`  bundleReportRef: ${contractBundle.report.reportId}`)
  console.log(`  bundleAuditRef: ${contractBundle.audit.eventId}`)
  console.log(`  bundleReviewRef: ${contractBundle.reviewSummary.summaryId}`)
  console.log(`  bundleSnapshotRef: ${contractBundle.stateSnapshot.snapshotId}`)
  console.log(
    `  bundleDecisionRef: ${contractBundle.decisionEnvelope?.decisionId ?? "none"}`
  )
  console.log(`  exportEnvelopeId: ${exportEnvelope.envelopeId}`)
  console.log(`  exportTarget: ${exportEnvelope.exportTarget}`)
  console.log(`  exportFinalStatus: ${exportEnvelope.finalStatus}`)
  console.log(`  exportApprovalState: ${exportEnvelope.approvalState ?? "none"}`)
  console.log(`  exportReviewStatus: ${exportEnvelope.reviewStatus ?? "none"}`)
  console.log(`  exportReportRef: ${exportEnvelope.reportId}`)
  console.log(`  exportAuditRef: ${exportEnvelope.auditEventId}`)
  console.log(`  exportBundleRef: ${exportEnvelope.bundle.bundleId}`)
  console.log(`  serializerVersion: ${exportSerializer.serializerVersion}`)
  console.log(`  serializerContentType: ${exportSerializer.contentType}`)
  console.log(`  serializerSucceeded: ${exportSerializer.succeeded ? "true" : "false"}`)
  console.log(`  serializerEnvelopeRef: ${exportSerializer.envelopeId}`)
  console.log(`  serializerPayloadReportRef: ${exportSerializer.payloadObject.reportId}`)
  console.log(`  serializerJsonLength: ${exportSerializer.payloadJson.length}`)
  console.log(`  transportReceiptId: ${transportReceipt?.receiptId ?? "none"}`)
  console.log(`  transportAttempted: ${transportReceipt?.attempted ?? "none"}`)
  console.log(`  transportDelivered: ${transportReceipt?.delivered ?? "none"}`)
  console.log(`  transportStatus: ${transportReceipt?.status ?? "none"}`)
  console.log(`  transportPayloadBytes: ${transportReceipt?.payloadByteLength ?? "none"}`)
  console.log(`  handoffSummaryId: ${handoffSummary.handoffSummaryId}`)
  console.log(`  handoffStatus: ${handoffSummary.handoffStatus}`)
  console.log(`  handoffAttempted: ${handoffSummary.attempted ? "true" : "false"}`)
  console.log(`  handoffDelivered: ${handoffSummary.delivered ? "true" : "false"}`)
  console.log(`  handoffReceiptRef: ${handoffSummary.receiptId ?? "none"}`)
  console.log(`  readinessId: ${deliveryReadiness.readinessId}`)
  console.log(`  readinessStatus: ${deliveryReadiness.readinessStatus}`)
  console.log(`  readinessIsReady: ${deliveryReadiness.isReady ? "true" : "false"}`)
  console.log(`  readinessEnvelopeRef: ${deliveryReadiness.envelopeId ?? "none"}`)
  console.log(`  adapterId: ${transportAdapter.adapterId}`)
  console.log(`  adapterStatus: ${transportAdapter.status}`)
  console.log(`  adapterTarget: ${transportAdapter.adapterTarget ?? "none"}`)
  console.log(`  adapterDeliveryPossible: ${transportAdapter.deliveryPossible ? "true" : "false"}`)
  console.log(`  adapterReceiptRef: ${transportAdapter.receiptId ?? "none"}`)

  if (result.ok) {
    const trustedAuthorization = getSmokeTrustedAuthorization()
    const inboundWebhookServer = await startSmokeApprovalResponseWebhookServer(
      {
        requestId: report.requestId,
        reportId: report.reportId,
        capabilityId: report.capabilityId,
        finalStatus: report.finalStatus,
        decisionId: decisionEnvelope?.decisionId,
      }
    )
    const ignoredWebhookPost =
      await postSmokeApprovalResponseWebhook<TCapabilityId>(
        inboundWebhookServer.url,
        JSON.stringify({
          source: "n8n",
          requestId: report.requestId,
          reportId: report.reportId,
          capabilityId: report.capabilityId,
          decision: "approved",
          note: "Smoke ignored intake response.",
        }),
        trustedAuthorization
      )
    await inboundWebhookServer.close()

    const ignoredWebhook = ignoredWebhookPost.response
    const ignoredWebhookChain = requireWebhookChain(ignoredWebhook)
    const ignoredIntake = ignoredWebhookChain.intake
    const ignoredSummary = ignoredWebhookChain.reviewSummary
    const ignoredApplication = ignoredWebhookChain.application
    const ignoredEligibility = ignoredWebhookChain.resumeEligibility
    const ignoredResumeRequest = ignoredWebhookChain.manualResumeRequest
    const ignoredManualGate = ignoredWebhookChain.manualResumeGate
    const ignoredManualResumeContract = ignoredWebhookChain.manualResumeContract

    console.log(`  inboundWebhookId: ${ignoredWebhook.webhookId}`)
    console.log(`  inboundWebhookAuth: ${ignoredWebhook.auth.status}`)
    console.log(`  inboundWebhookStatus: ${ignoredWebhook.status}`)
    console.log(`  inboundWebhookMethod: ${ignoredWebhook.method}`)
    console.log(`  inboundWebhookHttpStatus: ${ignoredWebhookPost.httpStatus}`)
    console.log(`  inboundWebhookIssues: ${ignoredWebhook.issues.join(" | ")}`)
    console.log(`  intakeId: ${ignoredIntake.intakeId}`)
    console.log(`  intakeValidity: ${ignoredIntake.validityStatus}`)
    console.log(`  intakeDecision: ${ignoredIntake.decision ?? "none"}`)
    console.log(`  intakeNextAction: ${ignoredIntake.nextActionHint ?? "none"}`)
    console.log(`  intakeIssues: ${ignoredIntake.issues.join(" | ")}`)
    console.log(`  responseSummaryId: ${ignoredSummary.responseSummaryId}`)
    console.log(`  responseSummaryValidity: ${ignoredSummary.validityStatus}`)
    console.log(`  responseSummaryIssues: ${ignoredSummary.issueCount}`)
    console.log(`  responseSummaryText: ${ignoredSummary.statusSummary}`)
    console.log(`  responseApplicationId: ${ignoredApplication.applicationId}`)
    console.log(
      `  responseApplicationStatus: ${ignoredApplication.applicationStatus}`
    )
    console.log(
      `  responseApplicationReason: ${ignoredApplication.reasonSummary}`
    )
    console.log(`  responseEligibilityId: ${ignoredEligibility.eligibilityId}`)
    console.log(
      `  responseEligibilityStatus: ${ignoredEligibility.eligibilityStatus}`
    )
    console.log(
      `  responseEligibilityBlocked: ${ignoredEligibility.blockingReason ?? "none"}`
    )
    console.log(
      `  manualResumeRequestId: ${ignoredResumeRequest.resumeRequestId}`
    )
    console.log(
      `  manualResumeRequestStatus: ${ignoredResumeRequest.requestStatus}`
    )
    console.log(
      `  manualResumeRequestBlocked: ${ignoredResumeRequest.blockingReason ?? "none"}`
    )
    console.log(`  manualGateId: ${ignoredManualGate.manualGateId}`)
    console.log(`  manualGateStatus: ${ignoredManualGate.gateStatus}`)
    console.log(
      `  manualGateBlocked: ${ignoredManualGate.blockingReason ?? "none"}`
    )
    console.log(
      `  manualResumeContractId: ${ignoredManualResumeContract.manualResumeContractId}`
    )
    console.log(
      `  manualResumeContractStatus: ${ignoredManualResumeContract.contractStatus}`
    )
    console.log(
      `  manualResumeContractBlocked: ${ignoredManualResumeContract.blockingReason ?? "none"}`
    )
    console.log(`  data: ${formatDataPreview(scenario.request.capabilityId, result.data)}`)
    console.log("")
    const passed =
      audit.outcomeStatus === "executed" &&
      report.finalStatus === "executed" &&
      report.auditEventId === audit.eventId &&
      reviewSummary.reviewStatus === "info" &&
      reviewSummary.reportId === report.reportId &&
      decisionEnvelope === undefined &&
      stateSnapshot.finalStatus === "executed" &&
      stateSnapshot.reviewStatus === "info" &&
      stateSnapshot.approvalLifecycleState === undefined &&
      stateSnapshot.decisionState === undefined &&
      stateSnapshot.reportId === report.reportId &&
      stateSnapshot.auditEventId === audit.eventId &&
      contractBundle.finalStatus === "executed" &&
      contractBundle.executionMode === selection.executionMode &&
      contractBundle.audit.eventId === audit.eventId &&
      contractBundle.report.reportId === report.reportId &&
      contractBundle.reviewSummary.summaryId === reviewSummary.summaryId &&
      contractBundle.stateSnapshot.snapshotId === stateSnapshot.snapshotId &&
      contractBundle.decisionEnvelope === undefined &&
      exportEnvelope.exportTarget === "external_handoff" &&
      exportEnvelope.finalStatus === "executed" &&
      exportEnvelope.approvalState === undefined &&
      exportEnvelope.reviewStatus === "info" &&
      exportEnvelope.reportId === report.reportId &&
      exportEnvelope.auditEventId === audit.eventId &&
      exportEnvelope.bundle.bundleId === contractBundle.bundleId &&
      exportSerializer.serializerVersion === "v1" &&
      exportSerializer.contentType === "application/json" &&
      exportSerializer.succeeded === true &&
      exportSerializer.envelopeId === exportEnvelope.envelopeId &&
      exportSerializer.exportTarget === exportEnvelope.exportTarget &&
      exportSerializer.payloadObject.reportId === report.reportId &&
      exportSerializer.payloadObject.auditEventId === audit.eventId &&
      exportSerializer.payloadObject.bundle.bundleId === contractBundle.bundleId &&
    exportSerializer.payloadJson === JSON.stringify(exportSerializer.payloadObject) &&
    transportReceipt === undefined &&
    handoffSummary.handoffStatus === "not_applicable" &&
      handoffSummary.attempted === false &&
      handoffSummary.delivered === false &&
      handoffSummary.receiptId === undefined &&
      handoffSummary.envelopeId === exportEnvelope.envelopeId &&
      deliveryReadiness.readinessStatus === "not_applicable" &&
      deliveryReadiness.isReady === false &&
      deliveryReadiness.blockingReason === undefined &&
      deliveryReadiness.handoffStatus === undefined &&
      deliveryReadiness.envelopeId === undefined &&
      deliveryReadiness.receiptId === undefined &&
      transportAdapter.adapterId === "n8n-webhook-transport" &&
      transportAdapter.status === "adapter_not_applicable" &&
      transportAdapter.deliveryAttempted === false &&
      transportAdapter.deliveryPossible === false &&
      transportAdapter.adapterTarget === undefined &&
      transportAdapter.input === undefined &&
      transportAdapter.receiptId === undefined &&
      ignoredWebhook.target === "n8n-approval-response" &&
      ignoredWebhook.intakeMode === "webhook" &&
      ignoredWebhook.method === "POST" &&
      ignoredWebhook.auth.field === "authorization" &&
      ignoredWebhook.auth.status === "trusted" &&
      ignoredWebhookPost.httpStatus === 200 &&
      ignoredWebhook.status === "ignored_not_applicable" &&
      ignoredWebhookChain.rawInput.requestId === report.requestId &&
      ignoredWebhookChain.rawInput.reportId === report.reportId &&
      ignoredWebhookChain.rawInput.capabilityId === report.capabilityId &&
      ignoredWebhookChain.rawInput.source === "n8n" &&
      ignoredWebhookChain.rawInput.decision === "approved" &&
      ignoredWebhookChain.rawInput.note === "Smoke ignored intake response." &&
      ignoredWebhookChain.intake.intakeId === ignoredIntake.intakeId &&
      ignoredWebhookChain.reviewSummary.responseSummaryId ===
        ignoredSummary.responseSummaryId &&
      ignoredWebhookChain.application.applicationId ===
        ignoredApplication.applicationId &&
      ignoredWebhookChain.resumeEligibility.eligibilityId ===
        ignoredEligibility.eligibilityId &&
      ignoredWebhookChain.manualResumeRequest.resumeRequestId ===
        ignoredResumeRequest.resumeRequestId &&
      ignoredWebhookChain.manualResumeGate.manualGateId ===
        ignoredManualGate.manualGateId &&
      ignoredWebhookChain.manualResumeContract.manualResumeContractId ===
        ignoredManualResumeContract.manualResumeContractId &&
      ignoredIntake.requestId === report.requestId &&
      ignoredIntake.reportId === report.reportId &&
      ignoredIntake.capabilityId === report.capabilityId &&
      ignoredIntake.decisionId === undefined &&
      ignoredIntake.source === "n8n" &&
      ignoredIntake.decision === "approved" &&
      ignoredIntake.nextActionHint === undefined &&
      ignoredIntake.validityStatus === "ignored_not_applicable" &&
      ignoredIntake.issues.includes(
        "Approval response intake is not applicable for this execution state."
      ) &&
      ignoredSummary.requestId === report.requestId &&
      ignoredSummary.reportId === report.reportId &&
      ignoredSummary.capabilityId === report.capabilityId &&
      ignoredSummary.source === "n8n" &&
      ignoredSummary.decision === "approved" &&
      ignoredSummary.validityStatus === "ignored_not_applicable" &&
      ignoredSummary.nextActionHint === undefined &&
      ignoredSummary.issueCount === 1 &&
      ignoredSummary.statusSummary ===
        `Ignored response because ${report.capabilityId} is not in an approval-required state.` &&
      ignoredApplication.requestId === report.requestId &&
      ignoredApplication.reportId === report.reportId &&
      ignoredApplication.capabilityId === report.capabilityId &&
      ignoredApplication.source === "n8n" &&
      ignoredApplication.decision === "approved" &&
      ignoredApplication.validityStatus === "ignored_not_applicable" &&
      ignoredApplication.applicationStatus === "no_action" &&
      ignoredApplication.nextActionHint === undefined &&
      ignoredApplication.issueCount === 1 &&
      ignoredApplication.reasonSummary === ignoredSummary.statusSummary &&
      ignoredEligibility.requestId === report.requestId &&
      ignoredEligibility.reportId === report.reportId &&
      ignoredEligibility.capabilityId === report.capabilityId &&
      ignoredEligibility.source === "n8n" &&
      ignoredEligibility.decision === "approved" &&
      ignoredEligibility.applicationStatus === "no_action" &&
      ignoredEligibility.eligibilityStatus === "not_applicable" &&
      ignoredEligibility.isEligible === false &&
      ignoredEligibility.blockingReason === undefined &&
      ignoredEligibility.nextActionHint === undefined &&
      ignoredResumeRequest.requestId === report.requestId &&
      ignoredResumeRequest.reportId === report.reportId &&
      ignoredResumeRequest.capabilityId === report.capabilityId &&
      ignoredResumeRequest.source === "n8n" &&
      ignoredResumeRequest.decision === "approved" &&
      ignoredResumeRequest.eligibilityStatus === "not_applicable" &&
      ignoredResumeRequest.requestStatus === "not_applicable" &&
      ignoredResumeRequest.isRequestable === false &&
      ignoredResumeRequest.blockingReason === undefined &&
      ignoredResumeRequest.nextActionHint === undefined &&
      ignoredManualGate.requestId === report.requestId &&
      ignoredManualGate.reportId === report.reportId &&
      ignoredManualGate.capabilityId === report.capabilityId &&
      ignoredManualGate.source === "n8n" &&
      ignoredManualGate.requestStatus === "not_applicable" &&
      ignoredManualGate.gateStatus === "gate_not_applicable" &&
      ignoredManualGate.canOpenResumePath === false &&
      ignoredManualGate.blockingReason === undefined &&
      ignoredManualGate.nextActionHint === undefined &&
      ignoredManualResumeContract.requestId === report.requestId &&
      ignoredManualResumeContract.reportId === report.reportId &&
      ignoredManualResumeContract.capabilityId === report.capabilityId &&
      ignoredManualResumeContract.source === "n8n" &&
      ignoredManualResumeContract.gateStatus === "gate_not_applicable" &&
      ignoredManualResumeContract.contractStatus === "contract_not_applicable" &&
      ignoredManualResumeContract.canIssueFutureResumeArtifact === false &&
      ignoredManualResumeContract.blockingReason === undefined &&
      ignoredManualResumeContract.nextActionHint === undefined
    return {
      capabilityId: scenario.request.capabilityId,
      errorCode: result.error?.code,
      executionMode: selection.executionMode,
      label: scenario.label,
      operatorSummary: buildOperatorSummary(
        scenario as SmokeScenario<CapabilityId>,
        passed
      ),
      passed,
      selectedProviderId: selection.selectedProviderId ?? undefined,
    }
  }

  const trustedAuthorization = getSmokeTrustedAuthorization()
  const inboundWebhookServer = await startSmokeApprovalResponseWebhookServer({
    requestId: report.requestId,
    reportId: report.reportId,
    capabilityId: report.capabilityId,
    finalStatus: report.finalStatus,
    decisionId: decisionEnvelope?.decisionId,
  })
  const acceptedApprovedWebhookPost =
    await postSmokeApprovalResponseWebhook<TCapabilityId>(
      inboundWebhookServer.url,
      JSON.stringify({
        source: "n8n",
        requestId: report.requestId,
        reportId: report.reportId,
        capabilityId: report.capabilityId,
        decisionId: decisionEnvelope?.decisionId,
        decision: "approved",
        note: "Smoke approval accepted response.",
      }),
      trustedAuthorization
    )
  const acceptedRejectedWebhookPost =
    await postSmokeApprovalResponseWebhook<TCapabilityId>(
      inboundWebhookServer.url,
      JSON.stringify({
        source: "n8n",
        requestId: report.requestId,
        reportId: report.reportId,
        capabilityId: report.capabilityId,
        decisionId: decisionEnvelope?.decisionId,
        decision: "rejected",
        note: "Smoke approval rejected response.",
      }),
      trustedAuthorization
    )
  const acceptedDeferredWebhookPost =
    await postSmokeApprovalResponseWebhook<TCapabilityId>(
      inboundWebhookServer.url,
      JSON.stringify({
        source: "n8n",
        requestId: report.requestId,
        reportId: report.reportId,
        capabilityId: report.capabilityId,
        decisionId: decisionEnvelope?.decisionId,
        decision: "deferred",
        note: "Smoke approval deferred response.",
      }),
      trustedAuthorization
    )
  const acceptedNeedsRevisionWebhookPost =
    await postSmokeApprovalResponseWebhook<TCapabilityId>(
      inboundWebhookServer.url,
      JSON.stringify({
        source: "n8n",
        requestId: report.requestId,
        reportId: report.reportId,
        capabilityId: report.capabilityId,
        decisionId: decisionEnvelope?.decisionId,
        decision: "needs_revision",
        note: "Smoke approval needs-revision response.",
      }),
      trustedAuthorization
    )
  const invalidWebhookPost = await postSmokeApprovalResponseWebhook<TCapabilityId>(
    inboundWebhookServer.url,
    JSON.stringify({
      source: 7,
      requestId: "wrong-request-id",
      reportId: report.reportId,
      capabilityId: "asset.search",
      decisionId: "wrong-decision-id",
      decision: "ship-it",
    }),
    trustedAuthorization
  )
  const untrustedWebhookPost =
    await postSmokeApprovalResponseWebhook<TCapabilityId>(
      inboundWebhookServer.url,
      JSON.stringify({
        source: "n8n",
        requestId: report.requestId,
        reportId: report.reportId,
        capabilityId: report.capabilityId,
        decisionId: decisionEnvelope?.decisionId,
        decision: "approved",
        note: "Smoke untrusted response should be blocked.",
      }),
      "Bearer untrusted-smoke-token"
    )
  await inboundWebhookServer.close()

  const acceptedApprovedWebhook = acceptedApprovedWebhookPost.response
  const acceptedRejectedWebhook = acceptedRejectedWebhookPost.response
  const acceptedDeferredWebhook = acceptedDeferredWebhookPost.response
  const acceptedNeedsRevisionWebhook = acceptedNeedsRevisionWebhookPost.response
  const invalidWebhook = invalidWebhookPost.response
  const untrustedWebhook = untrustedWebhookPost.response

  const acceptedApprovedWebhookChain = requireWebhookChain(
    acceptedApprovedWebhook
  )
  const acceptedRejectedWebhookChain = requireWebhookChain(
    acceptedRejectedWebhook
  )
  const acceptedDeferredWebhookChain = requireWebhookChain(
    acceptedDeferredWebhook
  )
  const acceptedNeedsRevisionWebhookChain = requireWebhookChain(
    acceptedNeedsRevisionWebhook
  )
  const invalidWebhookChain = requireWebhookChain(invalidWebhook)

  const acceptedApprovedIntake = acceptedApprovedWebhookChain.intake
  const invalidIntake = invalidWebhookChain.intake
  const acceptedApprovedSummary = acceptedApprovedWebhookChain.reviewSummary
  const acceptedRejectedSummary = acceptedRejectedWebhookChain.reviewSummary
  const acceptedDeferredSummary = acceptedDeferredWebhookChain.reviewSummary
  const acceptedNeedsRevisionSummary =
    acceptedNeedsRevisionWebhookChain.reviewSummary
  const invalidSummary = invalidWebhookChain.reviewSummary
  const acceptedApprovedApplication = acceptedApprovedWebhookChain.application
  const acceptedRejectedApplication = acceptedRejectedWebhookChain.application
  const acceptedDeferredApplication = acceptedDeferredWebhookChain.application
  const acceptedNeedsRevisionApplication =
    acceptedNeedsRevisionWebhookChain.application
  const invalidApplication = invalidWebhookChain.application
  const acceptedApprovedEligibility =
    acceptedApprovedWebhookChain.resumeEligibility
  const acceptedRejectedEligibility =
    acceptedRejectedWebhookChain.resumeEligibility
  const acceptedDeferredEligibility =
    acceptedDeferredWebhookChain.resumeEligibility
  const acceptedNeedsRevisionEligibility =
    acceptedNeedsRevisionWebhookChain.resumeEligibility
  const invalidEligibility = invalidWebhookChain.resumeEligibility
  const acceptedApprovedResumeRequest =
    acceptedApprovedWebhookChain.manualResumeRequest
  const acceptedRejectedResumeRequest =
    acceptedRejectedWebhookChain.manualResumeRequest
  const acceptedDeferredResumeRequest =
    acceptedDeferredWebhookChain.manualResumeRequest
  const acceptedNeedsRevisionResumeRequest =
    acceptedNeedsRevisionWebhookChain.manualResumeRequest
  const invalidResumeRequest = invalidWebhookChain.manualResumeRequest
  const acceptedApprovedManualGate = acceptedApprovedWebhookChain.manualResumeGate
  const acceptedRejectedManualGate = acceptedRejectedWebhookChain.manualResumeGate
  const acceptedDeferredManualGate = acceptedDeferredWebhookChain.manualResumeGate
  const acceptedNeedsRevisionManualGate =
    acceptedNeedsRevisionWebhookChain.manualResumeGate
  const invalidManualGate = invalidWebhookChain.manualResumeGate
  const acceptedApprovedManualResumeContract =
    acceptedApprovedWebhookChain.manualResumeContract
  const acceptedRejectedManualResumeContract =
    acceptedRejectedWebhookChain.manualResumeContract
  const acceptedDeferredManualResumeContract =
    acceptedDeferredWebhookChain.manualResumeContract
  const acceptedNeedsRevisionManualResumeContract =
    acceptedNeedsRevisionWebhookChain.manualResumeContract
  const invalidManualResumeContract = invalidWebhookChain.manualResumeContract

  console.log(`  errorCode: ${result.error?.code ?? "none"}`)
  console.log(`  errorMessage: ${result.error?.message ?? "none"}`)
  console.log(`  approvalStatus: ${result.approval?.status ?? "not-required"}`)
  console.log(`  approvalRisk: ${result.approval?.riskLevel ?? "none"}`)
  console.log(`  handoffTarget: ${result.approval?.handoff?.target ?? "none"}`)
  console.log(`  handoffStatus: ${result.approval?.handoff?.status ?? "none"}`)
  console.log(`  handoffOperation: ${result.approval?.handoff?.operation ?? "none"}`)
  console.log(`  senderMode: ${result.approval?.senderResult?.deliveryMode ?? "none"}`)
  console.log(`  senderStatus: ${result.approval?.senderResult?.status ?? "none"}`)
  console.log(`  senderDelivered: ${result.approval?.senderResult?.delivered ?? "none"}`)
  console.log(`  lifecycleState: ${result.approval?.lifecycle?.currentState ?? "none"}`)
  console.log(
    `  lifecycleReached: ${result.approval?.lifecycle?.reachedStates.join(", ") ?? "none"}`
  )
  console.log(`  inboundAcceptedWebhookAuth: ${acceptedApprovedWebhook.auth.status}`)
  console.log(`  inboundAcceptedWebhookId: ${acceptedApprovedWebhook.webhookId}`)
  console.log(`  inboundAcceptedWebhookStatus: ${acceptedApprovedWebhook.status}`)
  console.log(`  inboundAcceptedWebhookHttpStatus: ${acceptedApprovedWebhookPost.httpStatus}`)
  console.log(`  inboundUntrustedWebhookAuth: ${untrustedWebhook.auth.status}`)
  console.log(`  inboundUntrustedWebhookStatus: ${untrustedWebhook.status}`)
  console.log(`  inboundUntrustedWebhookHttpStatus: ${untrustedWebhookPost.httpStatus}`)
  console.log(`  inboundInvalidWebhookId: ${invalidWebhook.webhookId}`)
  console.log(`  inboundInvalidWebhookStatus: ${invalidWebhook.status}`)
  console.log(`  inboundInvalidWebhookHttpStatus: ${invalidWebhookPost.httpStatus}`)
  console.log(`  intakeAcceptedId: ${acceptedApprovedIntake.intakeId}`)
  console.log(`  intakeAcceptedValidity: ${acceptedApprovedIntake.validityStatus}`)
  console.log(`  intakeAcceptedDecision: ${acceptedApprovedIntake.decision ?? "none"}`)
  console.log(`  intakeAcceptedNextAction: ${acceptedApprovedIntake.nextActionHint ?? "none"}`)
  console.log(`  intakeAcceptedDecisionRef: ${acceptedApprovedIntake.decisionId ?? "none"}`)
  console.log(`  intakeInvalidValidity: ${invalidIntake.validityStatus}`)
  console.log(`  intakeInvalidIssues: ${invalidIntake.issues.join(" | ")}`)
  console.log(
    `  responseAcceptedSummaryId: ${acceptedApprovedSummary.responseSummaryId}`
  )
  console.log(
    `  responseAcceptedSummaryValidity: ${acceptedApprovedSummary.validityStatus}`
  )
  console.log(
    `  responseAcceptedSummaryIssues: ${acceptedApprovedSummary.issueCount}`
  )
  console.log(
    `  responseAcceptedSummaryText: ${acceptedApprovedSummary.statusSummary}`
  )
  console.log(`  responseInvalidSummaryId: ${invalidSummary.responseSummaryId}`)
  console.log(`  responseInvalidSummaryValidity: ${invalidSummary.validityStatus}`)
  console.log(`  responseInvalidSummaryIssues: ${invalidSummary.issueCount}`)
  console.log(`  responseInvalidSummaryText: ${invalidSummary.statusSummary}`)
  console.log(
    `  responseApplicationApprovedStatus: ${acceptedApprovedApplication.applicationStatus}`
  )
  console.log(
    `  responseApplicationRejectedStatus: ${acceptedRejectedApplication.applicationStatus}`
  )
  console.log(
    `  responseApplicationDeferredStatus: ${acceptedDeferredApplication.applicationStatus}`
  )
  console.log(
    `  responseApplicationNeedsRevisionStatus: ${acceptedNeedsRevisionApplication.applicationStatus}`
  )
  console.log(
    `  responseApplicationInvalidStatus: ${invalidApplication.applicationStatus}`
  )
  console.log(
    `  responseEligibilityApprovedStatus: ${acceptedApprovedEligibility.eligibilityStatus}`
  )
  console.log(
    `  responseEligibilityRejectedStatus: ${acceptedRejectedEligibility.eligibilityStatus}`
  )
  console.log(
    `  responseEligibilityDeferredStatus: ${acceptedDeferredEligibility.eligibilityStatus}`
  )
  console.log(
    `  responseEligibilityNeedsRevisionStatus: ${acceptedNeedsRevisionEligibility.eligibilityStatus}`
  )
  console.log(
    `  responseEligibilityInvalidStatus: ${invalidEligibility.eligibilityStatus}`
  )
  console.log(
    `  manualResumeRequestApprovedStatus: ${acceptedApprovedResumeRequest.requestStatus}`
  )
  console.log(
    `  manualResumeRequestRejectedStatus: ${acceptedRejectedResumeRequest.requestStatus}`
  )
  console.log(
    `  manualResumeRequestDeferredStatus: ${acceptedDeferredResumeRequest.requestStatus}`
  )
  console.log(
    `  manualResumeRequestNeedsRevisionStatus: ${acceptedNeedsRevisionResumeRequest.requestStatus}`
  )
  console.log(
    `  manualResumeRequestInvalidStatus: ${invalidResumeRequest.requestStatus}`
  )
  console.log(
    `  manualGateApprovedStatus: ${acceptedApprovedManualGate.gateStatus}`
  )
  console.log(
    `  manualGateRejectedStatus: ${acceptedRejectedManualGate.gateStatus}`
  )
  console.log(
    `  manualGateDeferredStatus: ${acceptedDeferredManualGate.gateStatus}`
  )
  console.log(
    `  manualGateNeedsRevisionStatus: ${acceptedNeedsRevisionManualGate.gateStatus}`
  )
  console.log(
    `  manualGateInvalidStatus: ${invalidManualGate.gateStatus}`
  )
  console.log(
    `  manualResumeContractApprovedStatus: ${acceptedApprovedManualResumeContract.contractStatus}`
  )
  console.log(
    `  manualResumeContractRejectedStatus: ${acceptedRejectedManualResumeContract.contractStatus}`
  )
  console.log(
    `  manualResumeContractDeferredStatus: ${acceptedDeferredManualResumeContract.contractStatus}`
  )
  console.log(
    `  manualResumeContractNeedsRevisionStatus: ${acceptedNeedsRevisionManualResumeContract.contractStatus}`
  )
  console.log(
    `  manualResumeContractInvalidStatus: ${invalidManualResumeContract.contractStatus}`
  )
  console.log("")
  const passed =
    result.error?.code === "APPROVAL_REQUIRED" &&
    result.approval?.handoff?.target === "n8n-approval" &&
    result.approval?.senderResult?.deliveryMode === "webhook" &&
    result.approval?.senderResult?.delivered === true &&
    result.approval?.senderResult?.status === "sent" &&
    result.approval?.lifecycle?.currentState === "handoff_sent" &&
    audit.outcomeStatus === "approval_required" &&
    audit.approvalLifecycleState === "handoff_sent" &&
    report.finalStatus === "approval_required" &&
    report.approvalState === "handoff_sent" &&
    report.auditEventId === audit.eventId &&
    reviewSummary.reviewStatus === "needs_approval" &&
    reviewSummary.approvalState === "handoff_sent" &&
    reviewSummary.reportId === report.reportId &&
    decisionEnvelope?.decisionSource === "orchestration_placeholder" &&
    decisionEnvelope?.decision === "deferred" &&
    decisionEnvelope?.nextAction === "wait_for_approval" &&
    decisionEnvelope?.reportId === report.reportId &&
    stateSnapshot.finalStatus === "approval_required" &&
    stateSnapshot.approvalLifecycleState === "handoff_sent" &&
    stateSnapshot.reviewStatus === "needs_approval" &&
    stateSnapshot.decisionState === "deferred" &&
    stateSnapshot.reportId === report.reportId &&
    stateSnapshot.auditEventId === audit.eventId &&
    contractBundle.finalStatus === "approval_required" &&
    contractBundle.executionMode === selection.executionMode &&
    contractBundle.audit.eventId === audit.eventId &&
    contractBundle.report.reportId === report.reportId &&
    contractBundle.reviewSummary.summaryId === reviewSummary.summaryId &&
    contractBundle.stateSnapshot.snapshotId === stateSnapshot.snapshotId &&
    contractBundle.decisionEnvelope?.decisionId === decisionEnvelope?.decisionId &&
    exportEnvelope.exportTarget === "external_handoff" &&
    exportEnvelope.finalStatus === "approval_required" &&
    exportEnvelope.approvalState === "handoff_sent" &&
    exportEnvelope.reviewStatus === "needs_approval" &&
    exportEnvelope.reportId === report.reportId &&
    exportEnvelope.auditEventId === audit.eventId &&
    exportEnvelope.bundle.bundleId === contractBundle.bundleId &&
    exportSerializer.serializerVersion === "v1" &&
    exportSerializer.contentType === "application/json" &&
    exportSerializer.succeeded === true &&
    exportSerializer.envelopeId === exportEnvelope.envelopeId &&
    exportSerializer.exportTarget === exportEnvelope.exportTarget &&
    exportSerializer.payloadObject.reportId === report.reportId &&
    exportSerializer.payloadObject.auditEventId === audit.eventId &&
    exportSerializer.payloadObject.bundle.bundleId === contractBundle.bundleId &&
    exportSerializer.payloadObject.approvalState === "handoff_sent" &&
    exportSerializer.payloadObject.reviewStatus === "needs_approval" &&
    exportSerializer.payloadJson === JSON.stringify(exportSerializer.payloadObject) &&
    transportReceipt?.envelopeId === exportEnvelope.envelopeId &&
    transportReceipt?.exportTarget === exportEnvelope.exportTarget &&
    transportReceipt?.contentType === exportSerializer.contentType &&
    transportReceipt?.attempted === true &&
    transportReceipt?.delivered === true &&
    transportReceipt?.deliveryMode === "webhook" &&
    transportReceipt?.status === "sent" &&
    transportReceipt?.reason === result.approval?.senderResult?.reason &&
    transportReceipt?.payloadByteLength ===
      result.approval?.senderResult?.payloadByteLength &&
    handoffSummary.handoffStatus === "sent" &&
    handoffSummary.deliveryMode === "webhook" &&
    handoffSummary.attempted === true &&
    handoffSummary.delivered === true &&
    handoffSummary.payloadByteLength === transportReceipt.payloadByteLength &&
    handoffSummary.reason === transportReceipt.reason &&
    handoffSummary.envelopeId === exportEnvelope.envelopeId &&
    handoffSummary.receiptId === transportReceipt.receiptId &&
    deliveryReadiness.readinessStatus === "ready_for_handoff" &&
    deliveryReadiness.isReady === true &&
    deliveryReadiness.blockingReason === undefined &&
    deliveryReadiness.handoffStatus === handoffSummary.handoffStatus &&
    deliveryReadiness.envelopeId === exportEnvelope.envelopeId &&
    deliveryReadiness.receiptId === transportReceipt.receiptId &&
    transportAdapter.adapterId === "n8n-webhook-transport" &&
    transportAdapter.status === "adapter_sent" &&
    transportAdapter.adapterTarget === exportEnvelope.exportTarget &&
    transportAdapter.acceptedInputType === "serialized_export_payload" &&
    transportAdapter.deliveryAttempted === true &&
    transportAdapter.deliveryPossible === true &&
    transportAdapter.blockedReason === undefined &&
    transportAdapter.input?.envelopeId === exportEnvelope.envelopeId &&
    transportAdapter.input?.contentType === exportSerializer.contentType &&
    transportAdapter.input?.serializerVersion === exportSerializer.serializerVersion &&
    transportAdapter.receiptId === transportReceipt.receiptId &&
    acceptedApprovedWebhook.target === "n8n-approval-response" &&
    acceptedApprovedWebhook.intakeMode === "webhook" &&
    acceptedApprovedWebhook.method === "POST" &&
    acceptedApprovedWebhook.auth.field === "authorization" &&
    acceptedApprovedWebhook.auth.status === "trusted" &&
    acceptedApprovedWebhookPost.httpStatus === 200 &&
    acceptedApprovedWebhook.status === "accepted" &&
    acceptedApprovedWebhookChain.rawInput.requestId === report.requestId &&
    acceptedApprovedWebhookChain.rawInput.reportId === report.reportId &&
    acceptedApprovedWebhookChain.rawInput.capabilityId === report.capabilityId &&
    acceptedApprovedWebhookChain.rawInput.decisionId === decisionEnvelope?.decisionId &&
    acceptedApprovedWebhookChain.rawInput.source === "n8n" &&
    acceptedApprovedWebhookChain.rawInput.decision === "approved" &&
    acceptedApprovedWebhookChain.rawInput.note ===
      "Smoke approval accepted response." &&
    acceptedApprovedWebhookChain.intake.intakeId === acceptedApprovedIntake.intakeId &&
    acceptedApprovedWebhookChain.reviewSummary.responseSummaryId ===
      acceptedApprovedSummary.responseSummaryId &&
    acceptedApprovedWebhookChain.application.applicationId ===
      acceptedApprovedApplication.applicationId &&
    acceptedApprovedWebhookChain.resumeEligibility.eligibilityId ===
      acceptedApprovedEligibility.eligibilityId &&
    acceptedApprovedWebhookChain.manualResumeRequest.resumeRequestId ===
      acceptedApprovedResumeRequest.resumeRequestId &&
    acceptedApprovedWebhookChain.manualResumeGate.manualGateId ===
      acceptedApprovedManualGate.manualGateId &&
    acceptedApprovedWebhookChain.manualResumeContract.manualResumeContractId ===
      acceptedApprovedManualResumeContract.manualResumeContractId &&
    acceptedRejectedWebhook.status === "accepted" &&
    acceptedRejectedWebhookPost.httpStatus === 200 &&
    acceptedDeferredWebhook.status === "accepted" &&
    acceptedDeferredWebhookPost.httpStatus === 200 &&
    acceptedNeedsRevisionWebhook.status === "accepted" &&
    acceptedNeedsRevisionWebhookPost.httpStatus === 200 &&
    untrustedWebhook.target === "n8n-approval-response" &&
    untrustedWebhook.intakeMode === "webhook" &&
    untrustedWebhook.method === "POST" &&
    untrustedWebhook.auth.field === "authorization" &&
    untrustedWebhook.auth.status === "untrusted" &&
    untrustedWebhook.auth.reason ===
      "authorization header does not match AUTOMATION_APPROVAL_WEBHOOK_SECRET." &&
    untrustedWebhookPost.httpStatus === 401 &&
    untrustedWebhook.status === "blocked_untrusted" &&
    untrustedWebhook.issues.length === 1 &&
    untrustedWebhook.issues[0] === untrustedWebhook.auth.reason &&
    untrustedWebhook.rawInput === undefined &&
    untrustedWebhook.intake === undefined &&
    untrustedWebhook.reviewSummary === undefined &&
    untrustedWebhook.application === undefined &&
    untrustedWebhook.resumeEligibility === undefined &&
    untrustedWebhook.manualResumeRequest === undefined &&
    untrustedWebhook.manualResumeGate === undefined &&
    untrustedWebhook.manualResumeContract === undefined &&
    invalidWebhook.target === "n8n-approval-response" &&
    invalidWebhook.intakeMode === "webhook" &&
    invalidWebhook.method === "POST" &&
    invalidWebhook.auth.field === "authorization" &&
    invalidWebhook.auth.status === "trusted" &&
    invalidWebhookPost.httpStatus === 400 &&
    invalidWebhook.status === "rejected_invalid" &&
    invalidWebhookChain.rawInput.requestId === "wrong-request-id" &&
    invalidWebhookChain.rawInput.reportId === report.reportId &&
    invalidWebhookChain.rawInput.capabilityId === "asset.search" &&
    invalidWebhookChain.rawInput.decisionId === "wrong-decision-id" &&
    invalidWebhookChain.rawInput.source === 7 &&
    invalidWebhookChain.rawInput.decision === "ship-it" &&
    invalidWebhookChain.reviewSummary.responseSummaryId ===
      invalidSummary.responseSummaryId &&
    invalidWebhookChain.application.applicationId === invalidApplication.applicationId &&
    invalidWebhookChain.resumeEligibility.eligibilityId ===
      invalidEligibility.eligibilityId &&
    invalidWebhookChain.manualResumeRequest.resumeRequestId ===
      invalidResumeRequest.resumeRequestId &&
    invalidWebhookChain.manualResumeGate.manualGateId ===
      invalidManualGate.manualGateId &&
    invalidWebhookChain.manualResumeContract.manualResumeContractId ===
      invalidManualResumeContract.manualResumeContractId &&
    acceptedApprovedIntake.requestId === report.requestId &&
    acceptedApprovedIntake.reportId === report.reportId &&
    acceptedApprovedIntake.capabilityId === report.capabilityId &&
    acceptedApprovedIntake.decisionId === decisionEnvelope?.decisionId &&
    acceptedApprovedIntake.source === "n8n" &&
    acceptedApprovedIntake.decision === "approved" &&
    acceptedApprovedIntake.note === "Smoke approval accepted response." &&
    acceptedApprovedIntake.nextActionHint === "remain_blocked" &&
    acceptedApprovedIntake.validityStatus === "accepted" &&
    acceptedApprovedIntake.issues.length === 0 &&
    acceptedApprovedSummary.requestId === report.requestId &&
    acceptedApprovedSummary.reportId === report.reportId &&
    acceptedApprovedSummary.capabilityId === report.capabilityId &&
    acceptedApprovedSummary.source === "n8n" &&
    acceptedApprovedSummary.decision === "approved" &&
    acceptedApprovedSummary.validityStatus === "accepted" &&
    acceptedApprovedSummary.nextActionHint === "remain_blocked" &&
    acceptedApprovedSummary.issueCount === 0 &&
    acceptedApprovedSummary.statusSummary ===
      `Accepted approved response for ${report.capabilityId}.` &&
    acceptedApprovedApplication.requestId === report.requestId &&
    acceptedApprovedApplication.reportId === report.reportId &&
    acceptedApprovedApplication.capabilityId === report.capabilityId &&
    acceptedApprovedApplication.source === "n8n" &&
    acceptedApprovedApplication.decision === "approved" &&
    acceptedApprovedApplication.validityStatus === "accepted" &&
    acceptedApprovedApplication.applicationStatus === "remain_blocked" &&
    acceptedApprovedApplication.nextActionHint === "remain_blocked" &&
    acceptedApprovedApplication.issueCount === 0 &&
    acceptedApprovedApplication.reasonSummary ===
      `${acceptedApprovedSummary.statusSummary} Execution remains blocked in automation v1.` &&
    acceptedApprovedEligibility.requestId === report.requestId &&
    acceptedApprovedEligibility.reportId === report.reportId &&
    acceptedApprovedEligibility.capabilityId === report.capabilityId &&
    acceptedApprovedEligibility.source === "n8n" &&
    acceptedApprovedEligibility.decision === "approved" &&
    acceptedApprovedEligibility.applicationStatus === "remain_blocked" &&
    acceptedApprovedEligibility.eligibilityStatus ===
      "blocked_still_requires_manual_gate" &&
    acceptedApprovedEligibility.isEligible === false &&
    acceptedApprovedEligibility.blockingReason ===
      "Approved responses still require a future manual resume gate in automation v1." &&
    acceptedApprovedEligibility.nextActionHint === "remain_blocked" &&
    acceptedApprovedResumeRequest.requestId === report.requestId &&
    acceptedApprovedResumeRequest.reportId === report.reportId &&
    acceptedApprovedResumeRequest.capabilityId === report.capabilityId &&
    acceptedApprovedResumeRequest.source === "n8n" &&
    acceptedApprovedResumeRequest.decision === "approved" &&
    acceptedApprovedResumeRequest.eligibilityStatus ===
      "blocked_still_requires_manual_gate" &&
    acceptedApprovedResumeRequest.requestStatus === "request_pending_manual_gate" &&
    acceptedApprovedResumeRequest.isRequestable === true &&
    acceptedApprovedResumeRequest.blockingReason ===
      "Manual resume remains gated and does not execute automatically in automation v1." &&
    acceptedApprovedResumeRequest.nextActionHint === "remain_blocked" &&
    acceptedApprovedManualGate.requestId === report.requestId &&
    acceptedApprovedManualGate.reportId === report.reportId &&
    acceptedApprovedManualGate.capabilityId === report.capabilityId &&
    acceptedApprovedManualGate.source === "n8n" &&
    acceptedApprovedManualGate.requestStatus ===
      "request_pending_manual_gate" &&
    acceptedApprovedManualGate.gateStatus ===
      "gate_open_for_future_resume_contract" &&
    acceptedApprovedManualGate.canOpenResumePath === true &&
    acceptedApprovedManualGate.blockingReason ===
      "Manual gate is open only for a future explicit resume contract, not for execution in automation v1." &&
    acceptedApprovedManualGate.nextActionHint === "remain_blocked" &&
    acceptedApprovedManualResumeContract.requestId === report.requestId &&
    acceptedApprovedManualResumeContract.reportId === report.reportId &&
    acceptedApprovedManualResumeContract.capabilityId === report.capabilityId &&
    acceptedApprovedManualResumeContract.source === "n8n" &&
    acceptedApprovedManualResumeContract.gateStatus ===
      "gate_open_for_future_resume_contract" &&
    acceptedApprovedManualResumeContract.contractStatus ===
      "contract_available_for_future_resume_artifact" &&
    acceptedApprovedManualResumeContract.canIssueFutureResumeArtifact === true &&
    acceptedApprovedManualResumeContract.blockingReason ===
      "A future manual resume artifact may be issued later, but no executable resume action exists in automation v1." &&
    acceptedApprovedManualResumeContract.nextActionHint === "remain_blocked" &&
    acceptedRejectedApplication.applicationStatus === "mark_rejected" &&
    acceptedRejectedApplication.decision === "rejected" &&
    acceptedRejectedApplication.nextActionHint === "stop_execution" &&
    acceptedRejectedApplication.reasonSummary ===
      `${acceptedRejectedSummary.statusSummary} Execution still does not resume automatically.` &&
    acceptedRejectedEligibility.eligibilityStatus === "blocked_rejected" &&
    acceptedRejectedEligibility.isEligible === false &&
    acceptedRejectedEligibility.blockingReason ===
      acceptedRejectedApplication.reasonSummary &&
    acceptedRejectedResumeRequest.requestStatus === "request_blocked" &&
    acceptedRejectedResumeRequest.isRequestable === false &&
    acceptedRejectedResumeRequest.blockingReason ===
      acceptedRejectedEligibility.blockingReason &&
    acceptedRejectedManualGate.gateStatus === "gate_blocked" &&
    acceptedRejectedManualGate.canOpenResumePath === false &&
    acceptedRejectedManualGate.blockingReason ===
      acceptedRejectedResumeRequest.blockingReason &&
    acceptedRejectedManualResumeContract.contractStatus === "contract_blocked" &&
    acceptedRejectedManualResumeContract.canIssueFutureResumeArtifact === false &&
    acceptedRejectedManualResumeContract.blockingReason ===
      acceptedRejectedManualGate.blockingReason &&
    acceptedDeferredApplication.applicationStatus === "mark_deferred" &&
    acceptedDeferredApplication.decision === "deferred" &&
    acceptedDeferredApplication.nextActionHint === "remain_blocked" &&
    acceptedDeferredApplication.reasonSummary ===
      `${acceptedDeferredSummary.statusSummary} Execution still does not resume automatically.` &&
    acceptedDeferredEligibility.eligibilityStatus === "blocked_deferred" &&
    acceptedDeferredEligibility.isEligible === false &&
    acceptedDeferredEligibility.blockingReason ===
      acceptedDeferredApplication.reasonSummary &&
    acceptedDeferredResumeRequest.requestStatus === "request_blocked" &&
    acceptedDeferredResumeRequest.isRequestable === false &&
    acceptedDeferredResumeRequest.blockingReason ===
      acceptedDeferredEligibility.blockingReason &&
    acceptedDeferredManualGate.gateStatus === "gate_blocked" &&
    acceptedDeferredManualGate.canOpenResumePath === false &&
    acceptedDeferredManualGate.blockingReason ===
      acceptedDeferredResumeRequest.blockingReason &&
    acceptedDeferredManualResumeContract.contractStatus === "contract_blocked" &&
    acceptedDeferredManualResumeContract.canIssueFutureResumeArtifact === false &&
    acceptedDeferredManualResumeContract.blockingReason ===
      acceptedDeferredManualGate.blockingReason &&
    acceptedNeedsRevisionApplication.applicationStatus ===
      "mark_needs_revision" &&
    acceptedNeedsRevisionApplication.decision === "needs_revision" &&
    acceptedNeedsRevisionApplication.nextActionHint === "revise_request" &&
    acceptedNeedsRevisionApplication.reasonSummary ===
      `${acceptedNeedsRevisionSummary.statusSummary} Execution still does not resume automatically.` &&
    acceptedNeedsRevisionEligibility.eligibilityStatus ===
      "blocked_needs_revision" &&
    acceptedNeedsRevisionEligibility.isEligible === false &&
    acceptedNeedsRevisionEligibility.blockingReason ===
      acceptedNeedsRevisionApplication.reasonSummary &&
    acceptedNeedsRevisionResumeRequest.requestStatus === "request_blocked" &&
    acceptedNeedsRevisionResumeRequest.isRequestable === false &&
    acceptedNeedsRevisionResumeRequest.blockingReason ===
      acceptedNeedsRevisionEligibility.blockingReason &&
    acceptedNeedsRevisionManualGate.gateStatus === "gate_blocked" &&
    acceptedNeedsRevisionManualGate.canOpenResumePath === false &&
    acceptedNeedsRevisionManualGate.blockingReason ===
      acceptedNeedsRevisionResumeRequest.blockingReason &&
    acceptedNeedsRevisionManualResumeContract.contractStatus ===
      "contract_blocked" &&
    acceptedNeedsRevisionManualResumeContract.canIssueFutureResumeArtifact ===
      false &&
    acceptedNeedsRevisionManualResumeContract.blockingReason ===
      acceptedNeedsRevisionManualGate.blockingReason &&
    invalidIntake.requestId === report.requestId &&
    invalidIntake.reportId === report.reportId &&
    invalidIntake.capabilityId === report.capabilityId &&
    invalidIntake.decisionId === decisionEnvelope?.decisionId &&
    invalidIntake.source === "external_orchestrator" &&
    invalidIntake.decision === undefined &&
    invalidIntake.nextActionHint === undefined &&
    invalidIntake.validityStatus === "rejected_invalid" &&
    invalidIntake.issues.includes(
      "requestId does not match the approval-required execution."
    ) &&
    invalidIntake.issues.includes(
      "capabilityId does not match the approval-required execution."
    ) &&
    invalidIntake.issues.includes(
      "decisionId does not match the current decision envelope."
    ) &&
    invalidIntake.issues.includes("source is required.") &&
    invalidIntake.issues.includes(
      "decision must be one of: approved, rejected, deferred, needs_revision."
    ) &&
    invalidSummary.requestId === report.requestId &&
    invalidSummary.reportId === report.reportId &&
    invalidSummary.capabilityId === report.capabilityId &&
    invalidSummary.source === "external_orchestrator" &&
    invalidSummary.decision === undefined &&
    invalidSummary.validityStatus === "rejected_invalid" &&
    invalidSummary.nextActionHint === undefined &&
    invalidSummary.issueCount === invalidIntake.issues.length &&
    invalidSummary.statusSummary ===
      `Rejected invalid response for ${report.capabilityId} with ${invalidIntake.issues.length} issue(s).` &&
    invalidApplication.requestId === report.requestId &&
    invalidApplication.reportId === report.reportId &&
    invalidApplication.capabilityId === report.capabilityId &&
    invalidApplication.source === "external_orchestrator" &&
    invalidApplication.decision === undefined &&
    invalidApplication.validityStatus === "rejected_invalid" &&
    invalidApplication.applicationStatus === "invalid_response" &&
    invalidApplication.nextActionHint === undefined &&
    invalidApplication.issueCount === invalidIntake.issues.length &&
    invalidApplication.reasonSummary === invalidSummary.statusSummary &&
    invalidEligibility.requestId === report.requestId &&
    invalidEligibility.reportId === report.reportId &&
    invalidEligibility.capabilityId === report.capabilityId &&
    invalidEligibility.source === "external_orchestrator" &&
    invalidEligibility.decision === undefined &&
    invalidEligibility.applicationStatus === "invalid_response" &&
    invalidEligibility.eligibilityStatus === "blocked_invalid_response" &&
    invalidEligibility.isEligible === false &&
    invalidEligibility.blockingReason === invalidApplication.reasonSummary &&
    invalidEligibility.nextActionHint === undefined &&
    invalidResumeRequest.requestId === report.requestId &&
    invalidResumeRequest.reportId === report.reportId &&
    invalidResumeRequest.capabilityId === report.capabilityId &&
    invalidResumeRequest.source === "external_orchestrator" &&
    invalidResumeRequest.decision === undefined &&
    invalidResumeRequest.eligibilityStatus === "blocked_invalid_response" &&
    invalidResumeRequest.requestStatus === "request_rejected_invalid" &&
    invalidResumeRequest.isRequestable === false &&
    invalidResumeRequest.blockingReason === invalidEligibility.blockingReason &&
    invalidResumeRequest.nextActionHint === undefined &&
    invalidManualGate.requestId === report.requestId &&
    invalidManualGate.reportId === report.reportId &&
    invalidManualGate.capabilityId === report.capabilityId &&
    invalidManualGate.source === "external_orchestrator" &&
    invalidManualGate.requestStatus === "request_rejected_invalid" &&
    invalidManualGate.gateStatus === "gate_rejected_invalid" &&
    invalidManualGate.canOpenResumePath === false &&
    invalidManualGate.blockingReason === invalidResumeRequest.blockingReason &&
    invalidManualGate.nextActionHint === undefined &&
    invalidManualResumeContract.requestId === report.requestId &&
    invalidManualResumeContract.reportId === report.reportId &&
    invalidManualResumeContract.capabilityId === report.capabilityId &&
    invalidManualResumeContract.source === "external_orchestrator" &&
    invalidManualResumeContract.gateStatus === "gate_rejected_invalid" &&
    invalidManualResumeContract.contractStatus === "contract_rejected_invalid" &&
    invalidManualResumeContract.canIssueFutureResumeArtifact === false &&
    invalidManualResumeContract.blockingReason ===
      invalidManualGate.blockingReason &&
    invalidManualResumeContract.nextActionHint === undefined
  return {
    capabilityId: scenario.request.capabilityId,
    errorCode: result.error?.code,
    executionMode: selection.executionMode,
    label: scenario.label,
    operatorSummary: buildOperatorSummary(
      scenario as SmokeScenario<CapabilityId>,
      passed
    ),
    passed,
    selectedProviderId: selection.selectedProviderId ?? undefined,
  }
}

async function runSmokeTest(): Promise<void> {
  console.log("AUTOMATION SMOKE TEST V1")
  console.log("")

  const previousWebhookUrl = process.env[APPROVAL_WEBHOOK_URL_ENV]
  const previousWebhookSecret = process.env[APPROVAL_WEBHOOK_SECRET_ENV]
  const webhookCapture = await startSmokeWebhookCapture()
  process.env[APPROVAL_WEBHOOK_URL_ENV] = webhookCapture.url
  process.env[APPROVAL_WEBHOOK_SECRET_ENV] = "smoke-approval-webhook-secret"

  const outcomes = await Promise.all(smokeScenarios.map(runScenario))

  await webhookCapture.close()

  if (previousWebhookUrl === undefined) {
    delete process.env[APPROVAL_WEBHOOK_URL_ENV]
  } else {
    process.env[APPROVAL_WEBHOOK_URL_ENV] = previousWebhookUrl
  }

  if (previousWebhookSecret === undefined) {
    delete process.env[APPROVAL_WEBHOOK_SECRET_ENV]
  } else {
    process.env[APPROVAL_WEBHOOK_SECRET_ENV] = previousWebhookSecret
  }

  const passedCount = outcomes.filter((outcome) => outcome.passed).length
  const exitCodeContract = buildSmokeExitCodeContract(outcomes)
  const smokeJsonReport = buildSmokeJsonReport(outcomes)
  const smokeJsonReportText = serializeSmokeJsonReport(smokeJsonReport)
  const smokeReportPath = process.env[SMOKE_REPORT_PATH_ENV]?.trim()

  console.log(`SUMMARY passed=${passedCount}/${smokeScenarios.length}`)
  printFinalSmokeSummary(outcomes)
  printSmokeJsonReport(smokeJsonReportText)
  await writeSmokeJsonReportFile(smokeReportPath, smokeJsonReportText)
  printSmokeExitCodeContract(outcomes)

  process.exitCode = exitCodeContract.exitCode
}

void runSmokeTest()
