export const runtime = "nodejs"

import { NextResponse } from "next/server"
import {
  automationRuntimeBridgeSafety,
  buildAutomationRuntimeCheckSummary,
} from "@/app/api/automation/contracts"

export async function GET() {
  return NextResponse.json({
    route: "/api/automation/check",
    routeVersion: "v1",
    target: "automation-runtime-bridge-check",
    check: buildAutomationRuntimeCheckSummary(),
    safety: automationRuntimeBridgeSafety,
  })
}
