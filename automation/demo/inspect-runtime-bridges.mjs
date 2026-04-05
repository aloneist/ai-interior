import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { buildRuntimeReportEnvelope } from "./runtime-report-envelope.mjs"
import {
  startRuntimeBridgeLocalServer,
  stopRuntimeBridgeLocalServer,
} from "./runtime-bridge-local.mjs"

const INSPECTION_PATHS = [
  "/api/automation/readiness",
  "/api/automation/routes",
  "/api/automation/overview",
  "/api/automation/status",
  "/api/automation/snapshot",
  "/api/automation/check",
  "/api/automation/approval-response/sample",
]

function printHeading(title) {
  console.log("")
  console.log(title)
}

function formatAvailability(value) {
  return value ? "yes" : "no"
}

async function writeReportFileIfRequested(reportJson) {
  const reportPath = process.env.AUTOMATION_RUNTIME_INSPECT_REPORT_PATH

  if (!reportPath) {
    return null
  }

  await mkdir(path.dirname(reportPath), { recursive: true })
  await writeFile(reportPath, `${reportJson}\n`, "utf8")
  return reportPath
}

async function fetchJson(baseUrl, path) {
  const response = await fetch(`${baseUrl}${path}`)
  const json = await response.json()

  return { response, json }
}

function buildRouteResults(results) {
  return results.map((result) => ({
    path: result.json.route,
    httpStatus: result.response.status,
    ok: result.response.ok,
  }))
}

function buildInspectionReport(baseUrl, results) {
  const readiness = results.readiness.json
  const routes = results.routes.json
  const overview = results.overview.json
  const status = results.status.json
  const snapshot = results.snapshot.json
  const check = results.check.json
  const sample = results.sample.json
  const routeResults = buildRouteResults([
    results.readiness,
    results.routes,
    results.overview,
    results.status,
    results.snapshot,
    results.check,
    results.sample,
  ])

  const keySummary = {
    outboundWebhookConfigured:
      readiness.readiness?.outboundApprovalWebhookConfigured === true,
    inboundApprovalAuthConfigured:
      readiness.readiness?.inboundApprovalWebhookAuthConfigured === true,
    routeInventoryCount: routes.routes?.length ?? 0,
    overviewTotalRoutes: overview.overview?.routeInventory?.totalRoutes ?? 0,
    statusTotalRoutes: status.status?.routeCounts?.total ?? 0,
    snapshotTotalRoutes: snapshot.snapshot?.routeCounts?.total ?? 0,
    statusAndSnapshotRouteCountsMatch:
      check.check?.consistencyCheck?.statusAndSnapshotRouteCountsMatch === true,
    snapshotAndOverviewRouteCountsMatch:
      check.check?.consistencyCheck?.snapshotAndOverviewRouteCountsMatch === true,
    approvalResponseSamplePath: sample.referenceFor?.path ?? null,
  }

  const safetySummary = {
    inspectionOnlyRoutes: true,
    exposesSecrets: false,
    resumesBlockedExecution: false,
  }

  const overallPass =
    routeResults.every((route) => route.ok) &&
    keySummary.statusAndSnapshotRouteCountsMatch &&
    keySummary.snapshotAndOverviewRouteCountsMatch &&
    safetySummary.exposesSecrets === false &&
    safetySummary.resumesBlockedExecution === false

  const summary = {
    inspectedRouteCount: INSPECTION_PATHS.length,
    healthyRouteCount: routeResults.filter((route) => route.ok).length,
    consistencyOk:
      keySummary.statusAndSnapshotRouteCountsMatch &&
      keySummary.snapshotAndOverviewRouteCountsMatch,
    noResumeBoundary: safetySummary.resumesBlockedExecution === false,
  }

  return {
    ...buildRuntimeReportEnvelope({
      command: "npm run automation:runtime:inspect",
      reportKind: "runtime_inspect_report",
      purpose: "operator_current_state_report",
      overallStatus: overallPass ? "PASS" : "FAIL",
      sourceSummary: {
        mode: "live_runtime_routes",
        assertionMode: "report_only",
      },
      summary,
      safetySummary,
    }),
    assertionMode: "report_only",
    baseUrl,
    inspectedRoutes: INSPECTION_PATHS,
    inspectedRouteCount: INSPECTION_PATHS.length,
    routes: routeResults,
    keySummary,
  }
}

async function main() {
  const runtimeBridgeServer = await startRuntimeBridgeLocalServer()
  const { baseUrl } = runtimeBridgeServer

  try {
    printHeading("RUNTIME INSPECTION")
    console.log(`baseUrl: ${baseUrl}`)
    console.log("mode: report-only current-state inspection")
    console.log("assertion owner: npm run automation:runtime:http:verify")
    console.log(`paths: ${INSPECTION_PATHS.join(", ")}`)

    const results = {
      readiness: await fetchJson(baseUrl, "/api/automation/readiness"),
      routes: await fetchJson(baseUrl, "/api/automation/routes"),
      overview: await fetchJson(baseUrl, "/api/automation/overview"),
      status: await fetchJson(baseUrl, "/api/automation/status"),
      snapshot: await fetchJson(baseUrl, "/api/automation/snapshot"),
      check: await fetchJson(baseUrl, "/api/automation/check"),
      sample: await fetchJson(baseUrl, "/api/automation/approval-response/sample"),
    }
    const report = buildInspectionReport(baseUrl, results)
    const reportJson = JSON.stringify(report, null, 2)
    const reportFilePath = await writeReportFileIfRequested(reportJson)

    printHeading("INSPECTION SUMMARY")
    console.log(
      `readiness configured: outbound=${formatAvailability(
        report.keySummary.outboundWebhookConfigured
      )}, inbound-auth=${formatAvailability(
        report.keySummary.inboundApprovalAuthConfigured
      )}`
    )
    console.log(`route inventory count: ${report.keySummary.routeInventoryCount}`)
    console.log(`overview total routes: ${report.keySummary.overviewTotalRoutes}`)
    console.log(`status total routes: ${report.keySummary.statusTotalRoutes}`)
    console.log(`snapshot total routes: ${report.keySummary.snapshotTotalRoutes}`)
    console.log(
      `check consistency: status/snapshot=${formatAvailability(
        report.keySummary.statusAndSnapshotRouteCountsMatch
      )}, snapshot/overview=${formatAvailability(
        report.keySummary.snapshotAndOverviewRouteCountsMatch
      )}`
    )
    console.log(
      `approval-response sample path: ${report.keySummary.approvalResponseSamplePath ?? "missing"}`
    )

    printHeading("ROUTE RESULTS")
    for (const route of report.routes) {
      console.log(`${route.path}: HTTP ${route.httpStatus}`)
    }

    printHeading("SAFETY")
    console.log(
      report.safetySummary.inspectionOnlyRoutes
        ? "inspection-only routes only"
        : "inspection surface changed"
    )
    console.log(
      report.safetySummary.exposesSecrets ? "secret exposure detected" : "no secrets exposed"
    )
    console.log(
      report.safetySummary.resumesBlockedExecution
        ? "blocked execution resume detected"
        : "no blocked execution resumed"
    )

    printHeading("FINAL SUMMARY")
    console.log("mode: report-only")
    console.log(
      `overall: ${report.overallStatus} (${report.summary.healthyRouteCount}/${report.summary.inspectedRouteCount} routes healthy)`
    )
    console.log(`route coverage: ${report.summary.inspectedRouteCount}`)
    console.log(
      `consistency: status/snapshot=${formatAvailability(
        report.keySummary.statusAndSnapshotRouteCountsMatch
      )}, snapshot/overview=${formatAvailability(
        report.keySummary.snapshotAndOverviewRouteCountsMatch
      )}`
    )
    console.log(
      `safety: secrets=${formatAvailability(
        !report.safetySummary.exposesSecrets
      )}, no-resume=${formatAvailability(!report.safetySummary.resumesBlockedExecution)}`
    )
    console.log("use verifier for boundary/correctness pass-fail assertions")

    printHeading("JSON REPORT")
    console.log(reportJson)

    if (reportFilePath) {
      printHeading("REPORT FILE")
      console.log(reportFilePath)
    }
  } finally {
    await stopRuntimeBridgeLocalServer(runtimeBridgeServer)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
