import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { spawn } from "node:child_process"

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
  const reportPath = process.env.AUTOMATION_READINESS_REPORT_PATH

  if (!reportPath) {
    return null
  }

  await mkdir(path.dirname(reportPath), { recursive: true })
  await writeFile(reportPath, `${reportJson}\n`, "utf8")
  return reportPath
}

async function runCommandForReport(scriptName, extraEnv) {
  const npmCommand = getNpmCommand()

  return await new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ["run", scriptName], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...extraEnv,
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
  const smokeSourcePath = process.env.AUTOMATION_SMOKE_SOURCE_PATH
  const runtimeInspectSourcePath = process.env.AUTOMATION_RUNTIME_INSPECT_SOURCE_PATH
  const runtimeVerifySourcePath = process.env.AUTOMATION_RUNTIME_VERIFY_SOURCE_PATH
  const runtimeCheckSourcePath = process.env.AUTOMATION_RUNTIME_CHECK_SOURCE_PATH
  const runtimeManifestSourcePath =
    process.env.AUTOMATION_RUNTIME_MANIFEST_SOURCE_PATH

  if (
    smokeSourcePath &&
    runtimeInspectSourcePath &&
    runtimeVerifySourcePath &&
    runtimeCheckSourcePath &&
    runtimeManifestSourcePath
  ) {
    return {
      smoke: await loadJson(smokeSourcePath),
      runtimeInspect: await loadJson(runtimeInspectSourcePath),
      runtimeVerify: await loadJson(runtimeVerifySourcePath),
      runtimeCheck: await loadJson(runtimeCheckSourcePath),
      runtimeManifest: await loadJson(runtimeManifestSourcePath),
      sourceMode: "prebuilt_reports",
    }
  }

  const tempDir = await mkdtemp(
    path.join(os.tmpdir(), "automation-readiness-report-")
  )
  const smokeReportPath = path.join(tempDir, "automation-smoke-report.json")
  const runtimeInspectReportPath = path.join(
    tempDir,
    "automation-runtime-inspect-report.json"
  )
  const runtimeVerifyReportPath = path.join(
    tempDir,
    "automation-runtime-http-verify-report.json"
  )
  const runtimeCheckReportPath = path.join(
    tempDir,
    "automation-runtime-check-report.json"
  )
  const runtimeManifestReportPath = path.join(
    tempDir,
    "automation-runtime-artifact-manifest.json"
  )

  try {
    await runCommandForReport("automation:smoke", {
      AUTOMATION_SMOKE_REPORT_PATH: smokeReportPath,
    })
    await runCommandForReport("automation:runtime:inspect", {
      AUTOMATION_RUNTIME_INSPECT_REPORT_PATH: runtimeInspectReportPath,
    })
    await runCommandForReport("automation:runtime:http:verify", {
      AUTOMATION_RUNTIME_VERIFY_REPORT_PATH: runtimeVerifyReportPath,
    })
    await runCommandForReport("automation:runtime:check", {
      AUTOMATION_RUNTIME_INSPECT_SOURCE_PATH: runtimeInspectReportPath,
      AUTOMATION_RUNTIME_VERIFY_SOURCE_PATH: runtimeVerifyReportPath,
      AUTOMATION_RUNTIME_CHECK_REPORT_PATH: runtimeCheckReportPath,
      AUTOMATION_RUNTIME_ARTIFACT_MANIFEST_PATH: runtimeManifestReportPath,
    })

    return {
      smoke: await loadJson(smokeReportPath),
      runtimeInspect: await loadJson(runtimeInspectReportPath),
      runtimeVerify: await loadJson(runtimeVerifyReportPath),
      runtimeCheck: await loadJson(runtimeCheckReportPath),
      runtimeManifest: await loadJson(runtimeManifestReportPath),
      sourceMode: "executed_commands",
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

function buildAutomationReadinessReport({
  smoke,
  runtimeInspect,
  runtimeVerify,
  runtimeCheck,
  runtimeManifest,
  sourceMode,
}) {
  const smokeOk = smoke?.overallStatus === "PASS"
  const runtimeInspectOk = runtimeInspect?.overallStatus === "PASS"
  const runtimeVerifyOk = runtimeVerify?.overallStatus === "PASS"
  const runtimeCheckOk = runtimeCheck?.overallStatus === "PASS"
  const runtimeArtifactsAligned =
    runtimeManifest?.combinedSummary?.runtimeArtifactsAligned === true
  const safetyBoundariesHeld =
    smoke?.summary?.noResumeSafety === "PASS" &&
    runtimeManifest?.combinedSummary?.safetyBoundariesHeld === true
  const automationReadinessOk =
    smokeOk &&
    runtimeInspectOk &&
    runtimeVerifyOk &&
    runtimeCheckOk &&
    runtimeArtifactsAligned &&
    safetyBoundariesHeld

  return {
    generatedAt: new Date().toISOString(),
    overallStatus: automationReadinessOk ? "PASS" : "FAIL",
    sourceSummary: {
      mode: sourceMode,
    },
    smoke: {
      overallStatus: smoke?.overallStatus ?? "UNKNOWN",
      summary: smoke?.summary ?? {},
      scenarioCount: smoke?.scenarioCount ?? null,
    },
    runtime: {
      inspect: {
        overallStatus: runtimeInspect?.overallStatus ?? "UNKNOWN",
        reportKind: runtimeInspect?.reportKind ?? "unknown",
      },
      verify: {
        overallStatus: runtimeVerify?.overallStatus ?? "UNKNOWN",
        reportKind: runtimeVerify?.reportKind ?? "unknown",
      },
      check: {
        overallStatus: runtimeCheck?.overallStatus ?? "UNKNOWN",
        reportKind: runtimeCheck?.reportKind ?? "unknown",
      },
      manifest: {
        overallStatus: runtimeManifest?.overallStatus ?? "UNKNOWN",
      },
    },
    readinessSummary: {
      smokeOk,
      runtimeInspectOk,
      runtimeVerifyOk,
      runtimeCheckOk,
      runtimeArtifactsAligned,
      automationReadinessOk,
      safetyBoundariesHeld,
    },
  }
}

function printFinalSummary(report) {
  logSection("FINAL SUMMARY")
  console.log(`  overall: ${report.overallStatus}`)
  console.log(`  source: ${report.sourceSummary.mode}`)
  console.log(
    `  smoke: ${report.smoke.overallStatus} (${report.smoke.scenarioCount ?? "n/a"} scenarios)`
  )
  console.log(
    `  runtime: inspect=${formatAvailability(
      report.readinessSummary.runtimeInspectOk
    )}, verify=${formatAvailability(
      report.readinessSummary.runtimeVerifyOk
    )}, check=${formatAvailability(report.readinessSummary.runtimeCheckOk)}`
  )
  console.log(
    `  readiness: aligned=${formatAvailability(
      report.readinessSummary.runtimeArtifactsAligned
    )}, safety=${formatAvailability(
      report.readinessSummary.safetyBoundariesHeld
    )}, automation=${formatAvailability(
      report.readinessSummary.automationReadinessOk
    )}`
  )
}

async function main() {
  const sourceReports = await resolveSourceReports()
  const report = buildAutomationReadinessReport(sourceReports)
  const reportJson = JSON.stringify(report, null, 2)
  const reportFilePath = await writeReportFileIfRequested(reportJson)

  logSection("AUTOMATION READINESS REPORT")
  console.log("  combines existing smoke and runtime outputs only")
  console.log("  smoke remains validation-oriented")
  console.log("  runtime reports remain inspection / verification / check oriented")

  printFinalSummary(report)

  logSection("JSON REPORT")
  console.log(reportJson)

  if (reportFilePath) {
    logSection("REPORT FILE")
    console.log(reportFilePath)
  }

  if (report.overallStatus !== "PASS") {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
