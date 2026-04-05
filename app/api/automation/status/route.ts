export const runtime = "nodejs"

import { NextResponse } from "next/server"
import {
  automationRuntimeBridgeSafety,
  buildAutomationRuntimeStatusSummary,
} from "@/app/api/automation/contracts"

export async function GET() {
  return NextResponse.json({
    route: "/api/automation/status",
    routeVersion: "v1",
    target: "automation-runtime-bridge-status",
    status: buildAutomationRuntimeStatusSummary(),
    safety: automationRuntimeBridgeSafety,
  })
}
