import type {
  ApprovalRequestInput,
  AssetSearchInput,
  CapabilityId,
  CapabilityOutputMap,
  CapabilityRequest,
  CatalogReadInput,
} from "@/automation/capabilities/types"
import { executeCapability } from "@/automation/execution"

type SmokeScenario<TCapabilityId extends CapabilityId> = {
  label: string
  request: CapabilityRequest<TCapabilityId>
}

const smokeScenarios: [
  SmokeScenario<"catalog.read">,
  SmokeScenario<"asset.search">,
  SmokeScenario<"approval.request">,
] = [
  {
    label: "catalog.read success",
    request: {
      capabilityId: "catalog.read",
      requestId: "smoke-catalog-read-001",
      actorId: "automation-smoke-test",
      payload: {
        query: "chair",
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
        query: "living",
        tags: ["chair"],
        limit: 2,
      } satisfies AssetSearchInput,
    },
  },
  {
    label: "approval.request no-ready-provider",
    request: {
      capabilityId: "approval.request",
      requestId: "smoke-approval-request-001",
      actorId: "automation-smoke-test",
      payload: {
        title: "Smoke Test Approval",
        summary: "Confirms the no-ready-provider execution path.",
        requestedBy: "automation-smoke-test",
        riskLevel: "low",
      } satisfies ApprovalRequestInput,
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
    return `${catalogData.items.length} item(s), totalCount=${catalogData.totalCount ?? 0}`
  }

  if (capabilityId === "asset.search") {
    const assetData = data as CapabilityOutputMap["asset.search"]
    return `${assetData.results.length} result(s)`
  }

  return "none"
}

async function runScenario<TCapabilityId extends CapabilityId>(
  scenario: SmokeScenario<TCapabilityId>
): Promise<boolean> {
  const execution = await executeCapability(scenario.request)
  const { selection, result } = execution

  console.log(`SCENARIO ${scenario.label}`)
  console.log(`  capability: ${scenario.request.capabilityId}`)
  console.log(`  selectedProvider: ${selection.selectedProviderId ?? "none"}`)
  console.log(
    `  readyProviders: ${
      selection.availableReadyProviderIds.length
        ? selection.availableReadyProviderIds.join(", ")
        : "none"
    }`
  )
  console.log(`  ok: ${result.ok ? "true" : "false"}`)

  if (result.ok) {
    console.log(`  data: ${formatDataPreview(scenario.request.capabilityId, result.data)}`)
    console.log("")
    return true
  }

  console.log(`  errorCode: ${result.error?.code ?? "none"}`)
  console.log(`  errorMessage: ${result.error?.message ?? "none"}`)
  console.log("")
  return result.error?.code === "NO_READY_PROVIDER"
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
