import type {
  AssetSearchInput,
  CapabilityId,
  CapabilityOutputMap,
  CapabilityRequest,
  CatalogReadInput,
  CatalogWriteSafeInput,
} from "@/automation/capabilities/types"
import { executeCapability } from "@/automation/execution"

type SmokeScenario<TCapabilityId extends CapabilityId> = {
  label: string
  request: CapabilityRequest<TCapabilityId>
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

async function runScenario<TCapabilityId extends CapabilityId>(
  scenario: SmokeScenario<TCapabilityId>
): Promise<boolean> {
  const execution = await executeCapability(scenario.request)
  const { selection, result, audit, report, reviewSummary, decisionEnvelope } = execution

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

  if (result.ok) {
    console.log(`  data: ${formatDataPreview(scenario.request.capabilityId, result.data)}`)
    console.log("")
    return (
      audit.outcomeStatus === "executed" &&
      report.finalStatus === "executed" &&
      report.auditEventId === audit.eventId &&
      reviewSummary.reviewStatus === "info" &&
      reviewSummary.reportId === report.reportId &&
      decisionEnvelope === undefined
    )
  }

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
  console.log("")
  return (
    result.error?.code === "APPROVAL_REQUIRED" &&
    result.approval?.handoff?.target === "n8n-approval" &&
    result.approval?.senderResult?.deliveryMode === "placeholder" &&
    result.approval?.senderResult?.delivered === false &&
    result.approval?.lifecycle?.currentState === "handoff_not_sent" &&
    audit.outcomeStatus === "approval_required" &&
    audit.approvalLifecycleState === "handoff_not_sent" &&
    report.finalStatus === "approval_required" &&
    report.approvalState === "handoff_not_sent" &&
    report.auditEventId === audit.eventId &&
    reviewSummary.reviewStatus === "needs_approval" &&
    reviewSummary.approvalState === "handoff_not_sent" &&
    reviewSummary.reportId === report.reportId &&
    decisionEnvelope?.decisionSource === "orchestration_placeholder" &&
    decisionEnvelope?.decision === "deferred" &&
    decisionEnvelope?.nextAction === "wait_for_approval" &&
    decisionEnvelope?.reportId === report.reportId
  )
}

async function runSmokeTest(): Promise<void> {
  console.log("AUTOMATION SMOKE TEST V1")
  console.log("")

  const outcomes = await Promise.all(smokeScenarios.map(runScenario))
  const passedCount = outcomes.filter(Boolean).length

  console.log(`SUMMARY passed=${passedCount}/${smokeScenarios.length}`)

  if (passedCount !== smokeScenarios.length) {
    process.exitCode = 1
  }
}

void runSmokeTest()
