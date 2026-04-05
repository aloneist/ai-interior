import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { buildRuntimeReportEnvelope } from "./runtime-report-envelope.mjs"
import {
  WEBHOOK_SECRET,
  startRuntimeBridgeLocalServer,
  stopRuntimeBridgeLocalServer,
} from "./runtime-bridge-local.mjs"

function logSection(title) {
  console.log("")
  console.log(title)
}

function formatAvailability(value) {
  return value ? "yes" : "no"
}

async function writeReportFileIfRequested(reportJson) {
  const reportPath = process.env.AUTOMATION_RUNTIME_VERIFY_REPORT_PATH

  if (!reportPath) {
    return null
  }

  await mkdir(path.dirname(reportPath), { recursive: true })
  await writeFile(reportPath, `${reportJson}\n`, "utf8")
  return reportPath
}

function createVerifierReport(baseUrl) {
  return {
    ...buildRuntimeReportEnvelope({
      command: "npm run automation:runtime:http:verify",
      reportKind: "runtime_verify_report",
      purpose: "runtime_correctness_and_safety_assertions",
      overallStatus: "FAIL",
      sourceSummary: {
        mode: "live_runtime_routes",
        assertionMode: "assertion_focused",
      },
      summary: {},
      safetySummary: {},
    }),
    baseUrl,
    routes: [],
    keySummary: {},
    assertionSummary: {},
    approvalResponseCoverage: {},
    approvalBoundaryCoverage: {},
    verifiedRouteCount: 0,
    failure: null,
  }
}

function createRouteCheck(section, pathName) {
  return {
    section,
    path: pathName,
    httpStatus: null,
    ok: false,
    assertions: [],
    failureMessage: null,
  }
}

function verify(routeCheck, key, condition, message) {
  routeCheck.assertions.push({
    key,
    passed: Boolean(condition),
    message,
  })

  if (!condition) {
    routeCheck.failureMessage = message
    throw new Error(message)
  }
}

async function runRouteCheck(report, section, pathName, runner) {
  logSection(section)
  const routeCheck = createRouteCheck(section, pathName)
  report.routes.push(routeCheck)

  try {
    const result = await runner(routeCheck)
    routeCheck.ok = routeCheck.assertions.every((assertion) => assertion.passed)
    console.log(`  ${pathName}: PASS`)
    return result
  } catch (error) {
    routeCheck.ok = false
    if (!routeCheck.failureMessage) {
      routeCheck.failureMessage = error instanceof Error ? error.message : String(error)
    }
    throw error
  }
}

function finalizeVerifierReport(report) {
  const passedRouteCount = report.routes.filter((route) => route.ok).length
  const totalAssertions = report.routes.reduce(
    (count, route) => count + route.assertions.length,
    0
  )
  const failedAssertions = report.routes.reduce(
    (count, route) =>
      count + route.assertions.filter((assertion) => !assertion.passed).length,
    0
  )

  report.verifiedRouteCount = report.routes.length
  report.assertionSummary = {
    passedRouteCount,
    failedRouteCount: report.routes.length - passedRouteCount,
    totalAssertions,
    failedAssertions,
  }
  report.overallStatus =
    report.failure === null && failedAssertions === 0 ? "PASS" : "FAIL"
  report.summary = {
    verifiedRouteCount: report.routes.length,
    passedRouteCount,
    totalAssertions,
    failedAssertions,
    trustedApprovalResponseCovered: report.approvalResponseCoverage.trustedFlow === true,
    untrustedApprovalResponseCovered:
      report.approvalResponseCoverage.untrustedFlow === true,
    approvalBoundaryCovered: report.approvalBoundaryCoverage.routeCovered === true,
  }

  return report
}

function printFinalSummary(report) {
  logSection("FINAL SUMMARY")
  console.log("  mode: assertion-focused")
  console.log(
    `  overall: ${report.overallStatus} (${report.summary.passedRouteCount}/${report.summary.verifiedRouteCount} route checks passed)`
  )
  console.log(
    `  assertions: ${report.summary.totalAssertions - report.summary.failedAssertions}/${report.summary.totalAssertions} passed`
  )
  console.log(
    `  approval-response coverage: trusted=${formatAvailability(
      report.approvalResponseCoverage.trustedFlow
    )}, untrusted=${formatAvailability(report.approvalResponseCoverage.untrustedFlow)}`
  )
  console.log(
    `  approval-boundary coverage: triggered=${formatAvailability(
      report.approvalBoundaryCoverage.boundaryTriggered
    )}, risky-work-blocked=${formatAvailability(
      report.approvalBoundaryCoverage.riskyExecutionBlocked
    )}`
  )
  console.log(
    `  safety: secrets=${formatAvailability(
      !report.safetySummary.exposesSecrets
    )}, no-resume=${formatAvailability(report.safetySummary.noResumeBoundary)}`
  )

  if (report.failure?.message) {
    console.log(`  failure: ${report.failure.message}`)
  }
}

async function main() {
  const runtimeBridgeServer = await startRuntimeBridgeLocalServer()
  const { baseUrl, webhookCapture } = runtimeBridgeServer
  const report = createVerifierReport(baseUrl)

  try {
    logSection("VERIFIER MODE")
    console.log("  purpose: correctness and safety assertions")
    console.log("  inspect command remains report-only current-state output")

    const readinessJson = await runRouteCheck(
      report,
      "READINESS VERIFY",
      "/api/automation/readiness",
      async (routeCheck) => {
        const response = await fetch(`${baseUrl}/api/automation/readiness`)
        routeCheck.httpStatus = response.status
        const json = await response.json()

        verify(
          routeCheck,
          "http_200",
          response.status === 200,
          "Readiness route must return HTTP 200."
        )
        verify(
          routeCheck,
          "route_id",
          json.route === "/api/automation/readiness",
          "Readiness route must identify itself explicitly."
        )
        verify(
          routeCheck,
          "outbound_configured",
          json.readiness.outboundApprovalWebhookConfigured === true,
          "Readiness route must report outbound webhook configured during verification."
        )
        verify(
          routeCheck,
          "inbound_auth_configured",
          json.readiness.inboundApprovalWebhookAuthConfigured === true,
          "Readiness route must report inbound webhook auth configured during verification."
        )
        verify(
          routeCheck,
          "no_secret_exposure",
          json.safety.exposesSecrets === false,
          "Readiness route must not report secret exposure."
        )
        verify(
          routeCheck,
          "secret_not_present",
          !JSON.stringify(json).includes(WEBHOOK_SECRET),
          "Readiness route must not expose the webhook secret."
        )
        verify(
          routeCheck,
          "check_available",
          json.readiness.checkRouteAvailable === true,
          "Readiness route must report check route availability."
        )
        verify(
          routeCheck,
          "approval_boundary_available",
          json.readiness.approvalBoundaryTestRouteAvailable === true,
          "Readiness route must report approval-boundary simulation availability."
        )
        verify(
          routeCheck,
          "status_available",
          json.readiness.statusRouteAvailable === true,
          "Readiness route must report status route availability."
        )
        verify(
          routeCheck,
          "snapshot_available",
          json.readiness.snapshotRouteAvailable === true,
          "Readiness route must report snapshot route availability."
        )
        verify(
          routeCheck,
          "routes_available",
          json.readiness.routeInventoryRouteAvailable === true,
          "Readiness route must report route inventory availability."
        )
        verify(
          routeCheck,
          "sample_available",
          json.readiness.approvalResponseSampleRouteAvailable === true,
          "Readiness route must report approval-response sample availability."
        )
        verify(
          routeCheck,
          "overview_available",
          json.readiness.overviewRouteAvailable === true,
          "Readiness route must report overview route availability."
        )

        return json
      }
    )

    const routesJson = await runRouteCheck(
      report,
      "ROUTE INVENTORY VERIFY",
      "/api/automation/routes",
      async (routeCheck) => {
        const response = await fetch(`${baseUrl}/api/automation/routes`)
        routeCheck.httpStatus = response.status
        const json = await response.json()

        verify(
          routeCheck,
          "http_200",
          response.status === 200,
          "Route inventory route must return HTTP 200."
        )
        verify(
          routeCheck,
          "route_id",
          json.route === "/api/automation/routes",
          "Route inventory route must identify itself explicitly."
        )
        verify(
          routeCheck,
          "routes_array",
          Array.isArray(json.routes),
          "Route inventory route must return the runtime bridge route list."
        )
        verify(
          routeCheck,
          "includes_self",
          json.routes.some((route) => route.path === "/api/automation/routes"),
          "Route inventory route must include itself."
        )
        verify(
          routeCheck,
          "includes_check",
          json.routes.some((route) => route.path === "/api/automation/check"),
          "Route inventory route must include the check route."
        )
        verify(
          routeCheck,
          "includes_snapshot",
          json.routes.some((route) => route.path === "/api/automation/snapshot"),
          "Route inventory route must include the snapshot route."
        )
        verify(
          routeCheck,
          "includes_status",
          json.routes.some((route) => route.path === "/api/automation/status"),
          "Route inventory route must include the status route."
        )
        verify(
          routeCheck,
          "includes_boundary_test",
          json.routes.some(
            (route) => route.path === "/api/automation/approval-boundary-test"
          ),
          "Route inventory route must include the approval-boundary test route."
        )
        verify(
          routeCheck,
          "includes_response_sample",
          json.routes.some(
            (route) => route.path === "/api/automation/approval-response/sample"
          ),
          "Route inventory route must include the approval-response sample route."
        )
        verify(
          routeCheck,
          "includes_overview",
          json.routes.some((route) => route.path === "/api/automation/overview"),
          "Route inventory route must include the overview route."
        )
        verify(
          routeCheck,
          "no_secret_exposure",
          json.safety.exposesSecrets === false,
          "Route inventory route must not expose secrets."
        )

        return json
      }
    )

    const checkJson = await runRouteCheck(
      report,
      "CHECK VERIFY",
      "/api/automation/check",
      async (routeCheck) => {
        const response = await fetch(`${baseUrl}/api/automation/check`)
        routeCheck.httpStatus = response.status
        const json = await response.json()

        verify(routeCheck, "http_200", response.status === 200, "Check route must return HTTP 200.")
        verify(
          routeCheck,
          "route_id",
          json.route === "/api/automation/check",
          "Check route must identify itself explicitly."
        )
        verify(
          routeCheck,
          "inspection_routes_available",
          json.check?.routeCheck?.inspectionRoutesAvailable === true,
          "Check route must report inspection route availability."
        )
        verify(
          routeCheck,
          "verifier_coverage_present",
          json.check?.bridgeCheck?.verifierCoveragePresent === true,
          "Check route must report verifier coverage presence."
        )
        verify(
          routeCheck,
          "verifier_covers_check",
          json.check?.consistencyCheck?.verifierCoverageIncludesCheck === true,
          "Check route must report its own verifier coverage."
        )
        verify(
          routeCheck,
          "status_snapshot_aligned",
          json.check?.consistencyCheck?.statusAndSnapshotRouteCountsMatch === true,
          "Check route must stay aligned with status and snapshot route counts."
        )
        verify(
          routeCheck,
          "no_secret_exposure",
          json.safety?.exposesSecrets === false,
          "Check route must not expose secrets."
        )

        return json
      }
    )

    const statusJson = await runRouteCheck(
      report,
      "STATUS VERIFY",
      "/api/automation/status",
      async (routeCheck) => {
        const response = await fetch(`${baseUrl}/api/automation/status`)
        routeCheck.httpStatus = response.status
        const json = await response.json()

        verify(routeCheck, "http_200", response.status === 200, "Status route must return HTTP 200.")
        verify(
          routeCheck,
          "route_id",
          json.route === "/api/automation/status",
          "Status route must identify itself explicitly."
        )
        verify(
          routeCheck,
          "route_count_present",
          json.status?.routeCounts?.total >= 1,
          "Status route must report bridge route counts."
        )
        verify(
          routeCheck,
          "inspection_routes_available",
          json.status?.availability?.inspectionRoutesAvailable === true,
          "Status route must report inspection route availability."
        )
        verify(
          routeCheck,
          "execution_routes_available",
          json.status?.availability?.executionRoutesAvailable === true,
          "Status route must report execution route availability."
        )
        verify(
          routeCheck,
          "verifier_command",
          json.status?.verifierCoverage?.command ===
            "npm run automation:runtime:http:verify",
          "Status route must expose the current runtime verifier command."
        )
        verify(
          routeCheck,
          "boundary_coverage",
          json.status?.verifierCoverage?.coverage?.approvalBoundarySimulation === true,
          "Status route must report approval-boundary simulation coverage."
        )
        verify(
          routeCheck,
          "check_coverage",
          json.status?.verifierCoverage?.coverage?.checkSummary === true,
          "Status route must report check route coverage."
        )
        verify(
          routeCheck,
          "snapshot_coverage",
          json.status?.verifierCoverage?.coverage?.snapshotSummary === true,
          "Status route must report snapshot route coverage."
        )
        verify(
          routeCheck,
          "untrusted_coverage",
          json.status?.verifierCoverage?.coverage?.approvalResponseUntrustedFlow ===
            true,
          "Status route must report untrusted approval-response coverage."
        )
        verify(
          routeCheck,
          "no_secret_exposure",
          json.safety?.exposesSecrets === false,
          "Status route must not expose secrets."
        )

        return json
      }
    )

    const sampleJson = await runRouteCheck(
      report,
      "APPROVAL RESPONSE SAMPLE VERIFY",
      "/api/automation/approval-response/sample",
      async (routeCheck) => {
        const response = await fetch(`${baseUrl}/api/automation/approval-response/sample`)
        routeCheck.httpStatus = response.status
        const json = await response.json()

        verify(
          routeCheck,
          "http_200",
          response.status === 200,
          "Approval-response sample route must return HTTP 200."
        )
        verify(
          routeCheck,
          "route_id",
          json.route === "/api/automation/approval-response/sample",
          "Approval-response sample route must identify itself explicitly."
        )
        verify(
          routeCheck,
          "reference_path",
          json.referenceFor?.path === "/api/automation/approval-response",
          "Approval-response sample route must reference the POST approval-response route."
        )
        verify(
          routeCheck,
          "required_context",
          json.context?.requiredFields?.includes("requestId"),
          "Approval-response sample route must include the required context field list."
        )
        verify(
          routeCheck,
          "no_resume",
          json.safety?.resumesBlockedExecution === false,
          "Approval-response sample route must state that it does not resume blocked execution."
        )
        verify(
          routeCheck,
          "secret_not_present",
          !JSON.stringify(json).includes(WEBHOOK_SECRET),
          "Approval-response sample route must not expose the webhook secret."
        )

        return json
      }
    )

    const overviewJson = await runRouteCheck(
      report,
      "OVERVIEW VERIFY",
      "/api/automation/overview",
      async (routeCheck) => {
        const response = await fetch(`${baseUrl}/api/automation/overview`)
        routeCheck.httpStatus = response.status
        const json = await response.json()

        verify(routeCheck, "http_200", response.status === 200, "Overview route must return HTTP 200.")
        verify(
          routeCheck,
          "route_id",
          json.route === "/api/automation/overview",
          "Overview route must identify itself explicitly."
        )
        verify(
          routeCheck,
          "readiness_summary",
          json.overview?.readiness?.overviewRouteAvailable === true,
          "Overview route must surface the readiness summary."
        )
        verify(
          routeCheck,
          "verifier_summary",
          json.overview?.verifierCoverage?.coverage?.statusSummary === true,
          "Overview route must surface the verifier coverage summary."
        )
        verify(
          routeCheck,
          "route_inventory_summary",
          json.overview?.routeInventory?.routes?.some(
            (route) => route.path === "/api/automation/overview"
          ),
          "Overview route must surface the route inventory summary."
        )
        verify(
          routeCheck,
          "response_sample_reference",
          json.overview?.approvalResponseReference?.samplePath ===
            "/api/automation/approval-response/sample",
          "Overview route must surface the approval-response sample reference."
        )
        verify(
          routeCheck,
          "boundary_route_reference",
          json.overview?.routeInventory?.routes?.some(
            (route) => route.path === "/api/automation/approval-boundary-test"
          ),
          "Overview route must surface the approval-boundary simulation route."
        )
        verify(
          routeCheck,
          "no_secret_exposure",
          json.safety?.exposesSecrets === false,
          "Overview route must not expose secrets."
        )

        return json
      }
    )

    const snapshotJson = await runRouteCheck(
      report,
      "SNAPSHOT VERIFY",
      "/api/automation/snapshot",
      async (routeCheck) => {
        const response = await fetch(`${baseUrl}/api/automation/snapshot`)
        routeCheck.httpStatus = response.status
        const json = await response.json()

        verify(routeCheck, "http_200", response.status === 200, "Snapshot route must return HTTP 200.")
        verify(
          routeCheck,
          "route_id",
          json.route === "/api/automation/snapshot",
          "Snapshot route must identify itself explicitly."
        )
        verify(
          routeCheck,
          "capture_timestamp",
          typeof json.snapshot?.capturedAt === "string",
          "Snapshot route must include a capture timestamp."
        )
        verify(
          routeCheck,
          "status_alignment",
          json.snapshot?.routeCounts?.total === statusJson.status?.routeCounts?.total,
          "Snapshot route must stay aligned with status route counts."
        )
        verify(
          routeCheck,
          "readiness_data",
          json.snapshot?.readiness?.overviewRouteAvailable === true,
          "Snapshot route must surface readiness summary data."
        )
        verify(
          routeCheck,
          "snapshot_coverage",
          json.snapshot?.status?.verifierCoverage?.coverage?.snapshotSummary === true,
          "Snapshot route must surface snapshot verifier coverage."
        )
        verify(
          routeCheck,
          "overview_alignment",
          json.snapshot?.overview?.routeInventory?.totalRoutes ===
            overviewJson.overview?.routeInventory?.totalRoutes,
          "Snapshot route must stay aligned with overview route inventory summary."
        )
        verify(
          routeCheck,
          "no_secret_exposure",
          json.safety?.exposesSecrets === false,
          "Snapshot route must not expose secrets."
        )

        return json
      }
    )

    const approvalBoundaryTestJson = await runRouteCheck(
      report,
      "APPROVAL BOUNDARY TEST VERIFY",
      "/api/automation/approval-boundary-test",
      async (routeCheck) => {
        const response = await fetch(`${baseUrl}/api/automation/approval-boundary-test`, {
          method: "POST",
        })
        routeCheck.httpStatus = response.status
        const json = await response.json()

        verify(
          routeCheck,
          "http_200",
          response.status === 200,
          "Approval-boundary test route must return HTTP 200."
        )
        verify(
          routeCheck,
          "route_id",
          json.route === "/api/automation/approval-boundary-test",
          "Approval-boundary test route must identify itself explicitly."
        )
        verify(
          routeCheck,
          "fixed_capability",
          json.simulation?.capabilityId === "catalog.write.safe",
          "Approval-boundary test route must stay fixed to catalog.write.safe."
        )
        verify(
          routeCheck,
          "no_arbitrary_capabilities",
          json.simulation?.acceptsArbitraryCapabilityIds === false,
          "Approval-boundary test route must not imply a general execution surface."
        )
        verify(
          routeCheck,
          "boundary_triggered",
          json.verification?.approvalBoundaryTriggered === true,
          "Approval-boundary test route must prove the approval boundary was triggered."
        )
        verify(
          routeCheck,
          "risky_work_blocked",
          json.verification?.executesRiskyWork === false,
          "Approval-boundary test route must state that it does not execute risky work."
        )
        verify(
          routeCheck,
          "approval_required_mode",
          json.execution?.selection?.executionMode === "approval-required",
          "Approval-boundary test route must run through the approval-required execution path."
        )
        verify(
          routeCheck,
          "approval_required_error",
          json.execution?.result?.error?.code === "APPROVAL_REQUIRED",
          "Approval-boundary test route must return the approval-required result."
        )
        verify(
          routeCheck,
          "approval_metadata",
          json.execution?.result?.approval?.status === "required",
          "Approval-boundary test route must expose approval metadata."
        )
        verify(
          routeCheck,
          "fixed_handoff_capability",
          json.execution?.result?.approval?.handoff?.capabilityId ===
            "catalog.write.safe",
          "Approval-boundary test route must keep the simulated handoff fixed to catalog.write.safe."
        )

        return json
      }
    )

    const webhookTestJson = await runRouteCheck(
      report,
      "WEBHOOK TEST VERIFY",
      "/api/automation/webhook-test",
      async (routeCheck) => {
        const response = await fetch(`${baseUrl}/api/automation/webhook-test`, {
          method: "POST",
        })
        routeCheck.httpStatus = response.status
        const json = await response.json()

        verify(
          routeCheck,
          "http_200",
          response.status === 200,
          "Webhook-test route must return HTTP 200 when the local capture server is available."
        )
        verify(
          routeCheck,
          "route_id",
          json.route === "/api/automation/webhook-test",
          "Webhook-test route must identify itself explicitly."
        )
        verify(
          routeCheck,
          "delivery_sent",
          json.delivery.status === "sent",
          "Webhook-test route must report sent delivery during local verification."
        )
        verify(
          routeCheck,
          "no_risky_work",
          json.verification.executesRiskyWork === false,
          "Webhook-test route must state that it does not execute risky work."
        )
        verify(
          routeCheck,
          "sender_exercised",
          webhookCapture.requests.length >= 1,
          "Webhook-test route must exercise the outbound sender path."
        )

        return json
      }
    )

    await runRouteCheck(
      report,
      "APPROVAL RESPONSE VERIFY",
      "/api/automation/approval-response",
      async (routeCheck) => {
        const trustedBody = {
          context: {
            requestId: "runtime-approval-request-id",
            reportId: "report-runtime-approval-request-id",
            capabilityId: "catalog.write.safe",
            finalStatus: "approval_required",
            decisionId: "decision-runtime-approval-request-id",
          },
          requestId: "runtime-approval-request-id",
          reportId: "report-runtime-approval-request-id",
          capabilityId: "catalog.write.safe",
          decisionId: "decision-runtime-approval-request-id",
          source: "n8n",
          decision: "approved",
          note: "Runtime HTTP verification only.",
        }

        const trustedResponse = await fetch(`${baseUrl}/api/automation/approval-response`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${WEBHOOK_SECRET}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(trustedBody),
        })
        const trustedJson = await trustedResponse.json()

        routeCheck.httpStatus = trustedResponse.status

        verify(
          routeCheck,
          "trusted_http_200",
          trustedResponse.status === 200,
          "Trusted approval-response route call must return HTTP 200."
        )
        verify(
          routeCheck,
          "trusted_accepted",
          trustedJson.webhook?.status === "accepted",
          "Trusted approval-response route call must reach the normalization chain."
        )
        verify(
          routeCheck,
          "trusted_auth",
          trustedJson.webhook?.auth?.status === "trusted",
          "Trusted approval-response route call must report trusted auth."
        )
        verify(
          routeCheck,
          "trusted_remains_blocked",
          trustedJson.webhook?.application?.applicationStatus === "remain_blocked",
          "Trusted approval-response route call must keep execution blocked."
        )

        const untrustedResponse = await fetch(`${baseUrl}/api/automation/approval-response`, {
          method: "POST",
          headers: {
            authorization: "Bearer wrong-secret",
            "content-type": "application/json",
          },
          body: JSON.stringify(trustedBody),
        })
        const untrustedJson = await untrustedResponse.json()

        verify(
          routeCheck,
          "untrusted_http_401",
          untrustedResponse.status === 401,
          "Untrusted approval-response route call must return HTTP 401."
        )
        verify(
          routeCheck,
          "untrusted_blocked",
          untrustedJson.webhook?.status === "blocked_untrusted",
          "Untrusted approval-response route call must be blocked before normalization."
        )
        verify(
          routeCheck,
          "untrusted_no_intake",
          !untrustedJson.webhook?.intake,
          "Untrusted approval-response route call must not include the intake chain."
        )

        report.approvalResponseCoverage = {
          trustedFlow: true,
          untrustedFlow: true,
        }

        return {
          trustedStatus: trustedJson.webhook?.status,
          untrustedStatus: untrustedJson.webhook?.status,
        }
      }
    )

    report.keySummary = {
      outboundWebhookConfigured:
        readinessJson.readiness?.outboundApprovalWebhookConfigured === true,
      inboundApprovalAuthConfigured:
        readinessJson.readiness?.inboundApprovalWebhookAuthConfigured === true,
      routeInventoryCount: routesJson.routes?.length ?? 0,
      statusRouteCount: statusJson.status?.routeCounts?.total ?? 0,
      snapshotRouteCount: snapshotJson.snapshot?.routeCounts?.total ?? 0,
      checkConsistency:
        checkJson.check?.consistencyCheck?.statusAndSnapshotRouteCountsMatch === true,
      responseSamplePath:
        sampleJson.referenceFor?.path === "/api/automation/approval-response",
      webhookSent: webhookTestJson.delivery?.status === "sent",
    }

    report.approvalBoundaryCoverage = {
      routeCovered: true,
      boundaryTriggered:
        approvalBoundaryTestJson.verification?.approvalBoundaryTriggered === true,
      riskyExecutionBlocked:
        approvalBoundaryTestJson.verification?.executesRiskyWork === false,
    }

    report.safetySummary = {
      exposesSecrets: false,
      noResumeBoundary: true,
      untrustedBlockedBeforeNormalization: true,
      riskyExecutionBlocked: true,
    }
  } catch (error) {
    report.failure = {
      message: error instanceof Error ? error.message : String(error),
    }
  } finally {
    await stopRuntimeBridgeLocalServer(runtimeBridgeServer)
  }

  finalizeVerifierReport(report)

  printFinalSummary(report)

  logSection("JSON REPORT")
  const reportJson = JSON.stringify(report, null, 2)
  console.log(reportJson)

  const reportFilePath = await writeReportFileIfRequested(reportJson)
  if (reportFilePath) {
    logSection("REPORT FILE")
    console.log(reportFilePath)
  }

  if (report.overallStatus === "PASS") {
    logSection("RUNTIME BRIDGE HTTP VERIFY")
    console.log("  overall: PASS")
    return
  }

  logSection("RUNTIME BRIDGE HTTP VERIFY")
  console.log("  overall: FAIL")
  process.exitCode = 1
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
