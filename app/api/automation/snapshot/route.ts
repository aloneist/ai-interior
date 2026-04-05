export const runtime = "nodejs"

import { NextResponse } from "next/server"
import {
  automationRuntimeBridgeSafety,
  buildAutomationRuntimeSnapshot,
} from "@/app/api/automation/contracts"

export async function GET() {
  return NextResponse.json({
    route: "/api/automation/snapshot",
    routeVersion: "v1",
    target: "automation-runtime-bridge-snapshot",
    snapshot: buildAutomationRuntimeSnapshot(),
    safety: automationRuntimeBridgeSafety,
  })
}
