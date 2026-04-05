export function buildRuntimeArtifactManifest({ inspect, verify, check }) {
  const inspectOk = inspect?.overallStatus === "PASS"
  const verifyOk = verify?.overallStatus === "PASS"
  const checkOk = check?.overallStatus === "PASS"
  const runtimeArtifactsAligned =
    inspect?.reportKind === "runtime_inspect_report" &&
    verify?.reportKind === "runtime_verify_report" &&
    check?.reportKind === "runtime_check_report"
  const safetyBoundariesHeld =
    inspect?.safetySummary?.exposesSecrets === false &&
    inspect?.safetySummary?.resumesBlockedExecution === false &&
    verify?.safetySummary?.exposesSecrets === false &&
    verify?.safetySummary?.noResumeBoundary === true &&
    check?.safetySummary?.exposesSecrets === false &&
    check?.safetySummary?.noResumeBoundary === true

  return {
    generatedAt: new Date().toISOString(),
    overallStatus: inspectOk && verifyOk && checkOk ? "PASS" : "FAIL",
    reports: {
      inspect: {
        artifactKind: "runtime_inspect_artifact",
        overallStatus: inspect?.overallStatus ?? "UNKNOWN",
        reportKind: inspect?.reportKind ?? "unknown",
        command: inspect?.command ?? "npm run automation:runtime:inspect",
      },
      verify: {
        artifactKind: "runtime_verify_artifact",
        overallStatus: verify?.overallStatus ?? "UNKNOWN",
        reportKind: verify?.reportKind ?? "unknown",
        command:
          verify?.command ?? "npm run automation:runtime:http:verify",
      },
      check: {
        artifactKind: "runtime_check_artifact",
        overallStatus: check?.overallStatus ?? "UNKNOWN",
        reportKind: check?.reportKind ?? "unknown",
        command: check?.command ?? "npm run automation:runtime:check",
      },
    },
    combinedSummary: {
      inspectOk,
      verifyOk,
      checkOk,
      runtimeArtifactsAligned,
      safetyBoundariesHeld,
    },
  }
}
