import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import type {
  CapabilityId,
  CapabilityRequest,
  CatalogWriteSafeInput,
} from "@/automation/capabilities/types"
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

export type AutomationRuntimeBridgeRoutePath =
  | "/api/automation/readiness"
  | "/api/automation/check"
  | "/api/automation/snapshot"
  | "/api/automation/status"
  | "/api/automation/webhook-test"
  | "/api/automation/approval-response"
  | "/api/automation/approval-boundary-test"
  | "/api/automation/routes"
  | "/api/automation/approval-response/sample"
  | "/api/automation/overview"

export type AutomationRuntimeBridgeRouteMetadata = {
  path: AutomationRuntimeBridgeRoutePath
  methods: readonly ("GET" | "POST")[]
  purpose: string
  authRequired: boolean
  classification: "inspection_only" | "approval_only"
  noResume: boolean
}

export const automationRuntimeBridgeRoutes: readonly AutomationRuntimeBridgeRouteMetadata[] =
  [
    {
      path: "/api/automation/readiness",
      methods: ["GET"],
      purpose: "Safe configured/not-configured readiness summary for automation runtime bridges.",
      authRequired: false,
      classification: "inspection_only",
      noResume: true,
    },
    {
      path: "/api/automation/check",
      methods: ["GET"],
      purpose: "Concise operator-facing runtime bridge check result.",
      authRequired: false,
      classification: "inspection_only",
      noResume: true,
    },
    {
      path: "/api/automation/snapshot",
      methods: ["GET"],
      purpose: "Concise operator-facing runtime bridge snapshot.",
      authRequired: false,
      classification: "inspection_only",
      noResume: true,
    },
    {
      path: "/api/automation/status",
      methods: ["GET"],
      purpose: "Concise operator-facing runtime bridge status summary.",
      authRequired: false,
      classification: "inspection_only",
      noResume: true,
    },
    {
      path: "/api/automation/webhook-test",
      methods: ["POST"],
      purpose: "Outbound approval webhook verification without executing risky work.",
      authRequired: false,
      classification: "approval_only",
      noResume: true,
    },
    {
      path: "/api/automation/approval-response",
      methods: ["POST"],
      purpose: "Inbound approval-response classification using the current receive-side chain.",
      authRequired: true,
      classification: "approval_only",
      noResume: true,
    },
    {
      path: "/api/automation/approval-boundary-test",
      methods: ["POST"],
      purpose: "Fixed approval-required write-path simulation through the current execution boundary.",
      authRequired: false,
      classification: "approval_only",
      noResume: true,
    },
    {
      path: "/api/automation/routes",
      methods: ["GET"],
      purpose: "Safe runtime bridge route inventory for operator inspection.",
      authRequired: false,
      classification: "inspection_only",
      noResume: true,
    },
    {
      path: "/api/automation/approval-response/sample",
      methods: ["GET"],
      purpose: "Safe approval-response request-shape reference for runtime bridge callers.",
      authRequired: false,
      classification: "inspection_only",
      noResume: true,
    },
    {
      path: "/api/automation/overview",
      methods: ["GET"],
      purpose: "Safe runtime bridge overview bundle for operator inspection.",
      authRequired: false,
      classification: "inspection_only",
      noResume: true,
    },
  ] as const

export const automationRuntimeBridgeSafety = {
  exposesSecrets: false,
  riskyExecutionResumeEnabled: false,
  persistenceEnabled: false,
} as const

export const automationApprovalResponseRequiredContextFields = [
  "requestId",
  "reportId",
  "capabilityId",
  "finalStatus",
] as const

export const automationApprovalResponseOptionalContextFields = [
  "decisionId",
] as const

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

export const automationApprovalResponseRouteResponseExample = {
  route: "/api/automation/approval-response",
  routeVersion: "v1",
  context: {
    requestId: "approval-run-request-id",
    reportId: "report-audit-example",
    capabilityId: "catalog.write.safe",
    finalStatus: "approval_required",
    decisionId: "decision-review-report-audit-example",
  },
  webhook: {
    status: "accepted",
    auth: {
      status: "trusted",
      reason: "matched_shared_secret",
    },
    application: {
      applicationStatus: "remain_blocked",
    },
  },
} as const

export function buildAutomationApprovalBoundarySimulationRequest(): CapabilityRequest<"catalog.write.safe"> {
  return {
    capabilityId: "catalog.write.safe",
    requestId: "runtime-approval-boundary-test-catalog-write-safe",
    actorId: "automation-runtime-bridge",
    payload: {
      operation: "archive",
      records: [{ id: "runtime-bridge-demo-record" }],
      reason: "Runtime approval-boundary verification only. No risky execution occurs.",
      dryRun: true,
    } satisfies CatalogWriteSafeInput,
  }
}

type PackageJsonScripts = Record<string, string>

export function getAutomationRuntimeBridgeRouteMetadata(
  path: AutomationRuntimeBridgeRoutePath
): AutomationRuntimeBridgeRouteMetadata | undefined {
  return automationRuntimeBridgeRoutes.find((route) => route.path === path)
}

function hasConfiguredValue(envName: string): boolean {
  const value = process.env[envName]?.trim()
  return Boolean(value)
}

function readPackageScripts(): PackageJsonScripts {
  try {
    const packageJsonPath = join(process.cwd(), "package.json")
    const packageJson = JSON.parse(
      readFileSync(packageJsonPath, "utf8")
    ) as { scripts?: PackageJsonScripts }

    return packageJson.scripts ?? {}
  } catch {
    return {}
  }
}

export function buildAutomationRuntimeReadinessSummary() {
  const scripts = readPackageScripts()

  return {
    outboundApprovalWebhookConfigured: hasConfiguredValue(
      "AUTOMATION_APPROVAL_WEBHOOK_URL"
    ),
    inboundApprovalWebhookAuthConfigured: hasConfiguredValue(
      "AUTOMATION_APPROVAL_WEBHOOK_SECRET"
    ),
    smokeCommandAvailable: typeof scripts["automation:smoke"] === "string",
    smokeReportCommandAvailable:
      typeof scripts["automation:smoke:report"] === "string",
    localSmokeReportEntrypointAvailable: existsSync(
      join(process.cwd(), "automation", "demo", "run-smoke-report.mjs")
    ),
    approvalResponseRouteAvailable: Boolean(
      getAutomationRuntimeBridgeRouteMetadata("/api/automation/approval-response")
    ),
    approvalBoundaryTestRouteAvailable: Boolean(
      getAutomationRuntimeBridgeRouteMetadata("/api/automation/approval-boundary-test")
    ),
    approvalResponseSampleRouteAvailable: Boolean(
      getAutomationRuntimeBridgeRouteMetadata("/api/automation/approval-response/sample")
    ),
    outboundWebhookTestRouteAvailable: Boolean(
      getAutomationRuntimeBridgeRouteMetadata("/api/automation/webhook-test")
    ),
    statusRouteAvailable: Boolean(
      getAutomationRuntimeBridgeRouteMetadata("/api/automation/status")
    ),
    checkRouteAvailable: Boolean(
      getAutomationRuntimeBridgeRouteMetadata("/api/automation/check")
    ),
    snapshotRouteAvailable: Boolean(
      getAutomationRuntimeBridgeRouteMetadata("/api/automation/snapshot")
    ),
    readinessRouteAvailable: Boolean(
      getAutomationRuntimeBridgeRouteMetadata("/api/automation/readiness")
    ),
    routeInventoryRouteAvailable: Boolean(
      getAutomationRuntimeBridgeRouteMetadata("/api/automation/routes")
    ),
    overviewRouteAvailable: Boolean(
      getAutomationRuntimeBridgeRouteMetadata("/api/automation/overview")
    ),
  }
}

export function buildAutomationApprovalResponseSampleReference() {
  return {
    referenceFor: getAutomationRuntimeBridgeRouteMetadata(
      "/api/automation/approval-response"
    ),
    auth: {
      required: true,
      scheme: "Bearer",
      header: "authorization",
      description:
        "Use `Bearer AUTOMATION_APPROVAL_WEBHOOK_SECRET` when calling POST /api/automation/approval-response.",
    },
    context: {
      requiredFields: automationApprovalResponseRequiredContextFields,
      optionalFields: automationApprovalResponseOptionalContextFields,
    },
    requestShape: automationApprovalResponseRouteRequestExample,
    responseExample: automationApprovalResponseRouteResponseExample,
    safety: {
      resumesBlockedExecution: false,
      exposesSecrets: false,
    },
  }
}

export function buildAutomationRuntimeVerifierCoverageSummary() {
  const coveredRoutes = [
    "/api/automation/readiness",
    "/api/automation/check",
    "/api/automation/snapshot",
    "/api/automation/status",
    "/api/automation/routes",
    "/api/automation/overview",
    "/api/automation/approval-boundary-test",
    "/api/automation/approval-response/sample",
    "/api/automation/webhook-test",
    "/api/automation/approval-response",
  ] as const satisfies readonly AutomationRuntimeBridgeRoutePath[]

  return {
    runtimeHttpVerifierAvailable: true,
    command: "npm run automation:runtime:http:verify",
    coveredRouteCount: coveredRoutes.length,
    coveredRoutes,
    coverage: {
      readiness: true,
      checkSummary: true,
      snapshotSummary: true,
      routeInventory: true,
      statusSummary: true,
      overview: true,
      approvalBoundarySimulation: true,
      approvalResponseSample: true,
      outboundWebhookTest: true,
      approvalResponseTrustedFlow: true,
      approvalResponseUntrustedFlow: true,
    },
    safety: {
      exposesSecrets: false,
      resumesBlockedExecution: false,
    },
  }
}

export function buildAutomationRuntimeOverview() {
  const readiness = buildAutomationRuntimeReadinessSummary()
  const sampleReference = buildAutomationApprovalResponseSampleReference()
  const verifierCoverage = buildAutomationRuntimeVerifierCoverageSummary()
  const inspectionRoutes = automationRuntimeBridgeRoutes.filter(
    (route) => route.classification === "inspection_only"
  ).length
  const approvalRoutes = automationRuntimeBridgeRoutes.filter(
    (route) => route.classification === "approval_only"
  ).length

  return {
    readiness,
    verifierCoverage,
    routeInventory: {
      totalRoutes: automationRuntimeBridgeRoutes.length,
      inspectionRouteCount: inspectionRoutes,
      approvalRouteCount: approvalRoutes,
      routes: automationRuntimeBridgeRoutes,
    },
    approvalResponseReference: {
      samplePath: "/api/automation/approval-response/sample",
      targetPath: sampleReference.referenceFor?.path,
      authRequired: sampleReference.referenceFor?.authRequired ?? true,
      requiredContextFields: sampleReference.context.requiredFields,
      optionalContextFields: sampleReference.context.optionalFields,
      noResume: true,
    },
  }
}

export function buildAutomationRuntimeStatusSummary() {
  const readiness = buildAutomationRuntimeReadinessSummary()
  const verifierCoverage = buildAutomationRuntimeVerifierCoverageSummary()
  const inspectionRouteCount = automationRuntimeBridgeRoutes.filter(
    (route) => route.classification === "inspection_only"
  ).length
  const executionRouteCount = automationRuntimeBridgeRoutes.filter(
    (route) => route.classification === "approval_only"
  ).length

  return {
    routeCounts: {
      total: automationRuntimeBridgeRoutes.length,
      inspection: inspectionRouteCount,
      execution: executionRouteCount,
    },
    readiness,
    availability: {
      inspectionRoutesAvailable:
        readiness.readinessRouteAvailable &&
        readiness.routeInventoryRouteAvailable &&
        readiness.overviewRouteAvailable &&
        readiness.approvalResponseSampleRouteAvailable &&
        readiness.statusRouteAvailable,
      executionRoutesAvailable:
        readiness.outboundWebhookTestRouteAvailable &&
        readiness.approvalResponseRouteAvailable &&
        readiness.approvalBoundaryTestRouteAvailable,
      verifierSupportAvailable: verifierCoverage.runtimeHttpVerifierAvailable,
    },
    verifierCoverage,
    safety: automationRuntimeBridgeSafety,
  }
}

export function buildAutomationRuntimeSnapshot() {
  const readiness = buildAutomationRuntimeReadinessSummary()
  const status = buildAutomationRuntimeStatusSummary()
  const overview = buildAutomationRuntimeOverview()

  return {
    capturedAt: new Date().toISOString(),
    routeCounts: status.routeCounts,
    readiness,
    status: {
      availability: status.availability,
      verifierCoverage: status.verifierCoverage,
    },
    overview: {
      routeInventory: {
        totalRoutes: overview.routeInventory.totalRoutes,
        inspectionRouteCount: overview.routeInventory.inspectionRouteCount,
        approvalRouteCount: overview.routeInventory.approvalRouteCount,
      },
      approvalResponseReference: overview.approvalResponseReference,
    },
    safety: automationRuntimeBridgeSafety,
  }
}

export function buildAutomationRuntimeCheckSummary() {
  const readiness = buildAutomationRuntimeReadinessSummary()
  const status = buildAutomationRuntimeStatusSummary()
  const snapshot = buildAutomationRuntimeSnapshot()
  const overview = buildAutomationRuntimeOverview()

  return {
    routeCheck: {
      inspectionRoutesAvailable:
        status.availability.inspectionRoutesAvailable &&
        readiness.checkRouteAvailable,
      executionRoutesAvailable: status.availability.executionRoutesAvailable,
      totalRoutes: status.routeCounts.total,
    },
    bridgeCheck: {
      outboundSummaryPresent: readiness.outboundApprovalWebhookConfigured,
      inboundSummaryPresent: readiness.inboundApprovalWebhookAuthConfigured,
      approvalBoundarySimulationPresent:
        readiness.approvalBoundaryTestRouteAvailable,
      verifierCoveragePresent: status.availability.verifierSupportAvailable,
    },
    consistencyCheck: {
      statusAndSnapshotRouteCountsMatch:
        status.routeCounts.total === snapshot.routeCounts.total,
      snapshotAndOverviewRouteCountsMatch:
        snapshot.overview.routeInventory.totalRoutes ===
        overview.routeInventory.totalRoutes,
      verifierCoverageIncludesCheck:
        status.verifierCoverage.coverage.checkSummary === true,
    },
    safety: automationRuntimeBridgeSafety,
  }
}
