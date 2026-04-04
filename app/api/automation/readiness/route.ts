export const runtime = "nodejs"

import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { NextResponse } from "next/server"

const APPROVAL_WEBHOOK_URL_ENV = "AUTOMATION_APPROVAL_WEBHOOK_URL"
const APPROVAL_WEBHOOK_SECRET_ENV = "AUTOMATION_APPROVAL_WEBHOOK_SECRET"

type PackageJsonScripts = Record<string, string>

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

export async function GET() {
  const scripts = readPackageScripts()

  return NextResponse.json({
    route: "/api/automation/readiness",
    routeVersion: "v1",
    target: "automation-runtime-bridge",
    readiness: {
      outboundApprovalWebhookConfigured: hasConfiguredValue(
        APPROVAL_WEBHOOK_URL_ENV
      ),
      inboundApprovalWebhookAuthConfigured: hasConfiguredValue(
        APPROVAL_WEBHOOK_SECRET_ENV
      ),
      smokeCommandAvailable: typeof scripts["automation:smoke"] === "string",
      smokeReportCommandAvailable:
        typeof scripts["automation:smoke:report"] === "string",
      localSmokeReportEntrypointAvailable: existsSync(
        join(process.cwd(), "automation", "demo", "run-smoke-report.mjs")
      ),
      approvalResponseRouteAvailable: true,
      outboundWebhookTestRouteAvailable: true,
      readinessRouteAvailable: true,
    },
    safety: {
      exposesSecrets: false,
      riskyExecutionResumeEnabled: false,
      persistenceEnabled: false,
    },
  })
}
