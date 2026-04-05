export function buildRuntimeReportEnvelope({
  command,
  reportKind,
  purpose,
  overallStatus,
  sourceSummary,
  summary,
  safetySummary,
}) {
  return {
    generatedAt: new Date().toISOString(),
    command,
    reportKind,
    purpose,
    overallStatus,
    sourceSummary,
    summary,
    safetySummary,
  }
}
