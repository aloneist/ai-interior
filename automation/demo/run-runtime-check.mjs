import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { spawn } from "node:child_process"
import { buildRuntimeReportEnvelope } from "./runtime-report-envelope.mjs"
import { buildRuntimeArtifactManifest } from "./runtime-artifact-manifest.mjs"

function logSection(title) {
  console.log("")
  console.log(title)
}

function formatAvailability(value) {
  return value ? "yes" : "no"
}

function getNpmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm"
}

async function writeReportFileIfRequested(reportJson) {
  const reportPath = process.env.AUTOMATION_RUNTIME_CHECK_REPORT_PATH

  if (!reportPath) {
    return null
  }

  await mkdir(path.dirname(reportPath), { recursive: true })
  await writeFile(reportPath, `${reportJson}\n`, "utf8")
  return reportPath
}

async function writeManifestFileIfRequested(manifestJson) {
  const manifestPath = process.env.AUTOMATION_RUNTIME_ARTIFACT_MANIFEST_PATH

  if (!manifestPath) {
    return null
  }

  await mkdir(path.dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, `${manifestJson}\n`, "utf8")
  return manifestPath
}

async function runCommandForReport(scriptName, reportEnvName, reportPath) {
  const npmCommand = getNpmCommand()

  return await new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ["run", scriptName], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        [reportEnvName]: reportPath,
      },
      stdio: ["ignore", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk)
    })

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk)
    })

    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
        return
      }

      reject(
        new Error(
          `${scriptName} failed with code ${code}.\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`
        )
      )
    })
  })
}

async function loadJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"))
}

async function resolveSourceReports() {
  const inspectSourcePath = process.env.AUTOMATION_RUNTIME_INSPECT_SOURCE_PATH
  const verifySourcePath = process.env.AUTOMATION_RUNTIME_VERIFY_SOURCE_PATH

  if (inspectSourcePath && verifySourcePath) {
    return {
      inspect: await loadJson(inspectSourcePath),
      verify: await loadJson(verifySourcePath),
      sourceMode: "prebuilt_reports",
    }
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "automation-runtime-check-"))
  const inspectReportPath = path.join(tempDir, "runtime-inspect-report.json")
  const verifyReportPath = path.join(tempDir, "runtime-verify-report.json")

  try {
    await runCommandForReport(
      "automation:runtime:inspect",
      "AUTOMATION_RUNTIME_INSPECT_REPORT_PATH",
      inspectReportPath
    )
    await runCommandForReport(
      "automation:runtime:http:verify",
      "AUTOMATION_RUNTIME_VERIFY_REPORT_PATH",
      verifyReportPath
    )

    return {
      inspect: await loadJson(inspectReportPath),
      verify: await loadJson(verifyReportPath),
      sourceMode: "executed_commands",
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

function buildCombinedReport(inspect, verify, sourceMode) {
  const inspectOk = inspect.overallStatus === "PASS"
  const verifyOk = verify.overallStatus === "PASS"
  const runtimeSurfaceCovered =
    inspect.inspectedRouteCount > 0 && verify.verifiedRouteCount > 0
  const safetyBoundariesHeld =
    inspect.safetySummary?.exposesSecrets === false &&
    inspect.safetySummary?.resumesBlockedExecution === false &&
    verify.safetySummary?.exposesSecrets === false &&
    verify.safetySummary?.noResumeBoundary === true &&
    verify.safetySummary?.untrustedBlockedBeforeNormalization === true &&
    verify.safetySummary?.riskyExecutionBlocked === true

  const summary = {
    inspectOk,
    verifyOk,
    runtimeSurfaceCovered,
    safetyBoundariesHeld,
  }

  return {
    ...buildRuntimeReportEnvelope({
      command: "npm run automation:runtime:check",
      reportKind: "runtime_check_report",
      purpose: "combined_runtime_check",
      overallStatus: inspectOk && verifyOk ? "PASS" : "FAIL",
      sourceSummary: {
        mode: sourceMode,
        inspectReportKind: inspect.reportKind ?? "runtime_inspect_report",
        verifyReportKind: verify.reportKind ?? "runtime_verify_report",
      },
      summary,
      safetySummary: {
        exposesSecrets: false,
        noResumeBoundary: safetyBoundariesHeld,
      },
    }),
    sourceMode,
    inspect: {
      overallStatus: inspect.overallStatus,
      summary: inspect.summary,
      inspectedRouteCount: inspect.inspectedRouteCount,
      keySummary: inspect.keySummary,
      safetySummary: inspect.safetySummary,
    },
    verify: {
      overallStatus: verify.overallStatus,
      summary: verify.summary,
      verifiedRouteCount: verify.verifiedRouteCount,
      keySummary: verify.keySummary,
      assertionSummary: verify.assertionSummary,
      safetySummary: verify.safetySummary,
      approvalResponseCoverage: verify.approvalResponseCoverage,
      approvalBoundaryCoverage: verify.approvalBoundaryCoverage,
    },
    combinedSummary: summary,
  }
}

function printFinalSummary(report) {
  logSection("FINAL SUMMARY")
  console.log(
    `  overall: ${report.overallStatus} (inspect=${report.inspect.overallStatus}, verify=${report.verify.overallStatus})`
  )
  console.log(`  source: ${report.sourceSummary.mode}`)
  console.log(
    `  route coverage: inspect=${report.inspect.inspectedRouteCount}, verify=${report.verify.verifiedRouteCount}`
  )
  console.log(
    `  assertions: ${report.verify.summary.passedRouteCount}/${report.verify.summary.verifiedRouteCount} route checks passed`
  )
  console.log(
    `  safety: surface=${formatAvailability(
      report.summary.runtimeSurfaceCovered
    )}, boundaries=${formatAvailability(report.summary.safetyBoundariesHeld)}`
  )
}

async function main() {
  const { inspect, verify, sourceMode } = await resolveSourceReports()
  const report = buildCombinedReport(inspect, verify, sourceMode)
  const reportJson = JSON.stringify(report, null, 2)
  const reportFilePath = await writeReportFileIfRequested(reportJson)
  const manifest = buildRuntimeArtifactManifest({
    inspect,
    verify,
    check: report,
  })
  const manifestJson = JSON.stringify(manifest, null, 2)
  const manifestFilePath = await writeManifestFileIfRequested(manifestJson)

  logSection("RUNTIME CHECK")
  console.log("  combines inspect and verifier outputs")
  console.log("  inspect remains report-oriented")
  console.log("  verify remains assertion-oriented")

  printFinalSummary(report)

  logSection("JSON REPORT")
  console.log(reportJson)

  if (manifestFilePath) {
    logSection("ARTIFACT MANIFEST")
    console.log(
      `  overall: ${manifest.overallStatus} (inspect=${formatAvailability(
        manifest.combinedSummary.inspectOk
      )}, verify=${formatAvailability(
        manifest.combinedSummary.verifyOk
      )}, check=${formatAvailability(manifest.combinedSummary.checkOk)})`
    )
    console.log(
      `  aligned: ${formatAvailability(
        manifest.combinedSummary.runtimeArtifactsAligned
      )}, safety=${formatAvailability(
        manifest.combinedSummary.safetyBoundariesHeld
      )}`
    )
  }

  if (reportFilePath) {
    logSection("REPORT FILE")
    console.log(reportFilePath)
  }

  if (manifestFilePath) {
    logSection("MANIFEST FILE")
    console.log(manifestFilePath)
  }

  if (report.overallStatus !== "PASS") {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
